'use client';
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Client, Event, Payment, InventoryItem, EventInventory, Reminder } from './types';
import { clientsApi, eventsApi, paymentsApi, inventoryApi, eventInventoryApi, remindersApi } from './api';

// ── Fallback mock data (used when backend is offline) ──────────────────────
import * as mockData from './data';

interface AppState {
  clients: Client[];
  events: Event[];
  payments: Payment[];
  inventory: InventoryItem[];
  eventInventory: EventInventory[];
  reminders: Reminder[];
  darkMode: boolean;
  sidebarOpen: boolean;
  activePage: string;
  loading: boolean;
  dbConnected: boolean;
  error: string | null;
}

interface AppActions {
  addEvent: (e: Omit<Event, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateEvent: (e: Event) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  addClient: (c: Omit<Client, 'id' | 'created_at'>) => Promise<void>;
  addPayment: (p: any) => Promise<void>;
  addInventoryItem: (i: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateInventoryItem: (i: InventoryItem) => Promise<void>;
  deleteInventoryItem: (id: string) => Promise<void>;
  updateEventInventory: (i: EventInventory) => Promise<void>;
  toggleDarkMode: () => void;
  toggleSidebar: () => void;
  setActivePage: (page: string) => void;
  refreshAll: () => Promise<void>;
}

const Ctx = createContext<(AppState & AppActions) | null>(null);

// Normalize MongoDB _id to id
function normalize(obj: any): any {
  if (!obj) return obj;
  if (Array.isArray(obj)) return obj.map(normalize);
  const n = { ...obj };
  if (n._id && !n.id) n.id = String(n._id);
  if (n.client_id && typeof n.client_id === 'object') {
    n.client = normalize(n.client_id);
    if (!n.client.id) n.client.id = String(n.client._id || n.client_id);
  }
  if (n.event_id && typeof n.event_id === 'object') {
    n.event = normalize(n.event_id);
  }
  if (n.inventory_id && typeof n.inventory_id === 'object') {
    n.inventory_item = normalize(n.inventory_id);
  }
  return n;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients]               = useState<Client[]>(mockData.clients);
  const [events, setEvents]                 = useState<Event[]>(mockData.events);
  const [payments, setPayments]             = useState<Payment[]>(mockData.payments);
  const [inventory, setInventory]           = useState<InventoryItem[]>(mockData.inventory);
  const [eventInventory, setEventInventory] = useState<EventInventory[]>(mockData.eventInventory);
  const [reminders, setReminders]           = useState<Reminder[]>(mockData.reminders);
  const [darkMode, setDarkMode]             = useState(false);
  const [sidebarOpen, setSidebarOpen]       = useState(true);
  const [activePage, setActivePage]         = useState('dashboard');
  const [loading, setLoading]               = useState(false);
  const [dbConnected, setDbConnected]       = useState(false);
  const [error, setError]                   = useState<string | null>(null);

  // Apply dark class to <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // Load all data from MongoDB on mount
  const refreshAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [c, e, p, inv, ei, rem] = await Promise.all([
        clientsApi.getAll(),
        eventsApi.getAll(),
        paymentsApi.getAll(),
        inventoryApi.getAll(),
        eventInventoryApi.getAll(),
        remindersApi.getAll(),
      ]);
      setClients(normalize(c));
      setEvents(normalize(e));
      setPayments(normalize(p));
      setInventory(normalize(inv));
      setEventInventory(normalize(ei));
      setReminders(normalize(rem));
      setDbConnected(true);
    } catch (err: any) {
      console.warn('Backend offline — using mock data:', err.message);
      setDbConnected(false);
      setError('Using offline mock data. Start the backend server to connect MongoDB.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refreshAll(); }, [refreshAll]);

  // ── Event actions ──────────────────────────────────────────────────────
  const addEvent = useCallback(async (data: any) => {
    if (dbConnected) {
      const created = normalize(await eventsApi.create({ ...data, client_id: data.client_id || data.client?.id }));
      setEvents(p => [created, ...p]);
    } else {
      const ev = { ...data, id: Date.now().toString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      setEvents(p => [ev, ...p]);
    }
  }, [dbConnected]);

  const updateEvent = useCallback(async (data: Event) => {
    if (dbConnected) {
      const updated = normalize(await eventsApi.update(data.id, data));
      setEvents(p => p.map(e => e.id === data.id ? updated : e));
    } else {
      setEvents(p => p.map(e => e.id === data.id ? { ...data, updated_at: new Date().toISOString() } : e));
    }
  }, [dbConnected]);

  const deleteEvent = useCallback(async (id: string) => {
    if (dbConnected) await eventsApi.delete(id);
    setEvents(p => p.filter(e => e.id !== id));
  }, [dbConnected]);

  // ── Client actions ─────────────────────────────────────────────────────
  const addClient = useCallback(async (data: any) => {
    if (dbConnected) {
      const created = normalize(await clientsApi.create(data));
      setClients(p => [created, ...p]);
    } else {
      setClients(p => [{ ...data, id: Date.now().toString(), created_at: new Date().toISOString() }, ...p]);
    }
  }, [dbConnected]);

  // ── Payment actions ────────────────────────────────────────────────────
  const addPayment = useCallback(async (data: any) => {
    if (dbConnected) {
      const created = normalize(await paymentsApi.create({ ...data, event_id: data.event_id || data.event?.id }));
      setPayments(p => [created, ...p]);
      // Refresh events to get updated balance
      const updatedEvents = normalize(await eventsApi.getAll());
      setEvents(updatedEvents);
    } else {
      setPayments(p => [{ ...data, id: Date.now().toString(), created_at: new Date().toISOString() }, ...p]);
    }
  }, [dbConnected]);

  // ── Inventory actions ──────────────────────────────────────────────────
  const addInventoryItem = useCallback(async (data: any) => {
    if (dbConnected) {
      const created = normalize(await inventoryApi.create(data));
      setInventory(p => [created, ...p]);
    } else {
      setInventory(p => [{ ...data, id: Date.now().toString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() }, ...p]);
    }
  }, [dbConnected]);

  const updateInventoryItem = useCallback(async (data: InventoryItem) => {
    if (dbConnected) {
      const updated = normalize(await inventoryApi.update(data.id, data));
      setInventory(p => p.map(i => i.id === data.id ? updated : i));
    } else {
      setInventory(p => p.map(i => i.id === data.id ? data : i));
    }
  }, [dbConnected]);

  const deleteInventoryItem = useCallback(async (id: string) => {
    if (dbConnected) await inventoryApi.delete(id);
    setInventory(p => p.filter(i => i.id !== id));
  }, [dbConnected]);

  // ── Event Inventory actions ────────────────────────────────────────────
  const updateEventInventory = useCallback(async (data: EventInventory) => {
    if (dbConnected) {
      const updated = normalize(await eventInventoryApi.update(data.id, { pickup_status: data.pickup_status }));
      setEventInventory(p => p.map(i => i.id === data.id ? { ...i, ...updated } : i));
    } else {
      setEventInventory(p => p.map(i => i.id === data.id ? data : i));
    }
  }, [dbConnected]);

  const toggleDarkMode  = useCallback(() => setDarkMode(p => !p), []);
  const toggleSidebar   = useCallback(() => setSidebarOpen(p => !p), []);

  return (
    <Ctx.Provider value={{
      clients, events, payments, inventory, eventInventory, reminders,
      darkMode, sidebarOpen, activePage, loading, dbConnected, error,
      addEvent, updateEvent, deleteEvent,
      addClient, addPayment,
      addInventoryItem, updateInventoryItem, deleteInventoryItem, updateEventInventory,
      toggleDarkMode, toggleSidebar, setActivePage, refreshAll,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}
