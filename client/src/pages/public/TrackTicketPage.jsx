import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Search,
  CheckCircle2,
  Clock,
  Wrench,
  AlertCircle,
  ArrowLeft,
  Building2,
  Calendar,
  Loader2,
  FileQuestion
} from 'lucide-react';
import { TicketStatusBadge } from '../../utils/statusBadges';

const TrackTicketPage = () => {
  const [searchParams] = useSearchParams();
  const initialTicketId = searchParams.get('ticketId') || '';
  const initialRollNumber = searchParams.get('rollNumber') || '';

  const [ticketId, setTicketId] = useState(initialTicketId);
  const [rollNumber, setRollNumber] = useState(initialRollNumber);
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTrackData = async (tId, rNum) => {
    if (!tId || !rNum) return;
    setLoading(true);
    setError('');

    try {
      const res = await api.get(`/tickets/track?ticketId=${tId.trim()}&rollNumber=${rNum.trim()}`);
      setTicketData(res.data.data);
    } catch (err) {
      setTicketData(null);
      setError(err.response?.data?.message || 'No ticket found with this combination.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialTicketId && initialRollNumber) {
      fetchTrackData(initialTicketId, initialRollNumber);
    }
  }, [initialTicketId, initialRollNumber]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTrackData(ticketId, rollNumber);
  };

  // Status index for progress tracker
  const steps = ['Open', 'Under Review', 'In Repair', 'Resolved'];
  const getStepIndex = (status) => {
    if (status === 'Resolved') return 3;
    if (status === 'In Repair') return 2;
    if (status === 'Under Review') return 1;
    return 0; // Open or default
  };

  const currentStepIdx = ticketData ? getStepIndex(ticketData.ticketStatus) : 0;

  return (
    <div className="min-h-screen bg-[#F7F9F7] text-[#172033] py-8 px-4 flex flex-col justify-between">
      
      <div className="max-w-md mx-auto w-full">
        
        {/* Navigation link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#647067] hover:text-[#087A35] mb-5 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Tracking Input Card */}
        <div className="bg-white border border-[#E5EBE6] rounded-3xl p-6 sm:p-7 shadow-sm space-y-4 mb-6">
          <div className="flex items-center gap-3.5 border-b border-[#E5EBE6] pb-4">
            <div className="w-11 h-11 rounded-2xl bg-[#EAF5ED] border border-[#BDE3CA] text-[#087A35] flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#172033]">Track Fault Ticket Status</h2>
              <p className="text-xs text-[#647067] mt-0.5">Enter your Ticket ID and Student Roll Number</p>
            </div>
          </div>

          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-1.5">
                Ticket ID
              </label>
              <input
                type="text"
                required
                placeholder="e.g. TKT-20261107-A9B2"
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value.toUpperCase())}
                className="w-full bg-[#F7F9F7] border border-[#E5EBE6] rounded-xl px-4 py-2.5 text-sm text-[#172033] font-mono uppercase placeholder-[#647067]/60 focus:outline-none focus:border-[#087A35] focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-1.5">
                Student Roll Number
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 2315001383"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
                className="w-full bg-[#F7F9F7] border border-[#E5EBE6] rounded-xl px-4 py-2.5 text-sm text-[#172033] font-mono uppercase placeholder-[#647067]/60 focus:outline-none focus:border-[#087A35] focus:bg-white transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#087A35] hover:bg-[#075C2B] text-white font-bold rounded-xl text-xs sm:text-sm transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Searching Ticket...
                </>
              ) : (
                'Search Ticket Status'
              )}
            </button>
          </form>

          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Ticket Details Result Card */}
        {ticketData && (
          <div className="bg-white border border-[#E5EBE6] rounded-3xl p-6 sm:p-7 shadow-sm space-y-5 animate-in fade-in duration-200">
            
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-[#E5EBE6] pb-4">
              <div>
                <span className="text-[10px] text-[#647067] block font-mono font-bold uppercase tracking-wider">
                  TICKET REFERENCE
                </span>
                <span className="font-mono text-base font-extrabold text-[#087A35]">
                  {ticketData.ticketId}
                </span>
              </div>
              <TicketStatusBadge status={ticketData.ticketStatus} />
            </div>

            {/* Visual Lifecycle Stepper */}
            <div className="py-2">
              <span className="text-[11px] font-bold text-[#647067] uppercase tracking-wider block mb-3">
                Repair Lifecycle Progress
              </span>
              <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-bold">
                {steps.map((step, idx) => {
                  const isDone = idx <= currentStepIdx;
                  const isCurrent = idx === currentStepIdx;
                  return (
                    <div key={step} className="flex flex-col items-center">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center mb-1 text-[11px] font-bold transition-all ${
                          isDone
                            ? 'bg-[#087A35] text-white shadow-sm'
                            : 'bg-slate-100 text-slate-400 border border-slate-200'
                        }`}
                      >
                        {isDone ? '✓' : idx + 1}
                      </div>
                      <span
                        className={`truncate w-full ${
                          isCurrent
                            ? 'text-[#087A35] font-extrabold'
                            : isDone
                            ? 'text-[#172033]'
                            : 'text-[#647067]'
                        }`}
                      >
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-[#087A35] h-full transition-all duration-300"
                  style={{ width: `${((currentStepIdx + 1) / steps.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3.5 text-xs border-t border-[#E5EBE6] pt-4">
              <div>
                <span className="text-[#647067] text-[11px] font-bold uppercase tracking-wider block">
                  Reported Instrument:
                </span>
                <p className="font-bold text-[#172033] text-base mt-0.5">{ticketData.equipmentName}</p>
                <span className="text-[#647067] text-xs font-mono">
                  {ticketData.labName} ({ticketData.labBlock})
                </span>
              </div>

              <div>
                <span className="text-[#647067] text-[11px] font-bold uppercase tracking-wider block">
                  Problem Description:
                </span>
                <p className="p-3.5 bg-[#F7F9F7] rounded-2xl border border-[#E5EBE6] text-[#172033] mt-1 leading-relaxed">
                  {ticketData.faultDescription}
                </p>
              </div>

              <div className="flex items-center justify-between text-[#647067] text-xs pt-1 font-mono">
                <span>Submitted On:</span>
                <span className="font-medium text-[#172033]">
                  {new Date(ticketData.createdAt).toLocaleString()}
                </span>
              </div>

              {ticketData.ticketStatus === 'Resolved' && (
                <div className="p-4 rounded-2xl bg-[#EAF5ED] border border-[#BDE3CA] space-y-2">
                  <div className="flex items-center gap-2 text-[#087A35] font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4 text-[#087A35]" />
                    Fault Resolved
                  </div>
                  <p className="text-[#087A35]/90 text-xs leading-relaxed">
                    {ticketData.resolutionNotes || 'Technician completed the repair and verified equipment functionality.'}
                  </p>
                  {ticketData.resolvedAt && (
                    <span className="text-[11px] text-[#087A35] block font-mono">
                      Closed on: {new Date(ticketData.resolvedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <footer className="text-center text-[11px] text-[#647067] py-4 mt-8">
        Local Lab Equipment Calibration & Fault Tracking System • LabEquip
      </footer>
    </div>
  );
};

export default TrackTicketPage;
