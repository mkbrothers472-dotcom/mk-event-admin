require('dotenv').config();
const mongoose = require('mongoose');
const Client = require('./models/Client');
const Event = require('./models/Event');
const Payment = require('./models/Payment');
const Inventory = require('./models/Inventory');
const EventInventory = require('./models/EventInventory');
const Reminder = require('./models/Reminder');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      Client.deleteMany({}), Event.deleteMany({}), Payment.deleteMany({}),
      Inventory.deleteMany({}), EventInventory.deleteMany({}), Reminder.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    // Seed Clients
    const clients = await Client.insertMany([
      { name:'Priya Sharma',  mobile:'9876543210', alternate_mobile:'9876543211', address:'123, MG Road, Pune, Maharashtra', google_map_link:'https://maps.google.com/?q=MG+Road+Pune' },
      { name:'Rahul Mehta',   mobile:'9123456789', address:'45, Baner Road, Pune, Maharashtra', google_map_link:'https://maps.google.com/?q=Baner+Pune' },
      { name:'Anjali Patel',  mobile:'9988776655', alternate_mobile:'9988776656', address:'78, Koregaon Park, Pune, Maharashtra' },
      { name:'Vikram Singh',  mobile:'9765432100', address:'12, Viman Nagar, Pune, Maharashtra', google_map_link:'https://maps.google.com/?q=Viman+Nagar+Pune' },
      { name:'Sneha Joshi',   mobile:'9654321098', address:'56, Hadapsar, Pune, Maharashtra' },
    ]);
    console.log(`Seeded ${clients.length} clients`);

    // Seed Events
    const events = await Event.insertMany([
      { client_id:clients[0]._id, event_name:'Baby Shower',        event_venue:'Hotel Marriott, Pune',          event_date:'2026-06-01', event_time:'18:00', event_status:'Upcoming',    total_price:25000, advance_received:10000, remaining_balance:15000, payment_method:'UPI',          payment_status:'Partial Paid', notes:'Pink theme, 50 guests' },
      { client_id:clients[1]._id, event_name:'Birthday Decoration', event_venue:"Rahul's Residence, Baner",      event_date:'2026-06-01', event_time:'10:00', event_status:'In Progress', total_price:15000, advance_received:15000, remaining_balance:0,     payment_method:'Cash',         payment_status:'Paid',         notes:'Superhero theme' },
      { client_id:clients[2]._id, event_name:'Wedding Decoration',  event_venue:'Koregaon Park Banquet Hall',    event_date:'2026-06-05', event_time:'09:00', event_status:'Upcoming',    total_price:85000, advance_received:30000, remaining_balance:55000, payment_method:'Bank Transfer', payment_status:'Partial Paid', notes:'Royal theme, 200 guests' },
      { client_id:clients[3]._id, event_name:'Mandap Muhurat',      event_venue:'Viman Nagar Community Hall',    event_date:'2026-05-28', event_time:'07:00', event_status:'Completed',   total_price:35000, advance_received:35000, remaining_balance:0,     payment_method:'UPI',          payment_status:'Paid',         notes:'Traditional setup' },
      { client_id:clients[4]._id, event_name:'Shrimant Sanskar',    event_venue:'Hadapsar Lawn',                 event_date:'2026-06-08', event_time:'11:00', event_status:'Upcoming',    total_price:45000, advance_received:10000, remaining_balance:35000, payment_method:'Cash',         payment_status:'Partial Paid', notes:'Traditional Maharashtrian decor' },
      { client_id:clients[0]._id, event_name:'Welcome Baby',        event_venue:"Priya's Residence",             event_date:'2026-06-12', event_time:'16:00', event_status:'Upcoming',    total_price:18000, advance_received:0,     remaining_balance:18000, payment_method:'UPI',          payment_status:'Pending',      notes:'Blue and white theme' },
    ]);
    console.log(`Seeded ${events.length} events`);

    // Seed Payments
    await Payment.insertMany([
      { event_id:events[0]._id, amount:10000, payment_method:'UPI',          payment_date:'2026-05-20', notes:'Advance payment' },
      { event_id:events[1]._id, amount:15000, payment_method:'Cash',         payment_date:'2026-05-22', notes:'Full payment' },
      { event_id:events[2]._id, amount:30000, payment_method:'Bank Transfer', payment_date:'2026-05-18', notes:'Advance payment' },
      { event_id:events[3]._id, amount:35000, payment_method:'UPI',          payment_date:'2026-05-28', notes:'Full payment' },
      { event_id:events[4]._id, amount:10000, payment_method:'Cash',         payment_date:'2026-05-25', notes:'Advance payment' },
    ]);
    console.log('Seeded payments');

    // Seed Inventory
    const inv = await Inventory.insertMany([
      { name:'Latex Balloons (Pack 100)', category:'Balloons',          quantity_available:500, quantity_used:200 },
      { name:'Foil Balloons',             category:'Balloons',          quantity_available:150, quantity_used:60  },
      { name:'Floral Backdrop 8x8ft',     category:'Backdrops',         quantity_available:10,  quantity_used:4   },
      { name:'LED Backdrop',              category:'Backdrops',         quantity_available:5,   quantity_used:2   },
      { name:'Rose Garlands',             category:'Flower Decorations',quantity_available:100, quantity_used:40  },
      { name:'Marigold Strings',          category:'Flower Decorations',quantity_available:200, quantity_used:80  },
      { name:'Welcome Board (Wooden)',    category:'Welcome Boards',    quantity_available:8,   quantity_used:3   },
      { name:'Banquet Chairs',            category:'Chairs',            quantity_available:200, quantity_used:100 },
      { name:'Round Tables',              category:'Tables',            quantity_available:30,  quantity_used:15  },
      { name:'Fairy Lights (10m)',        category:'Lights',            quantity_available:50,  quantity_used:20  },
      { name:'Spotlights',                category:'Lights',            quantity_available:20,  quantity_used:8   },
      { name:'PA System',                 category:'Sound System',      quantity_available:3,   quantity_used:1   },
    ]);
    console.log(`Seeded ${inv.length} inventory items`);

    // Seed EventInventory
    await EventInventory.insertMany([
      { event_id:events[0]._id, inventory_id:inv[0]._id, quantity_used:100, pickup_status:'Pending Pickup' },
      { event_id:events[0]._id, inventory_id:inv[2]._id, quantity_used:1,   pickup_status:'Pending Pickup' },
      { event_id:events[1]._id, inventory_id:inv[0]._id, quantity_used:50,  pickup_status:'Fully Picked'   },
      { event_id:events[2]._id, inventory_id:inv[3]._id, quantity_used:1,   pickup_status:'Pending Pickup' },
      { event_id:events[3]._id, inventory_id:inv[7]._id, quantity_used:50,  pickup_status:'Fully Picked'   },
    ]);
    console.log('Seeded event inventory');

    // Seed Reminders
    await Reminder.insertMany([
      { event_id:events[0]._id, reminder_type:'1 Day Before Event',          reminder_date:'2026-05-31', is_sent:false },
      { event_id:events[0]._id, reminder_type:'Remaining Payment Reminder',  reminder_date:'2026-05-30', is_sent:false },
      { event_id:events[2]._id, reminder_type:'3 Days Before Event',         reminder_date:'2026-06-02', is_sent:false },
      { event_id:events[4]._id, reminder_type:'Remaining Payment Reminder',  reminder_date:'2026-06-05', is_sent:false },
      { event_id:events[5]._id, reminder_type:'Overdue Payment Reminder',    reminder_date:'2026-06-01', is_sent:false },
    ]);
    console.log('Seeded reminders');

    console.log('\n✅ Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
