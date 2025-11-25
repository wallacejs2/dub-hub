
import React, { useEffect, useState } from 'react';
import { Task, TaskStatus, Priority } from '../types';
import { getTodayDateString, toInputDate, fromInputDate } from '../utils';
import { Trash2, Save, Calendar, User, Clock, Check } from 'lucide-react';

interface TaskDetailPaneProps {
  task: Task | null;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

const FieldLabel = ({ children }: { children?: React.ReactNode }) => (
    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
        {children}
    </label>
);

interface InputProps {
  type?: string;
  value?: string | number;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  className?: string;
}

const Input = ({ type = "text", value, onChange, placeholder, className = "" }: InputProps) => (
  <input 
      type={type} 
      value={value || ''} 
      onChange={onChange} 
      placeholder={placeholder}
      className={`w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${className}`}
  />
);

interface SelectProps {
  value?: string | number;
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
  options: string[];
}

const Select = ({ value, onChange, options }: SelectProps) => (
  <div className="relative">
      <select 
          value={value} 
          onChange={onChange} 
          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none cursor-pointer"
      >
          {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
          <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
      </div>
  </div>
);

interface TextAreaProps {
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
  placeholder?: string;
  className?: string;
}

const TextArea = ({ value, onChange, placeholder, className = "" }: TextAreaProps) => (
    <textarea 
        value={value || ''} 
        onChange={onChange} 
        placeholder={placeholder}
        className={`w-full px-3 py-2 bg-white border border-slate-200 rounded text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-y ${className}`}
    />
);

export default function TaskDetailPane({ task, onUpdateTask, onDeleteTask }: TaskDetailPaneProps) {
  const [formData, setFormData] = useState<Task | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setFormData(task);
    setIsDirty(false);
  }, [task]);

  const handleChange = (field: keyof Task, value: any) => {
    if (!formData) return;
    setFormData({ ...formData, [field]: value });
    setIsDirty(true);
  };

  const handleSave = () => {
    if (formData) {
        onUpdateTask({ ...formData, lastUpdatedDate: getTodayDateString() });
        setIsDirty(false);
    }
  };

  const handleDelete = () => {
      if (formData && window.confirm("Are you sure you want to delete this task?")) {
          onDeleteTask(formData.id);
      }
  };

  if (!task) {
      return (
          <div className="flex-1 h-full bg-slate-50 flex items-center justify-center text-slate-400 border-t md:border-t-0 md:border-l border-slate-200 p-8 text-center">
              <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                      <Check size={32} className="text-slate-300" />
                  </div>
                  <p className="text-xs">Select a task to view details</p>
              </div>
          </div>
      );
  }

  // Ensure formData is not null before rendering form
  if (!formData) return null;

  return (
    <div className="flex-1 h-full bg-slate-50 border-t md:border-t-0 md:border-l border-slate-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 flex-1">
                 <div className="w-full max-w-lg">
                    <Input 
                        value={formData.title} 
                        onChange={(e: any) => handleChange('title', e.target.value)} 
                        className="text-xs font-bold border-transparent bg-transparent focus:bg-white hover:bg-slate-50 px-0" 
                        placeholder="Task Title"
                    />
                 </div>
            </div>
            <div className="flex items-center gap-2">
                <button 
                    onClick={handleDelete}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                    title="Delete Task"
                >
                    <Trash2 size={16} />
                </button>
                {isDirty && (
                     <button 
                        onClick={handleSave}
                        className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <Save size={14} /> Save Changes
                    </button>
                )}
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            <div className="max-w-3xl mx-auto space-y-6">
                
                {/* Core Fields Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                        <FieldLabel>Status</FieldLabel>
                        <Select 
                            value={formData.status} 
                            options={Object.values(TaskStatus)} 
                            onChange={(e: any) => handleChange('status', e.target.value)} 
                        />
                    </div>
                    <div>
                        <FieldLabel>Priority</FieldLabel>
                        <Select 
                            value={formData.priority} 
                            options={Object.values(Priority)} 
                            onChange={(e: any) => handleChange('priority', e.target.value)} 
                        />
                    </div>
                    <div>
                        <FieldLabel>Due Date</FieldLabel>
                        <div className="relative">
                            <Input 
                                type="date" 
                                value={toInputDate(formData.dueDate)} 
                                onChange={(e: any) => handleChange('dueDate', fromInputDate(e.target.value))} 
                            />
                            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                        </div>
                    </div>
                    <div>
                        <FieldLabel>Assignee</FieldLabel>
                        <div className="relative">
                            <Input 
                                value={formData.assignee} 
                                onChange={(e: any) => handleChange('assignee', e.target.value)} 
                                placeholder="Unassigned"
                            />
                            <User className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <FieldLabel>Description</FieldLabel>
                    <TextArea 
                        value={formData.description} 
                        onChange={(e: any) => handleChange('description', e.target.value)} 
                        className="h-48"
                        placeholder="Add more details about this task..."
                    />
                </div>

                {/* Meta Info */}
                <div className="pt-4 border-t border-slate-200 flex flex-wrap gap-6 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                        <Clock size={12} /> Created: {formData.createdDate}
                    </div>
                    <div className="flex items-center gap-2">
                        <Save size={12} /> Last Updated: {formData.lastUpdatedDate}
                    </div>
                </div>

            </div>
        </div>
    </div>
  );
}
