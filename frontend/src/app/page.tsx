'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/lib/constants'

export default function HomePage() {
  const router = useRouter()

  // Handle authentication and redirection
  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const userData = localStorage.getItem('user_data');
        
        // Clear partial auth states
        if (!token || !userData) {
          localStorage.clear();
          router.replace(ROUTES.LOGIN);
          return;
        }
        
        // Validate stored user data
        try {
          const parsedUser = JSON.parse(userData);
          if (!parsedUser?.id || !parsedUser?.username) {
            throw new Error('Invalid user data');
          }
          router.replace(ROUTES.DASHBOARD);
        } catch (error) {
          console.error('Invalid user data:', error);
          localStorage.clear();
          router.replace(ROUTES.LOGIN);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.clear();
        router.replace(ROUTES.LOGIN);
      }
    };
    
    checkAuthAndRedirect();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to dashboard...</p>
      </div>
    </div>
  )
}
