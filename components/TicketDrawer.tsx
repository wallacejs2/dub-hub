
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Ticket, Status, Priority, TicketType, ProductArea, Platform, Update, Dealership } from '../types';
import { getTodayDateString, toInputDate, fromInputDate, getDaysActive } from '../utils';
import { X, Calendar, Copy, Trash2, Edit2, Save, Link as LinkIcon, Plus, Clock, User, Hash, Globe } from 'lucide-react';
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
  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 mt-6 first:mt-0">
    {children}
  </h3>
);

const FieldLabel = ({ children }: { children?: React.ReactNode }) => (
  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
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

// --- Badge Components for View Mode ---

const getStatusBadgeColors = (status: Status) => {
    const colors = {
      [Status.NewWaiting]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      [Status.Submitted]: 'bg-slate-100 text-slate-700 border-slate-200',
      [Status.PMReview]: 'bg-purple-100 text-purple-700 border-purple-200',
      [Status.DevReview]: 'bg-pink-100 text-pink-700 border-pink-200',
      [Status.OnHold]: 'bg-orange-100 text-orange-700 border-orange-200',
      [Status.PendingToDo]: 'bg-sky-100 text-sky-700 border-sky-200',
      [Status.Coding]: 'bg-blue-100 text-blue-700 border-blue-200',
      [Status.QATesting]: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      [Status.Completed]: 'bg-green-100 text-green-700 border-green-200',
      [Status.Cancelled]: 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
};

const StatusBadge = ({ status }: { status: Status }) => {
    return <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadgeColors(status)}`}>{status}</span>;
};
  
const PriorityBadge = ({ priority }: { priority: Priority }) => {
    const colors = {
        [Priority.P1]: 'bg-red-100 text-red-700 border-red-200',    // P1 Red
        [Priority.P2]: 'bg-yellow-100 text-yellow-800 border-yellow-200', // P2 Yellow
        [Priority.P3]: 'bg-green-100 text-green-700 border-green-200', // P3 Green
        [Priority.P4]: 'bg-blue-100 text-blue-700 border-blue-200',   // P4 Blue
    };
    return <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${colors[priority]}`}>{priority}</span>;
};

const TypeBadge = ({ type }: { type: TicketType }) => {
    const colors = {
        [TicketType.FeatureRequest]: 'text-emerald-700 bg-emerald-100 border-emerald-200',
        [TicketType.Issue]: 'text-rose-700 bg-rose-100 border-rose-200',
        [TicketType.Question]: 'text-blue-700 bg-blue-100 border-blue-200',
    };
    return <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${colors[type]}`}>{type}</span>;
};

const SimpleBadge = ({ label, colorClass }: { label: string, colorClass: string }) => (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${colorClass}`}>{label}</span>
);

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

  // --- Copy CSV Logic ---
  const handleCopyCSV = () => {
    if (!formData) return;

    const escapeCsvField = (field: any) => {
        if (field === null || field === undefined) return '';
        const stringValue = String(field);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
    };

    let recentActivity = '';
    // Assuming updates are stored with newest first (index 0)
    if (formData.updates && formData.updates.length > 0) {
        const latest = formData.updates[0];
        recentActivity = `${latest.date}: [${latest.author}] ${latest.comment}`;
    }

    const fields = [
        formData.startDate,
        formData.lastUpdatedDate,
        formData.title,
        formData.priority,
        formData.productArea,
        formData.platform,
        formData.location,
        formData.status,
        formData.reason,
        formData.submitterName,
        formData.client,
        formData.pmrNumber,
        formData.pmgNumber,
        formData.cpmNumber,
        formData.fpTicketNumber,
        formData.ticketThreadId,
        formData.summary,
        recentActivity
    ];

    const csvLine = fields.map(escapeCsvField).join(',');
    
    navigator.clipboard.writeText(csvLine);
    addToast("CSV line copied to clipboard", "success");
  };

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
                <div className="flex-none bg-white border-b border-slate-200 px-6 py-4 z-10">
                    <div className="flex flex-col gap-4">
                        {/* Action Buttons (Right Aligned) */}
                        <div className="flex items-center justify-end gap-2">
                            {!isNew && (
                                <>
                                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded shadow-sm transition-colors" onClick={handleCopyCSV}>
                                        <Copy size={12} /> Copy CSV
                                    </button>
                                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-slate-700 text-xs font-medium rounded shadow-sm transition-colors" onClick={handleDelete}>
                                        <Trash2 size={12} /> Delete
                                    </button>
                                </>
                            )}
                            
                            {isEditing ? (
                                <button 
                                    onClick={handleSave}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded shadow-sm transition-colors"
                                >
                                    <Save size={12} /> Save
                                </button>
                            ) : (
                                <button 
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded shadow-sm transition-colors"
                                >
                                    <Edit2 size={12} /> Edit
                                </button>
                            )}

                            <div className="w-px h-6 bg-slate-200 mx-1"></div>

                            <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Ticket Name */}
                        <div>
                            {isEditing ? (
                                <Input 
                                    value={formData.title} 
                                    onChange={(e: any) => handleChange('title', e.target.value)} 
                                    placeholder="Enter Ticket Title" 
                                    className="text-xl font-bold px-0 border-transparent hover:border-slate-300 focus:border-primary focus:ring-0 bg-transparent placeholder:text-slate-300" 
                                />
                            ) : (
                                <h2 className="text-2xl font-bold text-slate-900 leading-snug">{formData.title}</h2>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto bg-white custom-scrollbar" ref={scrollRef}>
                    
                    {/* 2. Status Row (Band) */}
                    <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                        {isEditing ? (
                            <div className="grid grid-cols-3 gap-4">
                                <div><FieldLabel>Type</FieldLabel><Select value={formData.type} options={Object.values(TicketType)} onChange={(e: any) => handleChange('type', e.target.value)} /></div>
                                <div><FieldLabel>Priority</FieldLabel><Select value={formData.priority} options={Object.values(Priority)} onChange={(e: any) => handleChange('priority', e.target.value)} /></div>
                                <div><FieldLabel>Status</FieldLabel><Select value={formData.status} options={Object.values(Status)} onChange={(e: any) => handleChange('status', e.target.value)} /></div>
                                <div><FieldLabel>Product Area</FieldLabel><Select value={formData.productArea} options={Object.values(ProductArea)} onChange={(e: any) => handleChange('productArea', e.target.value)} /></div>
                                <div><FieldLabel>Platform</FieldLabel><Select value={formData.platform} options={Object.values(Platform)} onChange={(e: any) => handleChange('platform', e.target.value)} /></div>
                                <div><FieldLabel>Location</FieldLabel><Input value={formData.location} onChange={(e: any) => handleChange('location', e.target.value)} /></div>
                            </div>
                        ) : (
                             <div className="flex flex-wrap items-center gap-3">
                                <TypeBadge type={formData.type} />
                                <PriorityBadge priority={formData.priority} />
                                <StatusBadge status={formData.status} />
                                <div className="w-px h-5 bg-slate-300 mx-1"></div>
                                <SimpleBadge 
                                    label={formData.productArea} 
                                    colorClass={formData.productArea === ProductArea.Fullpath ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-blue-50 text-blue-700 border-blue-200'} 
                                />
                                <SimpleBadge 
                                    label={formData.platform} 
                                    colorClass="bg-slate-100 text-slate-600 border-slate-200" 
                                />
                                {formData.location && (
                                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                                        in <span className="font-semibold text-slate-700">{formData.location}</span>
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="p-6 space-y-6">
                        
                        {/* Status Reason Field - Above Dates */}
                        <div>
                             {isEditing ? (
                                <div>
                                    <FieldLabel>Status Reason</FieldLabel>
                                    <Input value={formData.reason} onChange={(e: any) => handleChange('reason', e.target.value)} placeholder="e.g. Waiting on Client..." />
                                </div>
                             ) : (
                                formData.reason && (
                                    renderField('Status Reason', formData.reason)
                                )
                             )}
                        </div>

                        {/* 3. Dates Section */}
                        <div className="border-b border-slate-100 pb-4">
                             <div className="grid grid-cols-3 gap-8">
                                {isEditing ? (
                                    <>
                                        <div>
                                            <FieldLabel>Start Date</FieldLabel>
                                            <Input type="date" value={toInputDate(formData.startDate)} onChange={(e: any) => handleChange('startDate', fromInputDate(e.target.value))} />
                                        </div>
                                        <div>
                                            <FieldLabel>Last Updated</FieldLabel>
                                            <div className="text-sm text-slate-500 py-1.5">{formData.lastUpdatedDate}</div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {renderField('Start Date', <span className="flex items-center gap-2"><Calendar size={14} className="text-slate-400"/> {formData.startDate}</span>)}
                                        {renderField('Last Updated', <span className="flex items-center gap-2"><Clock size={14} className="text-slate-400"/> {formData.lastUpdatedDate}</span>)}
                                        {renderField('Days Active', <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{getDaysActive(formData.startDate)} Days</span>)}
                                    </>
                                )}
                             </div>
                        </div>

                        {/* 4. Tracking & Ownership */}
                        <div>
                            <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                                {/* Submitter & Client */}
                                <div>
                                    {isEditing ? (
                                        <div><FieldLabel>Submitter</FieldLabel><Input value={formData.submitterName} onChange={(e: any) => handleChange('submitterName', e.target.value)} /></div>
                                    ) : renderField('Submitter', <span className="flex items-center gap-2"><User size={14} className="text-slate-400"/> {formData.submitterName}</span>)}
                                </div>
                                <div>
                                    {isEditing ? (
                                        <div><FieldLabel>Client</FieldLabel><Select value={formData.client} options={clientOptions} onChange={(e: any) => handleChange('client', e.target.value)} /></div>
                                    ) : renderField('Client', formData.client)}
                                </div>

                                {/* PMR */}
                                <div>
                                    {isEditing ? (
                                         <div><FieldLabel>PMR #</FieldLabel><Input type="number" value={formData.pmrNumber} onChange={(e: any) => handleChange('pmrNumber', parseInt(e.target.value) || undefined)} placeholder="#" /></div>
                                    ) : renderField('PMR #', formData.pmrNumber)}
                                </div>
                                <div>
                                    {isEditing ? (
                                         <div><FieldLabel>PMR URL</FieldLabel><Input value={formData.pmrLink} onChange={(e: any) => handleChange('pmrLink', e.target.value)} placeholder="https://" /></div>
                                    ) : (
                                        formData.pmrLink ? (
                                            renderField('PMR URL', <a href={formData.pmrLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 truncate max-w-xs">{formData.pmrLink} <Globe size={12}/></a>)
                                        ) : renderField('PMR URL', null)
                                    )}
                                </div>

                                {/* PMG */}
                                <div>
                                    {isEditing ? (
                                         <div><FieldLabel>PMG #</FieldLabel><Input type="number" value={formData.pmgNumber} onChange={(e: any) => handleChange('pmgNumber', parseInt(e.target.value) || undefined)} placeholder="#" /></div>
                                    ) : renderField('PMG #', formData.pmgNumber)}
                                </div>
                                <div>
                                    {isEditing ? (
                                         <div><FieldLabel>PMG URL</FieldLabel><Input value={formData.pmgLink} onChange={(e: any) => handleChange('pmgLink', e.target.value)} placeholder="https://" /></div>
                                    ) : (
                                        formData.pmgLink ? (
                                            renderField('PMG URL', <a href={formData.pmgLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 truncate max-w-xs">{formData.pmgLink} <Globe size={12}/></a>)
                                        ) : renderField('PMG URL', null)
                                    )}
                                </div>

                                {/* CPM */}
                                <div>
                                    {isEditing ? (
                                         <div><FieldLabel>CPM #</FieldLabel><Input type="number" value={formData.cpmNumber} onChange={(e: any) => handleChange('cpmNumber', parseInt(e.target.value) || undefined)} placeholder="#" /></div>
                                    ) : renderField('CPM #', formData.cpmNumber)}
                                </div>
                                <div>
                                    {isEditing ? (
                                         <div><FieldLabel>CPM URL</FieldLabel><Input value={formData.cpmLink} onChange={(e: any) => handleChange('cpmLink', e.target.value)} placeholder="https://" /></div>
                                    ) : (
                                        formData.cpmLink ? (
                                            renderField('CPM URL', <a href={formData.cpmLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 truncate max-w-xs">{formData.cpmLink} <Globe size={12}/></a>)
                                        ) : renderField('CPM URL', null)
                                    )}
                                </div>

                                {/* FP Ticket */}
                                <div>
                                    {isEditing ? (
                                         <div><FieldLabel>FP Ticket Number</FieldLabel><Input type="number" value={formData.fpTicketNumber} onChange={(e: any) => handleChange('fpTicketNumber', parseInt(e.target.value) || undefined)} placeholder="#" /></div>
                                    ) : renderField('FP Ticket Number', formData.fpTicketNumber)}
                                </div>
                                <div>
                                    {/* Empty Column for grid alignment */}
                                </div>

                                {/* Thread ID - Full Width */}
                                <div className="col-span-2">
                                     {isEditing ? (
                                         <div><FieldLabel>Ticket Thread ID</FieldLabel><Input value={formData.ticketThreadId} onChange={(e: any) => handleChange('ticketThreadId', e.target.value)} /></div>
                                    ) : renderField('Ticket Thread ID', <span className="font-mono text-sm text-slate-500">{formData.ticketThreadId}</span>)}
                                </div>
                            </div>
                        </div>

                        {/* 5. Issue Summary & 6. Details Wrapper */}
                        <div>
                            <SectionHeader>Details</SectionHeader>
                            
                            {/* Summary */}
                            <div className="mb-4">
                                {isEditing ? (
                                    <Input value={formData.summary} onChange={(e: any) => handleChange('summary', e.target.value)} placeholder="Brief summary..." />
                                ) : (
                                    <p className="text-sm text-slate-800 font-normal leading-relaxed">{formData.summary || <span className="text-slate-400 italic text-sm">No summary provided.</span>}</p>
                                )}
                            </div>

                            {/* Long Details */}
                            <div>
                                {isEditing ? (
                                    <TextArea value={formData.details} onChange={(e: any) => handleChange('details', e.target.value)} className="h-48" placeholder="Full details..." />
                                ) : (
                                    <div className="bg-slate-50 rounded-md border border-slate-200 p-4 min-h-[200px] max-h-[300px] overflow-y-auto custom-scrollbar">
                                        <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                                            {formData.details || <span className="text-slate-400 italic">No details provided.</span>}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 7. Activity */}
                        <div className="pt-4 border-t border-slate-100">
                             <SectionHeader>Activity</SectionHeader>
                             <div className="space-y-6">
                                {formData.updates.length === 0 ? (
                                    <p className="text-slate-400 italic text-sm">No activity recorded yet.</p>
                                ) : (
                                    <div className="space-y-6 pl-4 border-l-2 border-slate-100 ml-2">
                                        {[...formData.updates].reverse().map((update) => (
                                            <div key={update.id} className="relative group">
                                                <div className="absolute -left-[21px] top-0 w-3 h-3 rounded-full bg-slate-300 border-2 border-white ring-1 ring-slate-100"></div>
                                                <div className="flex justify-between items-baseline mb-1">
                                                     <div className="flex items-center gap-2">
                                                        <span className="font-bold text-sm text-slate-800">{update.author}</span>
                                                        <span className="text-xs text-slate-400">{update.date}</span>
                                                     </div>
                                                     <div className="opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity">
                                                         <button onClick={() => startEditingUpdate(update)} className="text-xs text-blue-600 hover:underline">Edit</button>
                                                         <button onClick={() => handleDeleteUpdate(update.id)} className="text-xs text-red-600 hover:underline">Delete</button>
                                                     </div>
                                                </div>
                                                
                                                {editingUpdateId === update.id && tempUpdate ? (
                                                     <div className="mt-2 p-3 bg-slate-50 rounded border border-slate-200 space-y-2">
                                                         <div className="grid grid-cols-2 gap-2">
                                                            <Input value={tempUpdate.author} onChange={(e: any) => setTempUpdate({...tempUpdate, author: e.target.value})} placeholder="Author" />
                                                            <Input type="date" value={toInputDate(tempUpdate.date)} onChange={(e: any) => setTempUpdate({...tempUpdate, date: fromInputDate(e.target.value)})} />
                                                         </div>
                                                         <TextArea value={tempUpdate.comment} onChange={(e: any) => setTempUpdate({...tempUpdate, comment: e.target.value})} />
                                                         <div className="flex justify-end gap-2">
                                                             <button onClick={cancelEditingUpdate} className="text-xs text-slate-500">Cancel</button>
                                                             <button onClick={saveEditingUpdate} className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Save</button>
                                                         </div>
                                                     </div>
                                                ) : (
                                                    <p className="text-sm text-slate-600 whitespace-pre-wrap">{update.comment}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Add Comment Box */}
                                <div className="mt-8 bg-slate-50 p-4 rounded-lg border border-slate-200">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Add Comment</h4>
                                    <div className="grid grid-cols-2 gap-4 mb-3">
                                        <Input value={newUpdateAuthor} onChange={(e: any) => setNewUpdateAuthor(e.target.value)} placeholder="Your Name" />
                                        <Input type="date" value={toInputDate(newUpdateDate)} onChange={(e: any) => setNewUpdateDate(fromInputDate(e.target.value))} />
                                    </div>
                                    <TextArea 
                                        value={newUpdateText} 
                                        onChange={(e: any) => setNewUpdateText(e.target.value)} 
                                        placeholder="Type your comment or update here..." 
                                        rows={6}
                                    />
                                    <div className="flex justify-end mt-3">
                                        <button 
                                            onClick={handleAddUpdate}
                                            disabled={!newUpdateText.trim()}
                                            className="bg-primary hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded text-sm font-medium transition-colors"
                                        >
                                            Post Comment
                                        </button>
                                    </div>
                                </div>
                             </div>
                        </div>

                        {/* Extra padding for bottom scroll */}
                        <div className="h-10"></div>
                    </div>
                </div>

                {/* Footer Action for New Ticket Only */}
                {isNew && (
                    <div className="flex-none p-4 border-t border-slate-200 bg-white">
                         <button 
                            onClick={handleSave}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded shadow-md transition-all"
                        >
                            <Plus size={18} /> Create Ticket
                        </button>
                    </div>
                )}
            </>
        ) : (
            <div className="p-10 flex items-center justify-center h-full">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-4 w-32 bg-slate-200 rounded mb-4"></div>
                    <div className="h-64 w-64 bg-slate-100 rounded"></div>
                </div>
            </div>
        )}
      </div>
    </>
  );
}
