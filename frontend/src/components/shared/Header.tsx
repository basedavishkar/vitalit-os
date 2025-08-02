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
        className="flex items-center justify-between px-8 py-6"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.5rem 2rem'
        }}
      >
        {/* Left side - Breadcrumb */}
        <div 
          className="flex items-center space-x-4"
          style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
        >
          <h1 
            className="headline-2 gradient-primary"
            style={{
              fontSize: '2.25rem',
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
            className="text-neutral-300 font-medium"
            style={{ color: '#d4d4d4', fontWeight: '500' }}
          >
            Healthcare Management
          </span>
        </div>

        {/* Right side - User profile and actions */}
        <div 
          className="flex items-center space-x-6"
          style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}
        >
          {/* Notifications */}
          <button
            className="relative p-3 rounded-xl text-neutral-300 hover:bg-white/10 hover:text-white transition-all duration-300"
            style={{
              position: 'relative',
              padding: '0.75rem',
              borderRadius: '0.75rem',
              color: '#d4d4d4',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#d4d4d4';
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>🔔</span>
            <div
              className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"
              style={{
                position: 'absolute',
                top: '-0.25rem',
                right: '-0.25rem',
                width: '0.75rem',
                height: '0.75rem',
                background: '#22c55e',
                borderRadius: '50%',
                border: '2px solid white',
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
              className="input-field w-80 pl-12"
              style={{
                width: '20rem',
                padding: '0.75rem 1rem 0.75rem 3rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '0.75rem',
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
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400"
              style={{
                position: 'absolute',
                left: '1rem',
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
            className="flex items-center space-x-3"
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
          >
            <button
              className="btn-primary px-4 py-2 text-sm"
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '0.75rem',
                padding: '0.5rem 1rem',
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
            className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/10 transition-all duration-300 cursor-pointer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem',
              borderRadius: '0.75rem',
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
              className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm"
              style={{
                width: '2.5rem',
                height: '2.5rem',
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
