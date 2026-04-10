'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { 
  PlusIcon,
  VideoCameraIcon,
  MagnifyingGlassIcon,
  Cog6ToothIcon,
  PencilSquareIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { getToolColor } from '@/lib/utils';

type Resource = {
  id: number;
  title: string;
  tool: string;
  category: string;
  duration: string;
  video_url: string;
  creator: string;
  created_at: string;
};

export default function AdminResourcesPage() {
  const [activeTab, setActiveTab] = useState<'videos' | 'options'>('videos');
  const [resources, setResources] = useState<Resource[]>([]);
  const [customColors, setCustomColors] = useState<Record<string, string>>({});
  const [dbCategories, setDbCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    videoUrl: '',
    tool: '',
    category: '',
    duration: '',
    creator: '',
    description: ''
  });

  // Category Edit State
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingCategoryValue, setEditingCategoryValue] = useState('');
  const [newCategoryValue, setNewCategoryValue] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const [resResponse, colResponse, catResponse] = await Promise.all([
        fetch('/api/admin/resources'),
        fetch('/api/tools/colors'),
        fetch('/api/categories')
      ]);

      const resData = await resResponse.json();
      setResources(resData.data || []);

      if (colResponse.ok) {
        const colData = await colResponse.json();
        const colMap: Record<string, string> = {};
        if (colData.data) {
          colData.data.forEach((c: any) => { colMap[c.tool_name] = c.color_hex; });
        }
        setCustomColors(colMap);
      }

      if (catResponse.ok) {
        const catData = await catResponse.json();
        if (catData.data) {
          setDbCategories(catData.data.map((c: any) => c.name));
        }
      }
    } catch (error) {
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.videoUrl.trim()) return;

    setIsCreating(true);
    try {
      const response = await fetch('/api/admin/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          video_url: formData.videoUrl,
          description: formData.description || 'No description provided.',
          tool: formData.tool || 'General',
          category: formData.category || 'Uncategorized',
          duration: formData.duration || '00:00',
          creator: formData.creator || 'G1000 Instructor'
        }),
      });

      if (response.ok) {
        const { data } = await response.json();
        toast.success('Draft created!');
        window.location.href = `/admin/resources/${data.id}`;
      } else {
        throw new Error('Failed to create');
      }
    } catch (error) {
      toast.error('Failed to create draft');
      setIsCreating(false);
    }
  };

  const handleColorChange = (tool: string, hex: string) => {
    setCustomColors(prev => ({...prev, [tool]: hex}));
  };

  const handleSaveColor = async (tool: string, hex: string) => {
    try {
      const response = await fetch('/api/admin/tools/colors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool_name: tool, color_hex: hex })
      });
      if (response.ok) {
        toast.success(`Color saved for ${tool}!`);
      }
    } catch (e) {
      toast.error(`Failed to save color for ${tool}`);
    }
  };

  const handleAddNewCategory = async () => {
    if (!newCategoryValue.trim()) return;
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryValue })
      });
      if (res.ok) {
        toast.success(`Category added!`);
        setDbCategories(prev => [...prev, newCategoryValue.trim()]);
        setNewCategoryValue('');
        setIsAddingCategory(false);
      }
    } catch (e) {
      toast.error('Failed to add category');
    }
  };

  const handleRenameCategory = async (oldName: string) => {
    if (!editingCategoryValue.trim() || editingCategoryValue === oldName) {
      setEditingCategory(null);
      return;
    }
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldName, newName: editingCategoryValue })
      });
      if (res.ok) {
        toast.success(`Category renamed across all videos!`);
        fetchResources(); // Re-fetch to update all resources utilizing it
      }
    } catch (e) {
      toast.error('Failed to rename category');
    } finally {
      setEditingCategory(null);
    }
  };

  const sortedResources = [...resources].sort((a, b) => b.id - a.id);
  const filteredResources = sortedResources.filter(res => 
    res.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    res.tool.toLowerCase().includes(searchQuery.toLowerCase()) ||
    res.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Derived Options
  const uniqueTools = Array.from(new Set(resources.map(r => r.tool))).filter(Boolean).sort();
  const derivedCategories = resources.map(r => r.category).filter(Boolean);
  const allCategories = Array.from(new Set([...derivedCategories, ...dbCategories])).sort();

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <VideoCameraIcon className="w-8 h-8 text-generator-green" />
            Video Resources
          </h1>
          <p className="mt-2 text-gray-600">
            Manage educational tutorials and their attached support files.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-generator-green focus:border-generator-green sm:w-64"
            />
          </div>
          
          <Button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2">
            <PlusIcon className="w-5 h-5" />
            New Resource
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-8 space-x-4">
        <button
          onClick={() => setActiveTab('videos')}
          className={`py-3 px-6 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'videos' ? 'border-generator-green text-generator-green' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
        >
          <VideoCameraIcon className="w-5 h-5" />
          Video Entries
        </button>
        <button
          onClick={() => setActiveTab('options')}
          className={`py-3 px-6 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'options' ? 'border-generator-green text-generator-green' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
        >
          <Cog6ToothIcon className="w-5 h-5" />
          Categories & Tool Colors
        </button>
      </div>

      {activeTab === 'videos' && (
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500">Loading resources...</div>
          ) : filteredResources.length === 0 ? (
            <div className="p-16 text-center">
              <VideoCameraIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No resources found</h3>
              <p className="mt-1 text-gray-500">Get started by creating a new video resource.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Title & Category</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Creator</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tool</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Video URL</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Duration</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredResources.map((resource) => {
                    const colorOrClass = getToolColor(resource.tool, customColors);
                    const isTailwind = colorOrClass.startsWith('bg-');
                    return (
                      <tr key={resource.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-900">{resource.title}</span>
                            <span className="text-xs text-generator-green font-medium uppercase tracking-wider mt-1">{resource.category}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                          {resource.creator || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span 
                            className={`px-2.5 py-1 text-xs font-bold text-white shadow-sm rounded-md uppercase tracking-wider ${isTailwind ? colorOrClass : ''}`}
                            style={!isTailwind ? { backgroundColor: colorOrClass } : undefined}
                          >
                            {resource.tool}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                          <a href={resource.video_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline inline-block max-w-[200px] truncate">
                            {resource.video_url || 'No linking'}
                          </a>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                          {resource.duration}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link 
                            href={`/admin/resources/${resource.id}`}
                            className="text-generator-green hover:text-green-800 bg-green-50 hover:bg-green-100 px-4 py-2 rounded-lg font-bold transition-colors inline-block"
                          >
                            Edit / Manage
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'options' && (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-8 h-max">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Recognized Tool Colors</h2>
            <p className="text-sm text-gray-500 mb-8">
              Tools used in videos are automatically assigned a dynamic color. Any brand-new tool entered during video creation is mathematically assigned a rich, readable color sequence so that white text pops.
            </p>
            <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-2">
              {uniqueTools.map((tool) => {
                const colorOrClass = getToolColor(tool, customColors);
                const isTailwind = colorOrClass.startsWith('bg-');
                // Extract hex if it's a valid hex, otherwise default to black for the picker
                const hexValue = colorOrClass.startsWith('#') ? colorOrClass : '#000000';
                
                return (
                  <div key={tool} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-xl hover:border-gray-300 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div 
                        className={`w-8 h-8 rounded-lg flex-shrink-0 shadow-sm border border-black/5 ${isTailwind ? colorOrClass : ''}`}
                        style={!isTailwind ? { backgroundColor: colorOrClass } : undefined}
                      />
                      <span className="font-bold text-gray-800 tracking-wide uppercase text-sm">{tool}</span>
                    </div>
                    <div className="relative flex items-center">
                      <input 
                        type="color" 
                        value={hexValue} 
                        onChange={(e) => handleColorChange(tool, e.target.value)}
                        onBlur={(e) => handleSaveColor(tool, e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                        title="Edit Color"
                      />
                      <button className="p-2 text-gray-400 group-hover:text-generator-green rounded-lg bg-white shadow-sm border border-gray-200 transition-colors flex items-center gap-2 text-xs font-semibold">
                        <PencilSquareIcon className="w-4 h-4 pointer-events-none" />
                        Edit Color
                      </button>
                    </div>
                  </div>
                );
              })}
              {uniqueTools.length === 0 && <span className="text-gray-400 italic">No tools recorded yet.</span>}
            </div>
          </div>

          <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-8 h-max">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-gray-900">Active Categories</h2>
              <Button onClick={() => setIsAddingCategory(true)} className="text-xs px-3 py-1 flex items-center gap-1 bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 shadow-none">
                <PlusIcon className="w-3.5 h-3.5" />
                Add Category
              </Button>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              A master list of all categories. Renaming a category here updates it automatically across all existing videos.
            </p>

            {isAddingCategory && (
              <div className="flex items-center gap-2 mb-6 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <input 
                  type="text" 
                  value={newCategoryValue}
                  onChange={(e) => setNewCategoryValue(e.target.value)}
                  placeholder="New category name"
                  className="flex-1 text-sm border-gray-300 rounded-md focus:ring-generator-green focus:border-generator-green py-1.5 px-3"
                  autoFocus
                />
                <button onClick={handleAddNewCategory} className="p-1.5 bg-generator-green text-white rounded-md hover:bg-green-700">
                  <CheckIcon className="w-4 h-4" />
                </button>
                <button onClick={() => setIsAddingCategory(false)} className="p-1.5 bg-gray-200 text-gray-600 rounded-md hover:bg-gray-300">
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex flex-col gap-2 max-h-[600px] overflow-y-auto pr-2">
              {allCategories.map((cat: string) => {
                const isEditing = editingCategory === cat;
                return (
                  <div key={cat} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-xl hover:border-gray-300 transition-colors group">
                    {isEditing ? (
                      <div className="flex items-center gap-2 w-full">
                        <input 
                          type="text" 
                          value={editingCategoryValue}
                          onChange={(e) => setEditingCategoryValue(e.target.value)}
                          className="flex-1 text-sm border-gray-300 rounded-md focus:ring-generator-green focus:border-generator-green py-1.5 px-3"
                          autoFocus
                        />
                        <button onClick={() => handleRenameCategory(cat)} className="p-1.5 bg-generator-green text-white rounded-md hover:bg-green-700">
                          <CheckIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => setEditingCategory(null)} className="p-1.5 bg-gray-200 text-gray-600 rounded-md hover:bg-gray-300">
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="font-bold text-gray-800 tracking-wide text-sm">{cat}</span>
                        <button 
                          onClick={() => {
                            setEditingCategory(cat);
                            setEditingCategoryValue(cat);
                          }}
                          className="p-2 text-gray-400 group-hover:text-generator-green rounded-lg bg-white shadow-sm border border-gray-200 transition-colors flex items-center gap-2 text-xs font-semibold"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                          Rename
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
              {allCategories.length === 0 && !isAddingCategory && <span className="text-gray-400 italic">No categories recorded yet.</span>}
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Create New Resource</h2>
            <p className="text-gray-500 text-sm mb-6">Enter the primary details below. You can upload associated files on the next screen after saving.</p>
            
            <form onSubmit={handleCreateDraft} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Resource Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  autoFocus
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g. Setting up Cold Email Sequencing"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-generator-green focus:border-generator-green"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Video URL <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
                  placeholder="https://www.youtube.com/watch?v=... or Loom URL"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-generator-green focus:border-generator-green font-mono text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    placeholder="e.g. Marketing & Sales"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-generator-green focus:border-generator-green"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Primary Tool <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={formData.tool}
                    onChange={(e) => setFormData({...formData, tool: e.target.value})}
                    placeholder="e.g. Zapier"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-generator-green focus:border-generator-green"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Duration <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    placeholder="e.g. 14:28"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-generator-green focus:border-generator-green"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Creator / Author Name</label>
                  <input
                    type="text"
                    required
                    value={formData.creator}
                    onChange={(e) => setFormData({...formData, creator: e.target.value})}
                    placeholder="e.g. Rustin Katsura"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-generator-green focus:border-generator-green"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Explain what this tutorial is about..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-generator-green focus:border-generator-green resize-y"
                />
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
                <Button variant="outline" type="button" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating || !formData.title.trim()}>
                  {isCreating ? 'Saving...' : 'Save & Continue'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
