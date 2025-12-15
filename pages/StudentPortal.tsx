import React, { useState, useEffect } from 'react';
import { User, Booking, BookingStatus, Sport, TimeSlot } from '../types';
import { db } from '../services/db';
import { Button, Card, Badge, Input, Select, Modal } from '../components/UI';
import { Layout } from '../components/Layout';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface StudentPortalProps {
  user: User;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'book' | 'my_bookings' | 'profile'>('info');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>([]); // For availability check
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Booking Form State
  const [selectedSport, setSelectedSport] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [teamName, setTeamName] = useState('');
  const [playerCount, setPlayerCount] = useState(1);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchData();
  }, [user.id]);

  const fetchData = async () => {
    setLoading(true);
    const data = await db.bookings.getAll();
    setAllBookings(data);
    setBookings(data.filter(b => b.studentId === user.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setLoading(false);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (!selectedSport || !selectedDate || !selectedSlot) {
        throw new Error("Please fill in all required fields.");
      }
      
      // Simple validation for past dates
      const today = new Date().toISOString().split('T')[0];
      if (selectedDate < today) {
        throw new Error("Cannot book for past dates.");
      }

      await db.bookings.create({
        studentId: user.id,
        studentName: user.name,
        sportId: selectedSport,
        date: selectedDate,
        slotId: selectedSlot,
        teamName: teamName || 'Individual',
        playerCount: Number(playerCount)
      });
      
      setSuccessMsg("Booking request submitted successfully!");
      // Reset form
      setSelectedSport('');
      setSelectedSlot('');
      setTeamName('');
      setPlayerCount(1);
      fetchData(); // Refresh list
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isSlotAvailable = (date: string, slotId: string) => {
    // A slot is unavailable if it is APPROVED for ANY sport on that ground (assuming single ground shared, or per sport)
    // Assuming 1 ground for simplicity per sport? The requirements say "Prevent double booking of same slot".
    // Let's assume the slot is unique per Sport.
    const conflicting = allBookings.find(b => 
      b.date === date && 
      b.slotId === slotId && 
      b.sportId === selectedSport &&
      b.status === BookingStatus.APPROVED
    );
    return !conflicting;
  };

  const sports = db.meta.sports;
  const timeSlots = db.meta.timeSlots;

  return (
    <Layout user={user} title="Student Portal">
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6">
        
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 flex flex-col space-y-2">
          {['info', 'book', 'my_bookings', 'profile'].map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab as any); setError(''); setSuccessMsg(''); }}
              className={`text-left px-4 py-3 rounded-md font-medium transition-colors ${
                activeTab === tab 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab === 'info' && '🏟️ Ground Info'}
              {tab === 'book' && '📅 Book a Slot'}
              {tab === 'my_bookings' && '📑 My Bookings'}
              {tab === 'profile' && '👤 Profile'}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          
          {/* INFO TAB */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              <Card title="Sports Ground Information">
                <div className="prose text-gray-600">
                  <p>Welcome to the University Sports Complex. We offer state-of-the-art facilities for various sports. Please adhere to the rules.</p>
                  <h4 className="font-bold mt-4">Available Sports</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-2">
                    {sports.map(s => (
                      <div key={s.id} className="flex items-center space-x-2 p-2 border rounded bg-gray-50">
                        <span className="text-2xl">{s.icon}</span>
                        <span>{s.name}</span>
                      </div>
                    ))}
                  </div>
                  <h4 className="font-bold mt-4">Rules & Policies</h4>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Booking must be done at least 24 hours in advance.</li>
                    <li>Bring your Student ID card for verification at the entrance.</li>
                    <li>Respect the equipment and ground staff.</li>
                    <li>No spiked shoes allowed on the synthetic turf.</li>
                  </ul>
                </div>
              </Card>
              
              <Card title="Daily Schedule">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {timeSlots.map(slot => (
                      <div key={slot.id} className="p-3 bg-indigo-50 text-indigo-700 rounded-lg text-center font-medium">
                        {slot.label}
                      </div>
                    ))}
                 </div>
              </Card>
            </div>
          )}

          {/* BOOKING TAB */}
          {activeTab === 'book' && (
            <Card title="Request a Match Booking">
              {successMsg && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{successMsg}</div>}
              {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
              
              <form onSubmit={handleBookingSubmit} className="space-y-4 max-w-lg">
                <Select
                  label="Select Sport"
                  value={selectedSport}
                  onChange={(e) => setSelectedSport(e.target.value)}
                  options={sports.map(s => ({ value: s.id, label: `${s.icon} ${s.name}` }))}
                  required
                />
                
                <Input
                  label="Date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />

                {selectedSport && selectedDate && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Time Slot</label>
                    <div className="grid grid-cols-1 gap-2">
                      {timeSlots.map(slot => {
                        const available = isSlotAvailable(selectedDate, slot.id);
                        return (
                          <button
                            key={slot.id}
                            type="button"
                            onClick={() => available && setSelectedSlot(slot.id)}
                            disabled={!available}
                            className={`p-3 border rounded-md text-left flex justify-between items-center transition-all ${
                              selectedSlot === slot.id
                                ? 'border-indigo-500 ring-1 ring-indigo-500 bg-indigo-50'
                                : available 
                                  ? 'border-gray-300 hover:border-indigo-300' 
                                  : 'border-gray-200 bg-gray-100 opacity-60 cursor-not-allowed'
                            }`}
                          >
                            <span>{slot.label}</span>
                            <Badge status={available ? 'Available' : 'Booked'} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <Input
                  label="Team Name (Optional)"
                  placeholder="e.g. The Avengers"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                />
                
                <Input
                  label="Number of Players"
                  type="number"
                  min={1}
                  max={20}
                  value={playerCount}
                  onChange={(e) => setPlayerCount(Number(e.target.value))}
                />

                <Button type="submit" isLoading={loading} className="w-full">
                  Submit Booking Request
                </Button>
              </form>
            </Card>
          )}

          {/* MY BOOKINGS TAB */}
          {activeTab === 'my_bookings' && (
             <Card title="My Booking History">
               {bookings.length === 0 ? (
                 <p className="text-gray-500 py-4">No bookings found.</p>
               ) : (
                 <div className="overflow-x-auto">
                   <table className="min-w-full divide-y divide-gray-200">
                     <thead className="bg-gray-50">
                       <tr>
                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sport</th>
                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
                       </tr>
                     </thead>
                     <tbody className="bg-white divide-y divide-gray-200">
                       {bookings.map((b) => {
                         const sport = sports.find(s => s.id === b.sportId);
                         const slot = timeSlots.find(t => t.id === b.slotId);
                         return (
                           <tr key={b.id}>
                             <td className="px-6 py-4 whitespace-nowrap">
                               <div className="text-sm font-medium text-gray-900">{sport?.icon} {sport?.name}</div>
                               <div className="text-sm text-gray-500">{b.teamName}</div>
                             </td>
                             <td className="px-6 py-4 whitespace-nowrap">
                               <div className="text-sm text-gray-900">{b.date}</div>
                               <div className="text-sm text-gray-500">{slot?.label}</div>
                             </td>
                             <td className="px-6 py-4 whitespace-nowrap">
                               <Badge status={b.status} />
                             </td>
                             <td className="px-6 py-4">
                               <span className="text-sm text-gray-500">{b.adminRemarks || '-'}</span>
                             </td>
                           </tr>
                         );
                       })}
                     </tbody>
                   </table>
                 </div>
               )}
             </Card>
          )}

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <Card title="My Profile">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <label className="block text-sm font-medium text-gray-500">Student ID</label>
                   <p className="mt-1 text-lg font-semibold text-gray-900">{user.id}</p>
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-500">Full Name</label>
                   <p className="mt-1 text-lg font-semibold text-gray-900">{user.name}</p>
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-500">Department</label>
                   <p className="mt-1 text-lg text-gray-900">{user.department}</p>
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-500">Semester</label>
                   <p className="mt-1 text-lg text-gray-900">{user.semester}</p>
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-500">Email</label>
                   <p className="mt-1 text-lg text-gray-900">{user.email}</p>
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-500">Status</label>
                   <p className="mt-1"><Badge status={user.isBlocked ? 'Blocked' : 'Active'} text={user.isBlocked ? 'Blocked' : 'Active'} /></p>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="text-md font-medium text-gray-900 mb-4">Security</h4>
                <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                  <p className="text-sm text-yellow-800">To change your password or update email, please contact the administration office or use the edit form below (Mock functionality).</p>
                </div>
                <div className="mt-4">
                  <Input label="New Password" type="password" placeholder="********" disabled />
                  <Button disabled>Update Password</Button>
                </div>
              </div>
            </Card>
          )}

        </div>
      </div>
    </Layout>
  );
};