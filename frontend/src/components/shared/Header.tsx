'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const { user } = useAuth();

  return (
    <header 
      className="sticky top-0 z-40 glass-elevated border-b border-white/10"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        background: 'rgba(255, 255, 255, 0.05)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}
    >
      <div 
        className="flex items-center justify-between px-6 py-4"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.5rem'
        }}
      >
        {/* Left side - Breadcrumb */}
        <div 
          className="flex items-center space-x-3"
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
        >
          <h1 
            className="text-xl font-bold gradient-primary"
            style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              lineHeight: '1.2',
              letterSpacing: '-0.01em',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: 0
            }}
          >
            Dashboard
          </h1>
          <div 
            className="w-1 h-1 bg-neutral-400 rounded-full"
            style={{
              width: '0.25rem',
              height: '0.25rem',
              background: '#a3a3a3',
              borderRadius: '50%'
            }}
          />
          <span 
            className="text-sm text-neutral-300 font-medium"
            style={{ color: '#d4d4d4', fontWeight: '500', fontSize: '0.875rem' }}
          >
            Healthcare Management
          </span>
        </div>

        {/* Right side - User profile and actions */}
        <div 
          className="flex items-center space-x-4"
          style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
        >
          {/* Notifications */}
          <button
            className="relative p-2 rounded-lg text-neutral-300 hover:bg-white/10 hover:text-white transition-all duration-300"
            style={{
              position: 'relative',
              padding: '0.5rem',
              borderRadius: '0.5rem',
              color: '#d4d4d4',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#d4d4d4';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <span style={{ fontSize: '1.125rem' }}>🔔</span>
            <div
              className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-white animate-pulse"
              style={{
                position: 'absolute',
                top: '-0.25rem',
                right: '-0.25rem',
                width: '0.5rem',
                height: '0.5rem',
                background: '#22c55e',
                borderRadius: '50%',
                border: '1px solid white',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
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
              placeholder="Search patients, doctors, records..."
              className="input-field w-64 pl-10"
              style={{
                width: '16rem',
                padding: '0.5rem 0.75rem 0.5rem 2.5rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '0.5rem',
                outline: 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                color: 'white',
                fontSize: '0.875rem'
              }}
              onFocus={(e) => {
                e.target.style.border = '1px solid rgba(59, 130, 246, 0.5)';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                e.target.style.boxShadow = 'none';
                e.target.style.background = 'rgba(255, 255, 255, 0.05)';
              }}
            />
            <span
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400"
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#a3a3a3'
              }}
            >
              🔍
            </span>
          </div>

          {/* Quick Actions */}
          <div 
            className="flex items-center space-x-2"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <button
              className="btn-primary px-3 py-2 text-sm"
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.5rem 0.75rem',
                fontWeight: '600',
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.filter = 'brightness(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.filter = 'brightness(1)';
              }}
            >
              + New Patient
            </button>
          </div>

          {/* User Profile */}
          <div
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/10 transition-all duration-300 cursor-pointer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem',
              borderRadius: '0.5rem',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
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
                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)'
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
            <div className="hidden md:block">
              <p
                className="text-sm font-semibold text-white"
                style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: 'white',
                  margin: 0
                }}
              >
                {user?.username || 'User'}
              </p>
              <p
                className="text-xs text-neutral-300 capitalize"
                style={{
                  fontSize: '0.75rem',
                  color: '#d4d4d4',
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
