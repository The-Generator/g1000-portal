'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AvailabilitySlot } from '@/types';

interface WeeklyAvailabilityProps {
  slots: AvailabilitySlot[];
  onChange: (newSlots: AvailabilitySlot[]) => void;
  timezone: string;
  onTimezoneChange: (timezone: string) => void;
}

const WEEKDAYS = [
  'Monday',
  'Tuesday', 
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

const COMMON_TIMEZONES = [
  'America/New_York',
  'America/Chicago', 
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
  'UTC'
];

export function WeeklyAvailability({ 
  slots, 
  onChange, 
  timezone, 
  onTimezoneChange 
}: WeeklyAvailabilityProps) {
  
  // Ensure all slots have IDs on first mount
  useEffect(() => {
    const slotsNeedingIds = slots.filter(slot => !slot.id);
    if (slotsNeedingIds.length > 0) {
      const updatedSlots = slots.map(slot => 
        slot.id ? slot : { ...slot, id: uuidv4() }
      );
      onChange(updatedSlots);
    }
  }, []); // Only run on mount

  // Group slots by day for display
  const slotsByDay = useMemo(() => {
    const grouped: Record<string, AvailabilitySlot[]> = {};
    WEEKDAYS.forEach(day => {
      grouped[day] = slots.filter(slot => slot.day === day);
    });
    return grouped;
  }, [slots]);

  const addTimeSlot = (day: string) => {
    const newSlot: AvailabilitySlot = {
      id: uuidv4(),
      day,
      start_time: '09:00',
      end_time: '17:00'
    };
    onChange([...slots, newSlot]);
  };

  const updateTimeSlot = (id: string, field: 'start_time' | 'end_time', value: string) => {
    const updatedSlots = slots.map(slot =>
      slot.id === id ? { ...slot, [field]: value } : slot
    );
    onChange(updatedSlots);
  };

  const removeTimeSlot = (id: string) => {
    const updatedSlots = slots.filter(slot => slot.id !== id);
    onChange(updatedSlots);
  };

  return (
    <div className="space-y-6">
      {/* Timezone Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Timezone
        </label>
        <select
          value={timezone}
          onChange={(e) => onTimezoneChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          {COMMON_TIMEZONES.map(tz => (
            <option key={tz} value={tz}>
              {tz.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      {/* Weekly Schedule */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Weekly Availability</h3>
        
        {WEEKDAYS.map(day => (
          <div key={day} className="border border-gray-200 rounded-lg p-4 bg-white">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">{day}</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addTimeSlot(day)}
              >
                + Add Time
              </Button>
            </div>
            
            <div className="space-y-3">
              {slotsByDay[day].length === 0 ? (
                <p className="text-sm text-gray-500 italic">No availability set</p>
              ) : (
                slotsByDay[day].map(slot => (
                  <div key={slot.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="time"
                        value={slot.start_time}
                        onChange={(e) => updateTimeSlot(slot.id, 'start_time', e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                      <span className="text-gray-500 text-sm">to</span>
                      <input
                        type="time"
                        value={slot.end_time}
                        onChange={(e) => updateTimeSlot(slot.id, 'end_time', e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTimeSlot(slot.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Remove
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 