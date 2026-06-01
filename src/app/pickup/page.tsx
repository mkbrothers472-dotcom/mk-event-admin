'use client';

import { useState } from 'react';
import { useApp } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EventInventory, PickupStatus } from '@/lib/types';
import { Truck, CheckCircle, Clock, AlertCircle, Package } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const checklistItems = [
  'Balloons Removed',
  'Backdrop Collected',
  'Lights Collected',
  'Sound System Collected',
  'Chairs Returned',
  'Tables Returned',
  'Other Materials Returned',
];

export default function PickupPage() {
  const { events, eventInventory, updateEventInventory } = useApp();
  const [checkedItems, setCheckedItems] = useState<Record<string, string[]>>({});

  const completedEvents = events.filter(e => e.event_status === 'Completed');
  const pendingPickupEvents = completedEvents.filter(e => {
    const items = eventInventory.filter(i => i.event_id === e.id);
    return items.some(i => i.pickup_status !== 'Fully Picked');
  });

  const updatePickupStatus = (itemId: string, status: PickupStatus) => {
    const item = eventInventory.find(i => i.id === itemId);
    if (item) {
      updateEventInventory({ ...item, pickup_status: status });
    }
  };

  const toggleCheck = (eventId: string, item: string) => {
    setCheckedItems(prev => {
      const current = prev[eventId] || [];
      if (current.includes(item)) {
        return { ...prev, [eventId]: current.filter(i => i !== item) };
      }
      return { ...prev, [eventId]: [...current, item] };
    });
  };

  const stats = {
    pending: eventInventory.filter(i => i.pickup_status === 'Pending Pickup').length,
    partial: eventInventory.filter(i => i.pickup_status === 'Partially Picked').length,
    complete: eventInventory.filter(i => i.pickup_status === 'Fully Picked').length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <span className="text-sm font-medium text-red-700 dark:text-red-400">Pending Pickup</span>
          </div>
          <p className="text-3xl font-bold text-red-800 dark:text-red-300">{stats.pending}</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">Partially Picked</span>
          </div>
          <p className="text-3xl font-bold text-yellow-800 dark:text-yellow-300">{stats.partial}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-700 dark:text-green-400">Fully Picked</span>
          </div>
          <p className="text-3xl font-bold text-green-800 dark:text-green-300">{stats.complete}</p>
        </div>
      </div>

      {/* Pending Pickup Events */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Events Pending Material Pickup</h2>
        {pendingPickupEvents.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">All materials collected!</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">No pending pickups at this time</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingPickupEvents.map(event => {
              const items = eventInventory.filter(i => i.event_id === event.id);
              const checked = checkedItems[event.id] || [];
              const allChecked = checked.length === checklistItems.length;

              return (
                <div key={event.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{event.event_name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{event.client?.name} • {formatDate(event.event_date)}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{event.event_venue}</p>
                    </div>
                    <Badge className={allChecked
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                    }>
                      {allChecked ? 'Ready to Close' : 'Pickup Pending'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Inventory Items */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Assigned Items
                      </h4>
                      <div className="space-y-2">
                        {items.map(item => (
                          <div key={item.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2">
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{item.inventory_item?.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Qty: {item.quantity_used}</p>
                            </div>
                            <select
                              value={item.pickup_status}
                              onChange={e => updatePickupStatus(item.id, e.target.value as PickupStatus)}
                              className="text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                            >
                              <option value="Pending Pickup">Pending Pickup</option>
                              <option value="Partially Picked">Partially Picked</option>
                              <option value="Fully Picked">Fully Picked</option>
                            </select>
                          </div>
                        ))}
                        {items.length === 0 && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">No inventory assigned</p>
                        )}
                      </div>
                    </div>

                    {/* Checklist */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Pickup Checklist ({checked.length}/{checklistItems.length})
                      </h4>
                      <div className="space-y-1.5">
                        {checklistItems.map(item => (
                          <label key={item} className="flex items-center gap-2 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={checked.includes(item)}
                              onChange={() => toggleCheck(event.id, item)}
                              className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className={`text-sm transition-colors ${checked.includes(item) ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
                              {item}
                            </span>
                          </label>
                        ))}
                      </div>
                      {allChecked && (
                        <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <p className="text-xs text-green-700 dark:text-green-400 font-medium flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            All items checked! Ready to mark as complete.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* All Completed Events Pickup Status */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">All Completed Events</h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Event</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Client</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Items</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Pickup Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {completedEvents.map(event => {
                  const items = eventInventory.filter(i => i.event_id === event.id);
                  const allPicked = items.every(i => i.pickup_status === 'Fully Picked');
                  const anyPicked = items.some(i => i.pickup_status !== 'Pending Pickup');
                  const status = items.length === 0 ? 'N/A' : allPicked ? 'Fully Picked' : anyPicked ? 'Partially Picked' : 'Pending Pickup';

                  return (
                    <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{event.event_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{event.client?.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{formatDate(event.event_date)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{items.length} items</td>
                      <td className="px-4 py-3">
                        <Badge className={
                          status === 'Fully Picked' || status === 'N/A'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : status === 'Partially Picked'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }>
                          {status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
                {completedEvents.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">No completed events yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
