import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Cpu,
  CheckCircle2,
  AlertOctagon,
  Wrench,
  Clock,
  ArrowRight,
  Plus,
  Layers3,
  Building2,
  RefreshCw,
  CalendarCheck2
} from 'lucide-react';
import { OperationalStatusBadge } from '../../utils/statusBadges';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import EmptyState from '../../components/common/EmptyState';

const AssistantDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await api.get('/reports/stats');
      setStats(res.data.data);
    } catch (err) {
      console.error('Failed to load assistant stats:', err);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Auto-refresh telemetry every 5 seconds
    const interval = setInterval(() => {
      fetchStats();
    }, 5000);

    const onFocus = () => fetchStats();
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  const assignedLab = user?.assignedLab;

  return (
    <div className="p-5 sm:p-8 max-w-7xl mx-auto w-full space-y-7">
      
      {/* Page Header */}
      <PageHeader
        badge={`Lab Isolation: ${assignedLab?.labName || 'ASSIGNED LAB'} (${assignedLab?.labId || 'LAB'})`}
        badgeIcon={Building2}
        title="Lab Operations Console"
        description="Manage your laboratory's instrument inventory, generate and print QR identification labels, log completed calibrations, and resolve student fault tickets."
        actions={
          <>
            <button
              type="button"
              onClick={() => fetchStats(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-[#172033] border border-[#CBD5E1] text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
              title="Fetch live metrics immediately"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#087A35] ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Syncing...' : 'Sync Live'}
            </button>

            <Link
              to="/assistant/equipment"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#087A35] hover:bg-[#075C2B] text-white rounded-xl text-xs font-bold shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              Add Equipment
            </Link>

            <Link
              to="/assistant/tickets"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition"
            >
              <AlertOctagon className="w-4 h-4 text-red-600" />
              Fault Tickets ({stats ? stats.openTickets : 0})
            </Link>
          </>
        }
      />

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Laboratory Hardware"
          value={loading ? '...' : stats ? stats.totalEquipment : 0}
          subtitle={assignedLab ? `${assignedLab.labName}` : 'Designated Inventory'}
          icon={Cpu}
          color="green"
        />
        <StatCard
          title="Operational Ready"
          value={loading ? '...' : stats ? stats.readyEquipment : 0}
          subtitle="Ready for experiments"
          icon={CheckCircle2}
          color="green"
        />
        <StatCard
          title="Open Fault Tickets"
          value={loading ? '...' : stats ? stats.openTickets : 0}
          subtitle="Pending repair & review"
          icon={AlertOctagon}
          color={stats?.openTickets > 0 ? 'red' : 'green'}
        />
        <StatCard
          title="Overdue Calibrations"
          value={loading ? '...' : stats ? stats.overdueEquipment : 0}
          subtitle="Compliance inspection needed"
          icon={CalendarCheck2}
          color={stats?.overdueEquipment > 0 ? 'amber' : 'green'}
        />
      </div>

      {/* Frequently Damaged / Activity Table in this Lab */}
      <div className="rounded-3xl border border-[#E5EBE6] bg-white shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#E5EBE6] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold text-[#172033] flex items-center gap-2">
              <Layers3 className="w-4 h-4 text-[#087A35]" />
              Priority Instruments & High Damage Trends
            </h3>
            <p className="text-xs text-[#647067] mt-0.5">
              Instruments with recorded fault reports requiring regular operational inspection.
            </p>
          </div>
          <Link
            to="/assistant/equipment"
            className="text-xs font-bold text-[#087A35] hover:text-[#075C2B] flex items-center gap-1.5 transition self-start sm:self-auto"
          >
            Manage All Equipment <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F9F7] text-[#647067] font-bold border-b border-[#E5EBE6] uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-4">Equipment Details</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Operational Status</th>
                <th className="px-6 py-4 text-center">Cumulative Faults</th>
                <th className="px-6 py-4 text-right">Quick Action</th>
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
                    <td className="px-6 py-4 text-[#172033] font-medium">{eq.location}</td>
                    <td className="px-6 py-4">
                      <OperationalStatusBadge status={eq.operationalStatus} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-block px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 font-bold font-mono text-xs">
                        {eq.damageCount} {eq.damageCount === 1 ? 'fault' : 'faults'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to="/assistant/equipment"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EAF5ED] hover:bg-[#DDF2E3] border border-[#BDE3CA] text-[#087A35] text-xs font-bold transition"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        Manage in Inventory
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">
                    <EmptyState
                      icon={Cpu}
                      title="No damaged instruments reported"
                      description="All hardware in your laboratory is operating under verified conditions."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AssistantDashboard;
