import { Sport, TimeSlot, User, Role } from './types';

export const INITIAL_SPORTS: Sport[] = [
  { id: 'cricket', name: 'Cricket', icon: '🏏' },
  { id: 'football', name: 'Football', icon: '⚽' },
  { id: 'futsal', name: 'Futsal', icon: '🥅' },
  { id: 'basketball', name: 'Basketball', icon: '🏀' },
  { id: 'tennis', name: 'Tennis', icon: '🎾' },
  { id: 'volleyball', name: 'Volleyball', icon: '🏐' },
];

export const INITIAL_TIME_SLOTS: TimeSlot[] = [
  { id: 'slot1', label: '08:00 AM - 09:30 AM', startHour: 8 },
  { id: 'slot2', label: '09:30 AM - 11:00 AM', startHour: 9.5 },
  { id: 'slot3', label: '11:00 AM - 12:30 PM', startHour: 11 },
  { id: 'slot4', label: '02:00 PM - 03:30 PM', startHour: 14 },
  { id: 'slot5', label: '03:30 PM - 05:00 PM', startHour: 15.5 },
  { id: 'slot6', label: '05:00 PM - 06:30 PM', startHour: 17 },
];

export const ADMIN_USER: User = {
  id: 'admin',
  name: 'Sports Officer',
  email: 'admin@uni.edu',
  role: Role.ADMIN,
  password: 'admin' // Simple for demo
};

export const MOCK_STUDENTS: User[] = [
  {
    id: 'S101',
    name: 'John Doe',
    email: 'john@uni.edu',
    role: Role.STUDENT,
    password: 'password',
    department: 'Computer Science',
    semester: '6th'
  },
  {
    id: 'S102',
    name: 'Jane Smith',
    email: 'jane@uni.edu',
    role: Role.STUDENT,
    password: 'password',
    department: 'Business Admin',
    semester: '4th'
  }
];