const {
  mockClients,
  mockEvents,
  mockPayments,
  mockInventory,
  mockEventInventory,
  mockReminders,
} = require('./mock-data');




// In offline mode, backend only needs to mimic the shapes returned by Mongo routes.
// We keep mutable copies so POST/PUT/DELETE can update state for the lifetime of the process.
let clients = [...mockClients];
let events = [...mockEvents];
let payments = [...mockPayments];
let inventory = [...mockInventory];
let eventInventory = [...mockEventInventory];
let reminders = [...mockReminders];

const asId = (x) => String(x);

const db = {
  getClients: () => clients,
  getClientById: (id) => clients.find((c) => asId(c.id) === asId(id)),
  upsertClient: (client) => {
    const id = client.id ? asId(client.id) : String(Date.now());
    const now = new Date().toISOString();
    const next = { ...client, id, created_at: client.created_at ?? now, updated_at: client.updated_at ?? now };
    const idx = clients.findIndex((c) => asId(c.id) === asId(id));
    if (idx >= 0) clients[idx] = next;
    else clients = [next, ...clients];
    return next;
  },
  deleteClient: (id) => {
    const before = clients.length;
    clients = clients.filter((c) => asId(c.id) !== asId(id));
    return clients.length !== before;
  },

  getEvents: () => events,
  getEventById: (id) => events.find((e) => asId(e.id) === asId(id)),
  upsertEvent: (event) => {
    const id = event.id ? asId(event.id) : String(Date.now());
    const now = new Date().toISOString();
    const next = { ...event, id, created_at: event.created_at ?? now, updated_at: event.updated_at ?? now };
    const idx = events.findIndex((e) => asId(e.id) === asId(id));
    if (idx >= 0) events[idx] = next;
    else events = [next, ...events];
    return next;
  },
  deleteEvent: (id) => {
    const before = events.length;
    events = events.filter((e) => asId(e.id) !== asId(id));
    // Also cascade delete payments/reminders for simplicity
    payments = payments.filter((p) => asId(p.event_id) !== asId(id));
    reminders = reminders.filter((r) => asId(r.event_id) !== asId(id));
    eventInventory = eventInventory.filter((ei) => asId(ei.event_id) !== asId(id));
    return events.length !== before;
  },

  getPayments: () => payments,
  getPaymentById: (id) => payments.find((p) => asId(p.id) === asId(id)),
  createPayment: (payment) => {
    const id = payment.id ? asId(payment.id) : String(Date.now());
    const next = { ...payment, id };
    payments = [next, ...payments];

    // Mimic real payments route: update event advance_received/payment_status/balance
    if (next.event_id) {
      const evIdx = events.findIndex((e) => asId(e.id) === asId(next.event_id));
      if (evIdx >= 0) {
        const ev = events[evIdx];
        const amount = Number(next.amount ?? 0);
        const advanceReceived = Number(ev.advance_received ?? 0) + amount;
        const remaining = Number(ev.total_price ?? 0) - advanceReceived;
        const updated = {
          ...ev,
          advance_received: advanceReceived,
          remaining_balance: remaining <= 0 ? 0 : remaining,
          payment_status:
            remaining <= 0 ? 'Paid' : advanceReceived > 0 ? 'Partial Paid' : 'Pending',
        };
        events[evIdx] = updated;
      }
    }

    // Ensure payment.event shape exists like the frontend expects
    const ev = next.event_id ? db.getEventById(next.event_id) : undefined;
    return { ...next, event: ev };
  },
  deletePayment: (id) => {
    const before = payments.length;
    payments = payments.filter((p) => asId(p.id) !== asId(id));
    return payments.length !== before;
  },

  getInventory: () => inventory,
  upsertInventoryItem: (item) => {
    const id = item.id ? asId(item.id) : String(Date.now());
    const next = { ...item, id };
    const idx = inventory.findIndex((i) => asId(i.id) === asId(id));
    if (idx >= 0) inventory[idx] = next;
    else inventory = [next, ...inventory];
    return next;
  },
  deleteInventoryItem: (id) => {
    const before = inventory.length;
    inventory = inventory.filter((i) => asId(i.id) !== asId(id));
    // Also cascade remove from event inventory
    eventInventory = eventInventory.filter((ei) => asId(ei.inventory_id) !== asId(id));
    return inventory.length !== before;
  },

  getEventInventory: (eventId) => {
    if (eventId) return eventInventory.filter((x) => asId(x.event_id) === asId(eventId));
    return eventInventory;
  },
  upsertEventInventory: (row) => {
    const id = row.id ? asId(row.id) : String(Date.now());
    const next = { ...row, id };
    const idx = eventInventory.findIndex((x) => asId(x.id) === asId(id));
    if (idx >= 0) eventInventory[idx] = next;
    else eventInventory = [next, ...eventInventory];
    return next;
  },
  deleteEventInventoryRow: (id) => {
    const before = eventInventory.length;
    eventInventory = eventInventory.filter((x) => asId(x.id) !== asId(id));
    return eventInventory.length !== before;
  },

  getReminders: () => reminders,
  upsertReminder: (reminder) => {
    const id = reminder.id ? asId(reminder.id) : String(Date.now());
    const next = { ...reminder, id };
    const idx = reminders.findIndex((r) => asId(r.id) === asId(id));
    if (idx >= 0) reminders[idx] = next;
    else reminders = [next, ...reminders];
    return next;
  },
  deleteReminder: (id) => {
    const before = reminders.length;
    reminders = reminders.filter((r) => asId(r.id) !== asId(id));
    return reminders.length !== before;
  },
};

module.exports = db;

