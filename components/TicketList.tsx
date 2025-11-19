import React, { useState, useMemo } from 'react';
import { Ticket, Status, Priority, TicketType, ProductArea, Platform } from '../types';
import { Filter, Trash2, Plus, Star, MapPin, LayoutGrid, Server, Clock } from 'lucide-react';

// Helper for Status Colors (Used for Badge and Reason Text)
const getStatusColorClasses = (status: Status) => {
  switch (status) {
    case Status.NotStarted: return { bg: 'bg-gray-100', text: 'text-gray-700' };
    case Status.InProgress: return { bg: 'bg-blue-100', text: 'text-blue-700' };
    case Status.PMReview: return { bg: 'bg-purple-100', text: 'text-purple-700' };
    case Status.DevReview: return { bg: 'bg-indigo-100', text: 'text-indigo-700' };
    case Status.Testing: return { bg: 'bg-orange-100', text: 'text-orange-700' };
    case Status.Completed: return { bg: 'bg-green-100', text: 'text-green-700' };
    case Status.OnHold: return { bg: 'bg-red-50', text: 'text-red-700' };
    default: return { bg: 'bg-gray-100', text: 'text-gray-700' };
  }
};

// Status Badge Component
const StatusBadge = ({ status }: { status: Status }) => {
  const colors = getStatusColorClasses(status);
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
      {status}
    </span>
  );
};

const PriorityBadge = ({ priority }: { priority: Priority }) => {
  const colors = {
    [Priority.P1]: 'bg-red-100 text-red-700',    // P1 Red
    [Priority.P2]: 'bg-yellow-100 text-yellow-800', // P2 Yellow
    [Priority.P3]: 'bg-green-100 text-green-700', // P3 Green
    [Priority.P4]: 'bg-blue-100 text-blue-700',   // P4 Blue
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${colors[priority]} border-transparent`}>
      {priority}
    </span>
  );
};

const TypeBadge = ({ type }: { type: TicketType }) => {
    const colors = {
        [TicketType.FeatureRequest]: 'text-emerald-600 bg-emerald-50',
        [TicketType.Issue]: 'text-rose-600 bg-rose-50',
        [TicketType.Question]: 'text-blue-600 bg-blue-50',
    }
    return <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${colors[type]}`}>{type}</span>;
};

// Helper for Product Area Colors
const getProductAreaColor = (area: ProductArea) => {
    switch (area) {
        case ProductArea.Fullpath: return 'text-orange-600'; // Orange
        case ProductArea.Reynolds: return 'text-blue-900';   // Navy Blue
        default: return 'text-slate-400';
    }
};

// Helper for Platform Colors
const getPlatformColor = (platform: Platform) => {
    switch (platform) {
        case Platform.FOCUS: return 'text-orange-600'; // Orange
        case Platform.UCP: return 'text-blue-600';     // Blue
        case Platform.Curator: return 'text-purple-600'; // Purple
        default: return 'text-slate-400';
    }
};

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
        ticket.id.toLowerCase().includes(searchLower);
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
          
          {/* Status Filter */}
          <select 
            className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:border-primary"
            value={filters.status}
            onChange={(e) => setFilters(prev => ({...prev, status: e.target.value as any}))}
          >
            <option value="All">All Statuses</option>
            {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
          </select>

           {/* Priority Filter */}
           <select 
            className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:border-primary"
            value={filters.priority}
            onChange={(e) => setFilters(prev => ({...prev, priority: e.target.value as any}))}
          >
            <option value="All">All Priorities</option>
            {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
          </select>

           {/* Type Filter */}
           <select 
            className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:border-primary"
            value={filters.type}
            onChange={(e) => setFilters(prev => ({...prev, type: e.target.value as any}))}
          >
            <option value="All">All Types</option>
            {Object.values(TicketType).map(t => <option key={t} value={t}>{t}</option>)}
          </select>

           {/* Product Area Filter */}
           <select 
            className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:border-primary"
            value={filters.productArea}
            onChange={(e) => setFilters(prev => ({...prev, productArea: e.target.value as any}))}
          >
            <option value="All">All Areas</option>
            {Object.values(ProductArea).map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* Bulk Actions */}
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

      {/* Ticket Stack (Vertical List) */}
      <div className="flex flex-col space-y-3">
        {filteredTickets.length === 0 ? (
            <div className="text-center py-12 text-slate-500 bg-white rounded-lg border border-slate-200 border-dashed">
                No tickets found matching your criteria.
            </div>
        ) : (
            filteredTickets.map((ticket) => (
                <div 
                    key={ticket.id}
                    className={`
                        group relative bg-white rounded-lg border p-4 shadow-sm transition-all hover:shadow-md cursor-pointer flex flex-col sm:flex-row sm:items-center gap-4
                        ${selectedTicketIds.has(ticket.id) ? 'border-primary ring-1 ring-primary bg-blue-50/30' : 'border-slate-200 hover:border-slate-300'}
                    `}
                    onClick={() => onOpenTicket(ticket.id)}
                >
                    {/* Selection Checkbox */}
                    <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                        <input 
                            type="checkbox" 
                            className="rounded border-slate-300 text-primary focus:ring-primary cursor-pointer w-4 h-4 ml-1"
                            checked={selectedTicketIds.has(ticket.id)}
                            onChange={(e) => handleSelectOne(ticket.id, e.target.checked)}
                        />
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <TypeBadge type={ticket.type} />
                            <span className="hidden sm:inline text-[10px] text-slate-400 font-medium">
                               Last updated {ticket.lastUpdatedDate}
                            </span>
                            
                            {/* Days Active Calculation */}
                            {getDaysActive(ticket.startDate) !== null && (
                                <div className="hidden sm:flex items-center text-[10px] text-slate-400 font-medium border-l border-slate-300 pl-2 ml-2 gap-1">
                                    <Clock size={10} />
                                    <span>{getDaysActive(ticket.startDate)} Days Active</span>
                                </div>
                            )}
                        </div>
                        <h3 className="font-bold text-slate-800 text-base leading-snug truncate" title={ticket.title}>
                            {ticket.title}
                        </h3>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-600">
                            <div className={`flex items-center gap-1.5 font-medium ${getProductAreaColor(ticket.productArea)}`} title={`Area: ${ticket.productArea}`}>
                                <LayoutGrid size={12} className="text-current" />
                                <span>{ticket.productArea}</span>
                            </div>
                            <div className={`flex items-center gap-1.5 font-medium ${getPlatformColor(ticket.platform)}`} title={`Platform: ${ticket.platform}`}>
                                <Server size={12} className="text-current" />
                                <span>{ticket.platform}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-500" title={`Location: ${ticket.location}`}>
                                <MapPin size={12} className="text-slate-400" />
                                <span className="truncate max-w-[150px]">{ticket.location || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Status & Priority (Right Side) */}
                    <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 sm:gap-1.5 mt-2 sm:mt-0 border-t sm:border-0 border-slate-100 pt-2 sm:pt-0">
                         <div className="flex gap-2">
                             <StatusBadge status={ticket.status} />
                             <PriorityBadge priority={ticket.priority} />
                         </div>
                         
                         {/* Status Reason */}
                         {ticket.reason && (
                             <span className={`text-[11px] font-semibold mt-1 max-w-[180px] truncate ${getStatusColorClasses(ticket.status).text}`}>
                                 {ticket.reason}
                             </span>
                         )}

                         <div className="flex items-center gap-2 mt-1">
                            <span className="sm:hidden text-[10px] text-slate-400 font-medium">
                               Updated {ticket.lastUpdatedDate}
                            </span>
                             <button 
                                onClick={(e) => onToggleFavorite(ticket.id, e)}
                                className={`p-1.5 rounded-full transition-colors hover:bg-slate-100 ${ticket.isFavorite ? 'text-yellow-400' : 'text-slate-200 group-hover:text-slate-300'}`}
                            >
                                <Star size={16} fill={ticket.isFavorite ? "currentColor" : "none"} />
                            </button>
                         </div>
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
}