import { supabase } from '@/lib/supabaseClient';
import type { Reservation } from '@/lib/types';

export interface CreateReservationInput {
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  reservation_date: string;
  reservation_time: string;
  guests_count: number;
  special_requests?: string;
  payment_status?: 'pending' | 'paid';
  payment_amount?: number;
  customer_id?: string | null;
  floor_number?: number;
  selected_seats?: string[];
}

export interface ReservationService {
  createReservation(input: CreateReservationInput): Promise<Reservation>;
  getReservationById(id: string): Promise<Reservation>;
  getReservationByCode(code: string): Promise<Reservation>;
  getAllReservations(): Promise<Reservation[]>;
  updateReservationStatus(id: string, status: 'confirmed' | 'cancelled' | 'attended'): Promise<void>;
  updatePaymentStatus(id: string, paymentStatus: 'pending' | 'paid'): Promise<void>;
  getReservationsByCodes(codes: string[]): Promise<Reservation[]>;
}

const LOCAL_DB_KEY = 'royal_cafe_reservations_db';

const DEFAULT_MOCK_RESERVATIONS: Reservation[] = [
  {
    id: "mock-res-1",
    guest_name: "Alexander Mercer",
    guest_email: "alexander@mercer.com",
    guest_phone: "+91 98765 43210",
    reservation_date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    reservation_time: "19:30",
    guests_count: 4,
    special_requests: "Window seat with view if possible, celebrating anniversary.",
    payment_status: "paid",
    payment_amount: 0.00,
    verification_code: "RRC-ALEX99",
    status: "confirmed",
    created_at: new Date().toISOString(),
  },
  {
    id: "mock-res-2",
    guest_name: "Evelyn Sterling",
    guest_email: "evelyn@sterling.com",
    guest_phone: "+91 87654 32109",
    reservation_date: new Date(Date.now() + 172800000).toISOString().split('T')[0], // In 2 days
    reservation_time: "20:00",
    guests_count: 2,
    special_requests: "Gluten-free menu options required.",
    payment_status: "paid",
    payment_amount: 0.00,
    verification_code: "RRC-EVEL88",
    status: "confirmed",
    created_at: new Date().toISOString(),
  },
  {
    id: "mock-res-3",
    guest_name: "Marcus Vance",
    guest_email: "marcus@vance.com",
    guest_phone: "+91 76543 21098",
    reservation_date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
    reservation_time: "18:00",
    guests_count: 6,
    special_requests: "Wheelchair access required.",
    payment_status: "paid",
    payment_amount: 0.00,
    verification_code: "RRC-MARC77",
    status: "attended",
    created_at: new Date().toISOString(),
  }
];

function getLocalReservations(): Reservation[] {
  const stored = localStorage.getItem(LOCAL_DB_KEY);
  if (!stored) {
    localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(DEFAULT_MOCK_RESERVATIONS));
    return DEFAULT_MOCK_RESERVATIONS;
  }
  return JSON.parse(stored);
}

function saveLocalReservations(list: Reservation[]) {
  localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(list));
}

function addLocalReservation(res: Reservation) {
  const list = getLocalReservations();
  list.push(res);
  saveLocalReservations(list);
}

function updateLocalReservation(id: string, updates: Partial<Reservation>) {
  const list = getLocalReservations();
  const updated = list.map((res) => (res.id === id ? { ...res, ...updates } : res));
  saveLocalReservations(updated);
}

export const reservationService: ReservationService = {
  async createReservation(input) {
    // Generate a unique 6-digit verification code
    const randPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    const verificationCode = `RRC-${randPart}`;

    const reservationPayload = {
      guest_name: input.guest_name,
      guest_email: input.guest_email,
      guest_phone: input.guest_phone,
      reservation_date: input.reservation_date,
      reservation_time: input.reservation_time,
      guests_count: input.guests_count,
      special_requests: input.special_requests ?? null,
      payment_status: input.payment_status ?? 'pending',
      payment_amount: input.payment_amount ?? 0.00,
      verification_code: verificationCode,
      status: 'confirmed' as const,
      customer_id: input.customer_id ?? null,
      floor_number: input.floor_number ?? 1,
      selected_seats: input.selected_seats ?? [],
    };

    try {
      const { data, error } = await supabase
        .from('reservations')
        .insert(reservationPayload)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as Reservation;
    } catch (dbError) {
      console.warn('Database error or missing schema cache. Falling back to local storage reservation.', dbError);
      
      // Create a mocked full reservation object
      const localReservation: Reservation = {
        id: crypto.randomUUID(),
        ...reservationPayload,
        created_at: new Date().toISOString(),
      };

      addLocalReservation(localReservation);
      return localReservation;
    }
  },

  async getReservationById(id) {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw new Error(error.message);
      return data as Reservation;
    } catch (dbError) {
      console.warn('Database fetch failed. Checking local storage reservations.', dbError);
      const local = getLocalReservations().find((r) => r.id === id);
      if (local) return local;
      throw dbError;
    }
  },

  async getReservationByCode(code) {
    const formattedCode = code.toUpperCase().trim();
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('verification_code', formattedCode)
        .single();

      if (error) throw new Error(error.message);
      return data as Reservation;
    } catch (dbError) {
      console.warn('Database fetch failed. Checking local storage reservations.', dbError);
      const local = getLocalReservations().find((r) => r.verification_code === formattedCode);
      if (local) return local;
      throw dbError;
    }
  },

  async getAllReservations() {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('reservation_date', { ascending: true })
        .order('reservation_time', { ascending: true });

      if (error) throw new Error(error.message);
      
      // Merge local reservations if they exist to keep them all in sync in Admin view
      const localList = getLocalReservations();
      const combined = [...(data as Reservation[])];
      localList.forEach((local) => {
        if (!combined.some((dbRes) => dbRes.id === local.id || dbRes.verification_code === local.verification_code)) {
          combined.push(local);
        }
      });
      
      // Sort combined list
      return combined.sort((a, b) => {
        const dateDiff = new Date(a.reservation_date).getTime() - new Date(b.reservation_date).getTime();
        if (dateDiff !== 0) return dateDiff;
        return a.reservation_time.localeCompare(b.reservation_time);
      });
    } catch (dbError) {
      console.warn('Database fetch failed. Loading local storage reservations.', dbError);
      return getLocalReservations();
    }
  },

  async updateReservationStatus(id, status) {
    updateLocalReservation(id, { status });

    try {
      const { error } = await supabase
        .from('reservations')
        .update({ status })
        .eq('id', id);

      if (error) throw new Error(error.message);
    } catch (dbError) {
      console.warn('Database update failed. Updated in local storage only.', dbError);
    }
  },

  async updatePaymentStatus(id, paymentStatus) {
    updateLocalReservation(id, { payment_status: paymentStatus });

    try {
      const { error } = await supabase
        .from('reservations')
        .update({ payment_status: paymentStatus })
        .eq('id', id);

      if (error) throw new Error(error.message);
    } catch (dbError) {
      console.warn('Database update failed. Updated in local storage only.', dbError);
    }
  },

  async getReservationsByCodes(codes) {
    if (codes.length === 0) return [];
    
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .in('verification_code', codes)
        .order('reservation_date', { ascending: false });

      if (error) throw new Error(error.message);
      
      const localList = getLocalReservations().filter((r) => codes.includes(r.verification_code));
      const combined = [...(data as Reservation[])];
      localList.forEach((local) => {
        if (!combined.some((dbRes) => dbRes.id === local.id)) {
          combined.push(local);
        }
      });
      return combined.sort((a, b) => new Date(b.reservation_date).getTime() - new Date(a.reservation_date).getTime());
    } catch (dbError) {
      console.warn('Database fetch failed. Querying local storage reservations.', dbError);
      return getLocalReservations()
        .filter((r) => codes.includes(r.verification_code))
        .sort((a, b) => new Date(b.reservation_date).getTime() - new Date(a.reservation_date).getTime());
    }
  },
};
