import React, { useState } from 'react';
import { Dealership, DealershipStatus } from '../types';
import { Filter, Plus, Building2, Hash, Calendar, Server } from 'lucide-react';

const StatusBadge = ({ status }: { status: DealershipStatus }) => {
    const colors = {
        [DealershipStatus.DMTPending]: 'bg-yellow-100 text-yellow-800',
        [DealershipStatus.DMTApproved]: 'bg-blue-100 text-blue-800',
        [DealershipStatus.Onboarding]: 'bg-purple-100 text-purple-800',
        [DealershipStatus.Live]: 'bg-green-100 text-green-800',
        [DealershipStatus.Cancelled]: 'bg-red-100 text-red-800',
    };
    return <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${colors[status]}`}>{status}</span>;
};

interface DealershipListProps {
  dealerships: Dealership[];
  onOpenDealership: (id: string) => void;
  onAddDealership: () => void;
}

export default function DealershipList({
  dealerships,
  onOpenDealership,
  onAddDealership
}: DealershipListProps) {
  const [filter, setFilter] = useState('');

  const filteredDealerships = dealerships.filter(d => 
    d.accountName.toLowerCase().includes(filter.toLowerCase()) ||
    d.accountNumber.toString().includes(filter) ||
    d.storeNumber.toLowerCase().includes(filter)
  );

  return (
    <div className="space-y-6 pb-10">
        {/* Header & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
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
            <button 
                onClick={onAddDealership}
                className="flex items-center gap-2 bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-all whitespace-nowrap"
            >
                <Plus size={16} /> New Dealership
            </button>
        </div>

        {/* List */}
        <div className="flex flex-col space-y-3">
            {filteredDealerships.length === 0 ? (
                <div className="text-center py-12 text-slate-500 bg-white rounded-lg border border-slate-200 border-dashed">
                    No dealerships found.
                </div>
            ) : (
                filteredDealerships.map((dealership) => (
                    <div 
                        key={dealership.id}
                        className="group relative bg-white rounded-lg border border-slate-200 p-4 shadow-sm transition-all hover:shadow-md hover:border-slate-300 cursor-pointer"
                        onClick={() => onOpenDealership(dealership.id)}
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                {/* Header: CIF - Account Name */}
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-bold font-mono">
                                        <Building2 size={12} /> CIF: {dealership.accountNumber}
                                    </div>
                                    <h3 className="font-bold text-slate-800 text-lg">{dealership.accountName}</h3>
                                </div>

                                {/* Body Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3 text-xs text-slate-600">
                                    <div className="flex flex-col">
                                        <span className="uppercase font-bold text-[10px] text-slate-400 mb-0.5">PPSysID</span>
                                        <span className="font-medium flex items-center gap-1">
                                            <Hash size={10} /> {dealership.ppSysId || 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="uppercase font-bold text-[10px] text-slate-400 mb-0.5">Store / Branch</span>
                                        <span className="font-medium flex items-center gap-1">
                                            <Building2 size={10} /> {dealership.storeNumber || '-'} / {dealership.branchNumber || '-'}
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="uppercase font-bold text-[10px] text-slate-400 mb-0.5">ERA ID</span>
                                        <span className="font-medium flex items-center gap-1">
                                            <Server size={10} /> {dealership.eraSystemId || 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="uppercase font-bold text-[10px] text-slate-400 mb-0.5">Go-Live</span>
                                        <span className="font-medium flex items-center gap-1">
                                            <Calendar size={10} /> {dealership.goLiveDate || 'Pending'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-2">
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