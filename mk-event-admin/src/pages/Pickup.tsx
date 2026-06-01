import { useState } from 'react';
import { useApp } from '../store';
import { Card } from '../components/ui';
import { formatDate } from '../utils';
import { PickupStatus } from '../types';
import { CheckCircle, Clock, AlertCircle, Package } from 'lucide-react';

const CHECKLIST = [
  'Balloons Removed','Backdrop Collected','Lights Collected',
  'Sound System Collected','Chairs Returned','Tables Returned','Other Materials Returned',
];

export function Pickup() {
  const { events, eventInventory, updateEventInventory } = useApp();
  const [checked, setChecked] = useState<Record<string, string[]>>({});

  const completed = events.filter(e => e.event_status === 'Completed');
  const pendingPickup = completed.filter(e => {
    const items = eventInventory.filter(i => i.event_id === e.id);
    return items.some(i => i.pickup_status !== 'Fully Picked');
  });

  const toggle = (evId: string, item: string) => {
    setChecked(p => {
      const cur = p[evId] || [];
      return { ...p, [evId]: cur.includes(item) ? cur.filter(x => x !== item) : [...cur, item] };
    });
  };

  const stats = {
    pending: eventInventory.filter(i => i.pickup_status === 'Pending Pickup').length,
    partial: eventInventory.filter(i => i.pickup_status === 'Partially Picked').length,
    done: eventInventory.filter(i => i.pickup_status === 'Fully Picked').length,
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
            <span className="text-xs font-medium text-red-700 dark:text-red-400">Pending</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-red-800 dark:text-red-300">{stats.pending}</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
            <span className="text-xs font-medium text-yellow-700 dark:text-yellow-400">Partial</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-yellow-800 dark:text-yellow-300">{stats.partial}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
            <span className="text-xs font-medium text-green-700 dark:text-green-400">Collected</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-green-800 dark:text-green-300">{stats.done}</p>
        </div>
      </div>

      {/* Pending Pickup Events */}
      <h2 className="text-base font-bold text-gray-900 dark:text-white">Events Pending Pickup</h2>

      {pendingPickup.length === 0 ? (
        <Card className="p-10 text-center">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <p className="font-medium text-gray-700 dark:text-gray-300">All materials collected!</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">No pending pickups</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {pendingPickup.map(ev => {
            const items = eventInventory.filter(i => i.event_id === ev.id);
            const chk = checked[ev.id] || [];
            const allDone = chk.length === CHECKLIST.length;
            return (
              <Card key={ev.id} className="p-4">
                {/* Event header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white">{ev.event_name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{ev.client?.name} · {formatDate(ev.event_date)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{ev.event_venue}</p>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold flex-shrink-0 ml-2 ${allDone ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'}`}>
                    {allDone ? '✓ Ready' : 'Pending'}
                  </span>
                </div>

                {/* Inventory items */}
                {items.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5" />Assigned Items
                    </h4>
                    <div className="space-y-2">
                      {items.map(item => (
                        <div key={item.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2">
                          <div>
                            <p className="text-xs font-medium text-gray-900 dark:text-white">{item.inventory_item?.name}</p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400">Qty: {item.quantity_used}</p>
                          </div>
                          <select
                            value={item.pickup_status}
                            onChange={e => updateEventInventory({...item, pickup_status: e.target.value as PickupStatus})}
                            className="text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                          >
                            <option>Pending Pickup</option>
                            <option>Partially Picked</option>
                            <option>Fully Picked</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Checklist */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" />Checklist ({chk.length}/{CHECKLIST.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {CHECKLIST.map(item => (
                      <label key={item} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox" checked={chk.includes(item)} onChange={() => toggle(ev.id, item)}
                          className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 flex-shrink-0"
                        />
                        <span className={`text-xs transition-colors ${chk.includes(item) ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
                          {item}
                        </span>
                      </label>
                    ))}
                  </div>
                  {allDone && (
                    <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-xs text-green-700 dark:text-green-400 font-medium flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />All items checked! Ready to close.
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* All Completed Events */}
      <h2 className="text-base font-bold text-gray-900 dark:text-white pt-2">All Completed Events</h2>
      <Card className="overflow-hidden">
        {/* Mobile list */}
        <div className="sm:hidden divide-y divide-gray-100 dark:divide-gray-700">
          {completed.map(ev => {
            const items = eventInventory.filter(i => i.event_id === ev.id);
            const allPicked = items.every(i => i.pickup_status === 'Fully Picked');
            const anyPicked = items.some(i => i.pickup_status !== 'Pending Pickup');
            const status = items.length === 0 ? 'N/A' : allPicked ? 'Fully Picked' : anyPicked ? 'Partially Picked' : 'Pending Pickup';
            return (
              <div key={ev.id} className="p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{ev.event_name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{ev.client?.name} · {formatDate(ev.event_date)}</p>
                </div>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold flex-shrink-0 ${status==='Fully Picked'||status==='N/A' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : status==='Partially Picked' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                  {status}
                </span>
              </div>
            );
          })}
          {completed.length === 0 && <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">No completed events yet</div>}
        </div>
        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                {['Event','Client','Date','Items','Pickup Status'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {completed.map(ev => {
                const items = eventInventory.filter(i => i.event_id === ev.id);
                const allPicked = items.every(i => i.pickup_status === 'Fully Picked');
                const anyPicked = items.some(i => i.pickup_status !== 'Pending Pickup');
                const status = items.length === 0 ? 'N/A' : allPicked ? 'Fully Picked' : anyPicked ? 'Partially Picked' : 'Pending Pickup';
                return (
                  <tr key={ev.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{ev.event_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{ev.client?.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{formatDate(ev.event_date)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{items.length}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${status==='Fully Picked'||status==='N/A' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : status==='Partially Picked' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {completed.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">No completed events yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
