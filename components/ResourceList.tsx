
import React, { useState, useMemo } from 'react';
import { Resource, ResourceCategory, ResourceScope } from '../types';
import { Filter, Plus, ExternalLink, Tag, Globe, Lock } from 'lucide-react';

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
        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${colors[category]}`}>
            {category}
        </span>
    );
};

const ScopeBadge = ({ scope }: { scope: ResourceScope }) => {
    if (scope === ResourceScope.External) {
        return (
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-600 border border-emerald-100">
                <Globe size={10} /> External
            </div>
        );
    }
    return (
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
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

        {/* Stacked List */}
        <div className="flex flex-col space-y-2">
            {filteredResources.map(resource => (
                <div 
                    key={resource.id}
                    className="group relative bg-white rounded-lg border border-slate-200 p-3 shadow-sm transition-all hover:shadow-md hover:border-primary/50 cursor-pointer"
                    onClick={() => onOpenResource(resource.id)}
                >
                    <div className="flex justify-between items-start gap-4">
                        {/* Left Side: Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-sm font-bold text-slate-800 truncate group-hover:text-primary transition-colors">
                                    {resource.title}
                                </h3>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400 shrink-0">
                                    <span>v{resource.version}</span>
                                    <span className="w-0.5 h-0.5 rounded-full bg-slate-300"></span>
                                    <span>{resource.date}</span>
                                </div>
                            </div>

                            {resource.description && (
                                <p className="text-xs text-slate-500 line-clamp-1 mb-2">
                                    {resource.description}
                                </p>
                            )}

                             {/* Topics Inline */}
                             {resource.topics && (
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <Tag size={10} className="text-slate-400 shrink-0" />
                                    <div className="flex gap-1 overflow-hidden flex-wrap h-5">
                                        {resource.topics.split(',').slice(0, 4).map((topic, i) => (
                                            <span key={i} className="bg-slate-50 px-1.5 py-0.5 rounded text-[10px] text-slate-500 border border-slate-100 whitespace-nowrap">
                                                {topic.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Side: Meta Badges */}
                        <div className="flex flex-col items-end gap-2 shrink-0">
                            <div className="flex gap-2">
                                <CategoryBadge category={resource.category} />
                                <ScopeBadge scope={resource.scope || ResourceScope.Internal} />
                            </div>
                            {resource.linkUrl && (
                                <div className="text-[10px] text-slate-400 mt-1">
                                    <ExternalLink size={14} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
}
