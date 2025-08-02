'use client';

export default function InventoryPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-primary">
            Inventory Management
          </h1>
          <p className="text-sm text-neutral-300 mt-1">Manage medical supplies and equipment</p>
        </div>
        <button className="btn-primary px-4 py-2 text-sm">+ Add Item</button>
      </div>

      <div className="card-elevated p-4">
        <h2 className="text-lg font-bold text-white mb-4">Medical Supplies</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">💊</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Medications</p>
                <p className="text-xs text-neutral-400">1,247 items</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 rounded-lg border border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">🩹</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Bandages</p>
                <p className="text-xs text-neutral-400">856 items</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 rounded-lg border border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">🔬</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Lab Equipment</p>
                <p className="text-xs text-neutral-400">234 items</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}