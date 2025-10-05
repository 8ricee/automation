import { useAuth } from '@/components/providers/AuthProvider'

const UserProfile = () => {
    const { user, logout, refreshUser, loading } = useAuth()

    if (loading) {
        return <div>Loading user...</div>
    }

    if (!user) {
        // Người dùng chưa đăng nhập
        return null
    }

    // Kiểm tra trạng thái lỗi
    if (user.error) {
        return (
            <div style={{ padding: '1rem', backgroundColor: '#ffcccc', border: '1px solid red', borderRadius: '8px', margin: '1rem' }}>
                <p><strong>⚠️ Lỗi:</strong> {user.error}</p>
                <p>Một số chức năng có thể bị hạn chế. Vui lòng kiểm tra lại kết nối mạng.</p>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                    <button 
                        onClick={refreshUser}
                        style={{ 
                            padding: '0.5rem 1rem', 
                            backgroundColor: '#007bff', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        🔄 Thử lại
                    </button>
                    <button 
                        onClick={logout}
                        style={{ 
                            padding: '0.5rem 1rem', 
                            backgroundColor: '#dc3545', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        🚪 Đăng xuất
                    </button>
                </div>
            </div>
        )
    }
    
    // Nếu không có lỗi, hiển thị thông tin người dùng bình thường
    return (
        <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '8px', margin: '1rem' }}>
            <h2>👤 Thông tin người dùng</h2>
            <p><strong>Tên:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Vị trí:</strong> {user.position || 'N/A'}</p>
            <p><strong>Phòng ban:</strong> {user.department || 'N/A'}</p>
            <p><strong>Vai trò:</strong> {user.role_name}</p>
            <p><strong>Trạng thái:</strong> {user.is_active ? '✅ Hoạt động' : '❌ Không hoạt động'}</p>
            <div style={{ marginTop: '1rem' }}>
                <button 
                    onClick={logout}
                    style={{ 
                        padding: '0.5rem 1rem', 
                        backgroundColor: '#dc3545', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    🚪 Đăng xuất
                </button>
            </div>
        </div>
    )
}

export default UserProfile
