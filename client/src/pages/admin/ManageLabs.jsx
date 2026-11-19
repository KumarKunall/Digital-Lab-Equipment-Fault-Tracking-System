import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Building2,
  Plus,
  Archive,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Search,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';

const ManageLabs = () => {
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [labName, setLabName] = useState('');
  const [labBlock, setLabBlock] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'ACTIVE', 'ARCHIVED'
  const [search, setSearch] = useState('');

  const fetchLabs = async () => {
    try {
      const res = await api.get('/labs?includeArchived=true');
      setLabs(res.data.data || []);
    } catch (err) {
      console.error('Failed to load labs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabs();
  }, []);

  const handleCreateLab = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitLoading(true);

    try {
      await api.post('/labs', { labName, labBlock });
      setSuccessMsg(`Laboratory '${labName}' registered with an auto-generated unique Lab ID.`);
      setLabName('');
      setLabBlock('');
      setShowAddModal(false);
      fetchLabs();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create laboratory');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Archive Laboratory (Soft-delete)
  const handleArchiveLab = async (id, name) => {
    if (
      !window.confirm(
        `Are you sure you want to archive '${name}'? Existing equipment and records remain safe for audit compliance.`
      )
    ) {
      return;
    }

    try {
      await api.patch(`/labs/${id}/archive?force=true`);
      fetchLabs();
      setSuccessMsg(`Laboratory '${name}' has been safely archived.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to archive lab');
    }
  };

  // Restore / Unarchive Laboratory
  const handleRestoreLab = async (id, name) => {
    try {
      await api.patch(`/labs/${id}/reactivate`);
      fetchLabs();
      setSuccessMsg(`Laboratory '${name}' has been restored and moved back to active list.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to restore laboratory');
    }
  };

  const filteredLabs = labs.filter((l) => {
    const matchesSearch =
      l.labName.toLowerCase().includes(search.toLowerCase()) ||
      l.labId.toLowerCase().includes(search.toLowerCase()) ||
      l.labBlock.toLowerCase().includes(search.toLowerCase());

    if (statusFilter === 'ACTIVE') return matchesSearch && l.isActive;
    if (statusFilter === 'ARCHIVED') return matchesSearch && !l.isActive;
    return matchesSearch;
  });

  return (
    <div className="p-5 sm:p-8 max-w-7xl mx-auto w-full space-y-7">
      
      {/* Header */}
      <PageHeader
        badge="Facilities & Laboratories"
        badgeIcon={Building2}
        title="Manage Laboratories"
        description="Register campus facilities, maintain building/block designations, archive inactive labs and view facility status."
        actions={
          <button
            type="button"
            onClick={() => {
              setError('');
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#087A35] hover:bg-[#075C2B] text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Laboratory
          </button>
        }
      />

      {/* Success banner */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-[#EAF5ED] border border-[#BDE3CA] text-[#087A35] text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#087A35] shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="bg-white border border-[#E5EBE6] rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by lab name, code, or block..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#F7F9F7] border border-[#E5EBE6] rounded-xl pl-9 pr-4 py-2 text-xs text-[#172033] placeholder-[#647067] focus:outline-none focus:border-[#087A35] focus:bg-white transition"
          />
          <Search className="w-4 h-4 text-[#647067] absolute left-3 top-2.5" />
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F7F9F7] rounded-xl border border-[#E5EBE6] text-xs font-semibold self-stretch sm:self-auto">
          {['ALL', 'ACTIVE', 'ARCHIVED'].map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                statusFilter === filter
                  ? 'bg-white text-[#087A35] font-bold shadow-sm border border-[#BDE3CA]'
                  : 'text-[#647067] hover:text-[#172033]'
              }`}
            >
              {filter.charAt(0) + filter.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Laboratories Table */}
      <div className="rounded-3xl border border-[#E5EBE6] bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F9F7] text-[#647067] font-bold border-b border-[#E5EBE6] uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-4">Laboratory Name</th>
                <th className="px-6 py-4">Unique Code</th>
                <th className="px-6 py-4">Location / Block</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EBE6]">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-[#647067]">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#087A35] mb-2" />
                    Loading laboratories...
                  </td>
                </tr>
              ) : filteredLabs.length > 0 ? (
                filteredLabs.map((lab) => (
                  <tr key={lab._id} className="hover:bg-[#F7F9F7]/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#EAF5ED] text-[#087A35] border border-[#BDE3CA] flex items-center justify-center shrink-0 font-bold">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-[#172033] block text-sm">{lab.labName}</span>
                          <span className="text-[11px] text-[#647067]">Campus Facility</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-bold text-[#087A35] bg-[#EAF5ED] px-2.5 py-1 rounded-md border border-[#BDE3CA]">
                        {lab.labId}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#172033] font-medium">{lab.labBlock}</td>
                    <td className="px-6 py-4">
                      {lab.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#EAF5ED] text-[#087A35] border border-[#BDE3CA]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#087A35]" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          Archived
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {lab.isActive ? (
                        <button
                          type="button"
                          onClick={() => handleArchiveLab(lab._id, lab.labName)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 text-xs font-semibold transition cursor-pointer"
                        >
                          <Archive className="w-3.5 h-3.5" />
                          Archive
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRestoreLab(lab._id, lab.labName)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[#087A35] bg-[#EAF5ED] hover:bg-[#DDF2E3] border border-[#BDE3CA] text-xs font-semibold transition cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Restore
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">
                    <EmptyState
                      icon={Building2}
                      title="No laboratories found"
                      description="Try adjusting your search criteria or register a new laboratory."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Laboratory Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Register New Laboratory"
        subtitle="Create an institutional laboratory facility with an auto-generated unique ID"
      >
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleCreateLab} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-1.5">
              Laboratory Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Advanced Analog Electronics Lab"
              value={labName}
              onChange={(e) => setLabName(e.target.value)}
              className="w-full bg-[#F7F9F7] border border-[#E5EBE6] rounded-xl px-4 py-2.5 text-sm text-[#172033] placeholder-[#647067]/60 focus:outline-none focus:border-[#087A35] focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-1.5">
              Campus Block / Room Number
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Science Block B, Room 204"
              value={labBlock}
              onChange={(e) => setLabBlock(e.target.value)}
              className="w-full bg-[#F7F9F7] border border-[#E5EBE6] rounded-xl px-4 py-2.5 text-sm text-[#172033] placeholder-[#647067]/60 focus:outline-none focus:border-[#087A35] focus:bg-white transition"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
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
                  Creating...
                </>
              ) : (
                'Save Laboratory'
              )}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default ManageLabs;
