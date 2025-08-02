export default function CSSTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold gradient-text mb-8 text-center">
          CSS Test Page
        </h1>
        
        {/* Test Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Card 1</h2>
            <p className="text-gray-600">This is a test card with glass effect.</p>
          </div>
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Card 2</h2>
            <p className="text-gray-600">This is a test card with glass effect.</p>
          </div>
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Card 3</h2>
            <p className="text-gray-600">This is a test card with glass effect.</p>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button className="btn-primary">Primary Button</button>
          <button className="btn-secondary">Secondary Button</button>
        </div>

        {/* Test Input */}
        <div className="mb-8">
          <input 
            type="text" 
            placeholder="Test input field" 
            className="input-field w-full max-w-md"
          />
        </div>

        {/* Test Colors */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-500 text-white p-4 rounded-lg">Blue</div>
          <div className="bg-purple-500 text-white p-4 rounded-lg">Purple</div>
          <div className="bg-green-500 text-white p-4 rounded-lg">Green</div>
          <div className="bg-red-500 text-white p-4 rounded-lg">Red</div>
        </div>
      </div>
    </div>
  );
} 