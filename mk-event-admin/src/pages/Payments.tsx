import { useState } from 'react';
import { useApp } from '../store';
import { Card, Button, Input, Select, Modal } from '../components/ui';
import { formatDate, formatCurrency, payColor, waLink, exportCSV } from '../utils';
import { Payment } from '../types';
import { CreditCard, Plus, TrendingUp, AlertCircle, CheckCircle, Download, MessageCircle, Search } from 'lucide-react';

export function Payments() {
  const { events, payments, addPayment } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [statusF, setStatusF] = useState('');
  const [fd, setFd] = useState({ event_id:'', amount:'', method:'Cash', date: new Date().toISOString().split('T')[0], notes:'' });

  const totalCollected = payments.reduce((s,p) => s+p.amount, 0);
  const totalPending = events.reduce((s,e) => s+e.remaining_balance, 0);
  const overdue = events.filter(e => e.payment_status === 'Pending' && e.event_status !== 'Cancelled').length;

  const filtered = events.filter(e => {
    const s = search.toLowerCase();
    return (!search || e.client?.name.toLowerCase().includes(s) || e.event_name.toLowerCase().includes(s))
      && (!statusF || e.payment_status === statusF);
  });

  const handleAdd = () => {
    if (!fd.event_id || !fd.amount) return;
    const ev = events.find(e => e.id === fd.event_id);
    const p: Payment = { id: Date.now().toString(), event_id: fd.event_id, event: ev, amount: Number(fd.amount), payment_method: fd.method as Payment['payment_method'], payment_date: fd.date, notes: fd.notes, created_at: new Date().toISOString() };
    addPayment(p);
    setShowForm(false);
    setFd({ event_id:'', amount:'', method:'Cash', date: new Date().toISOString().split('T')[0], notes:'' });
  };

  const doExport = () => exportCSV([
    ['Client','Event','Date','Amount','Method','Notes'],
    ...payments.map(p => [p.event?.client?.name||'', p.event?.event_name||'', p.payment_date, p.amount, p.payment_method, p.notes||'']),
  ], 'payments.csv');

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-xl flex items-center justify-center flex-shrink-0"><TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" /></div>
          <div><p className="text-xs text-green-700 dark:text-green-400">Total Collected</p><p className="text-xl font-bold text-green-800 dark:text-green-300">{formatCurrency(totalCollected)}</p></div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-xl flex items-center justify-center flex-shrink-0"><AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" /></div>
          <div><p className="text-xs text-red-700 dark:text-red-400">Total Pending</p><p className="text-xl font-bold text-red-800 dark:text-red-300">{formatCurrency(totalPending)}</p></div>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/40 rounded-xl flex items-center justify-center flex-shrink-0"><CreditCard className="w-5 h-5 text-orange-600 dark:text-orange-400" /></div>
          <div><p className="text-xs text-orange-700 dark:text-orange-400">Overdue Events</p><p className="text-xl font-bold text-orange-800 dark:text-orange-300">{overdue}</p></div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 w-full sm:w-auto sm:flex-1">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={statusF} onChange={e => setStatusF(e.target.value)} options={[{value:'',label:'All'},{value:'Paid',label:'Paid'},{value:'Partial Paid',label:'Partial'},{value:'Pending',label:'Pending'}]} />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={doExport} className="flex-1 sm:flex-none"><Download className="w-4 h-4" /><span className="sm:inline">Export</span></Button>
          <Button onClick={() => setShowForm(true)} className="flex-1 sm:flex-none"><Plus className="w-4 h-4" /><span>Record Payment</span></Button>
        </div>
      </div>

      {/* Events Payment — cards on mobile, table on md+ */}
      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Payment Status by Event</h3>
        </div>
        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-700">
          {filtered.map(ev => (
            <div key={ev.id} className="p-4 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{ev.client?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{ev.event_name} · {formatDate(ev.event_date)}</p>
                </div>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${payColor(ev.payment_status)}`}>{ev.payment_status}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                <div><p className="text-xs text-gray-500 dark:text-gray-400">Total</p><p className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(ev.total_price)}</p></div>
                <div><p className="text-xs text-gray-500 dark:text-gray-400">Paid</p><p className="text-sm font-bold text-green-600 dark:text-green-400">{formatCurrency(ev.advance_received)}</p></div>
                <div><p className="text-xs text-gray-500 dark:text-gray-400">Due</p><p className="text-sm font-bold text-red-600 dark:text-red-400">{formatCurrency(ev.remaining_balance)}</p></div>
              </div>
              {ev.remaining_balance > 0 && (
                <div className="flex gap-2">
                  <button onClick={() => { setFd(p=>({...p,event_id:ev.id})); setShowForm(true); }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg text-xs font-medium">
                    <Plus className="w-3.5 h-3.5" />Record Payment
                  </button>
                  <a href={waLink(ev.client?.mobile||'', `Hi ${ev.client?.name}, your payment of ${formatCurrency(ev.remaining_balance)} is pending for ${ev.event_name}. - MK Brothers`)}
                    target="_blank" rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-xs font-medium">
                    <MessageCircle className="w-3.5 h-3.5" />WhatsApp
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-gray-100 dark:border-gray-700">
              {['Client','Event','Total','Advance','Balance','Status','Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filtered.map(ev => (
                <tr key={ev.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-3"><p className="text-sm font-medium text-gray-900 dark:text-white">{ev.client?.name}</p><p className="text-xs text-gray-500 dark:text-gray-400">{ev.client?.mobile}</p></td>
                  <td className="px-4 py-3"><p className="text-sm text-gray-900 dark:text-white">{ev.event_name}</p><p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(ev.event_date)}</p></td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(ev.total_price)}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-green-600 dark:text-green-400">{formatCurrency(ev.advance_received)}</td>
                  <td className="px-4 py-3 text-sm font-bold text-red-600 dark:text-red-400">{formatCurrency(ev.remaining_balance)}</td>
                  <td className="px-4 py-3"><span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${payColor(ev.payment_status)}`}>{ev.payment_status}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {ev.remaining_balance > 0 ? (
                        <>
                          <button onClick={() => { setFd(p=>({...p,event_id:ev.id})); setShowForm(true); }} className="p-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-200 transition-colors" title="Record Payment"><Plus className="w-3.5 h-3.5" /></button>
                          <a href={waLink(ev.client?.mobile||'', `Hi ${ev.client?.name}, your payment of ${formatCurrency(ev.remaining_balance)} is pending for ${ev.event_name}. Please clear at your earliest. - MK Brothers`)} target="_blank" rel="noreferrer"
                            className="p-1.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 transition-colors" title="WhatsApp Reminder">
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        </>
                      ) : <CheckCircle className="w-5 h-5 text-green-500" />}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Payment History */}
      <div>
        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-3">Payment History</h2>
        <Card className="overflow-hidden">
          {/* Mobile list */}
          <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-700">
            {payments.map(p => (
              <div key={p.id} className="p-3 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{p.event?.client?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{p.event?.event_name} · {formatDate(p.payment_date)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{p.payment_method}{p.notes ? ` · ${p.notes}` : ''}</p>
                </div>
                <span className="text-sm font-bold text-green-600 dark:text-green-400 flex-shrink-0">+{formatCurrency(p.amount)}</span>
              </div>
            ))}
            {payments.length === 0 && <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">No payments recorded</div>}
          </div>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                  {['Date','Client','Event','Amount','Method','Notes'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {payments.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{formatDate(p.payment_date)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{p.event?.client?.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{p.event?.event_name}</td>
                    <td className="px-4 py-3 text-sm font-bold text-green-600 dark:text-green-400">{formatCurrency(p.amount)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{p.payment_method}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{p.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Record Payment Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title="Record Payment" size="md">
        <div className="space-y-4">
          <Select label="Select Event" value={fd.event_id} onChange={e=>setFd(p=>({...p,event_id:e.target.value}))}
            options={[{value:'',label:'-- Select Event --'}, ...events.filter(e=>e.remaining_balance>0).map(e=>({value:e.id,label:`${e.client?.name} - ${e.event_name} (Due: ${formatCurrency(e.remaining_balance)})`}))]} />
          <Input label="Amount (₹)" type="number" placeholder="Enter amount" value={fd.amount} onChange={e=>setFd(p=>({...p,amount:e.target.value}))} />
          <Select label="Payment Method" value={fd.method} onChange={e=>setFd(p=>({...p,method:e.target.value}))} options={['Cash','UPI','Bank Transfer','Cheque'].map(s=>({value:s,label:s}))} />
          <Input label="Payment Date" type="date" value={fd.date} onChange={e=>setFd(p=>({...p,date:e.target.value}))} />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
            <textarea className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" rows={2} value={fd.notes} onChange={e=>setFd(p=>({...p,notes:e.target.value}))} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button onClick={handleAdd} className="flex-1">Record Payment</Button>
            <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
