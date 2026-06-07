const express    = require('express');
const router     = express.Router();
const { google } = require('googleapis');
const Client     = require('../models/Client');
const Event      = require('../models/Event');
const Payment    = require('../models/Payment');
const Inventory  = require('../models/Inventory');

const SHEET_ID = '1k1NT10pqvwn-rKN0rDUN7gzj-pQmtTB-N6b23DiOeAk';

// Build Google auth from env
function getAuth() {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON || '{}');
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

// Clear a sheet tab and write rows
async function writeSheet(sheets, tabName, headers, rows) {
  // Ensure tab exists (try create, ignore if exists)
  try {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      resource: {
        requests: [{
          addSheet: { properties: { title: tabName } }
        }]
      }
    });
  } catch {}

  const range = `${tabName}!A1`;
  const values = [headers, ...rows];

  // Clear then write
  await sheets.spreadsheets.values.clear({
    spreadsheetId: SHEET_ID,
    range: `${tabName}!A:Z`,
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range,
    valueInputOption: 'USER_ENTERED',
    resource: { values },
  });
}

// POST /api/backup/sync — sync all data to Google Sheets
router.post('/sync', async (req, res) => {
  try {
    const auth   = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    const [clients, events, payments, inventory] = await Promise.all([
      Client.find().lean(),
      Event.find().populate('client_id').lean(),
      Payment.find().populate('event_id').lean(),
      Inventory.find().lean(),
    ]);

    const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    // ── Clients ──
    await writeSheet(sheets, 'Clients',
      ['Name', 'Mobile', 'Alt Mobile', 'Address', 'Map Link', 'Created At'],
      clients.map(c => [
        c.name, c.mobile, c.alternate_mobile || '', c.address,
        c.google_map_link || '', new Date(c.createdAt).toLocaleDateString('en-IN'),
      ])
    );

    // ── Events ──
    await writeSheet(sheets, 'Events',
      ['Event Name', 'Client', 'Mobile', 'Venue', 'Date', 'Time', 'Status',
       'Total (₹)', 'Advance (₹)', 'Balance (₹)', 'Payment Status', 'Method', 'Notes'],
      events.map(e => [
        e.event_name,
        e.client_id?.name || '',
        e.client_id?.mobile || '',
        e.event_venue,
        e.event_date,
        e.event_time,
        e.event_status,
        e.total_price,
        e.advance_received,
        e.remaining_balance,
        e.payment_status,
        e.payment_method,
        e.notes || '',
      ])
    );

    // ── Payments ──
    await writeSheet(sheets, 'Payments',
      ['Date', 'Client', 'Event', 'Amount (₹)', 'Method', 'Notes'],
      payments.map(p => [
        p.payment_date,
        p.event_id?.client_id?.name || '',
        p.event_id?.event_name || '',
        p.amount,
        p.payment_method,
        p.notes || '',
      ])
    );

    // ── Inventory ──
    await writeSheet(sheets, 'Inventory',
      ['Name', 'Category', 'Available', 'In Use', 'Free'],
      inventory.map(i => [
        i.name, i.category,
        i.quantity_available,
        i.quantity_used,
        i.quantity_available - i.quantity_used,
      ])
    );

    // ── Summary tab ──
    const totalRevenue = payments.reduce((s, p) => s + p.amount, 0);
    const totalPending = events.reduce((s, e) => s + e.remaining_balance, 0);
    await writeSheet(sheets, 'Summary',
      ['Metric', 'Value'],
      [
        ['Last Backup', now],
        ['Total Clients', clients.length],
        ['Total Events', events.length],
        ['Completed Events', events.filter(e => e.event_status === 'Completed').length],
        ['Upcoming Events', events.filter(e => e.event_status === 'Upcoming').length],
        ['Total Revenue (₹)', totalRevenue],
        ['Pending Amount (₹)', totalPending],
        ['Total Payments', payments.length],
        ['Inventory Items', inventory.length],
      ]
    );

    res.json({
      success: true,
      message: `Backup synced at ${now}`,
      counts: {
        clients: clients.length,
        events: events.length,
        payments: payments.length,
        inventory: inventory.length,
      }
    });

  } catch (err) {
    console.error('Backup error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
