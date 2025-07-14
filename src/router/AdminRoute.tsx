import { useContext } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'

export const AdminRoute = () => {
  const { user } = useContext(AuthContext)
  return user?.user_metadata?.role === 'ADMIN' ? <Outlet /> : <Navigate to="/" />
}
