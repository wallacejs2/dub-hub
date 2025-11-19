
import React, { useEffect, useState, useMemo } from 'react';
import { Dealership, DealershipStatus, ReynoldsSolution, FullpathSolution, WebsiteLink, DMTOrderItem } from '../types';
import { DMT_PRODUCTS } from '../mockData';
import { getTodayDateString, toInputDate, fromInputDate } from '../utils';
import { X, Edit2, Save, Trash2, Plus, ExternalLink, CheckCircle, Circle, DollarSign } from 'lucide-react';
import { useToast } from './Toast';

interface DealershipDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  dealership?: Dealership;
  onUpdate: (dealership: Dealership) => void;
  onDelete: (id: string) => void;
  isNew?: boolean;
}

// Reuse styled components from TicketDrawer contextually
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

// Helper for View Mode rendering
const renderField = (label: string, content: React.ReactNode) => (
    <div className="mb-1">
        <FieldLabel>{label}</FieldLabel>
        <div className="min-h-[24px] flex items-center text-sm font-medium text-slate-800">
          {content || <span className="text-slate-400 text-xs italic">Empty</span>}
        </div>
    </div>
);

// --- Components ---

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

export default function DealershipDrawer({ isOpen, onClose, dealership, onUpdate, onDelete, isNew = false }: DealershipDrawerProps) {
  const [formData, setFormData] = useState<Dealership | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (dealership) {
      // Ensure dmtOrders exists if loading older data
      const safeData = { ...dealership, dmtOrders: dealership.dmtOrders || [] };
      setFormData(safeData);
      setIsEditing(isNew);
    }
  }, [dealership, isNew]);

  const handleChange = (field: keyof Dealership, value: any) => {
    setFormData(prev => prev ? ({ ...prev, [field]: value }) : null);
  };

  const handleSave = () => {
    if (formData) {
        if (!formData.accountName.trim()) {
            addToast("Account Name is required", "error");
            return;
        }
        const updated = { ...formData, lastUpdated: getTodayDateString() };
        onUpdate(updated);
        setFormData(updated);
        setIsEditing(false);
    }
  };

  const handleCancel = () => {
      if(isNew) {
          onClose();
      } else {
          // Revert to original
          if(dealership) setFormData({ ...dealership, dmtOrders: dealership.dmtOrders || [] });
          setIsEditing(false);
      }
  }

  const handleDelete = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (formData) onDelete(formData.id);
  }

  // --- Format Phone ---
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const char = { 0: '(', 3: ') ', 6: '-' };
    let str = '';
    for (let i = 0; i < numbers.length; i++) {
        str += (char[i as keyof typeof char] || '') + numbers[i];
    }
    return str.substring(0, 14);
  };

  // --- Dynamic Links Logic ---
  const handleLinkChange = (id: string, field: 'url' | 'clientId', value: string) => {
      if (!formData) return;
      const updatedLinks = formData.websiteLinks.map(link => 
          link.id === id ? { ...link, [field]: value } : link
      );
      handleChange('websiteLinks', updatedLinks);
  };

  const addLink = () => {
      if (!formData) return;
      const newLink: WebsiteLink = { id: Date.now().toString(), url: '', clientId: '' };
      handleChange('websiteLinks', [...formData.websiteLinks, newLink]);
  };

  const removeLink = (id: string) => {
      if (!formData) return;
      handleChange('websiteLinks', formData.websiteLinks.filter(l => l.id !== id));
  };

  // --- DMT Order Logic ---
  const addDmtOrder = () => {
      if (!formData) return;
      const newOrder: DMTOrderItem = {
          id: Date.now().toString(),
          receivedDate: getTodayDateString(),
          orderNumber: 0,
          productId: '',
          price: 0,
          isActive: false
      };
      handleChange('dmtOrders', [...formData.dmtOrders, newOrder]);
  };

  const removeDmtOrder = (id: string) => {
      if (!formData) return;
      handleChange('dmtOrders', formData.dmtOrders.filter(o => o.id !== id));
  };

  const handleOrderChange = (id: string, field: keyof DMTOrderItem, value: any) => {
      if (!formData) return;
      
      let updatedOrders = formData.dmtOrders.map(order => {
          if (order.id === id) {
              const updated = { ...order, [field]: value };
              // If product changes, auto-update price
              if (field === 'productId') {
                  const product = DMT_PRODUCTS.find(p => p.id === value);
                  if (product) {
                      updated.price = product.defaultPrice;
                  }
              }
              return updated;
          }
          return order;
      });
      handleChange('dmtOrders', updatedOrders);
  };

  const totalSellingPrice = useMemo(() => {
      if (!formData) return 0;
      return formData.dmtOrders
        .filter(o => o.isActive)
        .reduce((sum, o) => sum + (Number(o.price) || 0), 0);
  }, [formData]);

  // --- Multi Select Logic ---
  const toggleSolution = (arrayName: 'reynoldsSolutions' | 'fullpathSolutions', value: string) => {
      if (!formData) return;
      const currentArray = formData[arrayName] as string[];
      if (currentArray.includes(value)) {
          handleChange(arrayName, currentArray.filter(v => v !== value));
      } else {
          handleChange(arrayName, [...currentArray, value]);
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
                {/* Header Section */}
                <div className="px-8 py-6 border-b border-slate-200 bg-white flex flex-col gap-4">
                    {/* Row 1: Buttons Row */}
                    <div className="flex items-center justify-end gap-2">
                        {isEditing ? (
                            <>
                                <button onClick={handleCancel} className="text-xs text-slate-500 hover:underline px-3">Cancel</button>
                                <button 
                                    onClick={handleSave}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded shadow-sm transition-colors"
                                >
                                    <Save size={14} /> Save Changes
                                </button>
                            </>
                        ) : (
                            <>
                                <button 
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded shadow-sm transition-colors"
                                >
                                    <Edit2 size={14} /> Edit
                                </button>
                                <button 
                                    onClick={handleDelete}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded shadow-sm transition-colors"
                                >
                                    <Trash2 size={14} /> Delete
                                </button>
                            </>
                        )}

                        <button onClick={onClose} className="ml-2 p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Row 2: Title / Header */}
                    <div>
                         <div className="flex items-center gap-2 text-sm text-slate-500 font-mono mb-1">
                            CIF: {isEditing ? (
                                <input 
                                    type="number" 
                                    className="bg-slate-100 border border-slate-300 rounded px-1 w-24 focus:outline-none focus:border-primary"
                                    value={formData.accountNumber || ''}
                                    onChange={(e) => handleChange('accountNumber', parseInt(e.target.value) || 0)}
                                />
                            ) : formData.accountNumber}
                         </div>
                        {!isEditing ? (
                            <h2 className="text-2xl font-bold text-slate-900">{formData.accountName || "New Dealership"}</h2>
                        ) : (
                            <div>
                                <FieldLabel>Account Name</FieldLabel>
                                <Input value={formData.accountName} onChange={(e: any) => handleChange('accountName', e.target.value)} className="text-lg font-bold" placeholder="Dealership Name" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/50">

                    {/* 1. Core Status */}
                    <SectionHeader>Core Status</SectionHeader>
                    <div className="grid grid-cols-3 gap-x-8 gap-y-6">
                        {isEditing ? (
                            <>
                                <div><FieldLabel>Status</FieldLabel><Select value={formData.status} options={Object.values(DealershipStatus)} onChange={(e: any) => handleChange('status', e.target.value)} /></div>
                                <div><FieldLabel>Go-Live Date</FieldLabel><Input type="date" value={toInputDate(formData.goLiveDate)} onChange={(e: any) => handleChange('goLiveDate', fromInputDate(e.target.value))} /></div>
                                <div><FieldLabel>Term Date</FieldLabel><Input type="date" value={toInputDate(formData.termDate)} onChange={(e: any) => handleChange('termDate', fromInputDate(e.target.value))} /></div>
                            </>
                        ) : (
                            <>
                                {renderField('Status', <StatusBadge status={formData.status} />)}
                                {renderField('Go-Live Date', formData.goLiveDate)}
                                {renderField('Term Date', formData.termDate)}
                            </>
                        )}
                    </div>

                    {/* 2. Account Details */}
                    <SectionHeader>Account Details</SectionHeader>
                    <div className="grid grid-cols-3 gap-x-8 gap-y-6">
                        {isEditing ? (
                            <>
                                <div><FieldLabel>Enterprise (Group)</FieldLabel><Input value={formData.enterpriseGroup} onChange={(e: any) => handleChange('enterpriseGroup', e.target.value)} /></div>
                                <div><FieldLabel>Store Number</FieldLabel><Input value={formData.storeNumber} onChange={(e: any) => handleChange('storeNumber', e.target.value)} /></div>
                                <div><FieldLabel>Branch Number</FieldLabel><Input value={formData.branchNumber} onChange={(e: any) => handleChange('branchNumber', e.target.value)} /></div>
                                
                                <div><FieldLabel>ERA System ID</FieldLabel><Input type="number" value={formData.eraSystemId} onChange={(e: any) => handleChange('eraSystemId', parseInt(e.target.value) || undefined)} /></div>
                                <div><FieldLabel>PPSysID</FieldLabel><Input type="number" value={formData.ppSysId} onChange={(e: any) => handleChange('ppSysId', parseInt(e.target.value) || undefined)} /></div>
                                <div><FieldLabel>BU-ID</FieldLabel><Input type="number" value={formData.buId} onChange={(e: any) => handleChange('buId', parseInt(e.target.value) || undefined)} /></div>

                                <div className="col-span-3"><FieldLabel>Address</FieldLabel><Input value={formData.address} onChange={(e: any) => handleChange('address', e.target.value)} /></div>
                            </>
                        ) : (
                            <>
                                {renderField('Enterprise (Group)', formData.enterpriseGroup)}
                                {renderField('Store / Branch', `${formData.storeNumber || '-'} / ${formData.branchNumber || '-'}`)}
                                <div></div> {/* Spacer to align grid */}
                                {renderField('ERA System ID', formData.eraSystemId)}
                                {renderField('PPSysID', formData.ppSysId)}
                                {renderField('BU-ID', formData.buId)}
                                <div className="col-span-3">{renderField('Address', formData.address)}</div>
                            </>
                        )}
                    </div>

                    {/* 3. Website Links */}
                    <SectionHeader>Website Links</SectionHeader>
                    <div className="space-y-3">
                        {formData.websiteLinks.map((link) => (
                            <div key={link.id} className="flex items-end gap-4">
                                <div className="flex-1">
                                    <FieldLabel>URL</FieldLabel>
                                    {isEditing ? (
                                        <Input value={link.url} onChange={(e: any) => handleLinkChange(link.id, 'url', e.target.value)} placeholder="https://..." />
                                    ) : (
                                        <div className="min-h-[24px] flex items-center text-sm font-medium">
                                            {link.url ? (
                                                <a href={link.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                                                    {link.url} <ExternalLink size={12}/>
                                                </a>
                                            ) : <span className="text-slate-400 text-xs italic">Empty</span>}
                                        </div>
                                    )}
                                </div>
                                <div className="w-1/3">
                                    <FieldLabel>Client ID</FieldLabel>
                                    {isEditing ? (
                                        <Input value={link.clientId} onChange={(e: any) => handleLinkChange(link.id, 'clientId', e.target.value)} placeholder="ID" />
                                    ) : (
                                        <div className="min-h-[24px] flex items-center text-sm font-medium text-slate-800 bg-slate-100 px-2 rounded w-fit">
                                            {link.clientId}
                                        </div>
                                    )}
                                </div>
                                {isEditing && (
                                    <button onClick={() => removeLink(link.id)} className="mb-1.5 p-2 text-slate-400 hover:text-red-500 rounded hover:bg-red-50">
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        ))}

                        {isEditing && (
                            <button onClick={addLink} className="flex items-center gap-1 text-xs text-primary hover:underline mt-2">
                                <Plus size={14} /> Add Link
                            </button>
                        )}
                    </div>

                    {/* 4. Equity Provider */}
                    <SectionHeader>Equity Provider</SectionHeader>
                    <div>
                        {isEditing ? (
                            <Input value={formData.equityProvider} onChange={(e: any) => handleChange('equityProvider', e.target.value)} />
                        ) : (
                             renderField('Provider', formData.equityProvider)
                        )}
                    </div>

                    {/* 5. Solution Details */}
                    <SectionHeader>Solution Details</SectionHeader>
                    
                    <div className="space-y-6">
                         {/* Reynolds Solutions */}
                         <div>
                            <FieldLabel>Reynolds Solutions</FieldLabel>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {Object.values(ReynoldsSolution).map(sol => {
                                    const isSelected = formData.reynoldsSolutions.includes(sol);
                                    if (!isEditing && !isSelected) return null;

                                    return (
                                        <button
                                            key={sol}
                                            onClick={() => isEditing && toggleSolution('reynoldsSolutions', sol)}
                                            className={`
                                                px-3 py-1 rounded-full text-xs font-bold border transition-all
                                                ${isSelected 
                                                    ? 'bg-blue-600 text-white border-blue-600' 
                                                    : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300'
                                                }
                                                ${!isEditing ? 'cursor-default' : 'cursor-pointer'}
                                            `}
                                        >
                                            {sol}
                                        </button>
                                    )
                                })}
                                {!isEditing && formData.reynoldsSolutions.length === 0 && <span className="text-sm text-slate-400 italic">None</span>}
                            </div>
                         </div>

                         {/* Fullpath Solutions */}
                         <div>
                            <FieldLabel>Fullpath Solutions</FieldLabel>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {Object.values(FullpathSolution).map(sol => {
                                    const isSelected = formData.fullpathSolutions.includes(sol);
                                    if (!isEditing && !isSelected) return null;

                                    return (
                                        <button
                                            key={sol}
                                            onClick={() => isEditing && toggleSolution('fullpathSolutions', sol)}
                                            className={`
                                                px-3 py-1 rounded-full text-xs font-bold border transition-all
                                                ${isSelected 
                                                    ? 'bg-orange-500 text-white border-orange-500' 
                                                    : 'bg-white text-slate-500 border-slate-200 hover:border-orange-300'
                                                }
                                                ${!isEditing ? 'cursor-default' : 'cursor-pointer'}
                                            `}
                                        >
                                            {sol}
                                        </button>
                                    )
                                })}
                                {!isEditing && formData.fullpathSolutions.length === 0 && <span className="text-sm text-slate-400 italic">None</span>}
                            </div>
                         </div>
                    </div>

                    {/* 6. Contacts */}
                    <SectionHeader>Contacts & Sales</SectionHeader>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                        {isEditing ? (
                            <>
                                <div><FieldLabel>Assigned Specialist</FieldLabel><Input value={formData.assignedSpecialist} onChange={(e: any) => handleChange('assignedSpecialist', e.target.value)} /></div>
                                <div><FieldLabel>Sales</FieldLabel><Input value={formData.salesPerson} onChange={(e: any) => handleChange('salesPerson', e.target.value)} /></div>
                                
                                <div><FieldLabel>Point of Contact Name</FieldLabel><Input value={formData.pocName} onChange={(e: any) => handleChange('pocName', e.target.value)} /></div>
                                <div><FieldLabel>Point of Contact Email</FieldLabel><Input value={formData.pocEmail} onChange={(e: any) => handleChange('pocEmail', e.target.value)} /></div>
                                <div>
                                    <FieldLabel>Point of Contact Phone</FieldLabel>
                                    <Input value={formData.pocPhone} onChange={(e: any) => handleChange('pocPhone', formatPhoneNumber(e.target.value))} placeholder="(555) 555-5555" />
                                </div>
                            </>
                        ) : (
                            <>
                                {renderField('Assigned Specialist', formData.assignedSpecialist)}
                                {renderField('Sales', formData.salesPerson)}
                                {renderField('POC Name', formData.pocName)}
                                {renderField('POC Email', formData.pocEmail)}
                                {renderField('POC Phone', formData.pocPhone)}
                            </>
                        )}
                    </div>

                    {/* 7. DMT Orders */}
                    <SectionHeader>DMT Orders</SectionHeader>
                    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                        {/* Table Header */}
                        <div className="grid grid-cols-[100px_100px_1fr_100px_60px_40px] gap-4 px-4 py-2 bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            <div>Received</div>
                            <div>Order #</div>
                            <div>Product</div>
                            <div>Price</div>
                            <div className="text-center">Active</div>
                            <div></div>
                        </div>

                        {/* Table Body */}
                        <div className="divide-y divide-slate-100">
                            {formData.dmtOrders && formData.dmtOrders.length > 0 ? (
                                formData.dmtOrders.map(order => {
                                    const selectedProduct = DMT_PRODUCTS.find(p => p.id === order.productId);
                                    
                                    return (
                                        <div key={order.id} className="grid grid-cols-[100px_100px_1fr_100px_60px_40px] gap-4 px-4 py-3 items-center text-sm">
                                            {/* Received Date */}
                                            {isEditing ? (
                                                <input 
                                                    type="date" 
                                                    className="w-full bg-slate-50 border border-slate-200 rounded px-1 py-0.5 text-xs focus:outline-none focus:border-primary"
                                                    value={toInputDate(order.receivedDate)}
                                                    onChange={(e) => handleOrderChange(order.id, 'receivedDate', fromInputDate(e.target.value))}
                                                />
                                            ) : (
                                                <span className="text-slate-600">{order.receivedDate}</span>
                                            )}

                                            {/* Order Number */}
                                            {isEditing ? (
                                                <input 
                                                    type="number" 
                                                    className="w-full bg-slate-50 border border-slate-200 rounded px-1 py-0.5 text-xs focus:outline-none focus:border-primary"
                                                    value={order.orderNumber || ''}
                                                    onChange={(e) => handleOrderChange(order.id, 'orderNumber', parseInt(e.target.value) || 0)}
                                                    placeholder="#"
                                                />
                                            ) : (
                                                <span className="text-slate-800 font-mono">{order.orderNumber}</span>
                                            )}

                                            {/* Product */}
                                            {isEditing ? (
                                                <select 
                                                    className="w-full bg-slate-50 border border-slate-200 rounded px-1 py-0.5 text-xs focus:outline-none focus:border-primary"
                                                    value={order.productId}
                                                    onChange={(e) => handleOrderChange(order.id, 'productId', e.target.value)}
                                                >
                                                    <option value="">Select Product...</option>
                                                    <optgroup label="New">
                                                        {DMT_PRODUCTS.filter(p => p.category === 'New').map(p => (
                                                            <option key={p.id} value={p.id}>{p.code} | {p.name}</option>
                                                        ))}
                                                    </optgroup>
                                                    <optgroup label="Old">
                                                        {DMT_PRODUCTS.filter(p => p.category === 'Old').map(p => (
                                                            <option key={p.id} value={p.id}>{p.code} | {p.name}</option>
                                                        ))}
                                                    </optgroup>
                                                </select>
                                            ) : (
                                                <span className="text-slate-800 font-medium">
                                                    {selectedProduct ? `${selectedProduct.code} | ${selectedProduct.name}` : 'Unknown Product'}
                                                </span>
                                            )}

                                            {/* Price */}
                                            {isEditing ? (
                                                <div className="relative">
                                                    <span className="absolute left-1 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                                                    <input 
                                                        type="number"
                                                        className="w-full pl-3 pr-1 py-0.5 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none focus:border-primary text-right"
                                                        value={order.price}
                                                        onChange={(e) => handleOrderChange(order.id, 'price', parseFloat(e.target.value) || 0)}
                                                    />
                                                </div>
                                            ) : (
                                                <span className="text-slate-600 font-mono">${order.price.toLocaleString()}</span>
                                            )}

                                            {/* Active Toggle */}
                                            <div className="flex justify-center">
                                                <button 
                                                    onClick={() => isEditing && handleOrderChange(order.id, 'isActive', !order.isActive)}
                                                    className={`${isEditing ? 'cursor-pointer hover:opacity-80' : 'cursor-default'} transition-colors`}
                                                    disabled={!isEditing}
                                                >
                                                    {order.isActive ? (
                                                        <CheckCircle size={18} className="text-green-500 fill-green-50" />
                                                    ) : (
                                                        <Circle size={18} className="text-slate-300" />
                                                    )}
                                                </button>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex justify-end">
                                                {isEditing && (
                                                    <button onClick={() => removeDmtOrder(order.id)} className="text-slate-400 hover:text-red-500">
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })
                            ) : (
                                <div className="p-4 text-center text-slate-400 text-xs italic">No orders added.</div>
                            )}
                        </div>

                        {/* Footer: Total & Add Button */}
                        <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex justify-between items-center">
                            <div>
                                {isEditing && (
                                    <button onClick={addDmtOrder} className="flex items-center gap-1 text-xs text-primary hover:underline font-medium">
                                        <Plus size={14} /> Add Order
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-xs font-bold text-slate-500 uppercase">Total Selling Price</span>
                                <div className="text-lg font-bold text-green-600 font-mono flex items-center">
                                    <DollarSign size={16} strokeWidth={3} />
                                    {totalSellingPrice.toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="h-20"></div>
                </div>
            </>
        ) : (
            <div className="p-10 flex items-center justify-center h-full text-slate-400">Loading...</div>
        )}
      </div>
    </>
  );
}
