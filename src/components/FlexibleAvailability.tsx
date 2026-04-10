'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { AvailabilitySlot } from '@/types';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface FlexibleAvailabilityProps {
  availabilitySlots: AvailabilitySlot[];
  onChange: (slots: AvailabilitySlot[]) => void;
  timezone: string;
}

const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

// Simple ID generator
let counter = 0;
function generateId(): string {
  counter++;
  return `slot_${Date.now()}_${counter}`;
}

export default function FlexibleAvailability({ 
  availabilitySlots, 
  onChange, 
  timezone 
}: FlexibleAvailabilityProps) {
  
  // Ensure all slots have IDs
  const slotsWithIds = availabilitySlots.map(slot => ({
    ...slot,
    id: slot.id || generateId()
  }));

  const addTimeSlot = (day: string) => {
    const newSlot: AvailabilitySlot = {
      id: generateId(),
      day,
      start_time: '09:00',
      end_time: '17:00'
    };
    onChange([...slotsWithIds, newSlot]);
  };

  const updateSlot = (slotId: string, field: 'start_time' | 'end_time', value: string) => {
    const updated = slotsWithIds.map(slot => 
      slot.id === slotId 
        ? { ...slot, [field]: value }
        : slot
    );
    onChange(updated);
  };

  const removeSlot = (slotId: string) => {
    const filtered = slotsWithIds.filter(slot => slot.id !== slotId);
    onChange(filtered);
  };

  const getSlotsByDay = (day: string) => {
    return slotsWithIds
      .filter(slot => slot.day === day)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium text-gray-900">Weekly Availability</h4>
        <div className="text-sm text-gray-600">
          Timezone: <strong>{timezone || 'America/New_York'}</strong>
        </div>
      </div>

      {DAYS_OF_WEEK.map((day) => {
        const daySlots = getSlotsByDay(day);
        
        return (
          <div key={day} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-medium text-gray-900">{day}</h5>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => addTimeSlot(day)}
                className="text-xs"
              >
                <PlusIcon className="w-3 h-3 mr-1" />
                Add Time
              </Button>
            </div>

            {daySlots.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No availability set</p>
            ) : (
              <div className="space-y-3">
                {daySlots.map((slot) => (
                  <div key={slot.id} className="flex items-center gap-3">
                    <input
                      type="time"
                      value={slot.start_time}
                      onChange={(e) => updateSlot(slot.id, 'start_time', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <span className="text-gray-500 text-sm">to</span>
                    <input
                      type="time"
                      value={slot.end_time}
                      onChange={(e) => updateSlot(slot.id, 'end_time', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeSlot(slot.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {slotsWithIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h6 className="font-medium text-blue-900 mb-2">Availability Summary</h6>
          <div className="space-y-1">
            {DAYS_OF_WEEK.map((day) => {
              const daySlots = getSlotsByDay(day);
              if (daySlots.length === 0) return null;
              
              return (
                <p key={day} className="text-sm text-blue-800">
                  <strong>{day}:</strong> {daySlots.map(slot => 
                    `${slot.start_time} - ${slot.end_time}`
                  ).join(', ')}
                </p>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
} 