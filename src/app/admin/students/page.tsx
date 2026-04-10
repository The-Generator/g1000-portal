'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  PlusIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ArrowUpTrayIcon,
  UserCircleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Participant {
  id?: string;
  email: string;
  name?: string;
  major?: string;
  year?: string;
  created_at?: string;
}

export default function StudentWhitelistPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [filtered, setFiltered] = useState<Participant[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [form, setForm] = useState({ email: '', name: '', major: '', year: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchParticipants(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      q
        ? participants.filter(
            p =>
              p.email.toLowerCase().includes(q) ||
              p.name?.toLowerCase().includes(q) ||
              p.major?.toLowerCase().includes(q)
          )
        : participants
    );
  }, [search, participants]);

  const fetchParticipants = async () => {
    try {
      const res = await fetch('/api/admin/participants');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setParticipants(data.data || []);
    } catch {
      toast.error('Failed to load student whitelist');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(data.message);
      setForm({ email: '', name: '', major: '', year: '' });
      fetchParticipants();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add student');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async (email: string) => {
    if (!confirm(`Remove ${email} from the student whitelist?`)) return;
    try {
      const res = await fetch(`/api/admin/participants?email=${encodeURIComponent(email)}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(data.message);
      setParticipants(prev => prev.filter(p => p.email !== email));
    } catch {
      toast.error('Failed to remove student');
    }
  };

  const handleCsvImport = async () => {
    const lines = csvText.trim().split('\n').filter(l => l.trim());
    if (lines.length === 0) { toast.error('Paste some CSV rows first'); return; }

    setIsSubmitting(true);
    let added = 0, skipped = 0;

    for (const line of lines) {
      const [email, name, major, year] = line.split(',').map(s => s.trim().replace(/^"|"$/g, ''));
      if (!email || !email.includes('@')) { skipped++; continue; }
      const res = await fetch('/api/admin/participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, major, year }),
      });
      if (res.ok) added++; else skipped++;
    }
    toast.success(`Import done: ${added} added, ${skipped} skipped`);
    setCsvText('');
    setIsBulkMode(false);
    fetchParticipants();
    setIsSubmitting(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setCsvText(ev.target?.result as string);
      setIsBulkMode(true);
    };
    reader.readAsText(file);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Whitelist</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage which students are allowed to log into the G1000 Portal.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input type="file" accept=".csv,.txt" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2"
          >
            <ArrowUpTrayIcon className="w-4 h-4" />
            Import CSV
          </Button>
          <Button
            variant={isBulkMode ? 'primary' : 'outline'}
            onClick={() => setIsBulkMode(v => !v)}
            className="flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            Bulk Paste
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT PANEL — add form or bulk paste */}
        <div className="lg:col-span-1 space-y-6">
          {isBulkMode ? (
            <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-1">Bulk CSV Import</h2>
              <p className="text-xs text-gray-500 mb-4">
                One row per line: <code className="bg-gray-100 px-1 rounded">email, name, major, year</code>
              </p>
              <textarea
                rows={10}
                value={csvText}
                onChange={e => setCsvText(e.target.value)}
                placeholder={"joe@babson.edu, Joe Smith, Entrepreneurship, 2025\njane@babson.edu, Jane Doe, Finance, 2026"}
                className="w-full text-xs font-mono px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-generator-green resize-y"
              />
              <div className="flex gap-2 mt-3">
                <Button onClick={handleCsvImport} loading={isSubmitting} className="flex-1">
                  <CheckCircleIcon className="w-4 h-4 mr-1" /> Import {csvText.trim().split('\n').filter(l => l.trim()).length} rows
                </Button>
                <Button variant="outline" onClick={() => { setIsBulkMode(false); setCsvText(''); }}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <UserCircleIcon className="w-5 h-5 text-generator-green" />
                Add Student
              </h2>
              <form onSubmit={handleAddSingle} className="space-y-3">
                <Input
                  label="Email*"
                  type="email"
                  placeholder="student@babson.edu"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                />
                <Input
                  label="Full Name"
                  type="text"
                  placeholder="Jane Smith"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
                <Input
                  label="Major"
                  type="text"
                  placeholder="Entrepreneurship"
                  value={form.major}
                  onChange={e => setForm(f => ({ ...f, major: e.target.value }))}
                />
                <Input
                  label="Graduation Year"
                  type="text"
                  placeholder="2026"
                  value={form.year}
                  onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
                />
                <Button type="submit" loading={isSubmitting} className="w-full mt-1">
                  <PlusIcon className="w-4 h-4 mr-1" />
                  Add to Whitelist
                </Button>
              </form>
            </div>
          )}

          {/* Stats */}
          <div className="bg-generator-green/5 border border-generator-green/20 rounded-xl p-4 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Total Students</span>
            <span className="text-2xl font-bold text-generator-green">{participants.length}</span>
          </div>
        </div>

        {/* RIGHT PANEL — list */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
            {/* Search bar */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
              <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by email, name or major..."
                className="flex-1 text-sm outline-none bg-transparent text-gray-800 placeholder-gray-400"
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-xs text-gray-400 hover:text-gray-600">
                  Clear
                </button>
              )}
              <span className="text-xs text-gray-400 shrink-0">{filtered.length} shown</span>
            </div>

            {/* List */}
            <ul className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
              {filtered.length === 0 ? (
                <li className="py-12 text-center text-gray-400 text-sm">
                  {search ? 'No students match your search.' : 'No students on the whitelist yet.'}
                </li>
              ) : (
                filtered.map(p => (
                  <li key={p.email} className="px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-9 h-9 rounded-full bg-generator-green/10 flex items-center justify-center shrink-0 border border-generator-green/20">
                        <span className="text-xs font-bold text-generator-green uppercase">
                          {(p.name || p.email).charAt(0)}
                        </span>
                      </div>
                      <div className="overflow-hidden">
                        {p.name && <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>}
                        <p className="text-xs text-gray-500 truncate">{p.email}</p>
                        {(p.major || p.year) && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {[p.major, p.year].filter(Boolean).join(' · ')}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemove(p.email)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all shrink-0"
                      title="Remove student"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
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
