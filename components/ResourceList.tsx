
import React, { useState, useMemo } from 'react';
import { Resource, ResourceCategory, ResourceScope } from '../types';
import { Filter, Plus, ExternalLink, Tag, Globe, Lock, Clock } from 'lucide-react';

interface ResourceListProps {
  resources: Resource[];
  onOpenResource: (id: string) => void;
  onAddResource: () => void;
}

const CategoryBadge = ({ category }: { category: ResourceCategory }) => {
    const colors = {
        [ResourceCategory.PPT]: 'bg-orange-50 text-orange-700 border-orange-200',
        [ResourceCategory.DOC]: 'bg-blue-50 text-blue-700 border-blue-200',
        [ResourceCategory.PDF]: 'bg-red-50 text-red-700 border-red-200',
        [ResourceCategory.XML]: 'bg-green-50 text-green-700 border-green-200',
    };
    return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${colors[category]}`}>
            {category}
        </span>
    );
};

const ScopeBadge = ({ scope }: { scope: ResourceScope }) => {
    if (scope === ResourceScope.External) {
        return (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Globe size={10} /> External
            </div>
        );
    }
    return (
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
            <Lock size={10} /> Internal
        </div>
    );
};

export default function ResourceList({ resources, onOpenResource, onAddResource }: ResourceListProps) {
  const [filter, setFilter] = useState('');

  const filteredResources = useMemo(() => {
    return resources.filter(r => {
        if (!filter) return true;
        const search = filter.toLowerCase();
        return (
            r.title.toLowerCase().includes(search) ||
            r.topics.toLowerCase().includes(search) ||
            r.description.toLowerCase().includes(search)
        );
    }).sort((a, b) => {
        // Sort by Date descending
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA;
    });
  }, [resources, filter]);

  return (
    <div className="space-y-6 pb-10">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
             <div className="relative max-w-md w-full">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                    type="text"
                    placeholder="Search resources..."
                    className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:border-primary w-full shadow-sm"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
            </div>
            <button 
                onClick={onAddResource}
                className="flex items-center gap-2 bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-all whitespace-nowrap"
            >
                <Plus size={16} /> New Resource
            </button>
        </div>

        {/* List */}
        <div className="flex flex-col space-y-3">
            {filteredResources.map(resource => (
                <div 
                    key={resource.id}
                    className="group relative bg-white rounded-xl border border-slate-200 p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:border-blue-300 cursor-pointer flex flex-col"
                    onClick={() => onOpenResource(resource.id)}
                >
                    {/* 1. Header: Title & Version */}
                    <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                            <div className="flex items-baseline gap-2 mb-1">
                                <h3 className="text-base font-bold text-slate-900 leading-tight">
                                    {resource.title}
                                </h3>
                                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-mono font-medium border border-slate-200">
                                    v{resource.version}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 2. Description Preview */}
                    <div className="mt-1 mb-3">
                        <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                            {resource.description || <span className="italic opacity-50">No description provided.</span>}
                        </p>
                    </div>

                    {/* 3. Metadata Row (Badges) */}
                    <div className="flex flex-wrap items-center gap-2 mt-auto">
                        <CategoryBadge category={resource.category} />
                        <ScopeBadge scope={resource.scope || ResourceScope.Internal} />
                        
                        {/* Topics */}
                        {resource.topics && resource.topics.split(',').map((topic, i) => (
                            <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-50 text-slate-600 border border-slate-200">
                                {topic.trim()}
                            </span>
                        ))}
                    </div>

                    {/* 4. Footer Row (Timing) */}
                    <div className="border-t border-slate-50 mt-3 pt-2 flex justify-end">
                         <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                            <Clock size={10} />
                            <span>Updated {resource.lastUpdated}</span>
                         </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
}
