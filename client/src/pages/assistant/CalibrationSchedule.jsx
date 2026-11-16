import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  CalendarCheck2,
  Clock,
  History,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  FileCheck2,
  ExternalLink,
  Loader2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { CalibrationStatusBadge, OperationalStatusBadge } from '../../utils/statusBadges';
import PageHeader from '../../components/common/PageHeader';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';

const CalibrationSchedule = () => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showLogModal, setShowLogModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Selected item
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Log Form states
  const [calibratedBy, setCalibratedBy] = useState('');
  const [calibrationDate, setCalibrationDate] = useState(new Date().toISOString().slice(0, 10));
  const [nextDueDate, setNextDueDate] = useState('');
  const [certificateUrl, setCertificateUrl] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [logError, setLogError] = useState('');

  const fetchSchedule = async () => {
    try {
      const res = await api.get('/calibrations/schedule');
      setSchedule(res.data.data || []);
    } catch (err) {
      console.error('Failed to load calibration schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  // Open Log Calibration Modal
  const handleOpenLog = (item) => {
    setSelectedEquipment(item);
    setCalibratedBy('');
    setRemarks('');
    setCertificateUrl('');
    setLogError('');
    // Calculate default next due date from interval
    const intervalDays = item.calibrationIntervalDays || 180;
    const defaultNext = new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    setNextDueDate(defaultNext);
    setShowLogModal(true);
  };

  // Open History Ledger Modal
  const handleOpenHistory = async (item) => {
    setSelectedEquipment(item);
    setShowHistoryModal(true);
    setHistoryLoading(true);
    try {
      const res = await api.get(`/calibrations/equipment/${item._id}`);
      setHistoryLogs(res.data.data || []);
    } catch (err) {
      alert('Failed to load calibration history');
    } finally {
      setHistoryLoading(false);
    }
  };

  // Submit Completed Calibration
  const handleSubmitCalibration = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setLogError('');

    try {
      await api.post('/calibrations', {
        equipmentId: selectedEquipment._id,
        calibratedBy,
        calibrationDate,
        nextDueDate,
        certificateUrl,
        remarks
      });

      setShowLogModal(false);
      setSuccessMsg(`Calibration log recorded for '${selectedEquipment.name}'.`);
      fetchSchedule();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setLogError(err.response?.data?.message || 'Failed to record calibration log');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="p-5 sm:p-8 max-w-7xl mx-auto w-full space-y-7">
      
      {/* Header */}
      <PageHeader
        badge="Instrument Precision & Quality"
        badgeIcon={CalendarCheck2}
        title="Calibration Schedule"
        description="Monitor calibration deadlines, log completed inspection certificates, calculate next-due alarms, and review chronological compliance ledgers."
      />

      {/* Success banner */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-[#EAF5ED] border border-[#BDE3CA] text-[#087A35] text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#087A35] shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Calibration Schedule Table */}
      <div className="rounded-3xl border border-[#E5EBE6] bg-white shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#E5EBE6] flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-[#172033]">Scheduled Calibration Ledgers</h3>
            <p className="text-xs text-[#647067] mt-0.5">
              Sorted in descending order of urgency. Hardware requiring prompt recalibration is prioritized.
            </p>
          </div>
          <span className="text-xs font-bold text-[#087A35] bg-[#EAF5ED] px-3 py-1 rounded-full border border-[#BDE3CA]">
            {schedule.length} Instruments Monitored
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F9F7] text-[#647067] font-bold border-b border-[#E5EBE6] uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-4">Instrument Details</th>
                <th className="px-6 py-4">Bench Location</th>
                <th className="px-6 py-4">Last Calibrated</th>
                <th className="px-6 py-4">Next Due Date</th>
                <th className="px-6 py-4">Calibration Health</th>
                <th className="px-6 py-4">Operational Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EBE6]">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-[#647067]">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#087A35] mb-2" />
                    Loading calibration schedule...
                  </td>
                </tr>
              ) : schedule.length > 0 ? (
                schedule.map((item) => (
                  <tr key={item._id} className="hover:bg-[#F7F9F7]/60 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-bold text-[#172033] block text-sm">{item.name}</span>
                      <span className="font-mono text-[11px] text-[#647067]">
                        SN: {item.serialNumber} {item.model ? `• ${item.model}` : ''}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-[#172033] font-medium">{item.location}</td>

                    <td className="px-6 py-4 font-mono text-[#647067]">
                      {item.lastCalibrationDate
                        ? new Date(item.lastCalibrationDate).toLocaleDateString()
                        : 'Not logged yet'}
                    </td>

                    <td className="px-6 py-4 font-mono font-bold text-[#172033]">
                      {item.nextCalibrationDate
                        ? new Date(item.nextCalibrationDate).toLocaleDateString()
                        : 'N/A'}
                    </td>

                    <td className="px-6 py-4">
                      <CalibrationStatusBadge
                        status={item.calibrationHealth?.status}
                        daysRemaining={item.calibrationHealth?.daysRemaining}
                      />
                    </td>

                    <td className="px-6 py-4">
                      <OperationalStatusBadge status={item.operationalStatus} />
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenLog(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#087A35] hover:bg-[#075C2B] text-white text-xs font-bold transition shadow-sm cursor-pointer"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          Log Calibration
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenHistory(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-[#CBD5E1] text-[#172033] text-xs font-semibold transition cursor-pointer"
                          title="View past calibration records"
                        >
                          <History className="w-3.5 h-3.5 text-[#087A35]" />
                          History
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">
                    <EmptyState
                      icon={CalendarCheck2}
                      title="No calibration tasks scheduled"
                      description="No hardware in your laboratory currently requires calibration monitoring."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Log Calibration Modal ──────────────────────────────────────── */}
      {selectedEquipment && (
        <Modal
          isOpen={showLogModal}
          onClose={() => setShowLogModal(false)}
          title={`Log Calibration: ${selectedEquipment.name}`}
          subtitle={`SN: ${selectedEquipment.serialNumber} • Interval: ${selectedEquipment.calibrationIntervalDays || 180} days`}
        >
          {logError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 mb-4">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{logError}</span>
            </div>
          )}

          <form onSubmit={handleSubmitCalibration} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-1.5">
                Calibrated By (Staff / Certified Agency)
              </label>
              <input
                type="text"
                required
                placeholder="e.g. National Calibration Bureau / Dr. Mehta"
                value={calibratedBy}
                onChange={(e) => setCalibratedBy(e.target.value)}
                className="w-full bg-[#F7F9F7] border border-[#E5EBE6] rounded-xl px-4 py-2.5 text-sm text-[#172033] placeholder-[#647067]/60 focus:outline-none focus:border-[#087A35] focus:bg-white transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-1.5">
                  Calibration Date
                </label>
                <input
                  type="date"
                  required
                  value={calibrationDate}
                  onChange={(e) => setCalibrationDate(e.target.value)}
                  className="w-full bg-[#F7F9F7] border border-[#E5EBE6] rounded-xl px-4 py-2.5 text-sm text-[#172033] focus:outline-none focus:border-[#087A35] focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-1.5">
                  Next Due Date
                </label>
                <input
                  type="date"
                  required
                  value={nextDueDate}
                  onChange={(e) => setNextDueDate(e.target.value)}
                  className="w-full bg-[#F7F9F7] border border-[#E5EBE6] rounded-xl px-4 py-2.5 text-sm text-[#172033] focus:outline-none focus:border-[#087A35] focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-1.5">
                Certificate URL / Reference Link (Optional)
              </label>
              <input
                type="url"
                placeholder="https://drive.univ.edu/certificates/cal-001.pdf"
                value={certificateUrl}
                onChange={(e) => setCertificateUrl(e.target.value)}
                className="w-full bg-[#F7F9F7] border border-[#E5EBE6] rounded-xl px-4 py-2.5 text-sm text-[#172033] placeholder-[#647067]/60 focus:outline-none focus:border-[#087A35] focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-1.5">
                Inspection Remarks / Standard Readings
              </label>
              <textarea
                rows="3"
                placeholder="e.g. Deviation tested within +/- 0.5% tolerance. Oscilloscope timebase aligned."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full bg-[#F7F9F7] border border-[#E5EBE6] rounded-xl px-4 py-2.5 text-sm text-[#172033] placeholder-[#647067]/60 focus:outline-none focus:border-[#087A35] focus:bg-white transition"
              ></textarea>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowLogModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#647067] hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#087A35] hover:bg-[#075C2B] text-white rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50"
              >
                {submitLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Recording Log...
                  </>
                ) : (
                  'Record Calibration'
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Calibration History Ledger Modal ────────────────────────────── */}
      {selectedEquipment && (
        <Modal
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          title={`Calibration History: ${selectedEquipment.name}`}
          subtitle={`Immutable audit ledger for Serial Number: ${selectedEquipment.serialNumber}`}
          maxWidth="max-w-2xl"
        >
          {historyLoading ? (
            <div className="py-12 text-center text-[#647067]">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#087A35] mb-2" />
              Loading historical calibration ledgers...
            </div>
          ) : historyLogs.length > 0 ? (
            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
              {historyLogs.map((log) => (
                <div
                  key={log._id}
                  className="p-4 rounded-2xl bg-[#F7F9F7] border border-[#E5EBE6] space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between border-b border-[#E5EBE6] pb-2">
                    <span className="font-extrabold text-[#172033] flex items-center gap-1.5 text-sm">
                      <FileCheck2 className="w-4 h-4 text-[#087A35]" />
                      {new Date(log.calibrationDate).toLocaleDateString()}
                    </span>
                    <span className="text-[#647067]">
                      Logged By: <strong className="text-[#172033]">{log.calibratedBy}</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[#647067]">
                    <div>
                      <span>Next Due Date: </span>
                      <strong className="text-[#172033]">
                        {new Date(log.nextDueDate).toLocaleDateString()}
                      </strong>
                    </div>
                    {log.certificateUrl && (
                      <div className="text-right">
                        <a
                          href={log.certificateUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#087A35] font-bold hover:underline inline-flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View Certificate
                        </a>
                      </div>
                    )}
                  </div>

                  {log.remarks && (
                    <p className="p-2.5 bg-white border border-[#E5EBE6] rounded-xl text-[#172033] mt-1 leading-relaxed">
                      {log.remarks}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={History}
              title="No historical calibration logs"
              description="No past calibration records have been submitted for this instrument yet."
            />
          )}
        </Modal>
      )}

    </div>
  );
};

export default CalibrationSchedule;
