// Test script để kiểm tra permissions từ database
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Make sure .env.local contains:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_url');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPermissions() {
  console.log('🔍 Testing permissions from database...');
  console.log('Supabase URL:', supabaseUrl);
  
  try {
    // Test query để lấy permissions của một user
    const { data: employees, error } = await supabase
      .from('employees')
      .select(`
        id, name, email, role_id,
        roles!inner(
          id, name, description,
          role_permissions!inner(
            permissions!inner(name, resource, action)
          )
        )
      `)
      .limit(5);

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log('✅ Found employees:', employees?.length || 0);
    
    if (employees && employees.length > 0) {
      employees.forEach((employee) => {
        const role = employee.roles;
        console.log(`\n👤 ${employee.name} (${employee.email})`);
        console.log(`   Role: ${role.name}`);
        console.log(`   Description: ${role.description}`);
        
        if (role.role_permissions) {
          const permissions = role.role_permissions.map((rp) => {
            const p = rp.permissions;
            return `${p.resource}:${p.action}`;
          });
          console.log(`   Permissions (${permissions.length}):`, permissions.slice(0, 10));
          if (permissions.length > 10) {
            console.log(`   ... and ${permissions.length - 10} more`);
          }
        } else {
          console.log('   No permissions found');
        }
      });
    } else {
      console.log('No employees found');
    }

    // Test specific role permissions
    console.log('\n🔍 Testing specific role permissions...');
    const { data: rolePermissions, error: roleError } = await supabase
      .from('roles')
      .select(`
        name,
        role_permissions(
          permissions(name, resource, action)
        )
      `)
      .limit(3);

    if (roleError) {
      console.error('❌ Role permissions error:', roleError);
    } else {
      rolePermissions?.forEach((role) => {
        console.log(`\n📋 Role: ${role.name}`);
        if (role.role_permissions) {
          const permissions = role.role_permissions.map((rp) => {
            const p = rp.permissions;
            return `${p.resource}:${p.action}`;
          });
          console.log(`   Permissions: ${permissions.length}`);
          console.log(`   Sample: ${permissions.slice(0, 5).join(', ')}`);
        }
      });
    }

  } catch (err) {
    console.error('❌ Test failed:', err);
  }
}

// Chạy test
testPermissions().then(() => {
  console.log('\n✅ Test completed');
  process.exit(0);
}).catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});