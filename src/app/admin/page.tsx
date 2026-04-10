'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Business {
  user_id: string;
  company_name: string;
  business_name?: string;
  is_approved: boolean;
  users: {
    email: string;
    name: string;
  };
  created_at: string;
}

export default function AdminDashboard() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    try {
      const response = await fetch('/api/admin/businesses');
      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      setBusinesses(data.data);
    } catch (error) {
      console.error('Error fetching businesses:', error);
      toast.error('Failed to load businesses');
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalChange = async (userId: string, isApproved: boolean) => {
    try {
      const response = await fetch('/api/admin/businesses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isApproved }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      toast.success(isApproved ? 'Business approved' : 'Business approval revoked');
      
      // Update local state
      setBusinesses(prev => prev.map(b => 
        b.user_id === userId ? { ...b, is_approved: isApproved } : b
      ));

    } catch (error) {
      console.error('Error updating approval:', error);
      toast.error('Failed to update business status');
    }
  };

  const handleRejectBusiness = async (userId: string) => {
    if (!confirm('Are you sure you want to REJECT and DELETE this business application? They will need to re-register if they want to try again.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/businesses?userId=${encodeURIComponent(userId)}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      toast.success('Registration rejected successfully');
      
      // Update local state by removing the rejected business entirely
      setBusinesses(prev => prev.filter(b => b.user_id !== userId));

    } catch (error) {
      console.error('Error rejecting business:', error);
      toast.error('Failed to reject registration');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const filteredBusinesses = businesses.filter(b => 
    activeTab === 'pending' ? !b.is_approved : b.is_approved
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Business Approvals</h1>
          <p className="mt-1 text-sm text-gray-500">
            Review and manage business owner access to the portal.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('pending')}
            className={`${
              activeTab === 'pending'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Pending Approvals
            <span className="ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium bg-gray-100 text-gray-900">
              {businesses.filter(b => !b.is_approved).length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`${
              activeTab === 'approved'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Approved Businesses
            <span className="ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium bg-gray-100 text-gray-900">
              {businesses.filter(b => b.is_approved).length}
            </span>
          </button>
        </nav>
      </div>

      {/* Table List */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
        <ul className="divide-y divide-gray-200">
          {filteredBusinesses.length === 0 ? (
            <li className="p-8 text-center text-gray-500">
              No {activeTab} businesses found.
            </li>
          ) : (
            filteredBusinesses.map((business) => (
              <li key={business.user_id} className="p-4 sm:p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col xl:flex-row xl:items-center space-y-2 xl:space-y-0 flex-1 min-w-0 mr-4">
                    <div className="flex flex-col sm:flex-row sm:items-center text-sm min-w-0 flex-1">
                      <span className="font-semibold text-gray-900 w-48 truncate">
                        {business.company_name || business.business_name}
                      </span>
                      <span className="sm:w-40 text-gray-700 truncate sm:ml-4 sm:border-l sm:border-gray-300 sm:pl-4">
                        {business.users?.name}
                      </span>
                      <span className="flex-1 text-gray-500 truncate min-w-0 sm:ml-4 sm:border-l sm:border-gray-300 sm:pl-4">
                        {business.users?.email}
                      </span>
                    </div>
                    <div className="hidden xl:flex items-center text-sm text-gray-400 whitespace-nowrap ml-4">
                      <span>Joined {new Date(business.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3 ml-4">
                    {activeTab === 'pending' ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleApprovalChange(business.user_id, true)}
                          className="!bg-green-500 hover:!bg-green-600 !bg-none border-transparent text-white shadow-sm"
                        >
                          <CheckCircleIcon className="w-5 h-5 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleRejectBusiness(business.user_id)}
                        >
                          <XCircleIcon className="w-5 h-5 mr-1" />
                          Reject
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleApprovalChange(business.user_id, false)}
                      >
                        <XCircleIcon className="w-5 h-5 mr-1" />
                        Revoke
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
