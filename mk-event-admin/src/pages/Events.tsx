import { useState, useRef } from 'react';
import { useApp } from '../store';
import { Card, Button, Input, Select, Modal, Textarea } from '../components/ui';
import { formatDate, formatTime, formatCurrency, statusColor, payColor, waLink } from '../utils';
import { Event, EventType, EventStatus, PaymentMethod, PaymentStatus, Client } from '../types';
import { EventPhotos } from '../components/EventPhotos';
import { photosApi } from '../api';
import {
  Plus, Search, Eye, Edit, Trash2, MessageCircle, MapPin,
  Phone, Calendar, Clock, CreditCard, User, DollarSign, Save, X,
  Camera, Upload, Image, Loader2,
} from 'lucide-react';

const EVENT_TYPES: EventType[] = ['Baby Shower','Birthday Decoration','Welcome Baby','Mandap Muhurat','Wedding Decoration','Shrimant Sanskar','Custom Event'];

function EventForm({ event, onClose }: { event?: Event; onClose: () => void }) {
  const { clients, addEvent, updateEvent, addClient } = useApp();
  const [clientMode, setClientMode] = useState<'new'|'existing'>(event ? 'existing' : 'new');
  const [selClient, setSelClient] = useState(event?.client_id || '');
  const [cd, setCd] = useState({ name: event?.client?.name||'', mobile: event?.client?.mobile||'', alt: event?.client?.alternate_mobile||'', address: event?.client?.address||'', map: event?.client?.google_map_link||'' });
  const [fd, setFd] = useState({
    event_name: event?.event_name || 'Baby Shower' as EventType,
    custom_event_name: event?.custom_event_name||'',
    event_venue: event?.event_venue||'', event_date: event?.event_date||'',
    event_time: event?.event_time||'', event_status: event?.event_status||'Upcoming' as EventStatus,
    total_price: event?.total_price?.toString()||'', advance_received: event?.advance_received?.toString()||'',
    payment_method: event?.payment_method||'Cash' as PaymentMethod,
    payment_status: event?.payment_status||'Pending' as PaymentStatus, notes: event?.notes||'',
  });
  const [errs, setErrs] = useState<Record<string,string>>({});

  // Photo upload state
  const [refFiles, setRefFiles]       = useState<File[]>([]);
  const [refPreviews, setRefPreviews] = useState<string[]>([]);
  const [compFiles, setCompFiles]     = useState<File[]>([]);
  const [compPreviews, setCompPreviews] = useState<string[]>([]);
  const [uploading, setUploading]     = useState(false);
  const refInputRef  = useRef<HTMLInputElement>(null);
  const compInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null, type: 'reference' | 'completed') => {
    if (!files) return;
    const arr = Array.from(files).filter(f => f.type.startsWith('image/'));
    const previews = arr.map(f => URL.createObjectURL(f));
    if (type === 'reference') {
      setRefFiles(p => [...p, ...arr]);
      setRefPreviews(p => [...p, ...previews]);
    } else {
      setCompFiles(p => [...p, ...arr]);
      setCompPreviews(p => [...p, ...previews]);
    }
  };

  const removeFile = (idx: number, type: 'reference' | 'completed') => {
    if (type === 'reference') {
      setRefFiles(p => p.filter((_,i) => i !== idx));
      setRefPreviews(p => p.filter((_,i) => i !== idx));
    } else {
      setCompFiles(p => p.filter((_,i) => i !== idx));
      setCompPreviews(p => p.filter((_,i) => i !== idx));
    }
  };

  const validate = () => {
    const e: Record<string,string> = {};
    if (clientMode === 'new') {
      if (!cd.name.trim()) e.name = 'Required';
      if (!/^\d{10}$/.test(cd.mobile)) e.mobile = 'Enter valid 10-digit number';
      if (!cd.address.trim()) e.address = 'Required';
    } else if (!selClient) e.client = 'Select a client';
    if (!fd.event_venue.trim()) e.venue = 'Required';
    if (!fd.event_date) e.date = 'Required';
    if (!fd.event_time) e.time = 'Required';
    if (!fd.total_price || isNaN(Number(fd.total_price))) e.price = 'Enter valid amount';
    if (fd.event_name === 'Custom Event' && !fd.custom_event_name.trim()) e.custom = 'Required';
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const save = async () => {
    if (!validate()) return;
    let clientId = selClient;
    let clientObj: Client | undefined;
    if (clientMode === 'new') {
      const nc: Client = { id: Date.now().toString(), name: cd.name, mobile: cd.mobile, alternate_mobile: cd.alt||undefined, address: cd.address, google_map_link: cd.map||undefined, created_at: new Date().toISOString() };
      addClient(nc); clientId = nc.id; clientObj = nc;
    } else { clientObj = clients.find(c => c.id === selClient); }
    const total = Number(fd.total_price), adv = Number(fd.advance_received)||0;
    const ev: Event = {
      id: event?.id || Date.now().toString(), client_id: clientId, client: clientObj,
      event_name: fd.event_name, custom_event_name: fd.custom_event_name||undefined,
      event_venue: fd.event_venue, event_date: fd.event_date, event_time: fd.event_time,
      event_status: fd.event_status, total_price: total, advance_received: adv,
      remaining_balance: total - adv, payment_method: fd.payment_method,
      payment_status: fd.payment_status, notes: fd.notes||undefined,
      created_at: event?.created_at || new Date().toISOString(), updated_at: new Date().toISOString(),
    };

    let savedEvent: Event;
    if (event) {
      await updateEvent(ev);
      savedEvent = ev;
    } else {
      await addEvent(ev as any);
      savedEvent = ev;
    }

    // Upload photos if any selected
    if (refFiles.length > 0 || compFiles.length > 0) {
      setUploading(true);
      try {
        const eventId = savedEvent.id || (savedEvent as any)._id;
        if (refFiles.length > 0)  await photosApi.upload(eventId, refFiles, 'reference');
        if (compFiles.length > 0) await photosApi.upload(eventId, compFiles, 'completed');
      } catch (e) { console.warn('Photo upload failed:', e); }
      setUploading(false);
    }

    onClose();
  };

  const remaining = Math.max(0, (Number(fd.total_price)||0) - (Number(fd.advance_received)||0));

  return (
    <div className="space-y-6">
      {/* Client */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><User className="w-4 h-4 text-purple-600" />Client Details</h3>
        {!event && (
          <div className="flex gap-2 mb-4">
            {(['new','existing'] as const).map(m => (
              <button key={m} onClick={() => setClientMode(m)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${clientMode===m ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                {m === 'new' ? 'New Client' : 'Existing Client'}
              </button>
            ))}
          </div>
        )}
        {clientMode === 'existing'
          ? <Select value={selClient} onChange={e => setSelClient(e.target.value)} error={errs.client}
              options={[{value:'',label:'-- Select Client --'}, ...clients.map(c => ({value:c.id,label:`${c.name} (${c.mobile})`}))]} />
          : <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Client Name *" placeholder="Full name" value={cd.name} onChange={e=>setCd(p=>({...p,name:e.target.value}))} error={errs.name} />
              <Input label="Mobile *" placeholder="10-digit" value={cd.mobile} onChange={e=>setCd(p=>({...p,mobile:e.target.value}))} error={errs.mobile} />
              <Input label="Alternate Mobile" placeholder="Optional" value={cd.alt} onChange={e=>setCd(p=>({...p,alt:e.target.value}))} />
              <Input label="Address *" placeholder="Full address" value={cd.address} onChange={e=>setCd(p=>({...p,address:e.target.value}))} error={errs.address} />
              <div className="md:col-span-2">
                <Input label="Google Map Link" placeholder="https://maps.google.com/..." value={cd.map} onChange={e=>setCd(p=>({...p,map:e.target.value}))} />
              </div>
            </div>
        }
      </div>

      {/* Event Details */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><Calendar className="w-4 h-4 text-purple-600" />Event Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select label="Event Type *" value={fd.event_name} onChange={e=>setFd(p=>({...p,event_name:e.target.value as EventType}))} options={EVENT_TYPES.map(t=>({value:t,label:t}))} />
          {fd.event_name === 'Custom Event' && <Input label="Custom Name *" value={fd.custom_event_name} onChange={e=>setFd(p=>({...p,custom_event_name:e.target.value}))} error={errs.custom} />}
          <Input label="Event Venue *" placeholder="Venue name & address" value={fd.event_venue} onChange={e=>setFd(p=>({...p,event_venue:e.target.value}))} error={errs.venue} />
          <Input label="Event Date *" type="date" value={fd.event_date} onChange={e=>setFd(p=>({...p,event_date:e.target.value}))} error={errs.date} />
          <Input label="Event Time *" type="time" value={fd.event_time} onChange={e=>setFd(p=>({...p,event_time:e.target.value}))} error={errs.time} />
          <Select label="Event Status" value={fd.event_status} onChange={e=>setFd(p=>({...p,event_status:e.target.value as EventStatus}))}
            options={['Upcoming','In Progress','Completed','Cancelled'].map(s=>({value:s,label:s}))} />
        </div>
        <div className="mt-4">
          <Textarea label="Notes" rows={3} placeholder="Additional notes..." value={fd.notes} onChange={e=>setFd(p=>({...p,notes:e.target.value}))} />
        </div>
      </div>

      {/* Financial */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><DollarSign className="w-4 h-4 text-purple-600" />Financial Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Total Price (₹) *" type="number" placeholder="0" value={fd.total_price} onChange={e=>setFd(p=>({...p,total_price:e.target.value}))} error={errs.price} />
          <Input label="Advance Received (₹)" type="number" placeholder="0" value={fd.advance_received} onChange={e=>setFd(p=>({...p,advance_received:e.target.value}))} />
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">Remaining Balance</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">₹{remaining.toLocaleString('en-IN')}</p>
          </div>
          <Select label="Payment Method" value={fd.payment_method} onChange={e=>setFd(p=>({...p,payment_method:e.target.value as PaymentMethod}))}
            options={['Cash','UPI','Bank Transfer','Cheque'].map(s=>({value:s,label:s}))} />
          <Select label="Payment Status" value={fd.payment_status} onChange={e=>setFd(p=>({...p,payment_status:e.target.value as PaymentStatus}))}
            options={['Paid','Partial Paid','Pending'].map(s=>({value:s,label:s}))} />
        </div>
      </div>

      {/* ── Event Photos ── */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Camera className="w-4 h-4 text-purple-600" />Event Photos
          <span className="text-xs font-normal text-gray-400 dark:text-gray-500">(optional)</span>
        </h3>

        {/* Reference Photos */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
              <Image className="w-3.5 h-3.5 text-purple-500" />
              Reference Photos
              {refFiles.length > 0 && <span className="bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400 px-1.5 py-0.5 rounded-full text-[10px] font-bold">{refFiles.length}</span>}
            </p>
            <button
              type="button"
              onClick={() => refInputRef.current?.click()}
              className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 hover:underline font-medium"
            >
              <Upload className="w-3 h-3" />Add Photos
            </button>
          </div>
          <input ref={refInputRef} type="file" accept="image/*" multiple className="hidden"
            onChange={e => handleFileSelect(e.target.files, 'reference')} />

          {refPreviews.length > 0 ? (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {refPreviews.map((src, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 group">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeFile(i, 'reference')}
                    className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => refInputRef.current?.click()}
                className="aspect-square rounded-lg border-2 border-dashed border-purple-300 dark:border-purple-700 flex items-center justify-center hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
              >
                <Plus className="w-5 h-5 text-purple-400" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => refInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 flex flex-col items-center gap-2 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all"
            >
              <Upload className="w-6 h-6 text-gray-400" />
              <p className="text-xs text-gray-500 dark:text-gray-400">Click to upload reference photos</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500">JPG, PNG, WebP · Max 10MB each</p>
            </button>
          )}
        </div>

        {/* Completed Photos */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
              <Image className="w-3.5 h-3.5 text-green-500" />
              Completed Event Photos
              {compFiles.length > 0 && <span className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded-full text-[10px] font-bold">{compFiles.length}</span>}
            </p>
            <button
              type="button"
              onClick={() => compInputRef.current?.click()}
              className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 hover:underline font-medium"
            >
              <Upload className="w-3 h-3" />Add Photos
            </button>
          </div>
          <input ref={compInputRef} type="file" accept="image/*" multiple className="hidden"
            onChange={e => handleFileSelect(e.target.files, 'completed')} />

          {compPreviews.length > 0 ? (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {compPreviews.map((src, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 group">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeFile(i, 'completed')}
                    className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => compInputRef.current?.click()}
                className="aspect-square rounded-lg border-2 border-dashed border-green-300 dark:border-green-700 flex items-center justify-center hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
              >
                <Plus className="w-5 h-5 text-green-400" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => compInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 flex flex-col items-center gap-2 hover:border-green-400 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/10 transition-all"
            >
              <Camera className="w-6 h-6 text-gray-400" />
              <p className="text-xs text-gray-500 dark:text-gray-400">Click to upload completed event photos</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500">JPG, PNG, WebP · Max 10MB each</p>
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
        <Button onClick={save} className="flex-1" disabled={uploading}>
          {uploading ? <><Loader2 className="w-4 h-4 animate-spin" />Uploading Photos...</> : <><Save className="w-4 h-4" />{event ? 'Update Event' : 'Create Event'}</>}
        </Button>
        <Button variant="outline" onClick={onClose}><X className="w-4 h-4" />Cancel</Button>
      </div>
    </div>
  );
}

function EventDetail({ event, onBack, onEdit }: { event: Event; onBack: () => void; onEdit: () => void }) {
  const { payments } = useApp();
  const evPayments = payments.filter(p => p.event_id === event.id);
  const [activeTab, setActiveTab] = useState<'details' | 'photos'>('details');

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
          ← Back to Events
        </button>
        <div className="flex gap-2">
          <a
            href={waLink(event.client?.mobile||'', `Hi ${event.client?.name}, your ${event.event_name} is on ${formatDate(event.event_date)} at ${formatTime(event.event_time)}. Venue: ${event.event_venue}. - MK Brothers`)}
            target="_blank" rel="noreferrer"
            className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />WhatsApp
          </a>
          <Button onClick={onEdit}><Edit className="w-4 h-4" />Edit</Button>
        </div>
      </div>

      {/* Hero banner */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-4 sm:p-6 text-white">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">{event.event_name}</h1>
            <p className="text-purple-200 mt-1 text-sm">{event.client?.name}</p>
          </div>
          <div className="flex flex-col gap-1.5 items-end flex-shrink-0">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColor(event.event_status)}`}>{event.event_status}</span>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${payColor(event.payment_status)}`}>{event.payment_status}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          {[
            ['Date', formatDate(event.event_date)],
            ['Time', formatTime(event.event_time)],
            ['Total', formatCurrency(event.total_price)],
            ['Balance Due', formatCurrency(event.remaining_balance)],
          ].map(([l,v]) => (
            <div key={l}>
              <p className="text-purple-200 text-xs">{l}</p>
              <p className="font-semibold text-sm sm:text-base">{v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('details')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'details'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <User className="w-4 h-4" />Event Details
        </button>
        <button
          onClick={() => setActiveTab('photos')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'photos'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <Camera className="w-4 h-4" />Photos
        </button>
      </div>

      {/* Details Tab */}
      {activeTab === 'details' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Client */}
          <Card className="p-4 sm:p-5">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2 text-sm sm:text-base">
              <User className="w-4 h-4 text-purple-600" />Client Details
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Name</p>
                <p className="font-medium text-gray-900 dark:text-white">{event.client?.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <a href={`tel:${event.client?.mobile}`} className="text-purple-600 dark:text-purple-400 hover:underline text-sm">{event.client?.mobile}</a>
              </div>
              {event.client?.alternate_mobile && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300 text-sm">{event.client.alternate_mobile}</span>
                </div>
              )}
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700 dark:text-gray-300">{event.client?.address}</p>
              </div>
              {event.client?.google_map_link && (
                <a href={event.client.google_map_link} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  <MapPin className="w-4 h-4" />Open in Google Maps
                </a>
              )}
            </div>
          </Card>

          {/* Payment */}
          <Card className="p-4 sm:p-5">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2 text-sm sm:text-base">
              <CreditCard className="w-4 h-4 text-purple-600" />Payment Details
            </h2>
            <div className="space-y-2">
              {[
                ['Total Price',       formatCurrency(event.total_price),       'text-gray-900 dark:text-white'],
                ['Advance Received',  formatCurrency(event.advance_received),  'text-green-600 dark:text-green-400'],
                ['Remaining Balance', formatCurrency(event.remaining_balance), 'text-red-600 dark:text-red-400 font-bold'],
              ].map(([l,v,c]) => (
                <div key={l} className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{l}</span>
                  <span className={`text-sm font-semibold ${c}`}>{v}</span>
                </div>
              ))}
              <div className="flex justify-between py-1.5">
                <span className="text-sm text-gray-500 dark:text-gray-400">Method</span>
                <span className="text-sm text-gray-900 dark:text-white">{event.payment_method}</span>
              </div>
            </div>
            {evPayments.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Payment History</p>
                {evPayments.map(p => (
                  <div key={p.id} className="flex justify-between text-sm py-1">
                    <span className="text-gray-600 dark:text-gray-400">{formatDate(p.payment_date)} · {p.payment_method}</span>
                    <span className="font-medium text-green-600 dark:text-green-400">+{formatCurrency(p.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Venue & Notes */}
          <Card className="p-4 sm:p-5 md:col-span-2">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2 text-sm sm:text-base">
              <MapPin className="w-4 h-4 text-purple-600" />Venue & Notes
            </h2>
            <p className="text-gray-700 dark:text-gray-300 text-sm">{event.event_venue}</p>
            {event.notes && (
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Notes</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{event.notes}</p>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Photos Tab */}
      {activeTab === 'photos' && (
        <Card className="p-4 sm:p-5">
          <EventPhotos eventId={event.id} eventName={event.event_name} />
        </Card>
      )}
    </div>
  );
}

export function Events() {
  const { events, deleteEvent } = useApp();
  const [view, setView] = useState<'list'|'detail'|'form'>('list');
  const [selected, setSelected] = useState<Event|undefined>();
  const [search, setSearch] = useState('');
  const [statusF, setStatusF] = useState('');
  const [payF, setPayF] = useState('');
  const [typeF, setTypeF] = useState('');
  const [delId, setDelId] = useState<string|null>(null);

  const filtered = events.filter(e => {
    const s = search.toLowerCase();
    return (!search || e.client?.name.toLowerCase().includes(s) || e.event_name.toLowerCase().includes(s) || e.event_venue.toLowerCase().includes(s))
      && (!statusF || e.event_status === statusF)
      && (!payF || e.payment_status === payF)
      && (!typeF || e.event_name === typeF);
  });

  if (view === 'detail' && selected) return <EventDetail event={selected} onBack={() => setView('list')} onEdit={() => setView('form')} />;

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">{filtered.length} events</p>
        <Button onClick={() => { setSelected(undefined); setView('form'); }}><Plus className="w-4 h-4" />New Event</Button>
      </div>

      {/* Filters */}
      <Card className="p-3 sm:p-4">
        <div className="space-y-2 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Search events, clients..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-2 sm:contents">
            <Select value={statusF} onChange={e => setStatusF(e.target.value)} options={[{value:'',label:'Status'},{value:'Upcoming',label:'Upcoming'},{value:'In Progress',label:'In Progress'},{value:'Completed',label:'Completed'},{value:'Cancelled',label:'Cancelled'}]} />
            <Select value={payF} onChange={e => setPayF(e.target.value)} options={[{value:'',label:'Payment'},{value:'Paid',label:'Paid'},{value:'Partial Paid',label:'Partial'},{value:'Pending',label:'Pending'}]} />
            <Select value={typeF} onChange={e => setTypeF(e.target.value)} options={[{value:'',label:'Type'},...EVENT_TYPES.map(t=>({value:t,label:t.split(' ')[0]}))]} />
          </div>
        </div>
      </Card>

      {/* Grid — 1 col mobile, 2 col lg */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        {filtered.map(ev => (
          <Card key={ev.id} className="p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{ev.event_name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{ev.client?.name}</p>
              </div>
              <div className="flex flex-col gap-1 items-end">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColor(ev.event_status)}`}>{ev.event_status}</span>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${payColor(ev.payment_status)}`}>{ev.payment_status}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
              <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" />{formatDate(ev.event_date)}</div>
              <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" />{formatTime(ev.event_time)}</div>
              <div className="flex items-center gap-2 col-span-2"><MapPin className="w-3.5 h-3.5 flex-shrink-0" /><span className="truncate">{ev.event_venue}</span></div>
              <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" />{ev.client?.mobile}</div>
              <div className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white"><CreditCard className="w-3.5 h-3.5 text-gray-400" />{formatCurrency(ev.total_price)}</div>
            </div>
            {ev.remaining_balance > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2 mb-3">
                <p className="text-xs text-red-600 dark:text-red-400 font-medium">Balance Due: {formatCurrency(ev.remaining_balance)}</p>
              </div>
            )}
            <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
              <a href={waLink(ev.client?.mobile||'', `Hi ${ev.client?.name}, reminder for your ${ev.event_name} on ${formatDate(ev.event_date)}. - MK Brothers`)} target="_blank" rel="noreferrer"
                className="p-1.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors" title="WhatsApp">
                <MessageCircle className="w-4 h-4" />
              </a>
              {ev.client?.google_map_link && (
                <a href={ev.client.google_map_link} target="_blank" rel="noreferrer"
                  className="p-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors" title="Map">
                  <MapPin className="w-4 h-4" />
                </a>
              )}
              <div className="ml-auto flex gap-2">
                <button onClick={() => { setSelected(ev); setView('detail'); }} className="p-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" title="View"><Eye className="w-4 h-4" /></button>
                <button onClick={() => { setSelected(ev); setView('form'); }} className="p-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors" title="Edit"><Edit className="w-4 h-4" /></button>
                <button onClick={() => setDelId(ev.id)} className="p-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <Card className="p-16 text-center">
          <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">No events found</p>
          <Button onClick={() => { setSelected(undefined); setView('form'); }} className="mt-4"><Plus className="w-4 h-4" />Create Event</Button>
        </Card>
      )}

      {/* Form Modal */}
      <Modal open={view === 'form'} onClose={() => setView('list')} title={selected ? 'Edit Event' : 'Create New Event'} size="xl">
        <EventForm event={selected} onClose={() => { setView('list'); setSelected(undefined); }} />
      </Modal>

      {/* Delete Confirm */}
      {delId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDelId(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Event?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">This cannot be undone.</p>
            <div className="flex gap-3">
              <Button variant="danger" onClick={() => { deleteEvent(delId); setDelId(null); }} className="flex-1">Delete</Button>
              <Button variant="outline" onClick={() => setDelId(null)} className="flex-1">Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
