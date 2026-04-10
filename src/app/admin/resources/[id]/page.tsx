'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { 
  ArrowLeftIcon,
  TrashIcon,
  DocumentArrowUpIcon,
  DocumentIcon,
  CheckCircleIcon,
  PlayCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

type SupportDoc = {
  id: string;
  title: string;
  file_type: string;
  file_size: string;
  file_url: string;
  created_at: string;
};

export default function EditResourcePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tool, setTool] = useState('');
  const [category, setCategory] = useState('');
  const [duration, setDuration] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [creator, setCreator] = useState('');
  
  // Documents
  const [documents, setDocuments] = useState<SupportDoc[]>([]);
  const [uploadQueue, setUploadQueue] = useState<{ name: string; status: 'pending' | 'uploading' | 'done' | 'error' }[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isUploading = uploadQueue.some(f => f.status === 'uploading' || f.status === 'pending');

  useEffect(() => {
    fetchResource();
  }, [params.id]);

  const fetchResource = async () => {
    try {
      const response = await fetch(`/api/admin/resources/${params.id}`);
      if (!response.ok) throw new Error('Failed to load');
      const { data } = await response.json();
      
      setTitle(data.title || '');
      setDescription(data.description || '');
      setTool(data.tool || '');
      setCategory(data.category || '');
      setDuration(data.duration || '');
      setVideoUrl(data.video_url || '');
      setCreator(data.creator || '');
      setDocuments(data.support_documents || []);
    } catch (error) {
      toast.error('Could not load resource details');
      router.push('/admin/resources');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/resources/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, tool, category, duration, video_url: videoUrl, creator }),
      });
      if (!response.ok) throw new Error('Save failed');
      toast.success('Resource updated successfully');
    } catch (error) {
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteResource = async () => {
    if (!confirm('Are you strictly sure you want to delete this resource AND all its files? This cannot be undone.')) return;
    
    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/resources/${params.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Delete failed');
      toast.success('Resource deleted');
      router.push('/admin/resources');
    } catch (error) {
      toast.error('Failed to delete resource');
      setDeleting(false);
    }
  };

  const uploadSingleFile = async (file: File): Promise<boolean> => {
    if (file.size > 20 * 1024 * 1024) {
      toast.error(`${file.name} is too large (max 20MB).`);
      return false;
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name.split('.').slice(0, -1).join('.'));
    formData.append('type', file.name.split('.').pop()?.toUpperCase() || 'FILE');
    try {
      const response = await fetch(`/api/admin/resources/${params.id}/documents`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Upload failed');
      }
      return true;
    } catch {
      return false;
    }
  };

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArr = Array.from(files);
    if (fileArr.length === 0) return;

    // Initialize queue
    setUploadQueue(fileArr.map(f => ({ name: f.name, status: 'pending' })));

    let successCount = 0;
    for (let i = 0; i < fileArr.length; i++) {
      setUploadQueue(prev => prev.map((q, idx) => idx === i ? { ...q, status: 'uploading' } : q));
      const ok = await uploadSingleFile(fileArr[i]);
      setUploadQueue(prev => prev.map((q, idx) => idx === i ? { ...q, status: ok ? 'done' : 'error' } : q));
      if (ok) successCount++;
    }

    await fetchResource();
    if (successCount === fileArr.length) {
      toast.success(`${successCount} file${successCount > 1 ? 's' : ''} uploaded successfully!`);
    } else {
      toast.error(`${successCount}/${fileArr.length} files uploaded. Check errors.`);
    }

    setTimeout(() => setUploadQueue([]), 2000);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [params.id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm('Delete this document?')) return;
    
    // Optimistic UI update
    setDocuments(prev => prev.filter(d => d.id !== docId));
    
    try {
      const response = await fetch(`/api/admin/resources/${params.id}/documents?docId=${docId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete document');
      toast.success('Document removed');
    } catch (error) {
      toast.error('Could not delete document. Please try again.');
      fetchResource(); // Revert on failure
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-gray-500">Loading editor...</div>;
  }

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto pb-24">
      
      {/* Back Header */}
      <Link href="/admin/resources" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-6 transition-colors">
        <ArrowLeftIcon className="w-4 h-4 mr-2" /> Back to Resources
      </Link>

      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Resource</h1>
          <p className="text-gray-500 mt-1">Manage metadata and attach necessary files.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" onClick={handleDeleteResource} disabled={deleting}>
            <TrashIcon className="w-4 h-4 mr-2" />
            Delete Entire Resource
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-generator-green hover:bg-green-700">
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Details Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <PlayCircleIcon className="w-6 h-6 text-generator-green" />
              Video Details
            </h2>
            
            <form id="resource-form" onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-generator-green focus:border-generator-green bg-gray-50" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Video Component URL</label>
                <input type="text" placeholder="https://www.youtube.com/watch?v=... or Loom URL" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-generator-green focus:border-generator-green bg-gray-50 font-mono text-sm" />
                <p className="text-xs text-gray-500 mt-2">Paste a standard YouTube or Loom URL. The system will auto-detect formats for playback.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
                  <input required type="text" placeholder="e.g. Workflow Automation" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-generator-green focus:border-generator-green bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Primary Tool <span className="text-red-500">*</span></label>
                  <input required type="text" placeholder="e.g. Zapier" value={tool} onChange={(e) => setTool(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-generator-green focus:border-generator-green bg-gray-50" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Video Duration <span className="text-red-500">*</span></label>
                  <input required type="text" placeholder="e.g. 14:28" value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-generator-green focus:border-generator-green bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Creator / Author Name</label>
                  <input required type="text" placeholder="e.g. Rustin Katsura" value={creator} onChange={(e) => setCreator(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-generator-green focus:border-generator-green bg-gray-50" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
                <textarea required rows={5} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-generator-green focus:border-generator-green bg-gray-50 resize-y" />
              </div>
            </form>
          </div>
        </div>

        {/* Support Documents Manager */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm sticky top-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Support Documents</h2>
            <p className="text-gray-500 text-sm mb-6">Attach PDFs, Docs, or CSVs that accompany this tutorial.</p>

            {/* Drag & Drop Multi-File Upload Zone */}
            <div 
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                isDragging 
                  ? 'border-generator-green bg-green-50 scale-[1.02]' 
                  : isUploading 
                    ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
                    : 'border-generator-green/40 hover:border-generator-green hover:bg-green-50/50 bg-white'
              }`}
              onClick={() => !isUploading && fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.rtf,.ppt,.pptx,.html,.htm,.mp4,.mov"
                multiple
              />
              <DocumentArrowUpIcon className={`w-8 h-8 mx-auto mb-3 transition-colors ${isDragging ? 'text-generator-green scale-110' : isUploading ? 'text-gray-400 animate-bounce' : 'text-generator-green'}`} />
              <span className="text-sm font-bold text-gray-700 block">
                {isDragging ? 'Drop files here!' : isUploading ? 'Uploading...' : 'Click or drag & drop files'}
              </span>
              {!isUploading && !isDragging && <span className="text-xs text-gray-400 mt-1 block">PDF, DOC, DOCX, XLS, PPT, HTML, MP4 — up to 20MB each</span>}
            </div>

            {/* Upload Queue Progress */}
            {uploadQueue.length > 0 && (
              <div className="mt-4 space-y-2">
                {uploadQueue.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-100 bg-gray-50 text-sm">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${
                      item.status === 'done' ? 'bg-green-500' :
                      item.status === 'error' ? 'bg-red-500' :
                      item.status === 'uploading' ? 'bg-yellow-400 animate-pulse' :
                      'bg-gray-300'
                    }`} />
                    <span className="truncate flex-1 text-gray-700 font-medium" title={item.name}>{item.name}</span>
                    <span className={`text-xs font-bold shrink-0 ${
                      item.status === 'done' ? 'text-green-600' :
                      item.status === 'error' ? 'text-red-500' :
                      item.status === 'uploading' ? 'text-yellow-500' :
                      'text-gray-400'
                    }`}>
                      {item.status === 'done' ? '✓' : item.status === 'error' ? '✗' : item.status === 'uploading' ? '↑' : '–'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Existing Documents List */}
            <div className="mt-6 space-y-3">
              {documents.length === 0 ? (
                <div className="text-center py-6 border border-gray-100 rounded-xl bg-gray-50">
                  <p className="text-sm font-medium text-gray-400">No documents attached yet.</p>
                </div>
              ) : (
                documents.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-gray-300 bg-white group transition-colors">
                    <div className="flex items-center gap-3 overflow-hidden pr-2">
                      <div className="p-2 bg-gray-100 rounded-md shrink-0">
                        <DocumentIcon className="w-5 h-5 text-gray-500" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-bold text-gray-900 truncate" title={doc.title}>{doc.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-bold tracking-wider text-generator-green uppercase">{doc.file_type}</span>
                          <span className="text-[10px] text-gray-400 font-medium">• {doc.file_size}</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-all shrink-0"
                      title="Remove file"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
