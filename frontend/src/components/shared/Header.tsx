'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const { user } = useAuth();

  return (
    <header
      className="sticky top-0 z-40 glass border-b border-white/20 shadow-sm"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        background: 'rgba(255, 255, 255, 0.7)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div className="flex items-center justify-between px-6 py-4" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '1rem 1.5rem' 
      }}>
        {/* Left side - Breadcrumb */}
        <div className="flex items-center space-x-4" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 
            className="text-2xl font-bold gradient-text"
            style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: 0
            }}
          >
            Dashboard
          </h1>
          <div 
            className="w-1 h-1 bg-gray-400 rounded-full"
            style={{ 
              width: '0.25rem', 
              height: '0.25rem', 
              background: '#9ca3af', 
              borderRadius: '50%' 
            }}
          />
          <span 
            className="text-gray-600 font-medium"
            style={{ color: '#4b5563', fontWeight: '500' }}
          >
            Healthcare Management
          </span>
        </div>
        
        {/* Right side - User profile and actions */}
        <div className="flex items-center space-x-4" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Notifications */}
          <button 
            className="relative p-2 rounded-xl text-gray-600 hover:bg-white/50 hover:text-gray-900 transition-all duration-200"
            style={{
              position: 'relative',
              padding: '0.5rem',
              borderRadius: '0.75rem',
              color: '#4b5563',
              transition: 'all 0.2s',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.5)';
              e.currentTarget.style.color = '#111827';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#4b5563';
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>🔔</span>
            <div 
              className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"
              style={{
                position: 'absolute',
                top: '-0.25rem',
                right: '-0.25rem',
                width: '0.75rem',
                height: '0.75rem',
                background: '#ef4444',
                borderRadius: '50%',
                border: '2px solid white'
              }}
            />
          </button>
          
          {/* Search */}
          <div 
            className="relative"
            style={{ position: 'relative' }}
          >
            <input 
              type="text" 
              placeholder="Search..." 
              className="input-field w-64 pl-10"
              style={{
                width: '16rem',
                padding: '0.75rem 1rem 0.75rem 2.5rem',
                background: 'rgba(255, 255, 255, 0.5)',
                border: '1px solid rgba(229, 231, 235, 0.5)',
                borderRadius: '0.75rem',
                outline: 'none',
                transition: 'all 0.2s',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)'
              }}
              onFocus={(e) => {
                e.target.style.border = '1px solid rgba(59, 130, 246, 0.5)';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.border = '1px solid rgba(229, 231, 235, 0.5)';
                e.target.style.boxShadow = 'none';
              }}
            />
            <span 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9ca3af'
              }}
            >
              🔍
            </span>
          </div>
          
          {/* User Profile */}
          <div 
            className="flex items-center space-x-3 p-2 rounded-xl hover:bg-white/50 transition-all duration-200 cursor-pointer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.5rem',
              borderRadius: '0.75rem',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <div 
              className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm"
              style={{
                width: '2rem',
                height: '2rem',
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: '600',
                fontSize: '0.875rem',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1) rotate(360deg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
              }}
            >
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="hidden md:block" style={{ display: 'none' }}>
              <p 
                className="text-sm font-semibold text-gray-900"
                style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: '600', 
                  color: '#111827',
                  margin: 0
                }}
              >
                {user?.username || 'User'}
              </p>
              <p 
                className="text-xs text-gray-500 capitalize"
                style={{ 
                  fontSize: '0.75rem', 
                  color: '#6b7280',
                  textTransform: 'capitalize',
                  margin: 0
                }}
              >
                {user?.role || 'Admin'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
