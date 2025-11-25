
import React, { useState, useMemo } from 'react';
import { Ticket, Status, Priority, TicketType, ProductArea, Platform } from '../types';
import { Filter, Trash2, Plus, Star, MapPin, LayoutGrid, Server, Clock, Hash, Building2, Calendar } from 'lucide-react';

// Helper for Status Colors (Used for Badge and Reason Text)
const getStatusColorClasses = (status: Status) => {
  switch (status) {
    case Status.NotStarted: return { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };
    case Status.InProgress: return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
    case Status.PMReview: return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' };
    case Status.DevReview: return { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' };
    case Status.Testing: return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' };
    case Status.Completed: return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    case Status.OnHold: return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' };
    default: return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };
  }
};

// Status Badge Component
const StatusBadge = ({ status }: { status: Status }) => {
  const colors = getStatusColorClasses(status);
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${colors.bg} ${colors.text} ${colors.border}`}>
      {status}
    </span>
  );
};

const PriorityBadge = ({ priority }: { priority: Priority }) => {
  const colors = {
    [Priority.P1]: 'bg-red-50 text-red-700 border-red-200',    // P1 Red
    [Priority.P2]: 'bg-yellow-50 text-yellow-700 border-yellow-200', // P2 Yellow
    [Priority.P3]: 'bg-emerald-50 text-emerald-700 border-emerald-200', // P3 Green
    [Priority.P4]: 'bg-blue-50 text-blue-700 border-blue-200',   // P4 Blue
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${colors[priority]}`}>
      {priority}
    </span>
  );
};

const TypeBadge = ({ type }: { type: TicketType }) => {
    const colors = {
        [TicketType.FeatureRequest]: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        [TicketType.Issue]: 'text-rose-700 bg-rose-50 border-rose-200',
        [TicketType.Question]: 'text-blue-700 bg-blue-50 border-blue-200',
    }
    return <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${colors[type]} whitespace-nowrap`}>{type}</span>;
};

// Helper for Product Area Colors
const getProductAreaColor = (area: ProductArea) => {
    switch (area) {
        case ProductArea.Fullpath: return 'text-orange-700 bg-orange-50 border-orange-100'; 
        case ProductArea.Reynolds: return 'text-blue-800 bg-blue-50 border-blue-100';   
        default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
};

// Helper for Platform Colors
const getPlatformColor = (platform: Platform) => {
    switch (platform) {
        case Platform.FOCUS: return 'text-orange-700 bg-orange-50 border-orange-100'; 
        case Platform.UCP: return 'text-blue-700 bg-blue-50 border-blue-100';     
        case Platform.Curator: return 'text-purple-700 bg-purple-50 border-purple-100'; 
        default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
};

// Helper Component for Reference Badges (PMR, etc.)
const ReferenceBadge = ({ label, value, link }: { label: string, value: string | number, link?: string }) => {
  const content = (
    <>
      <span className="font-semibold opacity-70 mr-1">{label}:</span>{value}
    </>
  );
  
  const baseClasses = "inline-flex items-center px-1.5 py-0.5 bg-slate-50 text-slate-600 text-[10px] rounded border border-slate-200 whitespace-nowrap";
  
  if (link) {
    return (
      <a 
        href={link} 
        target="_blank" 
        rel="noreferrer"
        onClick={(e) => e.stopPropagation()} // Prevent drawer opening when clicking the link
        className={`${baseClasses} hover:border-blue-300 hover:text-blue-600 hover:bg-white cursor-pointer group/link`}
        title={`Open ${label} Link`}
      >
        {content}
        <ExternalLinkIcon size={8} className="ml-1 opacity-0 group-hover/link:opacity-100 transition-opacity" />
      </a>
    );
  }

  return (
    <span className={baseClasses}>
      {content}
    </span>
  );
};

const ExternalLinkIcon = ({ size = 10, className = "" }: { size?: number, className?: string }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
        <polyline points="15 3 21 3 21 9"></polyline>
        <line x1="10" y1="14" x2="21" y2="3"></line>
    </svg>
);

interface TicketListProps {
  tickets: Ticket[];
  selectedTicketIds: Set<string>;
  setSelectedTicketIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  onOpenTicket: (id: string) => void;
  onAddTicket: () => void;
  onBulkDelete: () => void;
  onBulkStatusUpdate: (status: Status) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
}

type TabType = 'Active' | 'On Hold' | 'Completed' | 'Favorites';

export default function TicketList({
  tickets,
  selectedTicketIds,
  setSelectedTicketIds,
  onOpenTicket,
  onAddTicket,
  onBulkDelete,
  onBulkStatusUpdate,
  onToggleFavorite,
}: TicketListProps) {
  const [activeTab, setActiveTab] = useState<TabType>('Active');
  const [filters, setFilters] = useState({
    search: '',
    status: 'All',
    priority: 'All',
    type: 'All',
    productArea: 'All',
  });

  // --- Count Logic ---
  const counts = useMemo(() => {
    return {
      active: tickets.filter(t => t.status !== Status.Completed && t.status !== Status.OnHold).length,
      onHold: tickets.filter(t => t.status === Status.OnHold).length,
      completed: tickets.filter(t => t.status === Status.Completed).length,
      favorites: tickets.filter(t => t.isFavorite).length
    };
  }, [tickets]);

  // --- Filtering & Sorting Logic ---
  const filteredTickets = useMemo(() => {
    // 1. Filter
    const result = tickets.filter((ticket) => {
      // Tab Logic
      if (activeTab === 'Active') {
        if (ticket.status === Status.Completed || ticket.status === Status.OnHold) return false;
      } else if (activeTab === 'On Hold') {
        if (ticket.status !== Status.OnHold) return false;
      } else if (activeTab === 'Completed') {
        if (ticket.status !== Status.Completed) return false;
      } else if (activeTab === 'Favorites') {
        if (!ticket.isFavorite) return false;
      }

      // Search Bar
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        ticket.title.toLowerCase().includes(searchLower) ||
        ticket.id.toLowerCase().includes(searchLower) ||
        (ticket.pmrNumber && ticket.pmrNumber.toString().includes(searchLower)) ||
        (ticket.fpTicketNumber && ticket.fpTicketNumber.toString().includes(searchLower));
        
      if (!matchesSearch) return false;

      // Dropdown Filters
      if (filters.status !== 'All' && ticket.status !== filters.status) return false;
      if (filters.priority !== 'All' && ticket.priority !== filters.priority) return false;
      if (filters.type !== 'All' && ticket.type !== filters.type) return false;
      if (filters.productArea !== 'All' && ticket.productArea !== filters.productArea) return false;

      return true;
    });

    // 2. Sort
    // Priority Weight: P1 (1) > P2 (2) > P3 (3) > P4 (4)
    const priorityWeight = {
        [Priority.P1]: 1,
        [Priority.P2]: 2,
        [Priority.P3]: 3,
        [Priority.P4]: 4,
    };

    const parseDate = (dateStr: string) => {
        if (!dateStr) return 0;
        const [mm, dd, yyyy] = dateStr.split('/').map(Number);
        return new Date(yyyy, mm - 1, dd).getTime();
    };

    return result.sort((a, b) => {
        // Primary Sort: Priority
        const priorityDiff = priorityWeight[a.priority] - priorityWeight[b.priority];
        if (priorityDiff !== 0) return priorityDiff;

        // Secondary Sort: Last Updated Date (Descending / Newest First)
        return parseDate(b.lastUpdatedDate) - parseDate(a.lastUpdatedDate);
    });

  }, [tickets, activeTab, filters]);

  // --- Selection Handlers ---
  const handleSelectOne = (id: string, checked: boolean) => {
    const newSet = new Set(selectedTicketIds);
    if (checked) newSet.add(id);
    else newSet.delete(id);
    setSelectedTicketIds(newSet);
  };

  // --- Days Active Calculation ---
  const getDaysActive = (startDate?: string) => {
    if (!startDate) return null;
    const [mm, dd, yyyy] = startDate.split('/').map(Number);
    const start = new Date(yyyy, mm - 1, dd);
    const today = new Date();
    // Reset time to ensure only date difference is calculated
    start.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const diffTime = today.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    // If start date is in the future, return 0
    return diffDays < 0 ? 0 : diffDays;
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Tabs & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 gap-4">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('Active')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'Active' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
            >
              Active ({counts.active})
            </button>
            <button
              onClick={() => setActiveTab('On Hold')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'On Hold' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
            >
              On Hold ({counts.onHold})
            </button>
            <button
              onClick={() => setActiveTab('Completed')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'Completed' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
            >
              Completed ({counts.completed})
            </button>
            <button
              onClick={() => setActiveTab('Favorites')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'Favorites' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
            >
              Favorites ({counts.favorites})
            </button>
        </nav>
        <div className="pb-2 sm:pb-0">
            <button 
                onClick={onAddTicket}
                className="flex items-center gap-2 bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-all"
            >
                <Plus size={16} /> New Ticket
            </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative">
             <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
             <input
                type="text"
                placeholder="Search tickets..."
                className="pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:border-primary w-48"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))}
             />
          </div>
          
          <select 
            className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:border-primary"
            value={filters.status}
            onChange={(e) => setFilters(prev => ({...prev, status: e.target.value as any}))}
          >
            <option value="All">All Statuses</option>
            {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
          </select>

           <select 
            className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:border-primary"
            value={filters.priority}
            onChange={(e) => setFilters(prev => ({...prev, priority: e.target.value as any}))}
          >
            <option value="All">All Priorities</option>
            {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
          </select>

           <select 
            className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:border-primary"
            value={filters.type}
            onChange={(e) => setFilters(prev => ({...prev, type: e.target.value as any}))}
          >
            <option value="All">All Types</option>
            {Object.values(TicketType).map(t => <option key={t} value={t}>{t}</option>)}
          </select>

           <select 
            className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:border-primary"
            value={filters.productArea}
            onChange={(e) => setFilters(prev => ({...prev, productArea: e.target.value as any}))}
          >
            <option value="All">All Areas</option>
            {Object.values(ProductArea).map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {selectedTicketIds.size > 0 && (
            <div className="flex items-center gap-2 animate-fadeIn">
                <span className="text-sm text-slate-500 mr-2">{selectedTicketIds.size} selected</span>
                <select 
                    className="py-1.5 px-2 text-sm border border-slate-200 rounded-md bg-white"
                    onChange={(e) => {
                        if(e.target.value) onBulkStatusUpdate(e.target.value as Status);
                        e.target.value = '';
                    }}
                >
                    <option value="">Set Status...</option>
                    {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <button 
                    onClick={onBulkDelete}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete Selected"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        )}
      </div>

      {/* Ticket List */}
      <div className="flex flex-col space-y-3">
        {filteredTickets.length === 0 ? (
            <div className="text-center py-16 text-slate-400 bg-white rounded-xl border border-slate-200 border-dashed">
                No tickets found matching your criteria.
            </div>
        ) : (
            filteredTickets.map((ticket) => (
                <div 
                    key={ticket.id}
                    className={`
                        group relative bg-white rounded-xl border p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:border-blue-300 cursor-pointer flex flex-col
                        ${selectedTicketIds.has(ticket.id) ? 'border-primary ring-1 ring-primary bg-blue-50/30' : 'border-slate-200'}
                    `}
                    onClick={() => onOpenTicket(ticket.id)}
                >
                    {/* 1. Top Row: Context & Metadata */}
                    <div className="flex items-center justify-between mb-3 gap-3">
                        {/* Left: Type & Labels */}
                        <div className="flex flex-wrap items-center gap-2 min-w-0">
                            <div className="flex items-center pr-1" onClick={(e) => e.stopPropagation()}>
                                <input 
                                    type="checkbox" 
                                    className="rounded border-slate-300 text-primary focus:ring-primary cursor-pointer w-4 h-4"
                                    checked={selectedTicketIds.has(ticket.id)}
                                    onChange={(e) => handleSelectOne(ticket.id, e.target.checked)}
                                />
                            </div>
                            
                            <TypeBadge type={ticket.type} />
                            
                            {/* Context Labels */}
                            <div className="flex flex-wrap items-center gap-1.5">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-50 text-slate-600 border border-slate-200 truncate max-w-[150px]">
                                    <Building2 size={10} className="text-slate-400" /> {ticket.client}
                                </span>

                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${getProductAreaColor(ticket.productArea)}`}>
                                    {ticket.productArea}
                                </span>

                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${getPlatformColor(ticket.platform)}`}>
                                    {ticket.platform}
                                </span>

                                {ticket.location && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-50 text-slate-500 border border-slate-200 truncate max-w-[120px]">
                                        <MapPin size={10} className="text-slate-400" /> {ticket.location}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Right: Status, Priority, Favorite */}
                        <div className="flex items-center gap-2 shrink-0">
                             <StatusBadge status={ticket.status} />
                             <PriorityBadge priority={ticket.priority} />
                             <button 
                                onClick={(e) => onToggleFavorite(ticket.id, e)}
                                className={`ml-1 p-1.5 rounded-full transition-colors hover:bg-slate-100 ${ticket.isFavorite ? 'text-yellow-400' : 'text-slate-200 group-hover:text-slate-300'}`}
                            >
                                <Star size={16} fill={ticket.isFavorite ? "currentColor" : "none"} />
                            </button>
                        </div>
                    </div>

                    {/* 2. Middle Content: Title & Summary */}
                    <div className="mb-3 pl-7"> 
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="text-base font-bold text-slate-900 leading-tight truncate">
                                {ticket.title}
                            </h3>
                            {/* Inline Status Reason */}
                            {ticket.reason && (
                                <span className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium border ${getStatusColorClasses(ticket.status).bg} ${getStatusColorClasses(ticket.status).text} ${getStatusColorClasses(ticket.status).border}`}>
                                    {ticket.reason}
                                </span>
                            )}
                        </div>

                        {/* Summary */}
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                            {ticket.summary || <span className="italic opacity-50">No summary provided</span>}
                        </p>
                    </div>

                    {/* 3. Footer Row: Meta Info */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pl-7 pt-2 border-t border-slate-50 mt-auto">
                        <div className="flex flex-wrap items-center gap-2">
                             {ticket.pmrNumber && (
                                <ReferenceBadge label="PMR" value={ticket.pmrNumber} link={ticket.pmrLink} />
                            )}
                            {ticket.ticketThreadId && (
                                <ReferenceBadge label="Thread" value={ticket.ticketThreadId} />
                            )}
                            {ticket.fpTicketNumber && (
                                <ReferenceBadge label="FP" value={ticket.fpTicketNumber} />
                            )}
                             {ticket.pmgNumber && (
                                <ReferenceBadge label="PMG" value={ticket.pmgNumber} link={ticket.pmgLink} />
                            )}
                            {ticket.cpmNumber && (
                                <ReferenceBadge label="CPM" value={ticket.cpmNumber} link={ticket.cpmLink} />
                            )}
                        </div>

                        <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium whitespace-nowrap ml-auto sm:ml-0">
                            <span>Updated {ticket.lastUpdatedDate}</span>
                            {getDaysActive(ticket.startDate) !== null && (
                                <span className="flex items-center gap-1">
                                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                    {getDaysActive(ticket.startDate)} Days Active
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
}
