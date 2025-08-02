'use client';

import { motion } from 'framer-motion';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Test Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold gradient-text mb-4">
            CSS Styling Test Page
          </h1>
          <p className="text-gray-600 text-lg">
            Testing all the beautiful styling components
          </p>
        </motion.div>

        {/* Test Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Glass Card</h3>
            <p className="text-gray-600">This card uses the glass effect with backdrop blur</p>
          </div>
          
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Gradient Text</h3>
            <p className="gradient-text text-lg font-bold">Beautiful gradient text effect</p>
          </div>
          
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Animations</h3>
            <p className="text-gray-600">Smooth animations with Framer Motion</p>
          </div>
        </motion.div>

        {/* Test Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap gap-4 justify-center"
        >
          <button className="btn-primary">
            Primary Button
          </button>
          <button className="btn-secondary">
            Secondary Button
          </button>
        </motion.div>

        {/* Test Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="max-w-md mx-auto"
        >
          <input 
            type="text" 
            placeholder="Test input field..." 
            className="input-field"
          />
        </motion.div>

        {/* Status */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center"
        >
          <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full">
            <span className="mr-2">✅</span>
            CSS Styling is Working!
          </div>
        </motion.div>
      </div>
    </div>
  );
} 