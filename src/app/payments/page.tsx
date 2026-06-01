'use client';

import { useState } from 'react';
import { useApp } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { Payment } from '@/lib/types';
import {
  CreditCard, Plus, TrendingUp, AlertCircle, CheckCircle,
  Download, MessageCircle, Search,
} from 'lucide-react';
import { formatDate, formatCurrency, getPaymentStatusColor, generateWhatsAppLink } from '@/lib/utils';

export default function PaymentsPage() {
  const { events, payments, addPayment } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [formData, setFormData] = useState({
    event_id: '',
    amount: '',
    payment_method: 'Cash',
    payment_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalPending = events.reduce((sum, e) => sum + e.remaining_balance, 0);
  const overdueEvents = events.filter(e => e.payment_status === 'Pending' && e.event_status !== 'Cancelled');

  const filteredEvents = events.filter(e => {
    const matchSearch = !search ||
      e.client?.name.toLowerCase().includes(search.toLowerCase()) ||
      e.event_name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || e.payment_status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleAddPayment = () => {
    if (!formData.event_id || !formData.amount) return;
    const event = events.find(e => e.id === formData.event_id);
    const payment: Payment = {
      id: Date.now().toString(),
      event_id: formData.event_id,
      event,
      amount: Number(formData.amount),
      payment_method: formData.payment_method as Payment['payment_method'],
      payment_date: formData.payment_date,
      notes: formData.notes,
      created_at: new Date().toISOString(),
    };
    addPayment(payment);
    setShowForm(false);
    setFormData({ event_id: '', amount: '', payment_method: 'Cash', payment_date: new Date().toISOString().split('T')[0], notes: '' });
  };

  const exportCSV = () => {
    const rows = [
      ['Client', 'Event', 'Date', 'Amount', 'Method', 'Notes'],
      ...payments.map(p => [
        p.event?.client?.name || '',
        p.event?.event_name || '',
        p.payment_date,
        p.amount.toString(),
        p.payment_method,
        p.notes || '',
      ]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'payments.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-5 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-green-700 dark:text-green-400">Total Collected</p>
              <p className="text-2xl font-bold text-green-800 dark:text-green-300">{formatCurrency(totalCollected)}</p>
            </div>
          </div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-5 border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-red-700 dark:text-red-400">Total Pending</p>
              <p className="text-2xl font-bold text-red-800 dark:text-red-300">{formatCurrency(totalPending)}</p>
            </div>
          </div>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-5 border border-orange-200 dark:border-orange-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/40 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-orange-700 dark:text-orange-400">Overdue Events</p>
              <p className="text-2xl font-bold text-orange-800 dark:text-orange-300">{overdueEvents.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-3 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'Paid', label: 'Paid' },
              { value: 'Partial Paid', label: 'Partial Paid' },
              { value: 'Pending', label: 'Pending' },
            ]}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCSV} className="gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Record Payment
          </Button>
        </div>
      </div>

      {/* Payment Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Client</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Event</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Advance</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Balance</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredEvents.map(event => (
                <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{event.client?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{event.client?.mobile}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-900 dark:text-white">{event.event_name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(event.event_date)}</p>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(event.total_price)}</td>
                  <td className="px-4 py-3 text-sm text-green-600 dark:text-green-400 font-medium">{formatCurrency(event.advance_received)}</td>
                  <td className="px-4 py-3 text-sm font-bold text-red-600 dark:text-red-400">{formatCurrency(event.remaining_balance)}</td>
                  <td className="px-4 py-3">
                    <Badge className={getPaymentStatusColor(event.payment_status)}>{event.payment_status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {event.remaining_balance > 0 && (
                        <>
                          <button
                            onClick={() => { setFormData(p => ({ ...p, event_id: event.id })); setShowForm(true); }}
                            className="p-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-200 transition-colors"
                            title="Record Payment"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <a
                            href={generateWhatsAppLink(event.client?.mobile || '', `Hi ${event.client?.name}, your payment of ${formatCurrency(event.remaining_balance)} is pending for ${event.event_name}. Please clear at your earliest. - MK Brothers`)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 transition-colors"
                            title="WhatsApp Reminder"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        </>
                      )}
                      {event.remaining_balance === 0 && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment History */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Payment History</h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Client</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Event</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Amount</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Method</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {payments.map(payment => (
                  <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{formatDate(payment.payment_date)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{payment.event?.client?.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{payment.event?.event_name}</td>
                    <td className="px-4 py-3 text-sm font-bold text-green-600 dark:text-green-400">{formatCurrency(payment.amount)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{payment.payment_method}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{payment.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Record Payment Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Record Payment" size="md">
        <div className="space-y-4">
          <Select
            label="Select Event"
            value={formData.event_id}
            onChange={e => setFormData(p => ({ ...p, event_id: e.target.value }))}
            options={[
              { value: '', label: '-- Select Event --' },
              ...events.filter(e => e.remaining_balance > 0).map(e => ({
                value: e.id,
                label: `${e.client?.name} - ${e.event_name} (Due: ${formatCurrency(e.remaining_balance)})`,
              })),
            ]}
          />
          <Input
            label="Amount (₹)"
            type="number"
            placeholder="Enter amount"
            value={formData.amount}
            onChange={e => setFormData(p => ({ ...p, amount: e.target.value }))}
          />
          <Select
            label="Payment Method"
            value={formData.payment_method}
            onChange={e => setFormData(p => ({ ...p, payment_method: e.target.value }))}
            options={[
              { value: 'Cash', label: 'Cash' },
              { value: 'UPI', label: 'UPI' },
              { value: 'Bank Transfer', label: 'Bank Transfer' },
              { value: 'Cheque', label: 'Cheque' },
            ]}
          />
          <Input
            label="Payment Date"
            type="date"
            value={formData.payment_date}
            onChange={e => setFormData(p => ({ ...p, payment_date: e.target.value }))}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
            <textarea
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={2}
              value={formData.notes}
              onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button onClick={handleAddPayment} className="flex-1">Record Payment</Button>
            <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
