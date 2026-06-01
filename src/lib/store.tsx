'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  Client, Event, Payment, InventoryItem, EventInventory, Reminder,
} from './types';
import {
  mockClients, mockEvents, mockPayments, mockInventory,
  mockEventInventory, mockReminders,
} from './mock-data';

interface AppState {
  clients: Client[];
  events: Event[];
  payments: Payment[];
  inventory: InventoryItem[];
  eventInventory: EventInventory[];
  reminders: Reminder[];
  darkMode: boolean;
  sidebarOpen: boolean;
}

interface AppActions {
  addEvent: (event: Event) => void;
  updateEvent: (event: Event) => void;
  deleteEvent: (id: string) => void;
  addClient: (client: Client) => void;
  updateClient: (client: Client) => void;
  addPayment: (payment: Payment) => void;
  addInventoryItem: (item: InventoryItem) => void;
  updateInventoryItem: (item: InventoryItem) => void;
  updateEventInventory: (item: EventInventory) => void;
  toggleDarkMode: () => void;
  toggleSidebar: () => void;
}

const AppContext = createContext<(AppState & AppActions) | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
  const [eventInventory, setEventInventory] = useState<EventInventory[]>(mockEventInventory);
  const [reminders, setReminders] = useState<Reminder[]>(mockReminders);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const addEvent = useCallback((event: Event) => {
    setEvents(prev => [event, ...prev]);
  }, []);

  const updateEvent = useCallback((event: Event) => {
    setEvents(prev => prev.map(e => e.id === event.id ? event : e));
  }, []);

  const deleteEvent = useCallback((id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  }, []);

  const addClient = useCallback((client: Client) => {
    setClients(prev => [client, ...prev]);
  }, []);

  const updateClient = useCallback((client: Client) => {
    setClients(prev => prev.map(c => c.id === client.id ? client : c));
  }, []);

  const addPayment = useCallback((payment: Payment) => {
    setPayments(prev => [payment, ...prev]);
  }, []);

  const addInventoryItem = useCallback((item: InventoryItem) => {
    setInventory(prev => [item, ...prev]);
  }, []);

  const updateInventoryItem = useCallback((item: InventoryItem) => {
    setInventory(prev => prev.map(i => i.id === item.id ? item : i));
  }, []);

  const updateEventInventory = useCallback((item: EventInventory) => {
    setEventInventory(prev => prev.map(i => i.id === item.id ? item : i));
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => !prev);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  return (
    <AppContext.Provider value={{
      clients, events, payments, inventory, eventInventory, reminders,
      darkMode, sidebarOpen,
      addEvent, updateEvent, deleteEvent,
      addClient, updateClient,
      addPayment,
      addInventoryItem, updateInventoryItem,
      updateEventInventory,
      toggleDarkMode, toggleSidebar,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
