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
                <p><strong>Lỗi:</strong> {user.error}</p>
                <p>Một số chức năng có thể bị hạn chế. Vui lòng kiểm tra lại kết nối mạng.</p>
                <button 
                    onClick={refreshUser}
                    style={{ 
                        padding: '0.5rem 1rem', 
                        backgroundColor: '#007bff', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginTop: '0.5rem'
                    }}
                >
                    Thử lại
                </button>
            </div>
        )
    }

    return (
        <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '8px', margin: '1rem' }}>
            <h3>Thông tin người dùng</h3>
            <div style={{ marginTop: '1rem' }}>
                <p><strong>Tên:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Vị trí:</strong> {user.position || 'Chưa cập nhật'}</p>
                <p><strong>Phòng ban:</strong> {user.department || 'Chưa cập nhật'}</p>
                <p><strong>Vai trò:</strong> {user.role_name || 'employee'}</p>
                <p><strong>Trạng thái:</strong> {user.is_active ? 'Hoạt động' : 'Không hoạt động'}</p>
                <p><strong>Loại xác thực:</strong> {user.auth_type}</p>
                
                {user.permissions && user.permissions.length > 0 && (
                    <div style={{ marginTop: '1rem' }}>
                        <p><strong>Quyền hạn:</strong></p>
                        <ul style={{ marginLeft: '1rem' }}>
                            {user.permissions.map((permission, index) => (
                                <li key={index}>{permission}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
            
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                <button 
                    onClick={refreshUser}
                    style={{ 
                        padding: '0.5rem 1rem', 
                        backgroundColor: '#28a745', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Làm mới
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
                    Đăng xuất
                </button>
            </div>
        </div>
    )
}

export default UserProfile
