'use client';

import { useState } from 'react';
import { useApp } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Client } from '@/lib/types';
import { Users, Plus, Phone, MapPin, MessageCircle, Search, Calendar, CreditCard } from 'lucide-react';
import { formatCurrency, generateWhatsAppLink } from '@/lib/utils';
import Link from 'next/link';

export default function ClientsPage() {
  const { clients, events, addClient } = useApp();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '', mobile: '', alternate_mobile: '', address: '', google_map_link: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filtered = clients.filter(c =>
    !search ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.mobile.includes(search)
  );

  const getClientStats = (clientId: string) => {
    const clientEvents = events.filter(e => e.client_id === clientId);
    const totalSpent = clientEvents.reduce((s, e) => s + e.advance_received, 0);
    const pending = clientEvents.reduce((s, e) => s + e.remaining_balance, 0);
    return { eventCount: clientEvents.length, totalSpent, pending };
  };

  const handleSave = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Name required';
    if (!formData.mobile.trim()) errs.mobile = 'Mobile required';
    if (!/^\d{10}$/.test(formData.mobile)) errs.mobile = 'Enter valid 10-digit mobile';
    if (!formData.address.trim()) errs.address = 'Address required';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    addClient({
      id: Date.now().toString(),
      name: formData.name,
      mobile: formData.mobile,
      alternate_mobile: formData.alternate_mobile || undefined,
      address: formData.address,
      google_map_link: formData.google_map_link || undefined,
      created_at: new Date().toISOString(),
    });
    setShowForm(false);
    setFormData({ name: '', mobile: '', alternate_mobile: '', address: '', google_map_link: '' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Search clients..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Client
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
          <p className="text-3xl font-bold text-purple-600">{clients.length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Clients</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{events.length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Events</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
          <p className="text-3xl font-bold text-blue-600">
            {formatCurrency(events.reduce((s, e) => s + e.advance_received, 0))}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Collected</p>
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(client => {
          const stats = getClientStats(client.id);
          return (
            <div key={client.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    {client.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">{client.name}</h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3 text-gray-400" />
                    <a href={`tel:${client.mobile}`} className="text-sm text-purple-600 hover:underline">{client.mobile}</a>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 mb-3">
                <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{client.address}</p>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.eventCount}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Events</p>
                </div>
                <div className="text-center border-x border-gray-200 dark:border-gray-600">
                  <p className="text-sm font-bold text-green-600">{formatCurrency(stats.totalSpent)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Paid</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-red-600">{formatCurrency(stats.pending)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Due</p>
                </div>
              </div>

              <div className="flex gap-2">
                <a
                  href={generateWhatsAppLink(client.mobile, `Hi ${client.name}, greetings from MK Brothers Event Decoration!`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-xs font-medium hover:bg-green-200 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  WhatsApp
                </a>
                {client.google_map_link && (
                  <a
                    href={client.google_map_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-medium hover:bg-blue-200 transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    Map
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No clients found</p>
        </div>
      )}

      {/* Add Client Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Add New Client" size="md">
        <div className="space-y-4">
          <Input label="Client Name *" placeholder="Full name" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} error={errors.name} />
          <Input label="Mobile Number *" placeholder="10-digit mobile" value={formData.mobile} onChange={e => setFormData(p => ({ ...p, mobile: e.target.value }))} error={errors.mobile} />
          <Input label="Alternate Number" placeholder="Optional" value={formData.alternate_mobile} onChange={e => setFormData(p => ({ ...p, alternate_mobile: e.target.value }))} />
          <Input label="Address *" placeholder="Full address" value={formData.address} onChange={e => setFormData(p => ({ ...p, address: e.target.value }))} error={errors.address} />
          <Input label="Google Map Link" placeholder="https://maps.google.com/..." value={formData.google_map_link} onChange={e => setFormData(p => ({ ...p, google_map_link: e.target.value }))} />
          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} className="flex-1">Add Client</Button>
            <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
