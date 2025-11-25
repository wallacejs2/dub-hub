
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Ticket, Status, TicketFilterState, TicketType, Priority, ProductArea, Update, Dealership, CRMProvider, Resource, ResourceScope, Task, TaskStatus } from './types';
import { generateMockTickets, createEmptyTicket, generateMockDealerships, createEmptyDealership, generateMockResources, createEmptyResource, generateMockTasks, createEmptyTask } from './mockData';
import { getTodayDateString } from './utils';
import Layout, { ViewMode } from './components/Layout';
import TicketList from './components/TicketList';
import TicketDrawer from './components/TicketDrawer';
import DealershipList from './components/DealershipList';
import DealershipDrawer from './components/DealershipDrawer';
import ResourceList from './components/ResourceList';
import ResourceDrawer from './components/ResourceDrawer';
import TaskList from './components/TaskList';
import TaskDetailPane from './components/TaskDetailPane';
import { ToastProvider, useToast } from './components/Toast';

function AppContent() {
  // --- State: View ---
  const [currentView, setCurrentView] = useState<ViewMode>('tickets');

  // --- State: Tickets ---
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    try {
      const savedData = localStorage.getItem('dubhub-tickets');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        const empty = createEmptyTicket(); 
        return parsedData.map((t: any) => ({
            ...empty, 
            ...t,     
            id: t.id, 
            updates: t.updates || [] 
        }));
      }
    } catch (error) {
      console.error("Failed to parse ticket data:", error);
    }
    return generateMockTickets();
  });

  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [selectedTicketIds, setSelectedTicketIds] = useState<Set<string>>(new Set());
  const [draftTicket, setDraftTicket] = useState<Ticket | null>(null);

  // --- State: Dealerships ---
  const [dealerships, setDealerships] = useState<Dealership[]>(() => {
      try {
          const savedData = localStorage.getItem('dubhub-dealerships');
          if (savedData) {
              const parsedData = JSON.parse(savedData);
              const empty = createEmptyDealership();
              return parsedData.map((d: any) => ({
                  ...empty,
                  ...d,
                  websiteLinks: d.websiteLinks || [],
                  reynoldsSolutions: d.reynoldsSolutions || [],
                  fullpathSolutions: d.fullpathSolutions || [],
                  dmtOrders: d.dmtOrders || [],
                  crmProvider: d.crmProvider || CRMProvider.FOCUS
              }));
          }
      } catch (error) {
          console.error("Failed to parse dealership data:", error);
      }
      return generateMockDealerships();
  });

  const [selectedDealershipId, setSelectedDealershipId] = useState<string | null>(null);
  const [draftDealership, setDraftDealership] = useState<Dealership | null>(null);

  // --- State: Resources ---
  const [resources, setResources] = useState<Resource[]>(() => {
    try {
        const savedData = localStorage.getItem('dubhub-resources');
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            const empty = createEmptyResource();
            return parsedData.map((r: any) => ({
                ...empty,
                ...r,
                scope: r.scope || ResourceScope.Internal
            }));
        }
    } catch (error) {
        console.error("Failed to parse resource data:", error);
    }
    return generateMockResources();
  });

  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);
  const [draftResource, setDraftResource] = useState<Resource | null>(null);

  // --- State: Tasks ---
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
        const savedData = localStorage.getItem('dubhub-tasks');
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            const empty = createEmptyTask();
            return parsedData.map((t: any) => ({
                ...empty,
                ...t
            }));
        }
    } catch (error) {
        console.error("Failed to parse task data:", error);
    }
    return generateMockTasks();
  });
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const { addToast } = useToast();

  // --- Persistence ---
  useEffect(() => {
    localStorage.setItem('dubhub-tickets', JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem('dubhub-dealerships', JSON.stringify(dealerships));
  }, [dealerships]);

  useEffect(() => {
    localStorage.setItem('dubhub-resources', JSON.stringify(resources));
  }, [resources]);

  useEffect(() => {
    localStorage.setItem('dubhub-tasks', JSON.stringify(tasks));
  }, [tasks]);


  // --- Ticket Logic ---

  const handleAddTicket = useCallback(() => {
    const newTicket = createEmptyTicket();
    setDraftTicket(newTicket);
    setSelectedTicketId('NEW');
  }, []);

  const handleUpdateTicket = useCallback((updatedTicket: Ticket) => {
    if (selectedTicketId === 'NEW') {
        setTickets((prev) => [updatedTicket, ...prev]);
        setDraftTicket(null);
        setSelectedTicketId(updatedTicket.id); 
        addToast('New ticket created successfully', 'success');
    } else {
        setTickets((prev) =>
          prev.map((t) => (t.id === updatedTicket.id ? updatedTicket : t))
        );
        addToast('Ticket updated successfully', 'success');
    }
  }, [selectedTicketId, addToast]);

  const handleDeleteTicket = useCallback((id: string) => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
        setTickets((prev) => prev.filter((t) => t.id !== id));
        setSelectedTicketId(null);
        setDraftTicket(null);
        addToast('Ticket deleted', 'success');
    }
  }, [addToast]);

  const handleBulkDelete = useCallback(() => {
    if (selectedTicketIds.size === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedTicketIds.size} tickets?`)) {
      setTickets((prev) => prev.filter((t) => !selectedTicketIds.has(t.id)));
      addToast(`Deleted ${selectedTicketIds.size} tickets`, 'success');
      setSelectedTicketIds(new Set());
    }
  }, [selectedTicketIds, addToast]);

  const handleBulkStatusUpdate = useCallback((newStatus: Status) => {
    if (selectedTicketIds.size === 0) return;
    const today = getTodayDateString();
    
    setTickets((prev) =>
      prev.map((t) =>
        selectedTicketIds.has(t.id)
          ? { ...t, status: newStatus, lastUpdatedDate: today }
          : t
      )
    );
    addToast(`Updated status for ${selectedTicketIds.size} tickets`, 'success');
    setSelectedTicketIds(new Set());
  }, [selectedTicketIds, addToast]);

  const handleToggleFavorite = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const today = getTodayDateString();
    setTickets((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, isFavorite: !t.isFavorite, lastUpdatedDate: today } : t
      )
    );
  }, []);

  // --- Dealership Logic ---

  const handleAddDealership = useCallback(() => {
      const newD = createEmptyDealership();
      setDraftDealership(newD);
      setSelectedDealershipId('NEW');
  }, []);

  const handleUpdateDealership = useCallback((updated: Dealership) => {
      if (selectedDealershipId === 'NEW') {
          setDealerships(prev => [updated, ...prev]);
          setDraftDealership(null);
          setSelectedDealershipId(updated.id);
          addToast('Dealership created successfully', 'success');
      } else {
          setDealerships(prev => prev.map(d => d.id === updated.id ? updated : d));
          addToast('Dealership updated successfully', 'success');
      }
  }, [selectedDealershipId, addToast]);

  const handleDeleteDealership = useCallback((id: string) => {
      if (window.confirm('Delete this dealership? This action cannot be undone.')) {
          setDealerships(prev => prev.filter(d => d.id !== id));
          setSelectedDealershipId(null);
          setDraftDealership(null);
          addToast('Dealership deleted', 'success');
      }
  }, [addToast]);

  // --- Resource Logic ---

  const handleAddResource = useCallback(() => {
      const newR = createEmptyResource();
      setDraftResource(newR);
      setSelectedResourceId('NEW');
  }, []);

  const handleUpdateResource = useCallback((updated: Resource) => {
      if (selectedResourceId === 'NEW') {
          setResources(prev => [updated, ...prev]);
          setDraftResource(null);
          setSelectedResourceId(updated.id);
          addToast('Resource created successfully', 'success');
      } else {
          setResources(prev => prev.map(r => r.id === updated.id ? updated : r));
          addToast('Resource updated successfully', 'success');
      }
  }, [selectedResourceId, addToast]);

  const handleDeleteResource = useCallback((id: string) => {
      if (window.confirm('Delete this resource?')) {
          setResources(prev => prev.filter(r => r.id !== id));
          setSelectedResourceId(null);
          setDraftResource(null);
          addToast('Resource deleted', 'success');
      }
  }, [addToast]);

  // --- Task Logic ---

  const handleAddTask = useCallback((title: string) => {
      const newTask = createEmptyTask();
      newTask.title = title;
      setTasks(prev => [newTask, ...prev]);
      setSelectedTaskId(newTask.id);
      addToast('Task added', 'success');
  }, [addToast]);

  const handleUpdateTask = useCallback((updatedTask: Task) => {
      setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
      addToast('Task updated', 'success');
  }, [addToast]);

  const handleDeleteTask = useCallback((id: string) => {
      setTasks(prev => prev.filter(t => t.id !== id));
      setSelectedTaskId(null);
      addToast('Task deleted', 'success');
  }, [addToast]);

  // --- Computed ---

  const selectedTicket = useMemo(
    () => {
        if (selectedTicketId === 'NEW') return draftTicket;
        return tickets.find((t) => t.id === selectedTicketId);
    },
    [tickets, selectedTicketId, draftTicket]
  );

  const selectedDealership = useMemo(() => {
      if (selectedDealershipId === 'NEW') return draftDealership;
      return dealerships.find(d => d.id === selectedDealershipId);
  }, [dealerships, selectedDealershipId, draftDealership]);

  const selectedResource = useMemo(() => {
      if (selectedResourceId === 'NEW') return draftResource;
      return resources.find(r => r.id === selectedResourceId);
  }, [resources, selectedResourceId, draftResource]);

  const selectedTask = useMemo(() => {
      return tasks.find(t => t.id === selectedTaskId) || null;
  }, [tasks, selectedTaskId]);

  // --- Render ---

  const renderView = () => {
      switch(currentView) {
          case 'tickets':
              return (
                <>
                    <TicketList
                        tickets={tickets}
                        selectedTicketIds={selectedTicketIds}
                        setSelectedTicketIds={setSelectedTicketIds}
                        onOpenTicket={(id) => { setSelectedTicketId(id); setDraftTicket(null); }}
                        onAddTicket={handleAddTicket}
                        onBulkDelete={handleBulkDelete}
                        onBulkStatusUpdate={handleBulkStatusUpdate}
                        onToggleFavorite={handleToggleFavorite}
                    />
                    <TicketDrawer
                        isOpen={!!selectedTicketId}
                        onClose={() => { setSelectedTicketId(null); setDraftTicket(null); }}
                        ticket={selectedTicket || undefined}
                        onUpdate={handleUpdateTicket}
                        onDelete={handleDeleteTicket}
                        isNew={selectedTicketId === 'NEW'}
                        dealerships={dealerships}
                    />
                </>
              );
            case 'dealerships':
                return (
                  <>
                    <DealershipList 
                        dealerships={dealerships}
                        onOpenDealership={(id) => { setSelectedDealershipId(id); setDraftDealership(null); }}
                        onAddDealership={handleAddDealership}
                    />
                    <DealershipDrawer 
                        isOpen={!!selectedDealershipId}
                        onClose={() => { setSelectedDealershipId(null); setDraftDealership(null); }}
                        dealership={selectedDealership || undefined}
                        onUpdate={handleUpdateDealership}
                        onDelete={handleDeleteDealership}
                        isNew={selectedDealershipId === 'NEW'}
                    />
                  </>
                );
            case 'resources':
                return (
                    <>
                        <ResourceList 
                            resources={resources}
                            onOpenResource={(id) => { setSelectedResourceId(id); setDraftResource(null); }}
                            onAddResource={handleAddResource}
                        />
                        <ResourceDrawer 
                            isOpen={!!selectedResourceId}
                            onClose={() => { setSelectedResourceId(null); setDraftResource(null); }}
                            resource={selectedResource || undefined}
                            onUpdate={handleUpdateResource}
                            onDelete={handleDeleteResource}
                            isNew={selectedResourceId === 'NEW'}
                        />
                    </>
                );
            case 'tasks':
                return (
                    <div className="flex h-full border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                        <TaskList 
                            tasks={tasks}
                            selectedTaskId={selectedTaskId}
                            onSelectTask={setSelectedTaskId}
                            onAddTask={handleAddTask}
                            onUpdateTask={handleUpdateTask}
                        />
                        <TaskDetailPane 
                            task={selectedTask}
                            onUpdateTask={handleUpdateTask}
                            onDeleteTask={handleDeleteTask}
                        />
                    </div>
                );
            default:
                return null;
      }
  }

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView}>
      {renderView()}
    </Layout>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
