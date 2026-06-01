import { useState } from 'react';
import { useApp } from '../store';
import { Card, Button, Input, Modal } from '../components/ui';
import { formatCurrency, waLink } from '../utils';
import { Users, Plus, Phone, MapPin, MessageCircle, Search } from 'lucide-react';

export function Clients() {
  const { clients, events, addClient } = useApp();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [fd, setFd] = useState({ name:'', mobile:'', alt:'', address:'', map:'' });
  const [errs, setErrs] = useState<Record<string,string>>({});

  const filtered = clients.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.mobile.includes(search)
  );

  const getStats = (id: string) => {
    const evts = events.filter(e => e.client_id === id);
    return {
      count: evts.length,
      paid: evts.reduce((s,e) => s+e.advance_received, 0),
      due: evts.reduce((s,e) => s+e.remaining_balance, 0),
    };
  };

  const save = () => {
    const e: Record<string,string> = {};
    if (!fd.name.trim()) e.name = 'Required';
    if (!/^\d{10}$/.test(fd.mobile)) e.mobile = 'Enter valid 10-digit number';
    if (!fd.address.trim()) e.address = 'Required';
    setErrs(e);
    if (Object.keys(e).length) return;
    addClient({
      name: fd.name, mobile: fd.mobile,
      alternate_mobile: fd.alt||undefined, address: fd.address,
      google_map_link: fd.map||undefined,
    } as any);
    setShowForm(false);
    setFd({ name:'', mobile:'', alt:'', address:'', map:'' });
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Search clients..." value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Button onClick={() => setShowForm(true)} size="md">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Client</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      {/* Summary — compact on mobile */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Card className="p-3 sm:p-4 text-center">
          <p className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">{clients.length}</p>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Clients</p>
        </Card>
        <Card className="p-3 sm:p-4 text-center">
          <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">{events.length}</p>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Events</p>
        </Card>
        <Card className="p-3 sm:p-4 text-center">
          <p className="text-lg sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
            {formatCurrency(events.reduce((s,e)=>s+e.advance_received,0))}
          </p>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Collected</p>
        </Card>
      </div>

      {/* Client Cards — 1 col mobile, 2 col md, 3 col lg */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {filtered.map(c => {
          const s = getStats(c.id);
          return (
            <Card key={c.id} className="p-4 hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex items-start gap-3 mb-3">
                <div className="w-11 h-11 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    {c.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate text-sm">{c.name}</h3>
                  <a href={`tel:${c.mobile}`} className="flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-purple-600 dark:text-purple-400">{c.mobile}</span>
                  </a>
                  {c.alternate_mobile && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{c.alternate_mobile}</p>
                  )}
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-1.5 mb-3">
                <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{c.address}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-1 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-2.5 mb-3">
                <div className="text-center">
                  <p className="text-base font-bold text-gray-900 dark:text-white">{s.count}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">Events</p>
                </div>
                <div className="text-center border-x border-gray-200 dark:border-gray-600">
                  <p className="text-xs font-bold text-green-600 dark:text-green-400">{formatCurrency(s.paid)}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">Paid</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-red-600 dark:text-red-400">{formatCurrency(s.due)}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">Due</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <a
                  href={waLink(c.mobile, `Hi ${c.name}, greetings from MK Brothers Event Decoration!`)}
                  target="_blank" rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-xs font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />WhatsApp
                </a>
                {c.google_map_link && (
                  <a
                    href={c.google_map_link} target="_blank" rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5" />Map
                  </a>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <Card className="p-12 text-center">
          <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No clients found</p>
        </Card>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Add New Client" size="md">
        <div className="space-y-4">
          <Input label="Client Name *" placeholder="Full name" value={fd.name} onChange={e=>setFd(p=>({...p,name:e.target.value}))} error={errs.name} />
          <Input label="Mobile Number *" placeholder="10-digit mobile" value={fd.mobile} onChange={e=>setFd(p=>({...p,mobile:e.target.value}))} error={errs.mobile} />
          <Input label="Alternate Number" placeholder="Optional" value={fd.alt} onChange={e=>setFd(p=>({...p,alt:e.target.value}))} />
          <Input label="Address *" placeholder="Full address" value={fd.address} onChange={e=>setFd(p=>({...p,address:e.target.value}))} error={errs.address} />
          <Input label="Google Map Link" placeholder="https://maps.google.com/..." value={fd.map} onChange={e=>setFd(p=>({...p,map:e.target.value}))} />
          <div className="flex gap-3 pt-2">
            <Button onClick={save} className="flex-1">Add Client</Button>
            <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
