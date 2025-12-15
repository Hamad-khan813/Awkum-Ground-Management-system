import { User, Booking, BookingStatus, GroundSettings, Role } from '../types';
import { MOCK_STUDENTS, ADMIN_USER, INITIAL_SPORTS, INITIAL_TIME_SLOTS } from '../constants';

// Keys for LocalStorage
const KEYS = {
  USERS: 'unisports_users',
  BOOKINGS: 'unisports_bookings',
  SETTINGS: 'unisports_settings',
  SESSION: 'unisports_session'
};

// Initialize DB if empty
const initDB = () => {
  if (!localStorage.getItem(KEYS.USERS)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify([...MOCK_STUDENTS, ADMIN_USER]));
  }
  if (!localStorage.getItem(KEYS.BOOKINGS)) {
    localStorage.setItem(KEYS.BOOKINGS, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.SETTINGS)) {
    const defaultSettings: GroundSettings = { isMaintenanceMode: false, blockedDates: [] };
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(defaultSettings));
  }
};

initDB();

// Helper to simulate network delay
const delay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));

export const db = {
  auth: {
    login: async (id: string, password: string): Promise<User | null> => {
      await delay();
      const users: User[] = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
      const user = users.find(u => u.id === id && u.password === password);
      if (user) {
        if (user.isBlocked) throw new Error("Account is blocked by admin.");
        localStorage.setItem(KEYS.SESSION, JSON.stringify(user));
        return user;
      }
      return null;
    },
    register: async (user: User): Promise<User> => {
      await delay();
      const users: User[] = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
      if (users.find(u => u.id === user.id)) {
        throw new Error("Student ID already registered.");
      }
      const newUser = { ...user, role: Role.STUDENT, isBlocked: false };
      users.push(newUser);
      localStorage.setItem(KEYS.USERS, JSON.stringify(users));
      return newUser;
    },
    getSession: (): User | null => {
      const sess = localStorage.getItem(KEYS.SESSION);
      return sess ? JSON.parse(sess) : null;
    },
    logout: () => {
      localStorage.removeItem(KEYS.SESSION);
    }
  },
  users: {
    getAllStudents: async (): Promise<User[]> => {
      await delay();
      const users: User[] = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
      return users.filter(u => u.role === Role.STUDENT);
    },
    toggleBlock: async (studentId: string): Promise<void> => {
      await delay();
      const users: User[] = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
      const idx = users.findIndex(u => u.id === studentId);
      if (idx !== -1) {
        users[idx].isBlocked = !users[idx].isBlocked;
        localStorage.setItem(KEYS.USERS, JSON.stringify(users));
      }
    }
  },
  bookings: {
    getAll: async (): Promise<Booking[]> => {
      await delay();
      return JSON.parse(localStorage.getItem(KEYS.BOOKINGS) || '[]');
    },
    create: async (booking: Omit<Booking, 'id' | 'createdAt' | 'status'>): Promise<Booking> => {
      await delay();
      const bookings: Booking[] = JSON.parse(localStorage.getItem(KEYS.BOOKINGS) || '[]');
      
      // Check for double booking (Same Date, Same Slot, Approved Status)
      const conflict = bookings.find(b => 
        b.date === booking.date && 
        b.slotId === booking.slotId && 
        b.status === BookingStatus.APPROVED
      );

      if (conflict) {
        throw new Error("This slot is already booked and approved.");
      }

      const newBooking: Booking = {
        ...booking,
        id: Math.random().toString(36).substr(2, 9),
        status: BookingStatus.PENDING,
        createdAt: new Date().toISOString()
      };
      bookings.push(newBooking);
      localStorage.setItem(KEYS.BOOKINGS, JSON.stringify(bookings));
      return newBooking;
    },
    updateStatus: async (bookingId: string, status: BookingStatus, remarks?: string): Promise<void> => {
      await delay();
      const bookings: Booking[] = JSON.parse(localStorage.getItem(KEYS.BOOKINGS) || '[]');
      const idx = bookings.findIndex(b => b.id === bookingId);
      if (idx !== -1) {
        bookings[idx].status = status;
        if (remarks) bookings[idx].adminRemarks = remarks;
        localStorage.setItem(KEYS.BOOKINGS, JSON.stringify(bookings));
      }
    }
  },
  meta: {
    sports: INITIAL_SPORTS,
    timeSlots: INITIAL_TIME_SLOTS
  }
};