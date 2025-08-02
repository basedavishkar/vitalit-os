'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const menuItems = [
  { name: 'Dashboard', icon: '🏠', href: '/dashboard' },
  { name: 'Patients', icon: '👥', href: '/dashboard/patients' },
  { name: 'Doctors', icon: '👨‍⚕️', href: '/dashboard/doctors' },
  { name: 'Appointments', icon: '📅', href: '/dashboard/appointments' },
  { name: 'Billing', icon: '💰', href: '/dashboard/billing' },
  { name: 'Records', icon: '📋', href: '/dashboard/records' },
  { name: 'Inventory', icon: '📦', href: '/dashboard/inventory' },
  { name: 'System', icon: '⚙️', href: '/dashboard/system' },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <motion.div 
      className="relative transition-all duration-300 ease-in-out"
      initial={{ width: 256 }}
      animate={{ width: isCollapsed ? 80 : 256 }}
    >
      <motion.div 
        className="fixed left-0 top-0 h-full glass border-r border-white/20 shadow-2xl z-50"
        initial={{ x: -256 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <motion.div 
            className="p-6 border-b border-white/20"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            <div className="flex items-center justify-center">
              <motion.div 
                className="flex items-center space-x-3"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div 
                  className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
                  whileHover={{ 
                    rotate: 360,
                    scale: 1.1
                  }}
                  transition={{ duration: 0.6 }}
                >
                  <span className="text-white text-lg font-bold">V</span>
                </motion.div>
                <AnimatePresence mode="wait">
                  {!isCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.h1 
                        className="text-xl font-bold gradient-text"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                      >
                        VITALIt
                      </motion.h1>
                      <motion.p 
                        className="text-xs text-gray-500"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                      >
                        Healthcare
                      </motion.p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </motion.div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            <AnimatePresence>
              {menuItems.map((item, index) => {
                const isActive = pathname === item.href;
                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.05, duration: 0.5 }}
                  >
                    <Link href={item.href} className="block">
                      <motion.div
                        className={`sidebar-item ${isActive ? 'sidebar-item-active' : ''}`}
                        whileHover={{ 
                          scale: 1.02,
                          x: 5
                        }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                      >
                        <motion.span 
                          className="text-lg mr-3"
                          whileHover={{ scale: 1.2 }}
                          transition={{ duration: 0.2 }}
                        >
                          {item.icon}
                        </motion.span>
                        <AnimatePresence mode="wait">
                          {!isCollapsed && (
                            <motion.span
                              className="truncate"
                              initial={{ opacity: 0, width: 0 }}
                              animate={{ opacity: 1, width: "auto" }}
                              exit={{ opacity: 0, width: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              {item.name}
                            </motion.span>
                          )}
                        </AnimatePresence>
                        {isActive && (
                          <motion.div 
                            className="ml-auto w-2 h-2 bg-blue-500 rounded-full"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.3, type: "spring" }}
                          />
                        )}
                      </motion.div>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-white/20">
            {/* Collapse Button */}
            <motion.button
              className="w-full flex items-center justify-center p-3 rounded-xl text-gray-600 hover:bg-white/50 hover:text-gray-900 transition-all duration-200"
              onClick={() => setIsCollapsed(!isCollapsed)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <motion.span 
                className="text-lg"
                animate={{ rotate: isCollapsed ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                ←
              </motion.span>
              <AnimatePresence mode="wait">
                {!isCollapsed && (
                  <motion.span
                    className="ml-2 text-sm"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    Collapse
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Logout Button */}
            <motion.button
              className="w-full mt-2 flex items-center justify-center p-3 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200"
              onClick={handleLogout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <motion.span 
                className="text-lg"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                🚪
              </motion.span>
              <AnimatePresence mode="wait">
                {!isCollapsed && (
                  <motion.span
                    className="ml-2 text-sm"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    Logout
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* User Info */}
            <AnimatePresence mode="wait">
              {!isCollapsed && user && (
                <motion.div
                  className="mt-4 p-3 glass rounded-xl border border-gray-200/30"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div 
                    className="flex items-center space-x-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                  >
                    <motion.div 
                      className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {user.username.charAt(0).toUpperCase()}
                    </motion.div>
                    <div>
                      <motion.p 
                        className="text-sm font-semibold text-gray-900"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                      >
                        {user.username}
                      </motion.p>
                      <motion.p 
                        className="text-xs text-gray-500 capitalize"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                      >
                        {user.role}
                      </motion.p>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
