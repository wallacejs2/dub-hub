
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Dealership, DealershipStatus, ReynoldsSolution, FullpathSolution, WebsiteLink, DMTOrderItem, CRMProvider } from '../types';
import { DMT_PRODUCTS } from '../mockData';
import { getTodayDateString, toInputDate, fromInputDate } from '../utils';
import { X, Edit2, Save, Trash2, Plus, ExternalLink, CheckCircle2, Circle, DollarSign, Globe, CheckSquare, Square } from 'lucide-react';
import { useToast } from './Toast';

interface DealershipDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  dealership?: Dealership;
  onUpdate: (dealership: Dealership) => void;
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

// Helper for View Mode rendering
const renderField = (label: string, content: React.ReactNode) => (
    <div className="mb-1">
        <FieldLabel>{label}</FieldLabel>
        <div className="min-h-[24px] flex items-center text-sm font-normal text-slate-800">
          {content || <span className="text-slate-400 text-xs italic">—</span>}
        </div>
    </div>
);

// --- Components ---

const StatusBadge = ({ status }: { status: DealershipStatus }) => {
    const colors = {
        [DealershipStatus.DMTPending]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        [DealershipStatus.DMTApproved]: 'bg-blue-100 text-blue-800 border-blue-200',
        [DealershipStatus.Onboarding]: 'bg-purple-100 text-purple-800 border-purple-200',
        [DealershipStatus.Live]: 'bg-green-100 text-green-800 border-green-200',
        [DealershipStatus.Cancelled]: 'bg-red-100 text-red-800 border-red-200',
    };
    return <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${colors[status]}`}>{status}</span>;
};

const SolutionItem: React.FC<{ label: string, active: boolean, onClick?: () => void, isEditing: boolean }> = ({ label, active, onClick, isEditing }) => (
    <div 
        onClick={isEditing && onClick ? onClick : undefined}
        className={`flex items-center gap-2 py-1 ${isEditing ? 'cursor-pointer hover:bg-slate-50 rounded px-1 -ml-1' : ''}`}
    >
        {active ? (
            <CheckSquare size={16} className="text-blue-600" />
        ) : (
            <Square size={16} className="text-slate-300" />
        )}
        <span className={`text-sm ${active ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>{label}</span>
    </div>
);

export default function DealershipDrawer({ isOpen, onClose, dealership, onUpdate, onDelete, isNew = false }: DealershipDrawerProps) {
  const [formData, setFormData] = useState<Dealership | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { addToast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (dealership) {
      const safeData = { 
          ...dealership, 
          dmtOrders: dealership.dmtOrders || [],
          crmProvider: dealership.crmProvider || CRMProvider.FOCUS
      };
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
          if(dealership) setFormData({ 
              ...dealership, 
              dmtOrders: dealership.dmtOrders || [],
              crmProvider: dealership.crmProvider || CRMProvider.FOCUS
          });
          setIsEditing(false);
      }
  }

  const handleDelete = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (formData) onDelete(formData.id);
  }

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const char = { 0: '(', 3: ') ', 6: '-' };
    let str = '';
    for (let i = 0; i < numbers.length; i++) {
        str += (char[i as keyof typeof char] || '') + numbers[i];
    }
    return str.substring(0, 14);
  };

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
      <div 
        className={`fixed inset-0 bg-slate-900/30 backdrop-blur-[2px] z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose}
      />

      <div className={`fixed top-0 right-0 bottom-0 w-full max-w-4xl bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {formData ? (
            <>
                {/* 1. Sticky Header */}
                <div className="flex-none bg-white px-6 py-4 z-10">
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

                        {/* Title Section */}
                        <div className="border-b border-slate-100 pb-4">
                            {isEditing ? (
                                <div className="space-y-3">
                                    <div><FieldLabel>CIF</FieldLabel><Input type="number" value={formData.accountNumber} onChange={(e: any) => handleChange('accountNumber', parseInt(e.target.value) || 0)} className="w-32" /></div>
                                    <div><FieldLabel>Dealership Name</FieldLabel><Input value={formData.accountName} onChange={(e: any) => handleChange('accountName', e.target.value)} className="text-xl font-bold" /></div>
                                </div>
                            ) : (
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900 leading-tight">{formData.accountName}</h2>
                                    <span className="text-sm text-slate-400 font-mono mt-1 block">CIF: {formData.accountNumber}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto bg-white custom-scrollbar px-6 pb-10" ref={scrollRef}>
                    
                    {/* 2. Core Status */}
                    <div className="bg-slate-50 border-y border-slate-100 px-4 py-3 -mx-6 mb-6">
                        <div className="flex items-center gap-8">
                             {isEditing ? (
                                <>
                                    <div className="flex-1"><FieldLabel>Status</FieldLabel><Select value={formData.status} options={Object.values(DealershipStatus)} onChange={(e: any) => handleChange('status', e.target.value)} /></div>
                                    <div className="flex-1"><FieldLabel>Go-Live Date</FieldLabel><Input type="date" value={toInputDate(formData.goLiveDate)} onChange={(e: any) => handleChange('goLiveDate', fromInputDate(e.target.value))} /></div>
                                    <div className="flex-1"><FieldLabel>Term Date</FieldLabel><Input type="date" value={toInputDate(formData.termDate)} onChange={(e: any) => handleChange('termDate', fromInputDate(e.target.value))} /></div>
                                </>
                             ) : (
                                <>
                                    {renderField('Status', <StatusBadge status={formData.status} />)}
                                    {renderField('Go-Live Date', formData.goLiveDate)}
                                    {renderField('Term Date', formData.termDate)}
                                </>
                             )}
                        </div>
                    </div>

                    {/* 3. Account Details (2-Column Grid) */}
                    <SectionHeader>Account Details</SectionHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                            {/* Column 1 */}
                            <div className="space-y-4">
                                {isEditing ? (
                                    <>
                                        <div><FieldLabel>Enterprise Group</FieldLabel><Input value={formData.enterpriseGroup} onChange={(e: any) => handleChange('enterpriseGroup', e.target.value)} /></div>
                                        <div><FieldLabel>ERA System ID</FieldLabel><Input type="number" value={formData.eraSystemId} onChange={(e: any) => handleChange('eraSystemId', parseInt(e.target.value) || undefined)} /></div>
                                        <div><FieldLabel>BU-ID</FieldLabel><Input type="number" value={formData.buId} onChange={(e: any) => handleChange('buId', parseInt(e.target.value) || undefined)} /></div>
                                        <div><FieldLabel>CRM Provider</FieldLabel><Select value={formData.crmProvider} options={Object.values(CRMProvider)} onChange={(e: any) => handleChange('crmProvider', e.target.value)} /></div>
                                    </>
                                ) : (
                                    <>
                                        {renderField('Enterprise Group', formData.enterpriseGroup)}
                                        {renderField('ERA System ID', formData.eraSystemId)}
                                        {renderField('BU-ID', formData.buId)}
                                        {renderField('CRM Provider', formData.crmProvider)}
                                    </>
                                )}
                            </div>

                            {/* Column 2 */}
                            <div className="space-y-4">
                                {isEditing ? (
                                    <>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div><FieldLabel>Store #</FieldLabel><Input value={formData.storeNumber} onChange={(e: any) => handleChange('storeNumber', e.target.value)} /></div>
                                            <div><FieldLabel>Branch #</FieldLabel><Input value={formData.branchNumber} onChange={(e: any) => handleChange('branchNumber', e.target.value)} /></div>
                                        </div>
                                        <div><FieldLabel>PPSysID</FieldLabel><Input type="number" value={formData.ppSysId} onChange={(e: any) => handleChange('ppSysId', parseInt(e.target.value) || undefined)} /></div>
                                    </>
                                ) : (
                                    <>
                                        {renderField('Store / Branch', `${formData.storeNumber || ''} / ${formData.branchNumber || ''}`)}
                                        {renderField('PPSysID', formData.ppSysId)}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Full Width Address */}
                        <div>
                             {isEditing ? (
                                <div><FieldLabel>Address</FieldLabel><Input value={formData.address} onChange={(e: any) => handleChange('address', e.target.value)} /></div>
                             ) : renderField('Address', formData.address)}
                        </div>
                    </div>

                    {/* 4. Website Links */}
                    <SectionHeader>Website Links</SectionHeader>
                    <div>
                        <div className="grid grid-cols-2 gap-x-12 gap-y-2 mb-2">
                            <FieldLabel>Primary URL</FieldLabel>
                            <FieldLabel>Client ID</FieldLabel>
                        </div>
                        <div className="space-y-2">
                            {formData.websiteLinks.map((link) => (
                                <div key={link.id} className="grid grid-cols-2 gap-x-12 gap-y-2 items-center">
                                    {isEditing ? (
                                        <Input value={link.url} onChange={(e: any) => handleLinkChange(link.id, 'url', e.target.value)} placeholder="https://..." />
                                    ) : (
                                        <div className="text-sm font-normal truncate">
                                            {link.url ? (
                                                <a href={link.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                                                    {link.url} <ExternalLink size={10}/>
                                                </a>
                                            ) : <span className="text-slate-400 italic">—</span>}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2">
                                        {isEditing ? (
                                            <Input value={link.clientId} onChange={(e: any) => handleLinkChange(link.id, 'clientId', e.target.value)} placeholder="ID" />
                                        ) : (
                                            <span className="text-sm font-normal text-slate-800">{link.clientId || <span className="text-slate-400 italic">—</span>}</span>
                                        )}
                                        {isEditing && (
                                            <button onClick={() => removeLink(link.id)} className="text-slate-400 hover:text-red-500 p-1">
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {isEditing && (
                            <button onClick={addLink} className="flex items-center gap-1 text-xs text-primary hover:underline mt-3">
                                <Plus size={14} /> Add Link
                            </button>
                        )}
                    </div>

                    {/* 5. Equity Provider */}
                    <SectionHeader>Equity Provider</SectionHeader>
                    <div>
                         {isEditing ? (
                            <Input value={formData.equityProvider} onChange={(e: any) => handleChange('equityProvider', e.target.value)} />
                        ) : renderField('Provider Name', formData.equityProvider)}
                    </div>

                    {/* 6. Solution Details */}
                    <SectionHeader>Solution Details</SectionHeader>
                    <div className="grid grid-cols-2 gap-x-12">
                         <div>
                             <FieldLabel>Reynolds Solutions</FieldLabel>
                             <div className="mt-2 space-y-1">
                                 {Object.values(ReynoldsSolution).map(sol => (
                                     <SolutionItem 
                                        key={sol} 
                                        label={sol} 
                                        active={formData.reynoldsSolutions.includes(sol)} 
                                        isEditing={isEditing}
                                        onClick={() => toggleSolution('reynoldsSolutions', sol)}
                                     />
                                 ))}
                             </div>
                         </div>
                         <div>
                             <FieldLabel>Fullpath Solutions</FieldLabel>
                             <div className="mt-2 space-y-1">
                                 {Object.values(FullpathSolution).map(sol => (
                                     <SolutionItem 
                                        key={sol} 
                                        label={sol} 
                                        active={formData.fullpathSolutions.includes(sol)} 
                                        isEditing={isEditing}
                                        onClick={() => toggleSolution('fullpathSolutions', sol)}
                                     />
                                 ))}
                             </div>
                         </div>
                    </div>

                    {/* 7. Contacts & Sales */}
                    <SectionHeader>Contacts & Sales</SectionHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                             <div className="space-y-4">
                                {isEditing ? (
                                    <>
                                        <div><FieldLabel>Assigned Specialist</FieldLabel><Input value={formData.assignedSpecialist} onChange={(e: any) => handleChange('assignedSpecialist', e.target.value)} /></div>
                                        <div><FieldLabel>POC Name</FieldLabel><Input value={formData.pocName} onChange={(e: any) => handleChange('pocName', e.target.value)} /></div>
                                    </>
                                ) : (
                                    <>
                                        {renderField('Assigned Specialist', formData.assignedSpecialist)}
                                        {renderField('POC Name', formData.pocName)}
                                    </>
                                )}
                             </div>
                             <div className="space-y-4">
                                {isEditing ? (
                                    <>
                                        <div><FieldLabel>Sales Contact</FieldLabel><Input value={formData.salesPerson} onChange={(e: any) => handleChange('salesPerson', e.target.value)} /></div>
                                        <div><FieldLabel>POC Email</FieldLabel><Input value={formData.pocEmail} onChange={(e: any) => handleChange('pocEmail', e.target.value)} /></div>
                                    </>
                                ) : (
                                    <>
                                        {renderField('Sales Contact', formData.salesPerson)}
                                        {renderField('POC Email', formData.pocEmail)}
                                    </>
                                )}
                             </div>
                        </div>
                        <div>
                             {isEditing ? (
                                <div><FieldLabel>POC Phone</FieldLabel><Input value={formData.pocPhone} onChange={(e: any) => handleChange('pocPhone', formatPhoneNumber(e.target.value))} placeholder="(555) 555-5555" /></div>
                             ) : renderField('POC Phone', formData.pocPhone)}
                        </div>
                    </div>

                    {/* 8. DMT Orders */}
                    <SectionHeader>DMT Orders</SectionHeader>
                    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                        {/* Table Header */}
                        <div className="grid grid-cols-[80px_120px_1fr_80px_40px_30px] gap-2 px-4 py-2 bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            <div>Received</div>
                            <div>Order #</div>
                            <div>Product</div>
                            <div className="text-right">Price</div>
                            <div className="text-center">Active</div>
                            <div></div>
                        </div>

                        {/* Table Body */}
                        <div className="divide-y divide-slate-100">
                            {formData.dmtOrders && formData.dmtOrders.length > 0 ? (
                                formData.dmtOrders.map(order => {
                                    const selectedProduct = DMT_PRODUCTS.find(p => p.id === order.productId);
                                    
                                    return (
                                        <div key={order.id} className="grid grid-cols-[80px_120px_1fr_80px_40px_30px] gap-2 px-4 py-3 items-center text-sm">
                                            {/* Received */}
                                            {isEditing ? (
                                                <input type="date" className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-1 py-0.5" value={toInputDate(order.receivedDate)} onChange={(e) => handleOrderChange(order.id, 'receivedDate', fromInputDate(e.target.value))} />
                                            ) : <span className="text-slate-600 text-xs">{order.receivedDate}</span>}

                                            {/* Order # */}
                                            {isEditing ? (
                                                <input type="number" className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-1 py-0.5" value={order.orderNumber} onChange={(e) => handleOrderChange(order.id, 'orderNumber', parseInt(e.target.value))} />
                                            ) : <span className="text-slate-800 font-mono text-xs">{order.orderNumber}</span>}

                                            {/* Product */}
                                            {isEditing ? (
                                                <select className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-1 py-0.5" value={order.productId} onChange={(e) => handleOrderChange(order.id, 'productId', e.target.value)}>
                                                    <option value="">Select...</option>
                                                    {DMT_PRODUCTS.map(p => <option key={p.id} value={p.id}>{p.code} | {p.name}</option>)}
                                                </select>
                                            ) : <span className="text-slate-800 text-xs">{selectedProduct ? selectedProduct.name : 'Unknown'}</span>}

                                            {/* Price */}
                                            {isEditing ? (
                                                <input type="number" className="w-full text-xs text-right bg-slate-50 border border-slate-200 rounded px-1 py-0.5" value={order.price} onChange={(e) => handleOrderChange(order.id, 'price', parseFloat(e.target.value))} />
                                            ) : <span className="text-slate-600 font-mono text-xs text-right block">${order.price.toLocaleString()}</span>}

                                            {/* Active */}
                                            <div className="flex justify-center">
                                                <button onClick={() => isEditing && handleOrderChange(order.id, 'isActive', !order.isActive)} disabled={!isEditing}>
                                                    {order.isActive ? <CheckCircle2 size={14} className="text-green-500" /> : <Circle size={14} className="text-slate-300" />}
                                                </button>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex justify-end">
                                                {isEditing && <button onClick={() => removeDmtOrder(order.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={12} /></button>}
                                            </div>
                                        </div>
                                    )
                                })
                            ) : (
                                <div className="p-4 text-center text-slate-400 text-xs italic">No orders recorded.</div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex justify-between items-center">
                            <div>
                                {isEditing && (
                                    <button onClick={addDmtOrder} className="flex items-center gap-1 text-xs text-primary hover:underline font-medium">
                                        <Plus size={14} /> Add Order
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold text-slate-500 uppercase">Total Selling Price</span>
                                <div className="text-sm font-bold text-green-700 font-mono">
                                    ${totalSellingPrice.toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </div>

                    {isNew && (
                        <div className="mt-8 flex justify-end border-t border-slate-100 pt-6">
                            <button 
                                onClick={handleSave}
                                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded shadow-md transition-all hover:shadow-lg w-full justify-center sm:w-auto"
                            >
                                <Plus size={18} /> Add Dealership
                            </button>
                        </div>
                    )}
                </div>
            </>
        ) : (
            <div className="p-10 flex items-center justify-center h-full text-slate-400">Loading...</div>
        )}
      </div>
    </>
  );
}
