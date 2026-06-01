-- MK Brothers Event Decoration - Supabase Schema
-- Run this in your Supabase SQL editor

-- Clients table
CREATE TABLE clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  alternate_mobile TEXT,
  address TEXT NOT NULL,
  google_map_link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events table
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  custom_event_name TEXT,
  event_venue TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_time TIME NOT NULL,
  event_status TEXT NOT NULL DEFAULT 'Upcoming',
  total_price NUMERIC NOT NULL DEFAULT 0,
  advance_received NUMERIC NOT NULL DEFAULT 0,
  remaining_balance NUMERIC GENERATED ALWAYS AS (total_price - advance_received) STORED,
  payment_method TEXT NOT NULL DEFAULT 'Cash',
  payment_status TEXT NOT NULL DEFAULT 'Pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL,
  payment_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory table
CREATE TABLE inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity_available INTEGER NOT NULL DEFAULT 0,
  quantity_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event Inventory (junction table)
CREATE TABLE event_inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  inventory_id UUID REFERENCES inventory(id) ON DELETE CASCADE,
  quantity_used INTEGER NOT NULL DEFAULT 0,
  pickup_status TEXT NOT NULL DEFAULT 'Pending Pickup',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reminders table
CREATE TABLE reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL,
  reminder_date DATE NOT NULL,
  is_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event Photos table
CREATE TABLE event_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  photo_type TEXT NOT NULL CHECK (photo_type IN ('reference', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_photos ENABLE ROW LEVEL SECURITY;

-- Policies (allow all for authenticated users - admin only)
CREATE POLICY "Allow all for authenticated" ON clients FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated" ON events FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated" ON payments FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated" ON inventory FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated" ON event_inventory FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated" ON reminders FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated" ON event_photos FOR ALL TO authenticated USING (true);
