import React, { useState, useEffect } from 'react';
import { User, Booking, BookingStatus, Role } from '../types';
import { db } from '../services/db';
import { Button, Card, Badge, Input, Select, Modal } from '../components/UI';
import { Layout } from '../components/Layout';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface AdminPortalProps {
  user: User;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'bookings' | 'schedule' | 'students' | 'reports'>('bookings');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Modal State for Reject
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    setLoading(true);
    const [bData, sData] = await Promise.all([
      db.bookings.getAll(),
      db.users.getAllStudents()
    ]);
    setBookings(bData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setStudents(sData);
    setLoading(false);
  };

  const handleApprove = async (id: string) => {
    // Check if slot is already approved for another booking to prevent double booking
    const booking = bookings.find(b => b.id === id);
    if (booking) {
      const conflict = bookings.find(b => 
        b.id !== id && 
        b.status === BookingStatus.APPROVED &&
        b.date === booking.date &&
        b.slotId === booking.slotId &&
        b.sportId === booking.sportId
      );
      if (conflict) {
        alert("Conflict detected! This slot is already approved for another booking.");
        return;
      }
    }

    await db.bookings.updateStatus(id, BookingStatus.APPROVED);
    refreshData();
  };

  const openRejectModal = (id: string) => {
    setSelectedBookingId(id);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const confirmReject = async () => {
    if (selectedBookingId && rejectReason) {
      await db.bookings.updateStatus(selectedBookingId, BookingStatus.REJECTED, rejectReason);
      setRejectModalOpen(false);
      refreshData();
    }
  };

  const handleToggleBlock = async (id: string) => {
    await db.users.toggleBlock(id);
    refreshData();
  };

  const sports = db.meta.sports;
  const timeSlots = db.meta.timeSlots;

  // Filtered Bookings
  const filteredBookings = bookings.filter(b => filterStatus === 'ALL' || b.status === filterStatus);

  // Reports Data
  const bookingsBySport = sports.map(s => ({
    name: s.name,
    count: bookings.filter(b => b.sportId === s.id).length
  }));
  
  const statusData = [
    { name: 'Approved', value: bookings.filter(b => b.status === BookingStatus.APPROVED).length, color: '#10B981' },
    { name: 'Rejected', value: bookings.filter(b => b.status === BookingStatus.REJECTED).length, color: '#EF4444' },
    { name: 'Pending', value: bookings.filter(b => b.status === BookingStatus.PENDING).length, color: '#F59E0B' },
  ];

  return (
    <Layout user={user} title="Admin Dashboard">
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 flex flex-col space-y-2">
          {['bookings', 'schedule', 'students', 'reports'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`text-left px-4 py-3 rounded-md font-medium transition-colors ${
                activeTab === tab 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab === 'bookings' && '📅 Manage Bookings'}
              {tab === 'schedule' && '⚙️ Schedule & Ground'}
              {tab === 'students' && '🎓 Manage Students'}
              {tab === 'reports' && '📊 Reports'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1">
          
          {/* BOOKINGS MANAGEMENT */}
          {activeTab === 'bookings' && (
            <Card title="Booking Requests">
              <div className="flex justify-between items-center mb-4">
                 <div className="flex items-center space-x-2">
                   <span className="text-sm text-gray-600">Filter by Status:</span>
                   <select 
                    className="border-gray-300 border rounded-md text-sm p-1" 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                   >
                     <option value="ALL">All</option>
                     <option value="PENDING">Pending</option>
                     <option value="APPROVED">Approved</option>
                     <option value="REJECTED">Rejected</option>
                   </select>
                 </div>
                 <Button variant="outline" onClick={refreshData} disabled={loading}>Refresh</Button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slot</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredBookings.map((b) => {
                      const sport = sports.find(s => s.id === b.sportId);
                      const slot = timeSlots.find(t => t.id === b.slotId);
                      return (
                        <tr key={b.id}>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{b.studentName}</div>
                            <div className="text-xs text-gray-500">{b.studentId}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{sport?.icon} {sport?.name}</div>
                            <div className="text-xs text-gray-500">{b.teamName || 'Individual'} ({b.playerCount} players)</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{b.date}</div>
                            <div className="text-xs text-gray-500">{slot?.label}</div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge status={b.status} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            {b.status === BookingStatus.PENDING && (
                              <>
                                <button onClick={() => handleApprove(b.id)} className="text-green-600 hover:text-green-900">Approve</button>
                                <button onClick={() => openRejectModal(b.id)} className="text-red-600 hover:text-red-900">Reject</button>
                              </>
                            )}
                            {b.status === BookingStatus.REJECTED && (
                              <span className="text-gray-400 cursor-help" title={b.adminRemarks}>View Reason</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {filteredBookings.length === 0 && (
                      <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">No bookings found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* SCHEDULE */}
          {activeTab === 'schedule' && (
            <div className="space-y-6">
              <Card title="Available Sports">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {sports.map(s => (
                    <div key={s.id} className="border p-4 rounded-lg text-center bg-gray-50">
                      <div className="text-3xl mb-2">{s.icon}</div>
                      <div className="font-medium">{s.name}</div>
                    </div>
                  ))}
                  <div className="border p-4 rounded-lg text-center border-dashed border-gray-300 flex flex-col justify-center items-center text-gray-400 cursor-not-allowed">
                    <span className="text-2xl">+</span>
                    <span>Add Sport</span>
                  </div>
                </div>
              </Card>

              <Card title="Time Slots Configuration">
                 <div className="space-y-2">
                   {timeSlots.map(t => (
                     <div key={t.id} className="flex justify-between items-center p-3 bg-white border rounded">
                       <span>{t.label}</span>
                       <span className="text-green-600 text-sm">Active</span>
                     </div>
                   ))}
                 </div>
              </Card>
            </div>
          )}

          {/* STUDENTS */}
          {activeTab === 'students' && (
            <Card title="Registered Students">
               <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dept/Sem</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map(s => (
                      <tr key={s.id}>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{s.id}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{s.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{s.department} - {s.semester}</td>
                        <td className="px-6 py-4">
                          <Badge status={s.isBlocked ? 'Blocked' : 'Active'} text={s.isBlocked ? 'Blocked' : 'Active'} />
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          <button 
                            onClick={() => handleToggleBlock(s.id)}
                            className={s.isBlocked ? "text-green-600 hover:text-green-900" : "text-red-600 hover:text-red-900"}
                          >
                            {s.isBlocked ? 'Unblock' : 'Block'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* REPORTS */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="Bookings by Sport">
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={bookingsBySport}>
                        <XAxis dataKey="name" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card title="Booking Status Distribution">
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-indigo-500">
                  <div className="text-gray-500 text-sm">Total Bookings</div>
                  <div className="text-2xl font-bold">{bookings.length}</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
                  <div className="text-gray-500 text-sm">Approved</div>
                  <div className="text-2xl font-bold">{bookings.filter(b => b.status === BookingStatus.APPROVED).length}</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
                  <div className="text-gray-500 text-sm">Pending Action</div>
                  <div className="text-2xl font-bold">{bookings.filter(b => b.status === BookingStatus.PENDING).length}</div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Reject Modal */}
      <Modal 
        isOpen={rejectModalOpen} 
        onClose={() => setRejectModalOpen(false)} 
        title="Reject Booking Request"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Please provide a reason for rejecting this booking. The student will be notified.</p>
          <Input 
            label="Reason" 
            value={rejectReason} 
            onChange={(e) => setRejectReason(e.target.value)} 
            placeholder="e.g., Ground maintenance, Slot double booked..."
            autoFocus
          />
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setRejectModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={confirmReject}>Reject Booking</Button>
          </div>
        </div>
      </Modal>

    </Layout>
  );
};