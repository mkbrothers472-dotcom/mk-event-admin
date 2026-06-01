import { useState } from 'react';
import { useApp } from '../store';
import { Card, Button, Input, Select, Modal } from '../components/ui';
import { InventoryItem, InventoryCategory } from '../types';
import { Package, Plus, Edit, Trash2, AlertTriangle, Search, AlertCircle } from 'lucide-react';

const CATS: InventoryCategory[] = [
  'Balloons','Backdrops','Flower Decorations','Welcome Boards',
  'Chairs','Tables','Lights','Sound System','Custom Items',
];
const ICONS: Record<string,string> = {
  Balloons:'🎈', Backdrops:'🖼️', 'Flower Decorations':'🌸',
  'Welcome Boards':'📋', Chairs:'🪑', Tables:'🪞',
  Lights:'💡', 'Sound System':'🔊', 'Custom Items':'📦',
};

export function Inventory() {
  const { inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem } = useApp() as any;
  const [showForm, setShowForm]     = useState(false);
  const [editItem, setEditItem]     = useState<InventoryItem|undefined>();
  const [deleteId, setDeleteId]     = useState<string|null>(null);
  const [search, setSearch]         = useState('');
  const [catF, setCatF]             = useState('');
  const [fd, setFd] = useState({
    name:'', category:'Balloons' as InventoryCategory, available:'', used:'0',
  });

  const filtered = inventory.filter((i: InventoryItem) =>
    (!search || i.name.toLowerCase().includes(search.toLowerCase())) &&
    (!catF || i.category === catF)
  );
  const lowStock = inventory.filter((i: InventoryItem) =>
    i.quantity_available - i.quantity_used < 5
  );

  const openEdit = (item: InventoryItem) => {
    setEditItem(item);
    setFd({
      name: item.name, category: item.category,
      available: item.quantity_available.toString(),
      used: item.quantity_used.toString(),
    });
    setShowForm(true);
  };

  const openAdd = () => {
    setEditItem(undefined);
    setFd({ name:'', category:'Balloons', available:'', used:'0' });
    setShowForm(true);
  };

  const save = () => {
    if (!fd.name || !fd.available) return;
    const base = {
      name: fd.name, category: fd.category,
      quantity_available: Number(fd.available),
      quantity_used: Number(fd.used),
      updated_at: new Date().toISOString(),
    };
    if (editItem) {
      updateInventoryItem({ ...editItem, ...base });
    } else {
      addInventoryItem(base as any);
    }
    setShowForm(false);
    setEditItem(undefined);
    setFd({ name:'', category:'Balloons', available:'', used:'0' });
  };

  const confirmDelete = (id: string) => setDeleteId(id);

  const handleDelete = async () => {
    if (!deleteId) return;
    if (deleteInventoryItem) {
      await deleteInventoryItem(deleteId);
    }
    setDeleteId(null);
  };

  const deleteItem = inventory.find((i: InventoryItem) => i.id === deleteId);

  const grouped = CATS.reduce((acc, cat) => {
    const items = filtered.filter((i: InventoryItem) => i.category === cat);
    if (items.length) acc[cat] = items;
    return acc;
  }, {} as Record<string, InventoryItem[]>);

  return (
    <div className="space-y-4">
      {/* Low Stock Alert */}
      {lowStock.length > 0 && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400 flex-shrink-0" />
            <h3 className="font-semibold text-sm text-orange-800 dark:text-orange-300">Low Stock Alert</h3>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {lowStock.map((i: InventoryItem) => (
              <span key={i.id} className="text-xs bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400 px-2 py-1 rounded-full">
                {i.name}: {i.quantity_available - i.quantity_used} left
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        {[
          { label:'Total Items',  val: inventory.length,                                          cls:'text-gray-900 dark:text-white' },
          { label:'Available',    val: inventory.reduce((s: number, i: InventoryItem) => s + i.quantity_available, 0), cls:'text-green-600 dark:text-green-400' },
          { label:'In Use',       val: inventory.reduce((s: number, i: InventoryItem) => s + i.quantity_used, 0),      cls:'text-blue-600 dark:text-blue-400' },
          { label:'Low Stock',    val: lowStock.length,                                           cls:'text-orange-600 dark:text-orange-400' },
        ].map(s => (
          <Card key={s.label} className="p-3 sm:p-4">
            <p className={`text-xl sm:text-2xl font-bold ${s.cls}`}>{s.val}</p>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Search items..." value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Select
          value={catF} onChange={e => setCatF(e.target.value)}
          options={[{value:'',label:'All'},...CATS.map(c=>({value:c,label:c.split(' ')[0]}))]}
          className="w-28 sm:w-40"
        />
        <Button onClick={openAdd} size="md">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Item</span>
        </Button>
      </div>

      {/* Grouped — mobile cards, desktop table */}
      {Object.entries(grouped).map(([cat, items]) => (
        <Card key={cat} className="overflow-hidden">
          {/* Category header */}
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
            <span className="text-base">{ICONS[cat]}</span>
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white">{cat}</h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">({items.length} items)</span>
          </div>

          {/* ── Mobile card list ── */}
          <div className="sm:hidden divide-y divide-gray-100 dark:divide-gray-700">
            {items.map(item => {
              const free = item.quantity_available - item.quantity_used;
              const pct  = Math.round((item.quantity_used / item.quantity_available) * 100);
              return (
                <div key={item.id} className="p-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Avail: <b className="text-gray-700 dark:text-gray-300">{item.quantity_available}</b>
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Use: <b className="text-blue-600 dark:text-blue-400">{item.quantity_used}</b>
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Free: <b className={free < 5 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>{free}</b>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${pct>80?'bg-red-500':pct>50?'bg-yellow-500':'bg-green-500'}`}
                          style={{width:`${pct}%`}}
                        />
                      </div>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 w-8 text-right">{pct}%</span>
                    </div>
                  </div>
                  {/* Mobile action buttons */}
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => openEdit(item)}
                      className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => confirmDelete(item.id)}
                      className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Desktop table ── */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  {['Item Name','Available','In Use','Free','Usage','Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {items.map(item => {
                  const free = item.quantity_available - item.quantity_used;
                  const pct  = Math.round((item.quantity_used / item.quantity_available) * 100);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{item.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{item.quantity_available}</td>
                      <td className="px-4 py-3 text-sm text-blue-600 dark:text-blue-400 font-medium">{item.quantity_used}</td>
                      <td className="px-4 py-3 text-sm font-semibold">
                        <span className={free < 5 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
                          {free}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${pct>80?'bg-red-500':pct>50?'bg-yellow-500':'bg-green-500'}`}
                              style={{width:`${pct}%`}}
                            />
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 w-8">{pct}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(item)}
                            className="p-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                            title="Edit item"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => confirmDelete(item.id)}
                            className="p-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                            title="Delete item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ))}

      {Object.keys(grouped).length === 0 && (
        <Card className="p-12 text-center">
          <Package className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">No inventory items found</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Add your first item using the button above</p>
          <Button onClick={openAdd} className="mt-4">
            <Plus className="w-4 h-4" />Add Item
          </Button>
        </Card>
      )}

      {/* ── Add / Edit Modal ── */}
      <Modal
        open={showForm}
        onClose={() => { setShowForm(false); setEditItem(undefined); }}
        title={editItem ? `Edit: ${editItem.name}` : 'Add Inventory Item'}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Item Name *"
            placeholder="e.g. Latex Balloons (Pack 100)"
            value={fd.name}
            onChange={e => setFd(p => ({...p, name: e.target.value}))}
          />
          <Select
            label="Category"
            value={fd.category}
            onChange={e => setFd(p => ({...p, category: e.target.value as InventoryCategory}))}
            options={CATS.map(c => ({value:c, label:c}))}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Quantity Available *"
              type="number"
              placeholder="0"
              value={fd.available}
              onChange={e => setFd(p => ({...p, available: e.target.value}))}
            />
            <Input
              label="Quantity In Use"
              type="number"
              placeholder="0"
              value={fd.used}
              onChange={e => setFd(p => ({...p, used: e.target.value}))}
            />
          </div>
          {/* Live preview */}
          {fd.available && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">Free / Available</span>
              <span className="text-sm font-bold text-green-600 dark:text-green-400">
                {Math.max(0, Number(fd.available) - Number(fd.used))} / {fd.available}
              </span>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <Button onClick={save} className="flex-1">
              {editItem ? '✓ Update Item' : '+ Add Item'}
            </Button>
            <Button variant="outline" onClick={() => { setShowForm(false); setEditItem(undefined); }} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Delete Confirm Dialog ── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            {/* Icon */}
            <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-7 h-7 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-1">
              Delete Item?
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-1">
              You are about to delete:
            </p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white text-center mb-1">
              "{deleteItem?.name}"
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center mb-5">
              Category: {deleteItem?.category} · Available: {deleteItem?.quantity_available}
            </p>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 mb-5">
              <p className="text-xs text-red-700 dark:text-red-400 text-center">
                ⚠️ This action cannot be undone. The item will be permanently removed.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="danger"
                onClick={handleDelete}
                className="flex-1"
              >
                <Trash2 className="w-4 h-4" />
                Yes, Delete
              </Button>
              <Button
                variant="outline"
                onClick={() => setDeleteId(null)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
