// hooks/useAuth.js 
'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export function useAuth(requireAuth = false) {
  const { data: session, status } = useSession()
  const router = useRouter()

  const user = session?.user || null
  const isLoading = status === 'loading'
  const isAuthenticated = !!session && status === 'authenticated'

  // Redirect to login if authentication is required but user is not authenticated
  if (requireAuth && !isLoading && !isAuthenticated) {
    router.push('/login')
  }

  return {
    user,
    isLoading,
    isAuthenticated,
    session
  }
}
