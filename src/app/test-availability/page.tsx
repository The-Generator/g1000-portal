'use client';

import React, { useState } from 'react';

interface TimeSlot {
  id: string;
  day: string;
  start_time: string;
  end_time: string;
}

let slotCounter = 0;

export default function TestAvailability() {
  const [slots, setSlots] = useState<TimeSlot[]>([]);

  const addSlot = () => {
    slotCounter++;
    const newSlot: TimeSlot = {
      id: `test_slot_${slotCounter}`,
      day: 'Monday',
      start_time: '09:00',
      end_time: '17:00'
    };
    
    console.log('Adding slot:', newSlot);
    setSlots(prev => [...prev, newSlot]);
  };

  const updateSlot = (id: string, field: 'start_time' | 'end_time', value: string) => {
    console.log('Updating slot:', id, field, value);
    
    setSlots(prev => prev.map(slot => 
      slot.id === id 
        ? { ...slot, [field]: value }
        : slot
    ));
  };

  const removeSlot = (id: string) => {
    console.log('Removing slot:', id);
    setSlots(prev => prev.filter(slot => slot.id !== id));
  };

  console.log('Current slots:', slots);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Availability Slots Test</h1>
        
        <button 
          onClick={addSlot}
          className="mb-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Time Slot
        </button>

        <div className="space-y-4">
          {slots.map((slot) => (
            <div key={slot.id} className="flex items-center gap-4 p-4 bg-white rounded border">
              <span className="w-20 text-sm font-medium">ID: {slot.id}</span>
              
              <input
                type="time"
                value={slot.start_time}
                onChange={(e) => {
                  console.log('Start time input changed:', e.target.value, 'for slot:', slot.id);
                  updateSlot(slot.id, 'start_time', e.target.value);
                }}
                className="px-3 py-2 border rounded text-sm"
              />
              
              <span className="text-gray-500">to</span>
              
              <input
                type="time"
                value={slot.end_time}
                onChange={(e) => {
                  console.log('End time input changed:', e.target.value, 'for slot:', slot.id);
                  updateSlot(slot.id, 'end_time', e.target.value);
                }}
                className="px-3 py-2 border rounded text-sm"
              />
              
              <button
                onClick={() => removeSlot(slot.id)}
                className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {slots.length === 0 && (
          <p className="text-gray-500 text-center py-8">No time slots added yet.</p>
        )}

        <div className="mt-8 p-4 bg-gray-100 rounded">
          <h3 className="font-medium mb-2">Debug Info:</h3>
          <pre className="text-xs">{JSON.stringify(slots, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
} 