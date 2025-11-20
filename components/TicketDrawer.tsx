import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Ticket, Status, Priority, TicketType, ProductArea, Platform, Update, Dealership } from '../types';
import { getTodayDateString, toInputDate, fromInputDate } from '../utils';
import { X, Calendar, Copy, Trash2, Edit2, Save, Link as LinkIcon, Plus } from 'lucide-react';
import { useToast } from './Toast';

interface TicketDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  ticket?: Ticket;
  onUpdate: (ticket: Ticket) => void;
  onDelete: (id: string) => void;
  isNew?: boolean;
  dealerships: Dealership[];
}

// --- Styled Components ---

const SectionHeader = ({ children }: { children?: React.ReactNode }) => (
  <h3 className="text-sm font-bold text-slate-800 mt-8 mb-4 pb-1 border-b border-slate-100">
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
      className={`w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${className}`}
  />
);

const TextArea = ({ value, onChange, placeholder, className = "" }: any) => (
    <textarea 
        value={value || ''} 
        onChange={onChange} 
        placeholder={placeholder}
        className={`w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none ${className}`}
    />
  );

const Select = ({ value, onChange, options }: any) => (
  <div className="relative">
      <select 
          value={value} 
          onChange={onChange} 
          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none"
      >
          {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
          <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
      </div>
  </div>
);

// --- Badge Components for View Mode ---

const StatusBadge = ({ status }: { status: Status }) => {
    const colors = {
      [Status.NotStarted]: 'bg-gray-100 text-gray-700',
      [Status.InProgress]: 'bg-blue-100 text-blue-700',
      [Status.PMReview]: 'bg-purple-100 text-purple-700',
      [Status.DevReview]: 'bg-indigo-100 text-indigo-700',
      [Status.Testing]: 'bg-orange-100 text-orange-700',
      [Status.Completed]: 'bg-green-100 text-green-700',
      [Status.OnHold]: 'bg-red-50 text-red-700',
    };
    return <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${colors[status]}`}>{status}</span>;
};
  
const PriorityBadge = ({ priority }: { priority: Priority }) => {
    const colors = {
        [Priority.P1]: 'bg-red-100 text-red-700',    // P1 Red
        [Priority.P2]: 'bg-yellow-100 text-yellow-800', // P2 Yellow
        [Priority.P3]: 'bg-green-100 text-green-700', // P3 Green
        [Priority.P4]: 'bg-blue-100 text-blue-700',   // P4 Blue
    };
    return <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${colors[priority]}`}>{priority}</span>;
};

const TypeBadge = ({ type }: { type: TicketType }) => {
    const colors = {
        [TicketType.FeatureRequest]: 'text-emerald-700 bg-emerald-100',
        [TicketType.Issue]: 'text-rose-700 bg-rose-100',
        [TicketType.Question]: 'text-blue-700 bg-blue-100',
    };
    return <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${colors[type]}`}>{type}</span>;
};

// Helpers for View Mode Coloring
const getProductAreaBadge = (area: ProductArea) => {
    let colorClass = 'bg-slate-200 text-slate-700';
    if (area === ProductArea.Fullpath) colorClass = 'bg-orange-100 text-orange-800'; // Orange
    if (area === ProductArea.Reynolds) colorClass = 'bg-blue-900 text-white';        // Navy Blue
    
    return <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${colorClass}`}>{area}</span>;
};

const getPlatformBadge = (platform: Platform) => {
    let colorClass = 'bg-slate-200 text-slate-700';
    if (platform === Platform.FOCUS) colorClass = 'bg-orange-100 text-orange-800';   // Orange
    if (platform === Platform.UCP) colorClass = 'bg-blue-100 text-blue-800';         // Blue
    if (platform === Platform.Curator) colorClass = 'bg-purple-100 text-purple-800'; // Purple
    
    return <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${colorClass}`}>{platform}</span>;
};

export default function TicketDrawer({ isOpen, onClose, ticket, onUpdate, onDelete, isNew = false, dealerships }: TicketDrawerProps) {
  const [formData, setFormData] = useState<Ticket | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { addToast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  // New Update State
  const [newUpdateText, setNewUpdateText] = useState('');
  const [newUpdateAuthor, setNewUpdateAuthor] = useState('You');
  const [newUpdateDate, setNewUpdateDate] = useState(getTodayDateString());
  
  // Edit Update State
  const [editingUpdateId, setEditingUpdateId] = useState<string | null>(null);
  const [tempUpdate, setTempUpdate] = useState<Update | null>(null);

  useEffect(() => {
    if (ticket) {
      setFormData(ticket);
      setIsEditing(isNew); // Auto edit if new
      setNewUpdateDate(getTodayDateString());
    }
  }, [ticket, isNew]);

  const handleChange = (field: keyof Ticket, value: any) => {
    setFormData(prev => prev ? ({ ...prev, [field]: value }) : null);
  };

  const clientOptions = useMemo(() => {
      const names = dealerships.map(d => d.accountName).sort();
      return ['All', ...names];
  }, [dealerships]);

  const handleSave = () => {
    if (formData) {
        if (!formData.title.trim()) {
            addToast("Please enter a ticket title", "error");
            return;
        }
        const today = getTodayDateString();
        const updated = { ...formData, lastUpdatedDate: today };
        onUpdate(updated);
        // If it's new, onUpdate will handle adding it to the list and setting ID
        // We just need to update local state if we stay open
        setFormData(updated);
        setIsEditing(false);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
      e.stopPropagation();
      if(formData) {
          onDelete(formData.id);
      }
  }

  // --- Update Logic ---

  const handleAddUpdate = () => {
    if (!newUpdateText.trim() || !formData) return;
    
    const newUpdate: Update = {
      id: Date.now().toString(),
      author: newUpdateAuthor,
      date: newUpdateDate,
      comment: newUpdateText
    };

    const updatedTicket = {
      ...formData,
      updates: [newUpdate, ...formData.updates],
      lastUpdatedDate: getTodayDateString()
    };

    setFormData(updatedTicket);
    onUpdate(updatedTicket);
    setNewUpdateText('');
    setNewUpdateAuthor('You'); 
    addToast('Comment added', 'success');
  };

  const startEditingUpdate = (update: Update) => {
    setEditingUpdateId(update.id);
    setTempUpdate({ ...update });
  };

  const cancelEditingUpdate = () => {
    setEditingUpdateId(null);
    setTempUpdate(null);
  };

  const saveEditingUpdate = () => {
      if (!tempUpdate || !formData) return;
      const updatedUpdates = formData.updates.map(u => u.id === tempUpdate.id ? tempUpdate : u);
      const updatedTicket = { ...formData, updates: updatedUpdates, lastUpdatedDate: getTodayDateString() };
      
      setFormData(updatedTicket);
      onUpdate(updatedTicket);
      setEditingUpdateId(null);
      setTempUpdate(null);
      addToast('Comment updated', 'success');
  };

  const handleDeleteUpdate = (id: string) => {
      if (!formData || !window.confirm("Delete this comment?")) return;
      const updatedUpdates = formData.updates.filter(u => u.id !== id);
      const updatedTicket = { ...formData, updates: updatedUpdates, lastUpdatedDate: getTodayDateString() };
      
      setFormData(updatedTicket);
      onUpdate(updatedTicket);
      addToast('Comment deleted', 'success');
  };


  const renderField = (label: string, content: React.ReactNode) => (
      <div className="mb-1">
          <FieldLabel>{label}</FieldLabel>
          <div className="min-h-[24px] flex items-center text-sm font-normal text-slate-800">
            {content || <span className="text-slate-400 text-xs italic">Empty</span>}
          </div>
      </div>
  );

  const renderLinkInput = (valKey: keyof Ticket, linkKey: keyof Ticket, label: string) => (
    <div className="space-y-1">
        <FieldLabel>{label} #</FieldLabel>
        <Input type="number" value={formData && formData[valKey]} onChange={(e: any) => handleChange(valKey, parseInt(e.target.value) || undefined)} placeholder="#" />
        <Input value={formData && formData[linkKey]} onChange={(e: any) => handleChange(linkKey, e.target.value)} placeholder={`${label} URL`} className="text-xs" />
    </div>
  );

  const renderLinkDisplay = (valKey: keyof Ticket, linkKey: keyof Ticket, label: string) => {
      if (!formData) return null;
      const rawVal = formData[valKey];
      // Ensure val is string or number for rendering
      const val = (typeof rawVal === 'string' || typeof rawVal === 'number') ? rawVal : null;

      const rawLink = formData[linkKey];
      const link = (typeof rawLink === 'string') ? rawLink : undefined;
      
      // If absolutely nothing
      if (!val && !link) return renderField(`${label} Number`, null);
      
      return (
        <div className="mb-1">
             <FieldLabel>{label} Number</FieldLabel>
             <div className="min-h-[24px] flex items-center text-sm font-normal text-slate-800">
                 {val && link ? (
                     <a href={link} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline hover:text-blue-800 font-semibold transition-colors">
                         {val}
                     </a>
                 ) : val ? (
                     <span>{val}</span>
                 ) : (
                     <a href={link} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs flex items-center gap-1">
                        <LinkIcon size={12}/> Link
                     </a>
                 )}
             </div>
        </div>
      );
  }

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
                {/* Header Section */}
                <div className="px-8 py-6 border-b border-slate-200 bg-white flex flex-col gap-4">
                    {/* Row 1: Buttons Row (Right Aligned) */}
                    <div className="flex items-center justify-end gap-2">
                        {!isNew && (
                            <>
                                <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-600 hover:bg-slate-700 text-white text-xs font-medium rounded shadow-sm transition-colors" onClick={() => addToast("Copied info to clipboard", "success")}>
                                    <Copy size={14} /> Copy Info
                                </button>
                                <button className="flex items-center gap-2 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded shadow-sm transition-colors" onClick={handleDelete}>
                                    <Trash2 size={14} /> Delete
                                </button>
                            </>
                        )}
                        
                        {isEditing ? (
                            <button 
                                onClick={handleSave}
                                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded shadow-sm transition-colors"
                            >
                                <Save size={14} /> Save
                            </button>
                        ) : (
                            <button 
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded shadow-sm transition-colors"
                            >
                                <Edit2 size={14} /> Edit
                            </button>
                        )}

                        <button onClick={onClose} className="ml-2 p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Row 2: Ticket Name Field */}
                    <div>
                        {!isEditing ? (
                            <h2 className="text-2xl font-bold text-slate-900 leading-tight break-words">{formData.title}</h2>
                        ) : (
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ticket Name</label>
                                <Input value={formData.title} onChange={(e: any) => handleChange('title', e.target.value)} placeholder="Enter Ticket Title..." className="text-lg font-bold" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/50" ref={scrollRef}>
                
                {/* 1. Core Information */}
                <SectionHeader>Core Information</SectionHeader>
                <div className="grid grid-cols-3 gap-x-8 gap-y-6">
                    {/* Row 1: Type, Priority, Status */}
                    {isEditing ? (
                        <>
                            <div><FieldLabel>Type</FieldLabel><Select value={formData.type} options={Object.values(TicketType)} onChange={(e: any) => handleChange('type', e.target.value)} /></div>
                            <div><FieldLabel>Priority</FieldLabel><Select value={formData.priority} options={Object.values(Priority)} onChange={(e: any) => handleChange('priority', e.target.value)} /></div>
                            <div><FieldLabel>Status</FieldLabel><Select value={formData.status} options={Object.values(Status)} onChange={(e: any) => handleChange('status', e.target.value)} /></div>
                        </>
                    ) : (
                        <>
                            {renderField('Type', <TypeBadge type={formData.type} />)}
                            {renderField('Priority', <PriorityBadge priority={formData.priority} />)}
                            {renderField('Status', <StatusBadge status={formData.status} />)}
                        </>
                    )}

                    {/* Row 2: Status Reason */}
                    <div className="col-span-3">
                        {isEditing ? (
                            <div><FieldLabel>Status Reason</FieldLabel><Input value={formData.reason} onChange={(e: any) => handleChange('reason', e.target.value)} placeholder="Reason..." /></div>
                        ) : (
                            renderField('Status Reason', <span className="text-slate-600">{formData.reason}</span>)
                        )}
                    </div>

                    {/* Row 3: Product Area, Platform, Location */}
                    {isEditing ? (
                        <>
                            <div><FieldLabel>Product Area</FieldLabel><Select value={formData.productArea} options={Object.values(ProductArea)} onChange={(e: any) => handleChange('productArea', e.target.value)} /></div>
                            <div><FieldLabel>Platform</FieldLabel><Select value={formData.platform} options={Object.values(Platform)} onChange={(e: any) => handleChange('platform', e.target.value)} /></div>
                            <div><FieldLabel>Location</FieldLabel><Input value={formData.location} onChange={(e: any) => handleChange('location', e.target.value)} /></div>
                        </>
                    ) : (
                        <>
                            {renderField('Product Area', getProductAreaBadge(formData.productArea))}
                            {renderField('Platform', getPlatformBadge(formData.platform))}
                            {renderField('Location', formData.location)}
                        </>
                    )}
                </div>

                {/* 2. Dates */}
                <SectionHeader>Dates</SectionHeader>
                <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                    {isEditing ? (
                        <>
                            <div>
                                <FieldLabel>Start Date</FieldLabel>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14}/>
                                    <Input type="date" className="pl-9" value={toInputDate(formData.startDate)} onChange={(e: any) => handleChange('startDate', fromInputDate(e.target.value))} />
                                </div>
                            </div>
                            <div>
                                <FieldLabel>Last Updated</FieldLabel>
                                <div className="px-3 py-1.5 bg-slate-100 text-slate-500 rounded text-sm border border-slate-200">{formData.lastUpdatedDate}</div>
                            </div>
                        </>
                    ) : (
                        <>
                            {renderField('Start Date', formData.startDate)}
                            {renderField('Last Updated', formData.lastUpdatedDate)}
                        </>
                    )}
                </div>

                {/* 3. Tracking & Ownership */}
                <SectionHeader>Tracking & Ownership</SectionHeader>
                <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                    {/* Row 1 */}
                    {isEditing ? (
                        <>
                            <div><FieldLabel>Submitter</FieldLabel><Input value={formData.submitterName} onChange={(e: any) => handleChange('submitterName', e.target.value)} /></div>
                            <div><FieldLabel>Client</FieldLabel><Select value={formData.client} options={clientOptions} onChange={(e: any) => handleChange('client', e.target.value)} /></div>
                        </>
                    ) : (
                        <>
                            {renderField('Submitter', formData.submitterName)}
                            {renderField('Client', formData.client)}
                        </>
                    )}

                    {/* Row 2: PMR */}
                    {isEditing ? renderLinkInput('pmrNumber', 'pmrLink', 'PMR') : renderLinkDisplay('pmrNumber', 'pmrLink', 'PMR')}
                    
                    {/* Row 3: PMG */}
                    {isEditing ? renderLinkInput('pmgNumber', 'pmgLink', 'PMG') : renderLinkDisplay('pmgNumber', 'pmgLink', 'PMG')}
                    {isEditing ? renderLinkInput('cpmNumber', 'cpmLink', 'CPM') : renderLinkDisplay('cpmNumber', 'cpmLink', 'CPM')}
                    
                    {/* FP Ticket & Thread */}
                    {isEditing ? (
                        <>
                            <div><FieldLabel>FP Ticket Number</FieldLabel><Input type="number" value={formData.fpTicketNumber} onChange={(e: any) => handleChange('fpTicketNumber', parseInt(e.target.value) || undefined)} /></div>
                            <div><FieldLabel>Ticket Thread ID</FieldLabel><Input value={formData.ticketThreadId} onChange={(e: any) => handleChange('ticketThreadId', e.target.value)} /></div>
                        </>
                    ) : (
                        <>
                            {renderField('FP Ticket Number', formData.fpTicketNumber ? `#${formData.fpTicketNumber}` : null)}
                            {renderField('Ticket Thread ID', formData.ticketThreadId)}
                        </>
                    )}
                </div>

                {/* 4. Issue Information */}
                <SectionHeader>Issue Information</SectionHeader>
                <div className="space-y-6">
                    <div>
                        <FieldLabel>Summary</FieldLabel>
                        {isEditing ? (
                            <Input value={formData.summary} onChange={(e: any) => handleChange('summary', e.target.value)} placeholder="Short summary of the issue..." />
                        ) : (
                            <div className="text-sm text-slate-800 font-normal">{formData.summary || "No summary provided."}</div>
                        )}
                    </div>
                    <div>
                        <FieldLabel>Details</FieldLabel>
                        {isEditing ? (
                            <TextArea value={formData.details} onChange={(e: any) => handleChange('details', e.target.value)} className="h-32" />
                        ) : (
                            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{formData.details || "No details provided."}</p>
                        )}
                    </div>
                </div>

                {/* 5. Ticket Activity */}
                <SectionHeader>Ticket Activity ({formData.updates.length})</SectionHeader>
                
                <div className="space-y-6">
                    {formData.updates.length === 0 ? (
                        <p className="text-slate-400 italic text-sm">No activity recorded yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {formData.updates.map((update) => (
                                <div key={update.id} className="flex gap-3 group">
                                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold shrink-0 uppercase">
                                        {update.author.charAt(0)}
                                    </div>
                                    <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex-1 relative">
                                        {editingUpdateId === update.id && tempUpdate ? (
                                            // Edit Mode for Comment
                                            <div className="space-y-3">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div><FieldLabel>Name</FieldLabel><Input value={tempUpdate.author} onChange={(e: any) => setTempUpdate({...tempUpdate, author: e.target.value})} /></div>
                                                    <div>
                                                        <FieldLabel>Date</FieldLabel>
                                                        <Input type="date" value={toInputDate(tempUpdate.date)} onChange={(e: any) => setTempUpdate({...tempUpdate, date: fromInputDate(e.target.value)})} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <FieldLabel>Comment</FieldLabel>
                                                    <TextArea value={tempUpdate.comment} onChange={(e: any) => setTempUpdate({...tempUpdate, comment: e.target.value})} />
                                                </div>
                                                <div className="flex gap-2 justify-end">
                                                    <button onClick={cancelEditingUpdate} className="text-xs text-slate-500 hover:underline">Cancel</button>
                                                    <button onClick={saveEditingUpdate} className="flex items-center gap-1 text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"><Save size={12}/> Save Update</button>
                                                </div>
                                            </div>
                                        ) : (
                                            // View Mode for Comment
                                            <>
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="font-bold text-xs text-slate-700">{update.author}</span>
                                                    <span className="text-[10px] text-slate-400">{update.date}</span>
                                                </div>
                                                <p className="text-sm text-slate-600 whitespace-pre-wrap">{update.comment}</p>
                                                
                                                {/* Action Buttons (Hidden until hover) */}
                                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => startEditingUpdate(update)} className="p-1 text-slate-400 hover:text-blue-500"><Edit2 size={12}/></button>
                                                    <button onClick={() => handleDeleteUpdate(update.id)} className="p-1 text-slate-400 hover:text-red-500"><Trash2 size={12}/></button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Add Comment Box with Name/Date Fields */}
                    <div className="mt-6 p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Your Name</label>
                                <input 
                                    className="w-full text-sm border-b border-slate-200 focus:border-primary focus:outline-none py-1" 
                                    value={newUpdateAuthor} 
                                    onChange={(e) => setNewUpdateAuthor(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Date</label>
                                <input 
                                    type="date"
                                    className="w-full text-sm border-b border-slate-200 focus:border-primary focus:outline-none py-1 text-slate-600" 
                                    value={toInputDate(newUpdateDate)} 
                                    onChange={(e) => setNewUpdateDate(fromInputDate(e.target.value))}
                                />
                            </div>
                        </div>
                        <textarea 
                            className="w-full text-sm border-none focus:ring-0 p-0 mb-3 resize-y placeholder:text-slate-400"
                            placeholder="Write a comment or update..."
                            rows={6}
                            value={newUpdateText}
                            onChange={(e) => setNewUpdateText(e.target.value)}
                        />
                        <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                            <div className="flex gap-2">
                                {/* Mock attachments buttons */}
                            </div>
                            <button 
                                onClick={handleAddUpdate}
                                disabled={!newUpdateText.trim()}
                                className="bg-primary hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded text-sm font-medium transition-colors"
                            >
                                Comment
                            </button>
                        </div>
                    </div>

                    {isNew && (
                        <div className="mt-8 flex justify-end border-t border-slate-100 pt-6">
                            <button 
                                onClick={handleSave}
                                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded shadow-md transition-all hover:shadow-lg w-full justify-center sm:w-auto"
                            >
                                <Plus size={18} /> Add Ticket
                            </button>
                        </div>
                    )}
                </div>

                <div className="h-20"></div>
                </div>
            </>
        ) : (
            <div className="p-10 flex items-center justify-center h-full">
                {/* Loading skeleton or blank state when closed/animating out */}
            </div>
        )}
      </div>
    </>
  );
}