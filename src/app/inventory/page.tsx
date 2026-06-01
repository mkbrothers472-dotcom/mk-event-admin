'use client';

import { useState } from 'react';
import { useApp } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { InventoryItem, InventoryCategory } from '@/lib/types';
import { Package, Plus, Edit, TrendingDown, AlertTriangle, Search } from 'lucide-react';

const categories: InventoryCategory[] = [
  'Balloons', 'Backdrops', 'Flower Decorations', 'Welcome Boards',
  'Chairs', 'Tables', 'Lights', 'Sound System', 'Custom Items',
];

const categoryIcons: Record<string, string> = {
  'Balloons': '🎈',
  'Backdrops': '🖼️',
  'Flower Decorations': '🌸',
  'Welcome Boards': '📋',
  'Chairs': '🪑',
  'Tables': '🪞',
  'Lights': '💡',
  'Sound System': '🔊',
  'Custom Items': '📦',
};

export default function InventoryPage() {
  const { inventory, addInventoryItem, updateInventoryItem } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | undefined>();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    category: 'Balloons' as InventoryCategory,
    quantity_available: '',
    quantity_used: '0',
  });

  const filtered = inventory.filter(item => {
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = !categoryFilter || item.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const lowStock = inventory.filter(i => i.quantity_available - i.quantity_used < 5);

  const handleSave = () => {
    if (!formData.name || !formData.quantity_available) return;
    if (editItem) {
      updateInventoryItem({
        ...editItem,
        name: formData.name,
        category: formData.category,
        quantity_available: Number(formData.quantity_available),
        quantity_used: Number(formData.quantity_used),
        updated_at: new Date().toISOString(),
      });
    } else {
      addInventoryItem({
        id: Date.now().toString(),
        name: formData.name,
        category: formData.category,
        quantity_available: Number(formData.quantity_available),
        quantity_used: Number(formData.quantity_used),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
    setShowForm(false);
    setEditItem(undefined);
    setFormData({ name: '', category: 'Balloons', quantity_available: '', quantity_used: '0' });
  };

  const openEdit = (item: InventoryItem) => {
    setEditItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      quantity_available: item.quantity_available.toString(),
      quantity_used: item.quantity_used.toString(),
    });
    setShowForm(true);
  };

  // Group by category
  const grouped = categories.reduce((acc, cat) => {
    const items = filtered.filter(i => i.category === cat);
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {} as Record<string, InventoryItem[]>);

  return (
    <div className="space-y-6">
      {/* Low Stock Alert */}
      {lowStock.length > 0 && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <h3 className="font-semibold text-orange-800 dark:text-orange-300">Low Stock Alert</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStock.map(item => (
              <span key={item.id} className="text-xs bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400 px-2 py-1 rounded-full">
                {item.name}: {item.quantity_available - item.quantity_used} left
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{inventory.length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Items</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-2xl font-bold text-green-600">{inventory.reduce((s, i) => s + i.quantity_available, 0)}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Available</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-2xl font-bold text-blue-600">{inventory.reduce((s, i) => s + i.quantity_used, 0)}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Currently In Use</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-2xl font-bold text-orange-600">{lowStock.length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Low Stock Items</p>
        </div>
      </div>

      {/* Filters + Add */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-3 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Search items..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            options={[
              { value: '', label: 'All Categories' },
              ...categories.map(c => ({ value: c, label: c })),
            ]}
          />
        </div>
        <Button onClick={() => { setEditItem(undefined); setFormData({ name: '', category: 'Balloons', quantity_available: '', quantity_used: '0' }); setShowForm(true); }} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Item
        </Button>
      </div>

      {/* Inventory by Category */}
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
            <span className="text-lg">{categoryIcons[category]}</span>
            <h3 className="font-semibold text-gray-900 dark:text-white">{category}</h3>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">({items.length} items)</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400">Item Name</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400">Available</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400">In Use</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400">Free</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400">Status</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {items.map(item => {
                  const free = item.quantity_available - item.quantity_used;
                  const pct = Math.round((item.quantity_used / item.quantity_available) * 100);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{item.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{item.quantity_available}</td>
                      <td className="px-4 py-3 text-sm text-blue-600 dark:text-blue-400 font-medium">{item.quantity_used}</td>
                      <td className="px-4 py-3 text-sm font-medium">
                        <span className={free < 5 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
                          {free}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${pct > 80 ? 'bg-red-500' : pct > 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{pct}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => openEdit(item)}
                          className="p-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-200 transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* Form Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editItem ? 'Edit Item' : 'Add Inventory Item'} size="md">
        <div className="space-y-4">
          <Input
            label="Item Name *"
            placeholder="Enter item name"
            value={formData.name}
            onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
          />
          <Select
            label="Category"
            value={formData.category}
            onChange={e => setFormData(p => ({ ...p, category: e.target.value as InventoryCategory }))}
            options={categories.map(c => ({ value: c, label: c }))}
          />
          <Input
            label="Quantity Available *"
            type="number"
            placeholder="0"
            value={formData.quantity_available}
            onChange={e => setFormData(p => ({ ...p, quantity_available: e.target.value }))}
          />
          <Input
            label="Quantity Currently Used"
            type="number"
            placeholder="0"
            value={formData.quantity_used}
            onChange={e => setFormData(p => ({ ...p, quantity_used: e.target.value }))}
          />
          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} className="flex-1">{editItem ? 'Update' : 'Add Item'}</Button>
            <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
