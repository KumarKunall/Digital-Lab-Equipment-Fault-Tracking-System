import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Building2,
  Users,
  Cpu,
  AlertOctagon,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Activity,
  Layers3,
  Clock,
  QrCode,
  Printer,
  Download,
  X,
  Loader2,
  Plus
} from 'lucide-react';
import { OperationalStatusBadge } from '../../utils/statusBadges';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import Modal from '../../components/common/Modal';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // QR Modal States
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsRes, labsRes, asstsRes] = await Promise.all([
          api.get('/reports/stats'),
          api.get('/labs'),
          api.get('/users/assistants')
        ]);
        const activeLabsCount = (labsRes.data.data || []).filter(l => l.isActive !== false).length;
        const activeAssistantsCount = (asstsRes.data.data || []).filter(a => a.isActive !== false).length;
        setStats({
          ...(statsRes.data.data || {}),
          totalLabs: activeLabsCount,
          totalAssistants: activeAssistantsCount
        });
      } catch (err) {
        console.error('Error fetching admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
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

  const readyCount = stats?.readyToUse ?? stats?.readyEquipment ?? 0;
  const compliancePercent =
    stats?.totalEquipment && stats.totalEquipment > 0
      ? Math.round((readyCount / stats.totalEquipment) * 100)
      : 100;

  return (
    <div className="p-5 sm:p-8 max-w-7xl mx-auto w-full space-y-7">
      
      {/* Page Header */}
      <PageHeader
        badge="System Administration"
        badgeIcon={ShieldCheck}
        title="Institutional Overview"
        description="Global management of university laboratories, assistant staff authorization, and system-wide equipment compliance metrics."
        actions={
          <>
            <Link
              to="/admin/labs"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#087A35] hover:bg-[#075C2B] text-white rounded-xl text-xs font-bold shadow-sm transition"
            >
              <Building2 className="w-4 h-4" />
              Manage Labs
            </Link>
            <Link
              to="/admin/assistants"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-[#CBD5E1] text-[#172033] rounded-xl text-xs font-bold shadow-sm transition"
            >
              <Users className="w-4 h-4 text-[#087A35]" />
              Manage Assistants
            </Link>
          </>
        }
      />

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Active Laboratories"
          value={loading ? '...' : (stats?.totalLabs ?? 0)}
          subtitle="Campus Facilities"
          icon={Building2}
          color="green"
        />
        <StatCard
          title="Registered Assistants"
          value={loading ? '...' : (stats?.totalAssistants ?? 0)}
          subtitle="Staff Accounts"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Total Equipment"
          value={loading ? '...' : (stats?.totalEquipment ?? 0)}
          subtitle={`${readyCount} Operational`}
          icon={Cpu}
          color="green"
        />
        <StatCard
          title="Active Fault Tickets"
          value={loading ? '...' : (stats?.openTickets ?? 0)}
          subtitle="Pending Investigation"
          icon={AlertOctagon}
          color={stats?.openTickets > 0 ? 'red' : 'green'}
        />
      </div>

      {/* Compliance & Health Summary Banner */}
      <div className="rounded-2xl border border-[#E5EBE6] bg-white p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#EAF5ED] text-[#087A35] border border-[#BDE3CA] flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-[#172033] text-sm sm:text-base">
                System Compliance Rate: {compliancePercent}%
              </h4>
            </div>
            <p className="text-xs text-[#647067] mt-0.5">
              {stats?.totalEquipment
                ? `${stats.readyEquipment || 0} of ${stats.totalEquipment} laboratory instruments are operational and verified.`
                : 'Loading metrics...'}
            </p>
          </div>
        </div>

        {/* Visual compliance bar */}
        <div className="w-full sm:w-64 flex flex-col gap-1.5">
          <div className="flex justify-between text-xs font-semibold text-[#647067]">
            <span>Operational Health</span>
            <span className="text-[#087A35] font-bold">{compliancePercent}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-[#087A35] h-full rounded-full transition-all duration-500"
              style={{ width: `${compliancePercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Frequently Damaged Instruments Table */}
      <div className="rounded-3xl border border-[#E5EBE6] bg-white shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#E5EBE6] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold text-[#172033] flex items-center gap-2">
              <Layers3 className="w-4 h-4 text-[#087A35]" />
              Most Frequently Damaged Instruments
            </h3>
            <p className="text-xs text-[#647067] mt-0.5">
              Ranked in descending order of cumulative fault tickets to highlight hardware replacement requirements.
            </p>
          </div>
          <Link
            to="/admin/reports"
            className="text-xs font-bold text-[#087A35] hover:text-[#075C2B] flex items-center gap-1.5 transition self-start sm:self-auto"
          >
            View Full Audit Reports <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F9F7] text-[#647067] font-bold border-b border-[#E5EBE6] uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-4">Equipment Details</th>
                <th className="px-6 py-4">Laboratory</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Operational Status</th>
                <th className="px-6 py-4 text-center">Lifetime Damage Count</th>
                <th className="px-6 py-4 text-right">QR Code</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EBE6]">
              {stats?.mostDamagedEquipment && stats.mostDamagedEquipment.length > 0 ? (
                stats.mostDamagedEquipment.map((eq) => (
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
                    <td className="px-6 py-4 text-[#647067] font-medium">{eq.location}</td>
                    <td className="px-6 py-4">
                      <OperationalStatusBadge status={eq.operationalStatus} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-block px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 font-bold font-mono text-xs">
                        {eq.damageCount} {eq.damageCount === 1 ? 'fault' : 'faults'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenQr(eq._id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EAF5ED] hover:bg-[#DDF2E3] border border-[#BDE3CA] text-[#087A35] text-xs font-bold transition cursor-pointer"
                        title="View / Print QR Code"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        View QR
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-[#647067]">
                    No equipment damage records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Code Printable Modal */}
      <Modal
        isOpen={showQrModal}
        onClose={() => {
          setShowQrModal(false);
          setQrData(null);
        }}
        title="Equipment Identification QR Code"
        subtitle="High-contrast printable sticker for physical instrument identification"
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

export default AdminDashboard;
