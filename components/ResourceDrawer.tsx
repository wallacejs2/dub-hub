
import React, { useEffect, useState, useRef } from 'react';
import { Resource, ResourceCategory, ResourceScope } from '../types';
import { getTodayDateString, toInputDate, fromInputDate } from '../utils';
import { X, Edit2, Save, Trash2, Plus, ExternalLink, Globe, Lock, FileText } from 'lucide-react';
import { useToast } from './Toast';

interface ResourceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  resource?: Resource;
  onUpdate: (resource: Resource) => void;
  onDelete: (id: string) => void;
  isNew?: boolean;
}

// --- Styled Components ---

const SectionHeader = ({ children }: { children?: React.ReactNode }) => (
  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 mt-8 first:mt-0">
    {children}
  </h3>
);

const FieldLabel = ({ children }: { children?: React.ReactNode }) => (
  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
    {children}
  </label>
);

const Input = ({ type = "text", value, onChange, placeholder, className = "" }: any) => (
  <input 
      type={type} 
      value={value || ''} 
      onChange={onChange} 
      placeholder={placeholder}
      className={`w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${className}`}
  />
);

const TextArea = ({ value, onChange, placeholder, className = "" }: any) => (
    <textarea 
        value={value || ''} 
        onChange={onChange} 
        placeholder={placeholder}
        className={`w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-y ${className}`}
    />
);

const Select = ({ value, onChange, options }: any) => (
  <div className="relative">
      <select 
          value={value} 
          onChange={onChange} 
          className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none"
      >
          {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
          <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
      </div>
  </div>
);

// Helper for View Mode
const renderField = (label: string, content: React.ReactNode) => (
    <div className="mb-1">
        <FieldLabel>{label}</FieldLabel>
        <div className="min-h-[24px] flex items-center text-sm font-normal text-slate-800">
          {content || <span className="text-slate-400 text-xs italic">—</span>}
        </div>
    </div>
);

// Badges
const CategoryBadge = ({ category }: { category: ResourceCategory }) => {
    const colors = {
        [ResourceCategory.PPT]: 'bg-orange-100 text-orange-700 border-orange-200',
        [ResourceCategory.DOC]: 'bg-blue-100 text-blue-700 border-blue-200',
        [ResourceCategory.PDF]: 'bg-red-100 text-red-700 border-red-200',
        [ResourceCategory.XML]: 'bg-green-100 text-green-700 border-green-200',
    };
    return <span className={`px-2 py-0.5 rounded text-xs font-bold border ${colors[category]}`}>{category}</span>;
};

const ScopeBadge = ({ scope }: { scope: ResourceScope }) => {
    return (
        <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold border ${scope === ResourceScope.External ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
            {scope === ResourceScope.External ? <Globe size={10} /> : <Lock size={10} />}
            {scope}
        </span>
    );
};

export default function ResourceDrawer({ isOpen, onClose, resource, onUpdate, onDelete, isNew = false }: ResourceDrawerProps) {
  const [formData, setFormData] = useState<Resource | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { addToast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (resource) {
      setFormData(resource);
      setIsEditing(isNew);
    }
  }, [resource, isNew]);

  const handleChange = (field: keyof Resource, value: any) => {
    setFormData(prev => prev ? ({ ...prev, [field]: value }) : null);
  };

  const handleSave = () => {
    if (formData) {
        if (!formData.title.trim()) {
            addToast("Title is required", "error");
            return;
        }
        const updated = { ...formData, lastUpdated: getTodayDateString() };
        onUpdate(updated);
        setFormData(updated);
        setIsEditing(false);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (formData) onDelete(formData.id);
  }

  const handleCancel = () => {
    if (isNew) {
        onClose();
    } else {
        if (resource) setFormData(resource);
        setIsEditing(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-slate-900/30 backdrop-blur-[2px] z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`fixed top-0 right-0 bottom-0 w-full max-w-4xl bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {formData ? (
            <>
                {/* 1. Sticky Header */}
                <div className="flex-none bg-white px-6 py-4 z-10 border-b border-slate-200">
                    <div className="flex flex-col gap-4">
                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-2">
                             {isEditing ? (
                                <>
                                    <button onClick={handleCancel} className="text-xs text-slate-500 hover:underline px-3">Cancel</button>
                                    <button 
                                        onClick={handleSave}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded shadow-sm transition-colors"
                                    >
                                        <Save size={12} /> Save
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button 
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded shadow-sm transition-colors"
                                    >
                                        <Edit2 size={12} /> Edit
                                    </button>
                                    <button 
                                        onClick={handleDelete}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-slate-700 text-xs font-medium rounded shadow-sm transition-colors"
                                    >
                                        <Trash2 size={12} /> Delete
                                    </button>
                                </>
                            )}
                            
                            <div className="w-px h-6 bg-slate-200 mx-1"></div>

                            <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Title & Version */}
                        <div className="pb-2">
                            {isEditing ? (
                                <div className="space-y-3">
                                    <Input value={formData.title} onChange={(e: any) => handleChange('title', e.target.value)} className="text-xl font-bold" placeholder="Resource Title" />
                                    <div className="flex gap-4">
                                         <div className="w-32">
                                            <Input value={formData.version} onChange={(e: any) => handleChange('version', e.target.value)} placeholder="v1.0" />
                                         </div>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900 leading-tight">{formData.title}</h2>
                                    <span className="text-sm text-slate-400 font-mono mt-1 block">Version: {formData.version}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto bg-white custom-scrollbar" ref={scrollRef}>
                    
                    {/* 2. General Info Section */}
                    <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                             {isEditing ? (
                                <>
                                    <div><FieldLabel>Date</FieldLabel><Input type="date" value={toInputDate(formData.date)} onChange={(e: any) => handleChange('date', fromInputDate(e.target.value))} /></div>
                                    <div><FieldLabel>Last Updated</FieldLabel><div className="text-sm text-slate-500 py-1.5">{formData.lastUpdated}</div></div>
                                    <div><FieldLabel>Category</FieldLabel><Select value={formData.category} options={Object.values(ResourceCategory)} onChange={(e: any) => handleChange('category', e.target.value)} /></div>
                                    <div><FieldLabel>Scope</FieldLabel><Select value={formData.scope} options={Object.values(ResourceScope)} onChange={(e: any) => handleChange('scope', e.target.value)} /></div>
                                </>
                             ) : (
                                <>
                                    {renderField('Date', formData.date)}
                                    {renderField('Last Updated', formData.lastUpdated)}
                                    {renderField('Category', <CategoryBadge category={formData.category} />)}
                                    {renderField('Scope', <ScopeBadge scope={formData.scope} />)}
                                </>
                             )}
                        </div>
                    </div>

                    <div className="p-6 space-y-8">
                        
                        {/* 3. Resource Topics */}
                        <div>
                             <FieldLabel>Resource Topics</FieldLabel>
                             {isEditing ? (
                                <Input value={formData.topics} onChange={(e: any) => handleChange('topics', e.target.value)} placeholder="e.g. Sales, Q1, Marketing" />
                             ) : (
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {formData.topics ? (
                                        formData.topics.split(',').map((topic, i) => (
                                            <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                                {topic.trim()}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-slate-400 italic text-sm">No topics tagged.</span>
                                    )}
                                </div>
                             )}
                        </div>

                        {/* 4. Description */}
                        <div>
                             <FieldLabel>Description</FieldLabel>
                             {isEditing ? (
                                <TextArea value={formData.description} onChange={(e: any) => handleChange('description', e.target.value)} className="h-48" placeholder="Full description..." />
                             ) : (
                                <div className="mt-1 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                                    {formData.description || <span className="text-slate-400 italic">No description provided.</span>}
                                </div>
                             )}
                        </div>

                        {/* 5. Links & Navigation */}
                        <div>
                             <SectionHeader>Links & Navigation</SectionHeader>
                             <div className="space-y-6">
                                <div>
                                     {isEditing ? (
                                         <div><FieldLabel>Navigation Path</FieldLabel><Input value={formData.navigationPath} onChange={(e: any) => handleChange('navigationPath', e.target.value)} placeholder="e.g. Docs > Sales" /></div>
                                     ) : (
                                         renderField('Navigation Path', formData.navigationPath)
                                     )}
                                </div>
                                <div>
                                     {isEditing ? (
                                         <div><FieldLabel>Link to Resource (URL)</FieldLabel><Input value={formData.linkUrl} onChange={(e: any) => handleChange('linkUrl', e.target.value)} placeholder="https://..." /></div>
                                     ) : (
                                         <div>
                                             <FieldLabel>Primary Link</FieldLabel>
                                             {formData.linkUrl ? (
                                                 <a 
                                                    href={formData.linkUrl} 
                                                    target="_blank" 
                                                    rel="noreferrer" 
                                                    className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 hover:underline font-medium text-sm mt-1 group"
                                                 >
                                                    <ExternalLink size={14} />
                                                    <span className="truncate max-w-[250px]">{formData.linkUrl}</span>
                                                 </a>
                                             ) : <span className="text-slate-400 italic text-sm">—</span>}
                                         </div>
                                     )}
                                </div>
                             </div>
                        </div>
                    </div>
                    
                    {/* Bottom Padding */}
                    <div className="h-20"></div>
                </div>
                
                {/* New Resource Action */}
                {isNew && (
                    <div className="flex-none p-4 border-t border-slate-200 bg-white">
                         <button 
                            onClick={handleSave}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded shadow-md transition-all"
                        >
                            <Plus size={18} /> Add Resource
                        </button>
                    </div>
                )}
            </>
        ) : (
            <div className="p-10 flex items-center justify-center h-full text-slate-400">Loading...</div>
        )}
      </div>
    </>
  );
}
