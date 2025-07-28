"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginModal from '@/components/auth/LoginModal';

export default function Header() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { user, logout } = useAuth();

  return (
    <>
      <header className="bg-white/80 shadow flex justify-between items-center px-8 py-4 border-b border-emerald-100">
        <h1 className="text-2xl font-extrabold text-emerald-700 tracking-tight">VITALIt-OS</h1>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm text-gray-600">Logged in as <span className="font-medium capitalize">{user.role}</span></span>
              <button
                onClick={logout}
                className="text-sm bg-emerald-600 text-white px-3 py-1 rounded hover:bg-emerald-700 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="text-sm bg-emerald-600 text-white px-3 py-1 rounded hover:bg-emerald-700 transition"
            >
              Login
            </button>
          )}
        </div>
      </header>
      
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </>
  );
}
