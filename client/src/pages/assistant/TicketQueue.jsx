import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  AlertOctagon,
  Clock,
  Wrench,
  CheckCircle2,
  Eye,
  User,
  Phone,
  Calendar,
  AlertCircle,
  RefreshCw,
  Loader2,
  ExternalLink,
  Mail,
  Camera
} from 'lucide-react';
import { TicketStatusBadge, OperationalStatusBadge } from '../../utils/statusBadges';
import PageHeader from '../../components/common/PageHeader';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';

const TicketQueue = () => {
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState('active'); // 'active' | 'all' | 'Resolved' | 'Expired'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Selected Ticket Modal
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Status update form states
  const [newStatus, setNewStatus] = useState('Under Review');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [restoreOperational, setRestoreOperational] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchTickets = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await api.get(`/tickets?status=${filter}`);
      setTickets(res.data.data || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTickets();

    // Instant real-time background sync every 5 seconds
    const interval = setInterval(() => {
      fetchTickets();
    }, 5000);

    const handleFocus = () => fetchTickets();
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [filter]);

  const handleOpenDetail = (ticket) => {
    setSelectedTicket(ticket);
    setNewStatus(ticket.ticketStatus);
    setResolutionNotes(ticket.resolutionNotes || '');
    setRestoreOperational(true);
    setShowModal(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      await api.patch(`/tickets/${selectedTicket._id}/status`, {
        ticketStatus: newStatus,
        resolutionNotes,
        restoreOperationalStatus: restoreOperational
      });

      setShowModal(false);
      setSuccessMsg(`Ticket ${selectedTicket.ticketId} updated to '${newStatus}' and student notified via email.`);
      fetchTickets();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update ticket status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="p-5 sm:p-8 max-w-7xl mx-auto w-full space-y-7">
      
      {/* Header */}
      <PageHeader
        badge="Damage Inspection & Repairs"
        badgeIcon={AlertOctagon}
        title="Fault Ticket Queue"
        description="Inspect submitted student damage tickets, review photographs, manage repair lifecycles, and dispatch resolution alerts."
        actions={
          <button
            type="button"
            onClick={() => fetchTickets(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-[#172033] border border-[#CBD5E1] rounded-xl text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#087A35] ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Syncing...' : 'Sync Queue'}
          </button>
        }
      />

      {/* Success Banner */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-[#EAF5ED] border border-[#BDE3CA] text-[#087A35] text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#087A35] shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-[#E5EBE6] rounded-2xl p-3 shadow-sm">
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          {[
            { id: 'active', label: 'Active Queue' },
            { id: 'all', label: 'All Tickets' },
            { id: 'Resolved', label: 'Resolved Tickets' },
            { id: 'Expired', label: 'Expired' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`px-3.5 py-2 rounded-xl transition cursor-pointer ${
                filter === tab.id
                  ? 'bg-[#EAF5ED] text-[#087A35] font-bold border border-[#BDE3CA] shadow-sm'
                  : 'text-[#647067] hover:text-[#172033]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-[11px] text-[#647067] font-mono px-2">
          Last synced: {lastUpdated.toLocaleTimeString()}
        </span>
      </div>

      {/* Tickets Table */}
      <div className="rounded-3xl border border-[#E5EBE6] bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F9F7] text-[#647067] font-bold border-b border-[#E5EBE6] uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-4">Ticket ID</th>
                <th className="px-6 py-4">Reported Instrument</th>
                <th className="px-6 py-4">Student Reporter</th>
                <th className="px-6 py-4">Fault Description</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Reported On</th>
                <th className="px-6 py-4 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EBE6]">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-[#647067]">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#087A35] mb-2" />
                    Loading fault queue...
                  </td>
                </tr>
              ) : tickets.length > 0 ? (
                tickets.map((t) => (
                  <tr key={t._id} className="hover:bg-[#F7F9F7]/60 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-extrabold text-[#087A35] bg-[#EAF5ED] px-2.5 py-1 rounded-md border border-[#BDE3CA]">
                        {t.ticketId}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-bold text-[#172033] block text-sm">
                        {t.equipmentId?.name || 'Equipment'}
                      </span>
                      <span className="font-mono text-[11px] text-[#647067]">
                        SN: {t.equipmentId?.serialNumber || 'N/A'} • {t.equipmentId?.location || ''}
                      </span>
                    </td>

                    <td className="px-6 py-4 space-y-0.5">
                      <span className="font-semibold text-[#172033] block">{t.studentName}</span>
                      <span className="font-mono text-[11px] text-[#647067] block">
                        Roll: {t.rollNumber} • {t.mobile}
                      </span>
                    </td>

                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-[#172033] truncate" title={t.description}>
                        {t.description}
                      </p>
                      {t.photoUrl && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#087A35] font-semibold mt-0.5">
                          <Camera className="w-3 h-3" /> Photo Attached
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <TicketStatusBadge status={t.ticketStatus} />
                    </td>

                    <td className="px-6 py-4 font-mono text-[#647067] text-[11px]">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenDetail(t)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#087A35] hover:bg-[#075C2B] text-white text-xs font-bold transition shadow-sm cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Inspect &amp; Update
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">
                    <EmptyState
                      icon={AlertOctagon}
                      title="No tickets in queue"
                      description="There are currently no active fault reports matching this filter."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Review & Update Status Modal ───────────────────────────────── */}
      {selectedTicket && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={`Ticket ${selectedTicket.ticketId}`}
          subtitle={`Reported for: ${selectedTicket.equipmentId?.name || 'Instrument'}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-5">
            
            {/* Student details header */}
            <div className="p-4 rounded-2xl bg-[#F7F9F7] border border-[#E5EBE6] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-[#647067] font-bold uppercase tracking-wider block">Student Name</span>
                <span className="font-bold text-[#172033] mt-0.5 block">{selectedTicket.studentName}</span>
                <span className="text-[11px] font-mono text-[#647067]">Roll: {selectedTicket.rollNumber}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#647067] font-bold uppercase tracking-wider block">Phone Contact</span>
                <span className="font-mono text-[#172033] font-semibold mt-0.5 block">{selectedTicket.mobile}</span>
                <span className="text-[11px] text-[#647067]">{selectedTicket.email || 'No email provided'}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#647067] font-bold uppercase tracking-wider block">Current Status</span>
                <div className="mt-1">
                  <TicketStatusBadge status={selectedTicket.ticketStatus} />
                </div>
              </div>
            </div>

            {/* Reported Problem Description */}
            <div>
              <span className="text-xs font-bold text-[#172033] uppercase tracking-wider block mb-1.5">
                Reported Malfunction / Damage Description
              </span>
              <p className="p-3.5 bg-[#F7F9F7] border border-[#E5EBE6] rounded-2xl text-xs sm:text-sm text-[#172033] leading-relaxed">
                {selectedTicket.description}
              </p>
            </div>

            {/* Damage Photograph Preview */}
            {selectedTicket.photoUrl && (
              <div>
                <span className="text-xs font-bold text-[#172033] uppercase tracking-wider block mb-1.5">
                  Damage Photograph (Uploaded by Student)
                </span>
                <div className="p-3 bg-[#F7F9F7] border border-[#E5EBE6] rounded-2xl flex flex-col items-center gap-2">
                  <img
                    src={selectedTicket.photoUrl}
                    alt="Damage proof"
                    className="max-h-64 rounded-xl object-contain border border-[#E5EBE6] shadow-sm"
                  />
                  <a
                    href={selectedTicket.photoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-[#087A35] font-bold hover:underline inline-flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open Full-Resolution Photo in New Tab
                  </a>
                </div>
              </div>
            )}

            {/* Status Update Form */}
            <form onSubmit={handleUpdateStatus} className="border-t border-[#E5EBE6] pt-4 space-y-4">
              <h4 className="text-xs font-extrabold text-[#172033] uppercase tracking-wider">
                Update Ticket Lifecycle Status
              </h4>

              <div>
                <label className="block text-xs font-bold text-[#647067] mb-1.5">
                  Lifecycle Stage (OPEN → UNDER REVIEW → IN REPAIR → RESOLVED)
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-[#F7F9F7] border border-[#E5EBE6] rounded-xl px-4 py-2.5 text-sm text-[#172033] font-semibold focus:outline-none focus:border-[#087A35] focus:bg-white transition cursor-pointer"
                >
                  <option value="Open">Open (Initial Submission)</option>
                  <option value="Under Review">Under Review (Inspecting Hardware)</option>
                  <option value="In Repair">In Repair (Servicing Malfunction)</option>
                  <option value="Resolved">Resolved (Repaired & Operational)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#647067] mb-1.5">
                  Resolution Notes / Technical Remarks
                </label>
                <textarea
                  rows="3"
                  placeholder="e.g. Soldered broken contact on Channel 1 probe. Tested waveform output with 1kHz calibration square wave."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="w-full bg-[#F7F9F7] border border-[#E5EBE6] rounded-xl px-4 py-2.5 text-sm text-[#172033] placeholder-[#647067]/60 focus:outline-none focus:border-[#087A35] focus:bg-white transition"
                ></textarea>
              </div>

              {newStatus === 'Resolved' && (
                <div className="p-3.5 bg-[#EAF5ED] border border-[#BDE3CA] rounded-xl">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={restoreOperational}
                      onChange={(e) => setRestoreOperational(e.target.checked)}
                      className="w-4 h-4 text-[#087A35] accent-[#087A35] rounded"
                    />
                    <span className="text-xs font-bold text-[#087A35]">
                      Restore equipment operational status to "Ready to Use"
                    </span>
                  </label>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#647067] hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#087A35] hover:bg-[#075C2B] text-white rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {updating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Updating & Notifying Student...
                    </>
                  ) : (
                    'Update Status & Notify Student'
                  )}
                </button>
              </div>
            </form>

          </div>
        </Modal>
      )}

    </div>
  );
};

export default TicketQueue;
