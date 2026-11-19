import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  FileSpreadsheet,
  ShieldCheck,
  CheckCircle2,
  AlertOctagon,
  RefreshCw,
  Layers3,
  QrCode,
  Printer,
  Download,
  CalendarCheck2,
  Loader2
} from 'lucide-react';
import { OperationalStatusBadge, CalibrationStatusBadge, TicketStatusBadge } from '../../utils/statusBadges';
import PageHeader from '../../components/common/PageHeader';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';

const AdminReports = () => {
  const [activeTab, setActiveTab] = useState('calibrated'); // 'calibrated' | 'damaged'
  const [calibratedData, setCalibratedData] = useState([]);
  const [damagedData, setDamagedData] = useState({ damagedEquipment: [], activeTickets: [] });
  const [loading, setLoading] = useState(true);

  // QR Modal States
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [calRes, damRes] = await Promise.all([
        api.get('/reports/calibrated-equipment'),
        api.get('/reports/damaged-equipment')
      ]);
      setCalibratedData(calRes.data.data || []);
      setDamagedData(damRes.data.data || { damagedEquipment: [], activeTickets: [] });
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleOpenQr = async (id) => {
    setQrData(null);
    setQrLoading(true);
    setShowQrModal(true);
    try {
      const res = await api.get(`/equipment/${id}/qr`);
      const d = res.data.data;
      const qrImg = d.qrDataUrl || d.qrCodeDataUrl;
      setQrData({
        ...d,
        qrCodeDataUrl: qrImg,
        qrDataUrl: qrImg
      });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate QR code');
      setShowQrModal(false);
    } finally {
      setQrLoading(false);
    }
  };

  const handleDownloadQr = () => {
    const src = qrData?.qrCodeDataUrl || qrData?.qrDataUrl;
    if (!src) return;
    const link = document.createElement('a');
    link.href = src;
    link.download = `QR_${(qrData.equipmentName || 'equipment').replace(/\s+/g, '_')}_${qrData.serialNumber || qrData.publicId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-5 sm:p-8 max-w-7xl mx-auto w-full space-y-7">
      
      {/* Header */}
      <PageHeader
        badge="Institutional Compliance"
        badgeIcon={ShieldCheck}
        title="Audit & Compliance Reports"
        description="Global read-only audit records across all campus laboratories. Inspect calibration ledgers, damage histories, and verify hardware QR labels."
        actions={
          <button
            type="button"
            onClick={fetchReports}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#087A35] hover:bg-[#075C2B] text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Ledger
          </button>
        }
      />

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-[#E5EBE6] shadow-sm max-w-md">
        <button
          type="button"
          onClick={() => setActiveTab('calibrated')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'calibrated'
              ? 'bg-[#EAF5ED] text-[#087A35] border border-[#BDE3CA] shadow-sm'
              : 'text-[#647067] hover:text-[#172033]'
          }`}
        >
          <CalendarCheck2 className="w-4 h-4" />
          Calibrated Equipment Ledger ({calibratedData.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('damaged')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'damaged'
              ? 'bg-red-50 text-red-700 border border-red-200 shadow-sm'
              : 'text-[#647067] hover:text-[#172033]'
          }`}
        >
          <AlertOctagon className="w-4 h-4" />
          Damaged & Tickets ({damagedData.damagedEquipment?.length || 0})
        </button>
      </div>

      {/* ── Table: Calibrated Equipment Ledger ───────────────────────────── */}
      {activeTab === 'calibrated' && (
        <div className="rounded-3xl border border-[#E5EBE6] bg-white shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#E5EBE6]">
            <h3 className="text-base font-extrabold text-[#172033]">Calibration Health & Ledgers</h3>
            <p className="text-xs text-[#647067] mt-0.5">
              Instruments requiring mandatory periodic testing to uphold university laboratory precision standards.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F9F7] text-[#647067] font-bold border-b border-[#E5EBE6] uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-4">Equipment Details</th>
                  <th className="px-6 py-4">Laboratory</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Last Calibrated</th>
                  <th className="px-6 py-4">Next Due Date</th>
                  <th className="px-6 py-4">Calibration Health</th>
                  <th className="px-6 py-4 text-right">QR Code</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EBE6]">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-[#647067]">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#087A35] mb-2" />
                      Loading calibration records...
                    </td>
                  </tr>
                ) : calibratedData.length > 0 ? (
                  calibratedData.map((item) => (
                    <tr key={item._id} className="hover:bg-[#F7F9F7]/60 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-bold text-[#172033] block text-sm">{item.name}</span>
                        <span className="font-mono text-[11px] text-[#647067]">
                          SN: {item.serialNumber} {item.model ? `• ${item.model}` : ''}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-[#172033] font-medium block">{item.labId?.labName}</span>
                        <span className="text-[10px] text-[#647067] font-mono">({item.labId?.labId})</span>
                      </td>

                      <td className="px-6 py-4 text-[#172033]">{item.location}</td>

                      <td className="px-6 py-4 font-mono text-[#647067]">
                        {item.lastCalibrationDate
                          ? new Date(item.lastCalibrationDate).toLocaleDateString()
                          : 'Not recorded'}
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

                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenQr(item._id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EAF5ED] hover:bg-[#DDF2E3] border border-[#BDE3CA] text-[#087A35] text-xs font-bold transition cursor-pointer"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          QR Code
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7">
                      <EmptyState
                        icon={CalendarCheck2}
                        title="No calibration records found"
                        description="There are currently no instruments flagged for calibration."
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Table: Damaged Instruments & Active Tickets ─────────────────── */}
      {activeTab === 'damaged' && (
        <div className="rounded-3xl border border-[#E5EBE6] bg-white shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#E5EBE6]">
            <h3 className="text-base font-extrabold text-[#172033]">Damaged Instruments & Fault Queue</h3>
            <p className="text-xs text-[#647067] mt-0.5">
              Comprehensive overview of instruments flagged as damaged or currently undergoing repair.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F9F7] text-[#647067] font-bold border-b border-[#E5EBE6] uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-4">Instrument Details</th>
                  <th className="px-6 py-4">Laboratory</th>
                  <th className="px-6 py-4">Operational Status</th>
                  <th className="px-6 py-4 text-center">Damage Count</th>
                  <th className="px-6 py-4">Latest Ticket Details</th>
                  <th className="px-6 py-4 text-right">QR Code</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EBE6]">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-[#647067]">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#087A35] mb-2" />
                      Loading damaged equipment records...
                    </td>
                  </tr>
                ) : damagedData.damagedEquipment && damagedData.damagedEquipment.length > 0 ? (
                  damagedData.damagedEquipment.map((eq) => {
                    const activeTicket = damagedData.activeTickets?.find(
                      (t) => t.equipmentId?._id === eq._id || t.equipmentId === eq._id
                    );

                    return (
                      <tr key={eq._id} className="hover:bg-[#F7F9F7]/60 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-bold text-[#172033] block text-sm">{eq.name}</span>
                          <span className="font-mono text-[11px] text-[#647067]">
                            SN: {eq.serialNumber} {eq.model ? `• ${eq.model}` : ''}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span className="text-[#172033] font-medium block">{eq.labId?.labName}</span>
                          <span className="text-[10px] text-[#647067] font-mono">({eq.labId?.labId})</span>
                        </td>

                        <td className="px-6 py-4">
                          <OperationalStatusBadge status={eq.operationalStatus} />
                        </td>

                        <td className="px-6 py-4 text-center">
                          <span className="inline-block px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 font-bold font-mono text-xs">
                            {eq.damageCount} faults
                          </span>
                        </td>

                        <td className="px-6 py-4 max-w-xs">
                          {activeTicket ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-bold text-[#087A35] text-[11px]">
                                  {activeTicket.ticketId}
                                </span>
                                <TicketStatusBadge status={activeTicket.ticketStatus} />
                              </div>
                              <p className="text-[11px] text-[#647067] truncate">
                                {activeTicket.description}
                              </p>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">No active open ticket</span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleOpenQr(eq._id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EAF5ED] hover:bg-[#DDF2E3] border border-[#BDE3CA] text-[#087A35] text-xs font-bold transition cursor-pointer"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            QR Code
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6">
                      <EmptyState
                        icon={AlertOctagon}
                        title="No damaged instruments"
                        description="All laboratory equipment is currently operational and in good standing."
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* QR Code Printable Modal */}
      <Modal
        isOpen={showQrModal}
        onClose={() => {
          setShowQrModal(false);
          setQrData(null);
        }}
        title="Equipment Identification QR Code"
        subtitle="Institutional equipment identification sticker"
        maxWidth="max-w-sm"
      >
        {qrLoading || !qrData ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#087A35] animate-spin" />
            <p className="text-xs text-[#647067] font-mono">Generating QR code...</p>
          </div>
        ) : (
          <div className="text-center">
            <h4 className="font-extrabold text-base text-[#172033]">{qrData.equipmentName}</h4>
            <p className="text-xs text-[#647067] font-mono mt-0.5">SN: {qrData.serialNumber}</p>
            <p className="text-xs text-[#087A35] font-bold mt-0.5">{qrData.labName} • {qrData.labBlock}</p>

            <div className="my-5 p-4 bg-white border border-[#E5EBE6] rounded-2xl inline-block shadow-sm">
              <img src={qrData.qrCodeDataUrl || qrData.qrDataUrl} alt="Equipment QR Code" className="w-44 h-44 mx-auto" />
            </div>

            <p className="text-[11px] text-[#647067] font-mono break-all mb-5">
              Public QR ID: <span className="text-[#087A35] font-bold">{qrData.publicId}</span>
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#087A35] hover:bg-[#075C2B] text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Print Sticker
              </button>
              <button
                type="button"
                onClick={handleDownloadQr}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#EAF5ED] hover:bg-[#DDF2E3] text-[#087A35] border border-[#BDE3CA] rounded-xl text-xs font-bold transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download PNG
              </button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default AdminReports;
