'use client';

import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

export default function Header() {
  const { user } = useAuth();

  return (
    <motion.header 
      className="sticky top-0 z-40 glass border-b border-white/20 shadow-sm"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <motion.h1 
            className="text-2xl font-bold gradient-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            Dashboard
          </motion.h1>
          <motion.div 
            className="w-1 h-1 bg-gray-400 rounded-full"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          />
          <motion.span 
            className="text-gray-600 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            Healthcare Management
          </motion.span>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <motion.button 
            className="relative p-2 rounded-xl text-gray-600 hover:bg-white/50 hover:text-gray-900 transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-xl">🔔</span>
            <motion.div 
              className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, duration: 0.3, type: "spring" }}
            />
          </motion.button>
          
          {/* Search */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            <input 
              type="text" 
              placeholder="Search..." 
              className="input-field w-64 pl-10"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
          </motion.div>
          
          {/* User Profile */}
          <motion.div 
            className="flex items-center space-x-3 p-2 rounded-xl hover:bg-white/50 transition-all duration-200 cursor-pointer"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.4 }}
          >
            <motion.div 
              className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm"
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </motion.div>
            <div className="hidden md:block">
              <motion.p 
                className="text-sm font-semibold text-gray-900"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.4 }}
              >
                {user?.username || 'User'}
              </motion.p>
              <motion.p 
                className="text-xs text-gray-500 capitalize"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.4 }}
              >
                {user?.role || 'Admin'}
              </motion.p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}
