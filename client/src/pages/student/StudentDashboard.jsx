import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap,
  ClipboardList,
  Clock3,
  Wrench,
  CheckCircle2,
  AlertOctagon,
  Search,
  ExternalLink,
  Camera,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { TicketStatusBadge } from '../../utils/statusBadges';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    underRepair: 0,
    resolved: 0,
    expired: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const fetchStudentTickets = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      const res = await api.get('/tickets/my-tickets');
      setTickets(res.data.data || []);
      if (res.data.stats) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to load student tickets:', err);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStudentTickets();

    // Live auto-refresh every 5 seconds
    const interval = setInterval(fetchStudentTickets, 5000);
    const onFocus = () => fetchStudentTickets();
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  // Filter tickets by search and status
  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.ticketId.toLowerCase().includes(search.toLowerCase()) ||
      t.equipmentId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.labId?.labName?.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase());

    if (statusFilter === 'ALL') return matchesSearch;
    if (statusFilter === 'PENDING') return matchesSearch && t.ticketStatus === 'Open';
    if (statusFilter === 'IN_REPAIR')
      return matchesSearch && (t.ticketStatus === 'Under Review' || t.ticketStatus === 'In Repair');
    if (statusFilter === 'RESOLVED') return matchesSearch && t.ticketStatus === 'Resolved';
    if (statusFilter === 'EXPIRED') return matchesSearch && t.ticketStatus === 'Expired';
    return matchesSearch;
  });

  return (
    <div className="p-5 sm:p-8 max-w-7xl mx-auto w-full space-y-7">
      
      {/* Header */}
      <PageHeader
        badge="Student Portal"
        badgeIcon={GraduationCap}
        title={`Welcome, ${user?.name || 'Student'}`}
        description={`Roll Number: ${user?.rollNumber || 'N/A'} • Registered Email: ${user?.email || 'N/A'}. Track your reported equipment tickets and repair progress.`}
        actions={
          <button
            type="button"
            onClick={() => fetchStudentTickets(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-[#172033] border border-[#CBD5E1] rounded-xl text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#087A35] ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Syncing...' : 'Sync Tickets'}
          </button>
        }
      />

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Total Reports"
          value={stats.total}
          subtitle="Submitted tickets"
          icon={ClipboardList}
          color="green"
        />
        <StatCard
          title="Open / Pending"
          value={stats.pending}
          subtitle="Under technician queue"
          icon={Clock3}
          color="amber"
        />
        <StatCard
          title="In Repair"
          value={stats.underRepair}
          subtitle="Currently serviced"
          icon={Wrench}
          color="blue"
        />
        <StatCard
          title="Resolved"
          value={stats.resolved}
          subtitle="Repairs verified"
          icon={CheckCircle2}
          color="green"
        />
      </div>

      {/* Search and Status Filters */}
      <div className="bg-white border border-[#E5EBE6] rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search tickets by ID, lab or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#F7F9F7] border border-[#E5EBE6] rounded-xl pl-9 pr-4 py-2 text-xs text-[#172033] placeholder-[#647067] focus:outline-none focus:border-[#087A35] focus:bg-white transition"
          />
          <Search className="w-4 h-4 text-[#647067] absolute left-3 top-2.5" />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#F7F9F7] rounded-xl border border-[#E5EBE6] text-xs font-semibold self-stretch sm:self-auto">
          {[
            { id: 'ALL', label: 'All' },
            { id: 'PENDING', label: 'Open' },
            { id: 'IN_REPAIR', label: 'In Repair' },
            { id: 'RESOLVED', label: 'Resolved' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-white text-[#087A35] font-bold shadow-sm border border-[#BDE3CA]'
                  : 'text-[#647067] hover:text-[#172033]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets Table */}
      <div className="rounded-3xl border border-[#E5EBE6] bg-white shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#E5EBE6]">
          <h3 className="text-base font-extrabold text-[#172033]">My Fault Reports</h3>
          <p className="text-xs text-[#647067] mt-0.5">
            Real-time status updates from the laboratory staff repairing your reported equipment.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F9F7] text-[#647067] font-bold border-b border-[#E5EBE6] uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-4">Ticket ID</th>
                <th className="px-6 py-4">Reported Instrument</th>
                <th className="px-6 py-4">Laboratory</th>
                <th className="px-6 py-4">Fault Description</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Submitted On</th>
                <th className="px-6 py-4 text-right">Photo Proof</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EBE6]">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-[#647067]">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#087A35] mb-2" />
                    Loading your tickets...
                  </td>
                </tr>
              ) : filteredTickets.length > 0 ? (
                filteredTickets.map((t) => (
                  <tr key={t._id} className="hover:bg-[#F7F9F7]/60 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-bold text-[#087A35] bg-[#EAF5ED] px-2.5 py-1 rounded-md border border-[#BDE3CA]">
                        {t.ticketId}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-bold text-[#172033] block text-sm">
                        {t.equipmentId?.name || 'Instrument'}
                      </span>
                      <span className="font-mono text-[11px] text-[#647067]">
                        SN: {t.equipmentId?.serialNumber || 'N/A'}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-[#172033] font-medium block">{t.labId?.labName || 'Laboratory'}</span>
                      <span className="text-[10px] text-[#647067] font-mono">
                        {t.labId?.labBlock} ({t.labId?.labId})
                      </span>
                    </td>

                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-[#172033] truncate" title={t.description}>
                        {t.description}
                      </p>
                      {t.resolutionNotes && (
                        <p className="text-[11px] text-[#087A35] mt-0.5 truncate font-medium">
                          Notes: {t.resolutionNotes}
                        </p>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <TicketStatusBadge status={t.ticketStatus} />
                    </td>

                    <td className="px-6 py-4 font-mono text-[#647067] text-[11px]">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 text-right">
                      {t.photoUrl ? (
                        <button
                          type="button"
                          onClick={() => setSelectedPhoto(t.photoUrl)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EAF5ED] hover:bg-[#DDF2E3] border border-[#BDE3CA] text-[#087A35] text-xs font-bold transition cursor-pointer"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          View Photo
                        </button>
                      ) : (
                        <span className="text-slate-400 italic">None</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">
                    <EmptyState
                      icon={ClipboardList}
                      title="No tickets found"
                      description="You have no tickets matching the current filter."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Photo Lightbox Modal ───────────────────────────────────────── */}
      {selectedPhoto && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedPhoto(null)}
          title="Submitted Damage Photograph"
          subtitle="Inspection photo uploaded during ticket creation"
          maxWidth="max-w-xl"
        >
          <div className="space-y-4">
            <div className="p-3 bg-[#F7F9F7] rounded-2xl border border-[#E5EBE6] text-center">
              <img
                src={selectedPhoto}
                alt="Damage proof"
                className="max-h-96 mx-auto rounded-xl object-contain shadow-sm border border-[#E5EBE6]"
              />
            </div>
            <div className="flex items-center justify-between text-xs pt-1">
              <a
                href={selectedPhoto}
                target="_blank"
                rel="noreferrer"
                className="text-[#087A35] font-bold hover:underline inline-flex items-center gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open Full Size in New Tab
              </a>
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="px-4 py-2 bg-[#087A35] text-white rounded-xl font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};

export default StudentDashboard;
