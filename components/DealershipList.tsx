
import React, { useState, useMemo } from 'react';
import { Dealership, DealershipStatus } from '../types';
import { Filter, Plus, Building2, FileSpreadsheet } from 'lucide-react';
import { exportDealershipsToCSV } from '../utils';
import { DMT_PRODUCTS } from '../mockData';

const StatusBadge = ({ status }: { status: DealershipStatus }) => {
    const colors = {
        [DealershipStatus.DMTPending]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        [DealershipStatus.DMTApproved]: 'bg-blue-100 text-blue-800 border-blue-200',
        [DealershipStatus.Onboarding]: 'bg-purple-100 text-purple-800 border-purple-200',
        [DealershipStatus.Live]: 'bg-green-100 text-green-800 border-green-200',
        [DealershipStatus.Cancelled]: 'bg-red-50 text-red-700 border-red-100',
    };
    return <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border whitespace-nowrap ${colors[status]}`}>{status}</span>;
};

// Helper component for Meta Fields in the bottom row
const MetaField = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded border border-slate-100">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{label}</span>
        <span className="text-xs font-medium text-slate-700 font-mono">{value}</span>
    </div>
);

interface DealershipListProps {
  dealerships: Dealership[];
  onOpenDealership: (id: string) => void;
  onAddDealership: () => void;
}

type TabType = 'Active' | 'Cancelled';

export default function DealershipList({
  dealerships,
  onOpenDealership,
  onAddDealership
}: DealershipListProps) {
  const [filter, setFilter] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('Active');

  // --- Counts ---
  const counts = useMemo(() => {
      const cancelled = dealerships.filter(d => d.status === DealershipStatus.Cancelled).length;
      const active = dealerships.length - cancelled;
      return { active, cancelled };
  }, [dealerships]);

  // --- Filter & Sort Logic ---
  const filteredDealerships = useMemo(() => {
    const result = dealerships.filter(d => {
        // 1. Tab Filter
        if (activeTab === 'Active') {
            if (d.status === DealershipStatus.Cancelled) return false;
        } else {
            if (d.status !== DealershipStatus.Cancelled) return false;
        }

        // 2. Search Filter
        if (filter) {
            const searchLower = filter.toLowerCase();
            const matches = 
                d.accountName.toLowerCase().includes(searchLower) ||
                d.accountNumber.toString().includes(filter) ||
                (d.storeNumber && d.storeNumber.toLowerCase().includes(filter));
            if (!matches) return false;
        }

        return true;
    });

    // Sort Alphabetically by Account Name
    return result.sort((a, b) => a.accountName.localeCompare(b.accountName));

  }, [dealerships, activeTab, filter]);

  return (
    <div className="space-y-6 pb-10">
        
        {/* Tabs & Actions Container */}
        <div className="flex flex-col space-y-4 border-b border-slate-200 pb-0">
            {/* Tabs */}
            <nav className="-mb-px flex space-x-8">
                <button
                    onClick={() => setActiveTab('Active')}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'Active' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                >
                    Active ({counts.active})
                </button>
                <button
                    onClick={() => setActiveTab('Cancelled')}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'Cancelled' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                >
                    Cancelled ({counts.cancelled})
                </button>
            </nav>
        </div>

        {/* Search & Add Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative max-w-md w-full">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                    type="text"
                    placeholder="Search dealerships (Name, CIF, Store #)..."
                    className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:border-primary w-full shadow-sm"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
            </div>
            <div className="flex items-center gap-2">
                 <button 
                    onClick={() => exportDealershipsToCSV(dealerships, DMT_PRODUCTS)}
                    className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-all whitespace-nowrap"
                >
                    <FileSpreadsheet size={16} /> Export CSV
                </button>
                <button 
                    onClick={onAddDealership}
                    className="flex items-center gap-2 bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-all whitespace-nowrap"
                >
                    <Plus size={16} /> New Dealership
                </button>
            </div>
        </div>

        {/* List */}
        <div className="flex flex-col space-y-3">
            {filteredDealerships.length === 0 ? (
                <div className="text-center py-12 text-slate-500 bg-white rounded-lg border border-slate-200 border-dashed">
                    No {activeTab.toLowerCase()} dealerships found matching your criteria.
                </div>
            ) : (
                filteredDealerships.map((dealership) => (
                    <div 
                        key={dealership.id}
                        className="group relative bg-white rounded-lg border border-slate-200 p-4 shadow-sm transition-all hover:shadow-md hover:border-blue-300 cursor-pointer"
                        onClick={() => onOpenDealership(dealership.id)}
                    >
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                            
                            {/* Left Side: Info */}
                            <div className="flex-1 min-w-0 flex flex-col gap-2">
                                
                                {/* 1. Top Line: CIF & CRM */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                        CIF {dealership.accountNumber}
                                    </span>
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 uppercase">
                                        {dealership.crmProvider || 'N/A'}
                                    </span>
                                </div>

                                {/* 2. Middle Row: Name */}
                                <h3 className="text-lg font-bold text-slate-900 truncate leading-tight">
                                    {dealership.accountName}
                                </h3>

                                {/* 3. Bottom Row: IDs & Go-Live */}
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                    <MetaField label="ERA ID" value={dealership.eraSystemId || 'N/A'} />
                                    <MetaField label="Store / Branch" value={`${dealership.storeNumber || '-'} / ${dealership.branchNumber || '-'}`} />
                                    <MetaField label="PPSysID" value={dealership.ppSysId || 'N/A'} />
                                    <MetaField label="Go-Live" value={dealership.goLiveDate || 'Pending'} />
                                </div>
                            </div>

                            {/* Right Side: Status */}
                            <div className="shrink-0">
                                <StatusBadge status={dealership.status} />
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
  );
}
