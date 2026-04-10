'use client';

import { useState, useEffect, useRef } from 'react';
import { PlayIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { 
  MagnifyingGlassIcon, 
  DocumentTextIcon, 
  ArrowDownTrayIcon, 
  ChevronDownIcon 
} from '@heroicons/react/24/outline';
import { getToolColor } from '@/lib/utils';



type SupportDoc = {
  id: string;
  title: string;
  type: string;
  size: string;
  url: string;
};

type Video = {
  id: number;
  title: string;
  description: string;
  tool: string;
  category: string;
  duration: string;
  image: string;
  color: string;
  videoUrl?: string;
  supportDocs?: SupportDoc[];
};

// (Mocks Removed)

// Intelligent URL Parser for identifying video platforms
const parseVideoUrl = (url?: string) => {
  if (!url) return null;
  
  // YouTube regex logic
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) return { type: 'youtube', id: ytMatch[1] };

  // Loom regex logic
  const loomMatch = url.match(/loom\.com\/(?:share|embed)\/([a-f0-9]{32})/i);
  if (loomMatch && loomMatch[1]) return { type: 'loom', id: loomMatch[1] };

  return null;
};

// Auto Thumbnail Generator
const generateThumbnailUrl = async (url: string) => {
  const parsed = parseVideoUrl(url);
  if (parsed?.type === 'youtube') return `https://img.youtube.com/vi/${parsed.id}/maxresdefault.jpg`;
  
  if (parsed?.type === 'loom') {
    try {
      const oembedRes = await fetch(`https://www.loom.com/v1/oembed?url=${url}`);
      const oembedData = await oembedRes.json();
      if (oembedData?.thumbnail_url) {
        return oembedData.thumbnail_url;
      }
    } catch (e) {
      console.error('Failed to fetch Loom thumbnail', e);
    }
  }

  return 'https://images.unsplash.com/photo-1620825937374-87fc1d6defc2?w=800&auto=format&fit=crop&q=60'; // Fallback
};

export default function ResourcesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [dbCategories, setDbCategories] = useState<string[]>([]);
  
  // Fake API Data State
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fake API Fetch Layer (Prepped for Supabase)
  useEffect(() => {
    let isActive = true; // Cleanup flag for strict API cancellation

    const fetchVideos = async () => {
      setIsLoading(true);
      try {
        const [videoRes, colResponse, catResponse] = await Promise.all([
          fetch('/api/resources'),
          fetch('/api/tools/colors'),
          fetch('/api/categories')
        ]);
        
        const { data } = await videoRes.json();
        
        // Build color map correctly
        const customColMap: Record<string, string> = {};
        if (colResponse.ok) {
          const colData = await colResponse.json();
          if (colData.data) {
            colData.data.forEach((c: any) => { customColMap[c.tool_name] = c.color_hex; });
          }
        }

        // Build native categories
        if (catResponse.ok) {
          const catData = await catResponse.json();
          if (catData.data) {
            setDbCategories(catData.data.map((c: any) => c.name));
          }
        }
        
        if (data && data.length > 0) {
          if (isActive) {
            const formattedVideos = await Promise.all(data.map(async (row: any) => ({
              id: row.id,
              title: row.title,
              description: row.description,
              tool: row.tool,
              category: row.category,
              duration: row.duration,
              color: getToolColor(row.tool, customColMap),
              image: await generateThumbnailUrl(row.video_url),
              videoUrl: row.video_url,
              supportDocs: (row.support_documents || []).map((d: any) => ({
                id: d.id,
                title: d.title,
                type: d.file_type,
                size: d.file_size,
                url: d.file_url,
              }))
            })));
            setVideos(formattedVideos);
          }
        } else {
          // Empty dashboard
          if (isActive) setVideos([]);
        }
      } catch (err) {
        if (isActive) {
          console.error("Error fetching videos:", err);
          setVideos([]);
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    fetchVideos();

    return () => {
      isActive = false; // Prevent memory leak status updates if unmounted
    };
  }, []);

  // Mounted & Mobile State for responsive dynamic pagination limit
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Video Modal State
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [expandedDocId, setExpandedDocId] = useState<string | null>(null); // State for accordion document view

  // Category scroll tracking logic for fade overlays
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024); // Breakpoint tracking for 'lg' layout
      checkScroll();
    };
    handleResize(); // trigger immediately on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle escape key to close video modal & cleanup modal specific states
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedVideo(null);
    };
    if (selectedVideo) {
      // Clear any previously expanded document every time a new video modal opens
      setExpandedDocId(null);
      
      window.addEventListener('keydown', handleKeyDown);
      // Enforce scroll lock on both body and html for strict browser compatibility
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [selectedVideo]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = isMounted && isMobile ? 10 : 20;

  const handlePageChange = (newPage: number, shouldScroll: boolean = true) => {
    setCurrentPage(newPage);
    if (shouldScroll) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Reset page to 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeCategory]);

  // Filter logic integrating use case, tools, and broad search
  const filteredVideos = videos.filter((video) => {
    const matchesCategory = activeCategory === 'All' || video.category === activeCategory;
    const matchesSearch = 
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.tool.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  // Explicit ID Sort newest first
  const sortedFilteredVideos = [...filteredVideos].sort((a: any, b: any) => b.id - a.id);

  // Calculate pagination
  const totalPages = Math.max(1, Math.ceil(sortedFilteredVideos.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedVideos = sortedFilteredVideos.slice(startIndex, startIndex + itemsPerPage);

  // Pagination navigation block (numbers + arrows)
  const renderPageNav = (shouldScroll: boolean = true) => (
    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
      <button
        onClick={() => handlePageChange(Math.max(1, currentPage - 1), shouldScroll)}
        disabled={currentPage === 1}
        className={`relative inline-flex items-center rounded-l-md px-3 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 transition-colors ${currentPage === 1 ? 'cursor-not-allowed opacity-50 bg-gray-50' : 'bg-white'}`}
      >
        <span className="sr-only">Previous</span>
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
        </svg>
      </button>
      {/* Page numbers */}
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
        <button
          key={page}
          onClick={() => handlePageChange(page, shouldScroll)}
          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus:outline-offset-0 transition-colors ${
            currentPage === page 
              ? 'z-10 bg-generator-green text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2' 
              : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 bg-white'
          }`}
        >
          {page}
        </button>
      ))}
      <button
        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1), shouldScroll)}
        disabled={currentPage === totalPages}
        className={`relative inline-flex items-center rounded-r-md px-3 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 transition-colors ${currentPage === totalPages ? 'cursor-not-allowed opacity-50 bg-gray-50' : 'bg-white'}`}
      >
        <span className="sr-only">Next</span>
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
        </svg>
      </button>
    </nav>
  );
  // Derive full unique categories dynamically
  const uniqueVideoCategories = videos.map(v => v.category).filter(Boolean);
  const categoriesList = ['All', ...Array.from(new Set([...uniqueVideoCategories, ...dbCategories])).sort()];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20 relative">
      
      {/* Header */}
      <div className="mb-8 border-b border-gray-200 pb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Business Use Cases</h1>
        <p className="mt-2 text-gray-600 max-w-xl">Filter through actionable business workflows and discover which AI tools power them.</p>
      </div>

      {/* Primary Control Strip */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-0 mb-8 bg-transparent lg:bg-white p-0 lg:p-2 rounded-none lg:rounded-xl border-none lg:border border-gray-200 shadow-none lg:shadow-sm h-auto lg:h-[64px] overflow-visible lg:overflow-hidden">
        
        {/* Search Bar (Mobile: Standalone Pill, Desktop: Integrated Pill) */}
        <div className="relative w-full lg:w-64 xl:w-80 flex-shrink-0 h-12 lg:h-11 lg:ml-1 lg:mr-4 rounded-full bg-white border border-gray-200 shadow-sm focus-within:border-generator-green focus-within:ring-1 focus-within:ring-generator-green transition-all">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full h-full pl-10 pr-4 py-2 border-0 bg-transparent focus:outline-none focus:ring-0 sm:text-sm placeholder-gray-500 text-gray-900"
            placeholder="Search videos, tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Categories Wrapper (Mobile: Standalone White Row Container) */}
        <div className="relative flex-1 min-w-0 flex items-center h-14 lg:h-full pl-2 lg:pl-0 bg-white lg:bg-transparent border border-gray-200 lg:border-none shadow-sm lg:shadow-none rounded-xl lg:rounded-none">
          
          <div 
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex flex-nowrap items-center overflow-x-auto gap-2 px-2 lg:px-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden w-full h-full py-1"
          >
            {categoriesList.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`whitespace-nowrap flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeCategory === category
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'bg-transparent text-gray-600 hover:bg-gray-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          
          {/* Smart Dynamic Fade Overlays */}
          <div className={`absolute left-0 top-0 bottom-0 w-10 lg:w-4 bg-gradient-to-r from-white to-transparent pointer-events-none rounded-l-xl lg:rounded-none transition-opacity duration-300 ${canScrollLeft ? 'opacity-100' : 'opacity-0'}`} />
          <div className={`absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none rounded-r-xl lg:rounded-none transition-opacity duration-300 ${canScrollRight ? 'opacity-100' : 'opacity-0'}`} />
        </div>

        {/* Top Pagination Select (Restored on mobile) */}
        {filteredVideos.length > 0 && (
          <div className="flex lg:flex-shrink-0 items-center justify-center lg:justify-start gap-4 lg:border-l lg:border-gray-200 lg:pl-4 lg:ml-2 py-2.5 lg:py-0 px-2 lg:pr-2 lg:px-0 bg-white lg:bg-transparent rounded-xl lg:rounded-none border border-gray-200 lg:border-none shadow-sm lg:shadow-none w-full lg:w-auto">
            <p className="text-sm text-gray-500 hidden xl:block">
              <span className="font-semibold text-gray-900">{startIndex + 1}</span> - <span className="font-semibold text-gray-900">{Math.min(startIndex + itemsPerPage, filteredVideos.length)}</span>
            </p>
            <div className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden w-full flex justify-center lg:w-auto">
              {renderPageNav(false)}
            </div>
          </div>
        )}
      </div>

      {/* Video Grid */}
      {isLoading ? (
        /* Loading Skeleton Sates */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse shadow-sm">
              <div className="w-full aspect-video bg-gray-200" />
              <div className="p-5 flex-grow flex flex-col pt-6">
                <div className="h-3 bg-gray-200 rounded-full w-1/3 mb-4" />
                <div className="h-5 bg-gray-200 rounded-lg w-5/6 mb-2" />
                <div className="h-5 bg-gray-200 rounded-lg w-2/3 mb-6" />
                <div className="h-3 bg-gray-200 rounded-full w-full mb-2" />
                <div className="h-3 bg-gray-200 rounded-full w-4/5" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredVideos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {paginatedVideos.map((video) => (
            <div 
              key={video.id} 
              onClick={() => setSelectedVideo(video)}
              className="flex flex-col group cursor-pointer bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden transform-gpu hover:-translate-y-1 z-0"
            >
              
              {/* Thumbnail Container */}
              <div className="relative w-full aspect-video bg-gray-200 overflow-hidden rounded-t-2xl [transform:translateZ(0)]">
                {/* Background Image */}
                <img 
                  src={video.image} 
                  alt={video.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 backface-hidden"
                />
                
                {/* Dark Gradient Overlay for Readability */}
                <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-black/60 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />

                {/* Tool Badge Pill */}
                <div className="absolute top-3 left-3 z-10">
                  <span 
                    className={`inline-flex items-center px-2.5 py-1 text-xs font-bold leading-none text-white rounded-md uppercase tracking-wider shadow-sm backdrop-blur-sm bg-opacity-90 ${video.color.startsWith('bg-') ? video.color : ''}`}
                    style={!video.color.startsWith('bg-') ? { backgroundColor: video.color } : undefined}
                  >
                    {video.tool}
                  </span>
                </div>

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/opacity-0 group-hover:bg-black/20 transition-all duration-300">
                  <div className="w-14 h-14 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center shadow-xl transform transition-all duration-300 opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-110">
                    <PlayIcon className="w-6 h-6 text-gray-900 ml-1" />
                  </div>
                </div>

                {/* Duration Badge */}
                <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md px-2 py-1 rounded-md text-xs font-semibold tracking-wide text-white shadow-sm">
                  {video.duration}
                </div>
              </div>

              {/* Text Content */}
              <div className="p-5 flex-grow flex flex-col">
                <span className="text-xs font-bold text-generator-green mb-1.5 uppercase tracking-wide">
                  {video.category}
                </span>
                <h3 className="font-bold text-gray-900 text-lg leading-tight mb-2 group-hover:text-generator-green transition-colors line-clamp-2">
                  {video.title}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                  {video.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-300 mt-8">
          <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No tutorials found</h3>
          <p className="mt-2 text-sm text-gray-500">
            We couldn't find anything matching "{searchQuery}" under {activeCategory}.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('All');
            }}
            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-generator-green hover:bg-generator-dark transition-colors focus:outline-none"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Bottom Pagination (Always Shown if there are results) */}
      {filteredVideos.length > 0 && (
        <div className="mt-12 flex flex-col md:flex-row items-center justify-between border border-gray-200 bg-white px-6 py-4 rounded-xl shadow-sm gap-4">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-semibold text-gray-900">{startIndex + 1}</span> to <span className="font-semibold text-gray-900">{Math.min(startIndex + itemsPerPage, filteredVideos.length)}</span> of{' '}
              <span className="font-semibold text-gray-900">{filteredVideos.length}</span> tutorials
            </p>
          </div>
          <div className="overflow-x-auto w-full flex justify-center md:w-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {renderPageNav(true)}
          </div>
        </div>
      )}

      {/* Overlay Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pb-20 sm:pb-6 lg:p-12">
          
          <style>{`
            @keyframes modal-enter {
              from { opacity: 0; transform: scale(0.96) translateY(20px); }
              to { opacity: 1; transform: scale(1) translateY(0); }
            }
            .animate-modal-enter {
              animation: modal-enter 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
            @keyframes backdrop-enter {
              from { opacity: 0; backdrop-filter: blur(0px); }
              to { opacity: 1; backdrop-filter: blur(16px); }
            }
            .animate-backdrop-enter {
              animation: backdrop-enter 0.5s ease-out forwards;
            }
          `}</style>
          
          {/* Cinematic Backdrop */}
          <div 
            className="absolute inset-0 bg-gray-900/70 animate-backdrop-enter"
            onClick={() => setSelectedVideo(null)}
          />
          
          {/* Modal Container */}
          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[90vh] animate-modal-enter border border-white/10 ring-1 ring-black/5">
            
            {/* Close Button - Floating Glass */}
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 z-50 rounded-full p-2.5 bg-black/40 backdrop-blur-md text-white/80 hover:text-white hover:bg-black/60 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            {/* Modal Body / Scrollable Content */}
            <div className="flex-1 overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden bg-white">
              
              {/* Premium Video Player Header Area */}
              <div className={`w-full bg-black relative flex items-center justify-center overflow-hidden ${parseVideoUrl(selectedVideo.videoUrl)?.type === 'loom' ? 'aspect-[16/10]' : 'aspect-video'}`}>
                {(() => {
                  const videoData = parseVideoUrl(selectedVideo.videoUrl);
                  
                  if (videoData?.type === 'youtube') {
                    return (
                      <iframe 
                        className="absolute inset-0 w-full h-full"
                        src={`https://www.youtube.com/embed/${videoData.id}?autoplay=1&rel=0`}
                        title={selectedVideo.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    );
                  }
                  
                  if (videoData?.type === 'loom') {
                    return (
                      <iframe 
                        className="absolute inset-0 w-full h-full"
                        src={`https://www.loom.com/embed/${videoData.id}?autoplay=1&hide_owner=true&hide_share=true&hide_title=true&hideEmbedTopBar=true`}
                        title={selectedVideo.title}
                        frameBorder="0"
                        allow="autoplay; fullscreen"
                        allowFullScreen
                      />
                    );
                  }

                  return (
                    <div className="relative group w-full h-full flex items-center justify-center">
                      <img 
                        src={selectedVideo.image} 
                        alt={selectedVideo.title} 
                        className="absolute inset-0 w-full h-full object-cover opacity-70 transform transition-transform duration-[2s] group-hover:scale-105"
                      />
                      {/* Immersive Dark Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent" />
                      
                      {/* Floating Metadata Tags over Video */}
                      <div className="absolute top-5 left-5 sm:top-6 sm:left-6 flex flex-wrap items-center gap-3 z-20">
                        <span className={`inline-flex items-center px-3 py-1.5 text-xs font-bold leading-none text-white rounded-lg uppercase tracking-wider ${selectedVideo.color} shadow-lg backdrop-blur-md bg-opacity-90`}>
                          {selectedVideo.tool}
                        </span>
                        <span className="inline-flex items-center px-3 py-1.5 text-xs font-bold leading-none text-white/90 rounded-lg uppercase tracking-wider bg-black/50 border border-white/10 shadow-lg backdrop-blur-md">
                          {selectedVideo.duration}
                        </span>
                      </div>

                      {/* Big Glass Play Button */}
                      <div className="relative flex flex-col items-center z-20">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full flex items-center justify-center shadow-2xl transform transition-all duration-300 hover:scale-110 hover:bg-white/30 cursor-pointer">
                          <PlayIcon className="w-10 h-10 sm:w-12 sm:h-12 text-white ml-2 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]" />
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Extended Details Body */}
              <div className="px-6 py-6 sm:px-10 sm:py-8 lg:py-10">
                <div className="max-w-3xl mx-auto">
                  
                  <span className="text-xs sm:text-sm font-bold text-generator-green uppercase tracking-[0.2em] mb-2 sm:mb-3 block">
                    {selectedVideo.category} Workflow
                  </span>
                  
                  <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 mb-5 sm:mb-6 tracking-tight leading-tight">
                    {selectedVideo.title}
                  </h2>
                  
                  <div className="h-px w-full bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-6 sm:mb-8" />
                  
                  <div className="prose prose-base sm:prose-lg text-gray-600 max-w-none">
                    <p className="leading-relaxed text-gray-700 mb-8 font-medium">
                      {selectedVideo.description}
                    </p>

                    {/* Support Documents Section (Accordion UI) */}
                    {selectedVideo.supportDocs && selectedVideo.supportDocs.length > 0 && (
                      <div className="mt-12 pt-10 border-t border-gray-100">
                        <h3 className="text-gray-900 font-extrabold text-2xl mb-6 flex items-center gap-3">
                          <DocumentTextIcon className="w-7 h-7 text-generator-green" />
                          Support Documents
                        </h3>
                        <div className="flex flex-col gap-4">
                          {selectedVideo.supportDocs.map((doc) => {
                            const isExpanded = expandedDocId === doc.id;
                            return (
                              <div key={doc.id} className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm transition-all duration-300">
                                
                                {/* Accordion Header */}
                                <button 
                                  onClick={() => setExpandedDocId(isExpanded ? null : doc.id)}
                                  className="w-full flex items-center justify-between p-5 hover:bg-gray-50 focus:outline-none transition-colors"
                                >
                                  <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-generator-green/10 flex items-center justify-center text-generator-green font-bold text-sm tracking-wider uppercase border border-generator-green/20">
                                      {doc.type ?? 'FILE'}
                                    </div>
                                    <div className="text-left">
                                      <h4 className="font-bold text-gray-900 text-lg leading-tight">{doc.title}</h4>
                                      <p className="text-sm font-medium text-gray-500 mt-1">{doc.size}</p>
                                    </div>
                                  </div>
                                  <div className={`p-2 rounded-full transition-transform duration-300 ${isExpanded ? 'bg-gray-100 rotate-180' : 'bg-transparent text-gray-400 object-none'}`}>
                                    <ChevronDownIcon className="w-5 h-5" />
                                  </div>
                                </button>

                                {/* Accordion Expanding Preview Body */}
                                <div 
                                  className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[900px] opacity-100 pointer-events-auto' : 'max-h-0 opacity-0 pointer-events-none overflow-hidden'}`}
                                >
                                  <div className="bg-gray-50 border-t border-gray-100 p-6">
                                    
                                    {/* Dynamic Document Display Engine */}
                                    {doc.url !== '#' && (doc.type?.toUpperCase() ?? '') === 'PDF' ? (
                                      <div className="bg-gray-100 rounded-xl overflow-hidden mb-5 border border-gray-200 shadow-inner h-[500px]">
                                        <object data={`${doc.url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`} type="application/pdf" className="w-full h-full">
                                          <iframe src={`${doc.url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`} className="w-full h-full border-0" title={`${doc.title} Preview`} />
                                        </object>
                                      </div>
                                    ) : doc.url !== '#' && ((doc.type?.toUpperCase() ?? '') === 'DOC' || (doc.type?.toUpperCase() ?? '') === 'DOCX') ? (
                                      <div className="bg-gray-100 rounded-xl overflow-hidden mb-5 border border-gray-200 shadow-inner h-[500px] relative">
                                        <iframe 
                                          src={`https://docs.google.com/gview?url=${encodeURIComponent('https://your-public-domain.com' + doc.url)}&embedded=true`} 
                                          className="absolute inset-0 w-full h-full border-0 z-10" 
                                          title={`${doc.title} Preview`}
                                        />
                                        
                                        {/* Localhost Viewer Warning (Hidden if iframe successfully loads over it) */}
                                        <div className="absolute inset-0 z-0 flex flex-col items-center justify-center p-8 bg-gray-50 text-center">
                                            <DocumentTextIcon className="w-10 h-10 text-gray-300 mb-2" />
                                            <p className="text-sm font-bold text-gray-600">Word Document Preview</p>
                                            <p className="text-xs text-gray-500 mt-2 max-w-[250px]">
                                              Testing locally? External embedding APIs cannot read files from localhost. This preview will render after deployment.
                                            </p>
                                        </div>
                                      </div>
                                    ) : doc.url !== '#' && ((doc.type?.toUpperCase() ?? '') === 'HTML' || (doc.type?.toUpperCase() ?? '') === 'HTM') ? (
                                      <div className="bg-gray-100 rounded-xl overflow-hidden mb-5 border border-gray-200 shadow-inner h-[500px]">
                                        <iframe
                                          src={doc.url}
                                          className="w-full h-full border-0"
                                          title={`${doc.title} Preview`}
                                          sandbox="allow-scripts allow-same-origin"
                                        />
                                      </div>
                                    ) : doc.url !== '#' && ((doc.type?.toUpperCase() ?? '') === 'MP4' || (doc.type?.toUpperCase() ?? '') === 'MOV') ? (
                                      <div className="bg-black rounded-xl overflow-hidden mb-5 border border-gray-200 shadow-inner">
                                        <video
                                          src={doc.url}
                                          controls
                                          className="w-full max-h-[500px]"
                                          preload="metadata"
                                        >
                                          Your browser does not support the video tag.
                                        </video>
                                      </div>
                                    ) : (
                                      <div className="bg-white border text-center border-gray-200 rounded-xl p-10 mb-5 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)]">
                                        <DocumentTextIcon className="w-14 h-14 text-gray-200 mx-auto mb-3" />
                                        <h5 className="text-gray-900 font-bold">{doc.title} Preview</h5>
                                        <p className="text-sm text-gray-500 font-medium mt-1">Live preview is currently unavailable for {doc.type ?? 'this'} files.</p>
                                        <p className="text-xs text-gray-400 mt-1">Please download the file to view its full contents locally.</p>
                                      </div>
                                    )}
                                    
                                    {/* Download Action Row */}
                                    <div className="flex justify-end">
                                      <a 
                                        href={doc.url} 
                                        download 
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-generator-green text-white text-sm font-bold rounded-lg shadow-sm shadow-generator-green/20 hover:bg-green-600 transition-colors"
                                      >
                                        <ArrowDownTrayIcon className="w-5 h-5" />
                                        Download File
                                      </a>
                                    </div>
                                    
                                  </div>
                                </div>
                                
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  
                </div>
              </div>
              
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
