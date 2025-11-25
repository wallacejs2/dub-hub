
import React, { useState, useMemo } from 'react';
import { Task, TaskStatus, Priority } from '../types';
import { Filter, Plus, Square, CheckSquare, Search } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  selectedTaskId: string | null;
  onSelectTask: (id: string) => void;
  onAddTask: (title: string) => void;
  onUpdateTask: (task: Task) => void;
}

const StatusPill = ({ status }: { status: TaskStatus }) => {
    const colors = {
        [TaskStatus.ToDo]: 'bg-slate-100 text-slate-700 border-slate-200',
        [TaskStatus.InProgress]: 'bg-blue-50 text-blue-700 border-blue-200',
        [TaskStatus.Blocked]: 'bg-red-50 text-red-700 border-red-200',
        [TaskStatus.Completed]: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border whitespace-nowrap ${colors[status]}`}>
            {status}
        </span>
    );
};

const PriorityPill = ({ priority }: { priority: Priority }) => {
    const colors = {
      [Priority.P1]: 'text-red-600 bg-red-50 border-red-200',
      [Priority.P2]: 'text-yellow-700 bg-yellow-50 border-yellow-200',
      [Priority.P3]: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      [Priority.P4]: 'text-blue-700 bg-blue-50 border-blue-200',
    };
    return <span className={`px-1.5 py-0.5 rounded text-xs font-bold border ${colors[priority]}`}>{priority}</span>;
};

export default function TaskList({ tasks, selectedTaskId, onSelectTask, onAddTask, onUpdateTask }: TaskListProps) {
  const [quickAddTitle, setQuickAddTitle] = useState('');
  const [filters, setFilters] = useState({
      status: 'All',
      priority: 'All',
      search: ''
  });

  const filteredTasks = useMemo(() => {
      return tasks.filter(t => {
          if (filters.status !== 'All' && t.status !== filters.status) return false;
          if (filters.priority !== 'All' && t.priority !== filters.priority) return false;
          if (filters.search && !t.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
          return true;
      }).sort((a, b) => {
          if (a.status === TaskStatus.Completed && b.status !== TaskStatus.Completed) return 1;
          if (a.status !== TaskStatus.Completed && b.status === TaskStatus.Completed) return -1;
          return new Date(b.lastUpdatedDate).getTime() - new Date(a.lastUpdatedDate).getTime();
      });
  }, [tasks, filters]);

  const handleQuickAdd = (e: React.FormEvent) => {
      e.preventDefault();
      if (quickAddTitle.trim()) {
          onAddTask(quickAddTitle.trim());
          setQuickAddTitle('');
      }
  };

  const toggleComplete = (e: React.MouseEvent, task: Task) => {
      e.stopPropagation();
      const newStatus = task.status === TaskStatus.Completed ? TaskStatus.ToDo : TaskStatus.Completed;
      onUpdateTask({ ...task, status: newStatus });
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 w-full md:w-[500px] shrink-0">
        {/* Header Filters */}
        <div className="p-3 border-b border-slate-200 space-y-2">
            <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Tasks</h2>
                <div className="ml-auto flex gap-2">
                    <button 
                        onClick={() => onAddTask("New Task")}
                        className="p-1 bg-primary text-white rounded hover:bg-blue-700 transition-colors"
                        title="New Task"
                    >
                        <Plus size={14} />
                    </button>
                </div>
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                <select 
                    className="text-xs border border-slate-200 rounded px-2 py-1 bg-slate-50 focus:outline-none focus:border-primary"
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                >
                    <option value="All">All Status</option>
                    {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select 
                    className="text-xs border border-slate-200 rounded px-2 py-1 bg-slate-50 focus:outline-none focus:border-primary"
                    value={filters.priority}
                    onChange={(e) => setFilters({...filters, priority: e.target.value})}
                >
                    <option value="All">All Priority</option>
                    {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>
            
            <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                <input 
                    type="text" 
                    placeholder="Search tasks..." 
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none focus:border-primary"
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                />
            </div>
        </div>

        {/* Quick Add */}
        <form onSubmit={handleQuickAdd} className="p-2 border-b border-slate-200 bg-slate-50">
            <input 
                type="text" 
                placeholder="+ Add a new task..." 
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                value={quickAddTitle}
                onChange={(e) => setQuickAddTitle(e.target.value)}
            />
        </form>

        {/* Task List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
            {filteredTasks.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">No tasks found.</div>
            ) : (
                <div className="divide-y divide-slate-100">
                    {filteredTasks.map(task => (
                        <div 
                            key={task.id}
                            onClick={() => onSelectTask(task.id)}
                            className={`p-3 cursor-pointer hover:bg-slate-50 transition-colors group ${selectedTaskId === task.id ? 'bg-blue-50/50 border-l-4 border-primary pl-[8px]' : 'border-l-4 border-transparent'}`}
                        >
                            <div className="flex items-start gap-2">
                                <button 
                                    onClick={(e) => toggleComplete(e, task)}
                                    className="mt-0.5 text-slate-400 hover:text-primary transition-colors shrink-0"
                                >
                                    {task.status === TaskStatus.Completed ? (
                                        <CheckSquare size={16} className="text-emerald-500" />
                                    ) : (
                                        <Square size={16} />
                                    )}
                                </button>
                                <div className="flex-1 min-w-0">
                                    <h3 className={`text-xs font-bold text-slate-900 mb-1 truncate ${task.status === TaskStatus.Completed ? 'line-through text-slate-400' : ''}`}>
                                        {task.title}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        <StatusPill status={task.status} />
                                        <PriorityPill priority={task.priority} />
                                        {task.dueDate && (
                                            <span className="text-xs text-slate-500 font-medium">
                                                Due: {task.dueDate}
                                            </span>
                                        )}
                                        {task.assignee && (
                                            <span className="text-xs text-slate-400 ml-auto">
                                                {task.assignee}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );
}
