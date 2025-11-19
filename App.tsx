import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Ticket, Status, TicketFilterState, TicketType, Priority, ProductArea, Update } from './types';
import { generateMockTickets, createEmptyTicket } from './mockData';
import { getTodayDateString } from './utils';
import Layout from './components/Layout';
import TicketList from './components/TicketList';
import TicketDrawer from './components/TicketDrawer';
import { ToastProvider, useToast } from './components/Toast';

function AppContent() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [selectedTicketIds, setSelectedTicketIds] = useState<Set<string>>(new Set());
  const [draftTicket, setDraftTicket] = useState<Ticket | null>(null);
  const { addToast } = useToast();

  // Initialize Mock Data
  useEffect(() => {
    setTickets(generateMockTickets());
  }, []);

  // --- CRUD Operations ---

  const handleAddTicket = useCallback(() => {
    const newTicket = createEmptyTicket();
    setDraftTicket(newTicket);
    setSelectedTicketId('NEW');
  }, []);

  const handleUpdateTicket = useCallback((updatedTicket: Ticket) => {
    if (selectedTicketId === 'NEW') {
        // Saving a new ticket
        setTickets((prev) => [updatedTicket, ...prev]);
        setDraftTicket(null);
        setSelectedTicketId(updatedTicket.id); // Switch to viewing the created ticket
        addToast('New ticket created successfully', 'success');
    } else {
        // Updating existing ticket
        setTickets((prev) =>
          prev.map((t) => (t.id === updatedTicket.id ? updatedTicket : t))
        );
        addToast('Ticket updated successfully', 'success');
    }
  }, [selectedTicketId, addToast]);

  const handleDeleteTicket = useCallback((id: string) => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
        setTickets((prev) => prev.filter((t) => t.id !== id));
        // Always close the drawer when deleting the currently viewed ticket
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

  // --- Drawer Handlers ---

  const openDrawer = (ticketId: string) => {
      setSelectedTicketId(ticketId);
      setDraftTicket(null);
  }
  
  const closeDrawer = () => {
      setSelectedTicketId(null);
      setDraftTicket(null);
  }

  const selectedTicket = useMemo(
    () => {
        if (selectedTicketId === 'NEW') return draftTicket;
        return tickets.find((t) => t.id === selectedTicketId);
    },
    [tickets, selectedTicketId, draftTicket]
  );

  return (
    <Layout>
      <TicketList
        tickets={tickets}
        selectedTicketIds={selectedTicketIds}
        setSelectedTicketIds={setSelectedTicketIds}
        onOpenTicket={openDrawer}
        onAddTicket={handleAddTicket}
        onBulkDelete={handleBulkDelete}
        onBulkStatusUpdate={handleBulkStatusUpdate}
        onToggleFavorite={handleToggleFavorite}
      />
      
      <TicketDrawer
        isOpen={!!selectedTicketId}
        onClose={closeDrawer}
        ticket={selectedTicket || undefined}
        onUpdate={handleUpdateTicket}
        onDelete={handleDeleteTicket}
        isNew={selectedTicketId === 'NEW'}
      />
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