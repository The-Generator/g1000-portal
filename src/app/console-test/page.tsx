'use client';

import { useEffect } from 'react';

export default function ConsoleTest() {
  console.log('🔥 CONSOLE TEST: Page component rendered!');

  useEffect(() => {
    console.log('🔥 CONSOLE TEST: useEffect ran!');
    console.log('🔥 CONSOLE TEST: Current time:', new Date().toISOString());
    
    // Test basic functionality
    const button = document.getElementById('test-button');
    if (button) {
      console.log('🔥 CONSOLE TEST: Button found!');
    }
  }, []);

  const handleClick = () => {
    console.log('🔥 CONSOLE TEST: Button clicked!');
    alert('Button clicked! Check console.');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Console Test Page</h1>
        <p className="mb-4">This page should show console logs immediately.</p>
        
        <button 
          id="test-button"
          onClick={handleClick}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Click me to test console
        </button>
        
        <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 rounded">
          <p className="text-sm">
            <strong>Instructions:</strong>
            <br />1. Open browser dev tools (F12)
            <br />2. Go to Console tab
            <br />3. You should see messages starting with "🔥 CONSOLE TEST"
            <br />4. Click the button above for more logs
          </p>
        </div>
      </div>
    </div>
  );
} 