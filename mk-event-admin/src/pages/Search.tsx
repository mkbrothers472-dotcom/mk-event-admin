import { useState } from 'react';
import { useApp } from '../store';
import { Card, Select } from '../components/ui';
import { formatDate, formatTime, formatCurrency, statusColor, payColor } from '../utils';
import { Search as SearchIcon, Calendar, Clock, MapPin, Phone } from 'lucide-react';

const EVENT_TYPES = ['Baby Shower','Birthday Decoration','Welcome Baby','Mandap Muhurat','Wedding Decoration','Shrimant Sanskar','Custom Event'];

export function Search() {
  const { events, setActivePage } = useApp();
  const [q, setQ] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [typeF, setTypeF] = useState('');
  const [payF, setPayF] = useState('');
  const [statusF, setStatusF] = useState('');

  const hasFilter = q || dateFrom || dateTo || typeF || payF || statusF;

  const filtered = events.filter(e => {
    const s = q.toLowerCase();
    return (
      (!q || e.client?.name.toLowerCase().includes(s) || e.event_name.toLowerCase().includes(s) || e.event_venue.toLowerCase().includes(s) || e.client?.mobile.includes(q))
      && (!dateFrom || e.event_date >= dateFrom)
      && (!dateTo || e.event_date <= dateTo)
      && (!typeF || e.event_name === typeF)
      && (!payF || e.payment_status === payF)
      && (!statusF || e.event_status === statusF)
    );
  });

  return (
    <div className="space-y-4">
      {/* Search box */}
      <Card className="p-3 sm:p-5">
        <div className="relative mb-3">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            autoFocus
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white dark:focus:bg-gray-600 transition-colors"
            placeholder="Search by client, event type, venue, mobile..."
            value={q} onChange={e => setQ(e.target.value)}
          />
        </div>

        {/* Filters — 2 col on mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          <div>
            <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">From</label>
            <input type="date" className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">To</label>
            <input type="date" className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500" value={dateTo} onChange={e=>setDateTo(e.target.value)} />
          </div>
          <Select value={typeF} onChange={e=>setTypeF(e.target.value)} options={[{value:'',label:'All Types'},...EVENT_TYPES.map(t=>({value:t,label:t.split(' ')[0]}))]} />
          <Select value={payF} onChange={e=>setPayF(e.target.value)} options={[{value:'',label:'Payment'},{value:'Paid',label:'Paid'},{value:'Partial Paid',label:'Partial'},{value:'Pending',label:'Pending'}]} />
          <Select value={statusF} onChange={e=>setStatusF(e.target.value)} options={[{value:'',label:'Status'},{value:'Upcoming',label:'Upcoming'},{value:'In Progress',label:'In Progress'},{value:'Completed',label:'Completed'},{value:'Cancelled',label:'Cancelled'}]} />
        </div>

        {hasFilter && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              <span className="font-semibold text-gray-900 dark:text-white">{filtered.length}</span> results
            </p>
            <button
              onClick={() => { setQ(''); setDateFrom(''); setDateTo(''); setTypeF(''); setPayF(''); setStatusF(''); }}
              className="text-xs text-purple-600 dark:text-purple-400 hover:underline font-medium"
            >
              Clear all
            </button>
          </div>
        )}
      </Card>

      {/* Empty state */}
      {!hasFilter && (
        <div className="text-center py-16">
          <SearchIcon className="w-14 h-14 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">Start searching</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Use the search bar and filters above</p>
        </div>
      )}

      {hasFilter && filtered.length === 0 && (
        <Card className="p-12 text-center">
          <SearchIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No results found</p>
        </Card>
      )}

      {/* Results */}
      {hasFilter && filtered.length > 0 && (
        <div className="space-y-2 sm:space-y-3">
          {filtered.map(ev => (
            <button key={ev.id} onClick={() => setActivePage('events')} className="w-full text-left">
              <Card className="p-3 sm:p-5 hover:shadow-md hover:border-purple-300 dark:hover:border-purple-700 transition-all">
                <div className="flex items-start justify-between mb-2 gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white">{ev.event_name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{ev.client?.name}</p>
                  </div>
                  <div className="flex flex-col gap-1 items-end flex-shrink-0">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusColor(ev.event_status)}`}>{ev.event_status}</span>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${payColor(ev.payment_status)}`}>{ev.payment_status}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1.5"><Calendar className="w-3 h-3 flex-shrink-0" />{formatDate(ev.event_date)}</div>
                  <div className="flex items-center gap-1.5"><Clock className="w-3 h-3 flex-shrink-0" />{formatTime(ev.event_time)}</div>
                  <div className="flex items-center gap-1.5 col-span-2"><MapPin className="w-3 h-3 flex-shrink-0" /><span className="truncate">{ev.event_venue}</span></div>
                  <div className="flex items-center gap-1.5"><Phone className="w-3 h-3 flex-shrink-0" />{ev.client?.mobile}</div>
                  <div className="flex items-center gap-1.5 font-semibold text-gray-900 dark:text-white">{formatCurrency(ev.total_price)}</div>
                </div>
                {ev.remaining_balance > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <span className="text-xs font-semibold text-red-600 dark:text-red-400">Due: {formatCurrency(ev.remaining_balance)}</span>
                  </div>
                )}
              </Card>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
