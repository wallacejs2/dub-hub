
import React, { useState, useMemo } from 'react';
import { Resource, ResourceCategory, ResourceScope } from '../types';
import { Filter, Plus, ExternalLink, Calendar, FileText, Tag, Globe, Lock } from 'lucide-react';

interface ResourceListProps {
  resources: Resource[];
  onOpenResource: (id: string) => void;
  onAddResource: () => void;
}

const CategoryBadge = ({ category }: { category: ResourceCategory }) => {
    const colors = {
        [ResourceCategory.PPT]: 'bg-orange-100 text-orange-700 border-orange-200',
        [ResourceCategory.DOC]: 'bg-blue-100 text-blue-700 border-blue-200',
        [ResourceCategory.PDF]: 'bg-red-100 text-red-700 border-red-200',
        [ResourceCategory.XML]: 'bg-green-100 text-green-700 border-green-200',
    };
    return (
        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${colors[category]}`}>
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

        {/* Grid List */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredResources.map(resource => (
                <div 
                    key={resource.id}
                    className="group relative bg-white rounded-lg border border-slate-200 p-4 shadow-sm transition-all hover:shadow-md hover:border-primary/50 cursor-pointer flex flex-col h-full"
                    onClick={() => onOpenResource(resource.id)}
                >
                    <div className="flex justify-between items-start mb-3">
                        <CategoryBadge category={resource.category} />
                        <ScopeBadge scope={resource.scope || ResourceScope.Internal} />
                    </div>

                    <h3 className="text-base font-bold text-slate-800 mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                        {resource.title}
                    </h3>
                    
                    <div className="text-[10px] text-slate-400 font-medium mb-2 flex items-center gap-2">
                        <span>v{resource.version}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span>{resource.date}</span>
                    </div>

                    {resource.description && (
                        <p className="text-xs text-slate-500 mb-4 line-clamp-2 flex-grow">
                            {resource.description}
                        </p>
                    )}

                    <div className="mt-auto space-y-3 pt-3 border-t border-slate-50">
                        {/* Topics */}
                        {resource.topics && (
                            <div className="flex items-start gap-1.5 text-[10px] text-slate-500">
                                <Tag size={12} className="mt-0.5 shrink-0" />
                                <div className="flex flex-wrap gap-1">
                                    {resource.topics.split(',').map((topic, i) => (
                                        <span key={i} className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                                            {topic.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Meta Footer */}
                        <div className="flex justify-end items-center text-xs text-slate-400">
                            {resource.linkUrl && (
                                <a 
                                    href={resource.linkUrl} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex items-center gap-1 text-blue-600 hover:underline font-medium"
                                >
                                    Open <ExternalLink size={10} />
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
}
