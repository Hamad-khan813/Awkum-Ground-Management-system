export enum Role {
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN'
}

export enum BookingStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface User {
  id: string; // Student ID or Admin Username
  name: string;
  email: string;
  role: Role;
  password?: string; // In a real app, never store plain text
  department?: string; // Student only
  semester?: string; // Student only
  isBlocked?: boolean;
}

export interface Sport {
  id: string;
  name: string;
  icon: string; // Emoji or icon name
}

export interface TimeSlot {
  id: string;
  label: string; // e.g., "09:00 AM - 10:00 AM"
  startHour: number;
}

export interface Booking {
  id: string;
  studentId: string;
  studentName: string; // Denormalized for easier display
  sportId: string;
  date: string; // YYYY-MM-DD
  slotId: string;
  status: BookingStatus;
  teamName?: string;
  playerCount: number;
  adminRemarks?: string;
  createdAt: string;
}

export interface GroundSettings {
  isMaintenanceMode: boolean;
  blockedDates: string[];
}