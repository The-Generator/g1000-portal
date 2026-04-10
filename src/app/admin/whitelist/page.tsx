'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface WhitelistEmail {
  id: string;
  email: string;
  is_active: boolean;
  created_at?: string;
}

export default function WhitelistPage() {
  const [emails, setEmails] = useState<WhitelistEmail[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchWhitelist();
  }, []);

  const fetchWhitelist = async () => {
    try {
      const response = await fetch('/api/admin/whitelist');
      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      setEmails(data.data || []);
    } catch (error) {
      console.error('Error fetching whitelist:', error);
      toast.error('Failed to load whitelisted emails');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes('@')) {
      toast.error('Enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/whitelist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail.trim() }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      toast.success(data.message);
      setNewEmail(''); // Reset input
      
      // Update list without refetching if possible, but safely we can just refetch
      fetchWhitelist();
    } catch (error) {
      console.error('Add email error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add email');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveEmail = async (email: string) => {
    if (!confirm(`Are you sure you want to remove ${email} from the whitelist? They will no longer be able to register new accounts.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/whitelist?email=${encodeURIComponent(email)}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      toast.success(data.message);
      setEmails(prev => prev.filter(e => e.email !== email));
    } catch (error) {
      console.error('Delete email error:', error);
      toast.error('Failed to remove email');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Registration Whitelist</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage the list of explicit business emails allowed to create an account on the platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* ADD EMAIL FORM */}
        <div className="md:col-span-1">
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Add New Email</h2>
            <form onSubmit={handleAddEmail} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="newbusiness@example.com"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                required
              />
              <Button type="submit" loading={isSubmitting} className="w-full">
                <PlusIcon className="w-5 h-5 mr-1 -ml-1" />
                Add to Whitelist
              </Button>
            </form>
          </div>
        </div>

        {/* WHITELIST TABLE */}
        <div className="md:col-span-2">
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h2 className="text-base font-semibold text-gray-900">
                Pre-Approved Emails
              </h2>
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {emails.length} Authorized
              </span>
            </div>
            
            <ul className="divide-y divide-gray-200 h-[600px] overflow-y-auto">
              {emails.length === 0 ? (
                <li className="p-8 text-center text-gray-500">
                  No emails currently whitelisted.
                </li>
              ) : (
                emails.map((row) => (
                  <li key={row.email} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">{row.email}</span>
                      {row.created_at && (
                        <span className="text-xs text-gray-500 mt-1">
                          Added {new Date(row.created_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveEmail(row.email)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      title="Remove from whitelist"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
