export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  city: string;
  category: 'concert' | 'music' | 'art' | 'private' | 'exhibition';
  imageUrl: string;
  price: number;
  organizerId: string;
  ticketsAvailable: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'user' | 'organizer' | 'admin';
  subscriptionStatus: 'none' | 'active' | 'canceled';
  stripeCustomerId?: string;
}

export interface Ticket {
  id: string;
  eventId: string;
  userId: string;
  purchaseDate: string;
  status: 'valid' | 'used' | 'refunded';
  qrCode: string;
}
