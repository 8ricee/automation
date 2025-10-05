"use client"

import { createContext, useContext, useState, ReactNode } from 'react'

interface UserContextType {
  userRole: string
  userPermissions: string[]
  setUserRole: (role: string) => void
  setUserPermissions: (permissions: string[]) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [userRole, setUserRole] = useState("engineer") // Mặc định là admin
  const [userPermissions, setUserPermissions] = useState<string[]>([])

  return (
    <UserContext.Provider value={{
      userRole,
      userPermissions,
      setUserRole,
      setUserPermissions
    }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
