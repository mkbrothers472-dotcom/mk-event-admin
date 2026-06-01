export type EventType =
  | 'Baby Shower' | 'Birthday Decoration' | 'Welcome Baby'
  | 'Mandap Muhurat' | 'Wedding Decoration' | 'Shrimant Sanskar' | 'Custom Event';

export type EventStatus = 'Upcoming' | 'In Progress' | 'Completed' | 'Cancelled';
export type PaymentStatus = 'Paid' | 'Partial Paid' | 'Pending';
export type PaymentMethod = 'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque';
export type PickupStatus = 'Pending Pickup' | 'Partially Picked' | 'Fully Picked';
export type InventoryCategory =
  | 'Balloons' | 'Backdrops' | 'Flower Decorations' | 'Welcome Boards'
  | 'Chairs' | 'Tables' | 'Lights' | 'Sound System' | 'Custom Items';

export interface Client {
  id: string; name: string; mobile: string;
  alternate_mobile?: string; address: string; google_map_link?: string; created_at: string;
}
export interface Event {
  id: string; client_id: string; client?: Client;
  event_name: EventType; custom_event_name?: string;
  event_venue: string; event_date: string; event_time: string;
  event_status: EventStatus; total_price: number;
  advance_received: number; remaining_balance: number;
  payment_method: PaymentMethod; payment_status: PaymentStatus;
  notes?: string; created_at: string; updated_at: string;
}
export interface Payment {
  id: string; event_id: string; event?: Event;
  amount: number; payment_method: PaymentMethod;
  payment_date: string; notes?: string; created_at: string;
}
export interface InventoryItem {
  id: string; name: string; category: InventoryCategory;
  quantity_available: number; quantity_used: number;
  created_at: string; updated_at: string;
}
export interface EventInventory {
  id: string; event_id: string; inventory_id: string;
  inventory_item?: InventoryItem; quantity_used: number;
  pickup_status: PickupStatus; created_at: string;
}
export interface Reminder {
  id: string; event_id: string; event?: Event;
  reminder_type: string; reminder_date: string;
  is_sent: boolean; created_at: string;
}
