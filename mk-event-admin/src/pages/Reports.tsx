import { useState } from 'react';
import { useApp } from '../store';
import { Card, Button } from '../components/ui';
import { formatCurrency, exportCSV } from '../utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { Download, TrendingUp, Calendar, CreditCard, Package } from 'lucide-react';
import { format, subMonths } from 'date-fns';

const COLORS = ['#8b5cf6','#3b82f6','#10b981','#f59e0b','#ef4444','#ec4899'];

export function Reports() {
  const { events, payments, clients, inventory } = useApp();
  const [tab, setTab] = useState<'revenue'|'events'|'payments'|'inventory'>('revenue');

  const monthly = Array.from({length:6},(_,i) => {
    const d = subMonths(new Date(), 5-i), m = format(d,'yyyy-MM');
    return {
      month: format(d,'MMM'),
      revenue: payments.filter(p=>p.payment_date.startsWith(m)).reduce((s,p)=>s+p.amount,0),
      events: events.filter(e=>e.event_date.startsWith(m)).length,
      pending: events.filter(e=>e.event_date.startsWith(m)).reduce((s,e)=>s+e.remaining_balance,0),
    };
  });

  const typeData = Object.entries(events.reduce((a,e)=>({...a,[e.event_name]:(a[e.event_name]||0)+1}),{} as Record<string,number>)).map(([name,value])=>({name:name.split(' ')[0],value}));
  const payData = [
    {name:'Paid',value:events.filter(e=>e.payment_status==='Paid').length},
    {name:'Partial',value:events.filter(e=>e.payment_status==='Partial Paid').length},
    {name:'Pending',value:events.filter(e=>e.payment_status==='Pending').length},
  ];
  const invData = inventory.slice(0,8).map(i=>({name:i.name.split(' ')[0],available:i.quantity_available,used:i.quantity_used}));

  const totalRev = payments.reduce((s,p)=>s+p.amount,0);
  const totalPend = events.reduce((s,e)=>s+e.remaining_balance,0);
  const avgVal = events.length ? events.reduce((s,e)=>s+e.total_price,0)/events.length : 0;

  const doExport = () => exportCSV([
    ['MK Brothers Event Decoration - Report'],
    ['Generated:', new Date().toLocaleDateString('en-IN')],
    [],['SUMMARY'],
    ['Total Events',events.length],['Revenue Collected',totalRev],['Pending',totalPend],['Clients',clients.length],
    [],['MONTHLY'],['Month','Events','Revenue','Pending'],
    ...monthly.map(m=>[m.month,m.events,m.revenue,m.pending]),
  ], `mk-report-${format(new Date(),'yyyy-MM-dd')}.csv`);

  const tabs = [
    {id:'revenue',label:'Revenue',icon:TrendingUp},
    {id:'events',label:'Events',icon:Calendar},
    {id:'payments',label:'Payments',icon:CreditCard},
    {id:'inventory',label:'Inventory',icon:Package},
  ] as const;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        {[
          {label:'Total Revenue',val:formatCurrency(totalRev),cls:'from-purple-500 to-purple-700'},
          {label:'Pending Amount',val:formatCurrency(totalPend),cls:'from-red-500 to-red-700'},
          {label:'Avg Event Value',val:formatCurrency(avgVal),cls:'from-blue-500 to-blue-700'},
          {label:'Total Clients',val:clients.length,cls:'from-green-500 to-green-700'},
        ].map(s => (
          <div key={s.label} className={`bg-gradient-to-br ${s.cls} rounded-xl p-3 sm:p-5 text-white`}>
            <p className="text-white/70 text-xs">{s.label}</p>
            <p className="text-lg sm:text-2xl font-bold mt-1">{s.val}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button variant="outline" onClick={doExport}><Download className="w-4 h-4" />Export CSV</Button>
      </div>

      {/* Tabs — scrollable on mobile */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {tabs.map(({id,label,icon:Icon}) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${tab===id ? 'border-purple-600 text-purple-600 dark:text-purple-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
            <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />{label}
          </button>
        ))}
      </div>

      {tab === 'revenue' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-4 sm:p-5">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-4">Monthly Revenue vs Pending</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <XAxis dataKey="month" tick={{fontSize:11,fill:'#6b7280'}} />
                <YAxis tick={{fontSize:11,fill:'#6b7280'}} tickFormatter={v=>`₹${(v/1000).toFixed(0)}k`} width={40} />
                <Tooltip formatter={(v)=>formatCurrency(Number(v))} contentStyle={{backgroundColor:'#fff',border:'1px solid #e5e7eb',borderRadius:'8px',fontSize:'12px'}} />
                <Bar dataKey="revenue" fill="#8b5cf6" radius={[4,4,0,0]} name="Revenue" />
                <Bar dataKey="pending" fill="#ef4444" radius={[4,4,0,0]} name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card className="p-4 sm:p-5">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-4">Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{fontSize:11,fill:'#6b7280'}} />
                <YAxis tick={{fontSize:11,fill:'#6b7280'}} tickFormatter={v=>`₹${(v/1000).toFixed(0)}k`} width={40} />
                <Tooltip formatter={(v)=>formatCurrency(Number(v))} contentStyle={{backgroundColor:'#fff',border:'1px solid #e5e7eb',borderRadius:'8px',fontSize:'12px'}} />
                <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2.5} dot={{fill:'#8b5cf6',r:3}} name="Revenue" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {tab === 'events' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-4 sm:p-5">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-4">Events by Type</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={typeData} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({name,value})=>`${name}:${value}`} labelLine={false}>
                  {typeData.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
          <Card className="p-4 sm:p-5">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-4">Monthly Event Count</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{fontSize:11,fill:'#6b7280'}} />
                <YAxis tick={{fontSize:11,fill:'#6b7280'}} />
                <Tooltip contentStyle={{backgroundColor:'#fff',border:'1px solid #e5e7eb',borderRadius:'8px',fontSize:'12px'}} />
                <Bar dataKey="events" fill="#3b82f6" radius={[4,4,0,0]} name="Events" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {tab === 'payments' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-4 sm:p-5">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-4">Payment Status</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={payData} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({name,value})=>`${name}:${value}`} labelLine={false}>
                  <Cell fill="#10b981" /><Cell fill="#f59e0b" /><Cell fill="#ef4444" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
          <Card className="p-4 sm:p-5">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-4">Top Pending Payments</h3>
            <div className="space-y-3 max-h-[180px] overflow-y-auto">
              {events.filter(e=>e.remaining_balance>0).sort((a,b)=>b.remaining_balance-a.remaining_balance).map(ev => (
                <div key={ev.id} className="flex items-center justify-between">
                  <div><p className="text-sm font-medium text-gray-900 dark:text-white">{ev.client?.name}</p><p className="text-xs text-gray-500 dark:text-gray-400">{ev.event_name}</p></div>
                  <span className="text-sm font-bold text-red-600 dark:text-red-400">{formatCurrency(ev.remaining_balance)}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {tab === 'inventory' && (
        <Card className="p-4 sm:p-5">
          <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-4">Inventory Usage</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={invData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" tick={{fontSize:11,fill:'#6b7280'}} />
              <YAxis dataKey="name" type="category" tick={{fontSize:10,fill:'#6b7280'}} width={70} />
              <Tooltip contentStyle={{backgroundColor:'#fff',border:'1px solid #e5e7eb',borderRadius:'8px',fontSize:'12px'}} />
              <Legend wrapperStyle={{fontSize:'12px'}} />
              <Bar dataKey="available" fill="#10b981" name="Available" radius={[0,4,4,0]} />
              <Bar dataKey="used" fill="#8b5cf6" name="In Use" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Monthly Table */}
      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Monthly Summary</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50">
                {['Month','Events','Revenue','Pending'].map(h => (
                  <th key={h} className="text-left px-3 sm:px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {monthly.map(r => (
                <tr key={r.month} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-3 sm:px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{r.month}</td>
                  <td className="px-3 sm:px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{r.events}</td>
                  <td className="px-3 sm:px-4 py-3 text-sm font-semibold text-green-600 dark:text-green-400">{formatCurrency(r.revenue)}</td>
                  <td className="px-3 sm:px-4 py-3 text-sm font-semibold text-red-600 dark:text-red-400">{formatCurrency(r.pending)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
