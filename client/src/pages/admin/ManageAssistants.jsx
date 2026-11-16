import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Users,
  Plus,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
  Building2,
  Loader2,
  KeyRound,
  Copy,
  ShieldCheck,
  UserCheck,
  UserX
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';

const ManageAssistants = () => {
  const [assistants, setAssistants] = useState([]);
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [tableError, setTableError] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [assignedLabId, setAssignedLabId] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [successInfo, setSuccessInfo] = useState(null);
  const [copied, setCopied] = useState(false);

  const fetchData = async () => {
    try {
      const [astRes, labRes] = await Promise.all([
        api.get('/users/assistants'),
        api.get('/labs')
      ]);
      setAssistants(astRes.data.data || []);
      setLabs(labRes.data.data || []);
    } catch (err) {
      console.error('Failed to load assistants:', err);
      setTableError(err.response?.data?.message || 'Failed to load data. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateAssistant = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitLoading(true);

    try {
      const res = await api.post('/users/assistants', {
        name,
        email,
        mobile,
        assignedLabId
      });

      setSuccessInfo(res.data.data);
      setName('');
      setEmail('');
      setMobile('');
      setAssignedLabId('');
      setShowAddModal(false);
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create lab assistant');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const action = currentStatus ? 'deactivate' : 'reactivate';
    if (!window.confirm(`Are you sure you want to ${action} this assistant?`)) return;

    setTogglingId(id);
    setTableError('');
    try {
      await api.patch(`/users/assistants/${id}/status`);
      setAssistants((prev) =>
        prev.map((a) =>
          (a._id === id || a.id === id) ? { ...a, isActive: !a.isActive } : a
        )
      );
    } catch (err) {
      setTableError(err.response?.data?.message || `Failed to ${action} assistant. Please try again.`);
    } finally {
      setTogglingId(null);
    }
  };

  const handleCopyPassword = () => {
    if (successInfo?.tempPassword) {
      navigator.clipboard.writeText(successInfo.tempPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-5 sm:p-8 max-w-7xl mx-auto w-full space-y-7">
      
      {/* Header */}
      <PageHeader
        badge="Staff Authorization"
        badgeIcon={Users}
        title="Manage Lab Assistants"
        description="Authorize lab assistants, assign exclusive laboratory boundaries, and monitor operational credentials."
        actions={
          <button
            type="button"
            onClick={() => {
              setFormError('');
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#087A35] hover:bg-[#075C2B] text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Lab Assistant
          </button>
        }
      />

      {tableError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{tableError}</span>
        </div>
      )}

      {/* Staff Table */}
      <div className="rounded-3xl border border-[#E5EBE6] bg-white shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#E5EBE6] flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-[#172033]">Authorized Laboratory Staff</h3>
            <p className="text-xs text-[#647067] mt-0.5">
              Each assistant is isolated to manage equipment and tickets for their designated laboratory facility.
            </p>
          </div>
          <span className="text-xs font-bold text-[#087A35] bg-[#EAF5ED] px-3 py-1 rounded-full border border-[#BDE3CA]">
            {assistants.length} Registered Staff
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F9F7] text-[#647067] font-bold border-b border-[#E5EBE6] uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-4">Assistant Name</th>
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4">Assigned Laboratory</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EBE6]">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-[#647067]">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#087A35] mb-2" />
                    Loading staff records...
                  </td>
                </tr>
              ) : assistants.length > 0 ? (
                assistants.map((ast) => (
                  <tr key={ast._id} className="hover:bg-[#F7F9F7]/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#EAF5ED] text-[#087A35] border border-[#BDE3CA] flex items-center justify-center shrink-0 font-bold">
                          {ast.name ? ast.name.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <div>
                          <span className="font-bold text-[#172033] block text-sm">{ast.name}</span>
                          <span className="text-[11px] text-[#647067] font-mono">ID: {ast._id.slice(-6).toUpperCase()}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 space-y-0.5">
                      <div className="flex items-center gap-1.5 text-[#172033]">
                        <Mail className="w-3.5 h-3.5 text-[#087A35]" />
                        <span>{ast.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[#647067] font-mono text-[11px]">
                        <Phone className="w-3.5 h-3.5 text-[#647067]" />
                        <span>{ast.mobile || 'N/A'}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {ast.assignedLabId ? (
                        <div>
                          <span className="font-semibold text-[#172033] block">
                            {ast.assignedLabId.labName || 'Assigned Lab'}
                          </span>
                          <span className="font-mono text-[11px] text-[#087A35] font-bold">
                            {ast.assignedLabId.labId} • {ast.assignedLabId.labBlock}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {ast.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#EAF5ED] text-[#087A35] border border-[#BDE3CA]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#087A35]" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          Inactive
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        disabled={togglingId === ast._id}
                        onClick={() => handleToggleStatus(ast._id, ast.isActive)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer disabled:opacity-50 ${
                          ast.isActive
                            ? 'text-red-700 bg-red-50 hover:bg-red-100 border border-red-200'
                            : 'text-[#087A35] bg-[#EAF5ED] hover:bg-[#DDF2E3] border border-[#BDE3CA]'
                        }`}
                      >
                        {togglingId === ast._id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : ast.isActive ? (
                          <>
                            <UserX className="w-3.5 h-3.5" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-3.5 h-3.5" />
                            Reactivate
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">
                    <EmptyState
                      icon={Users}
                      title="No assistants registered"
                      description="Create an assistant account to assign them to a laboratory."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Assistant Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Register New Lab Assistant"
        subtitle="Staff member will receive auto-generated credentials and laboratory isolation permissions"
      >
        {formError && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleCreateAssistant} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Dr. Rajesh Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#F7F9F7] border border-[#E5EBE6] rounded-xl px-4 py-2.5 text-sm text-[#172033] placeholder-[#647067]/60 focus:outline-none focus:border-[#087A35] focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-1.5">
              Work Email Address
            </label>
            <input
              type="email"
              required
              placeholder="e.g. rajesh@univ.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#F7F9F7] border border-[#E5EBE6] rounded-xl px-4 py-2.5 text-sm text-[#172033] placeholder-[#647067]/60 focus:outline-none focus:border-[#087A35] focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-1.5">
              Mobile Contact Number
            </label>
            <input
              type="tel"
              required
              placeholder="e.g. 9876543210"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full bg-[#F7F9F7] border border-[#E5EBE6] rounded-xl px-4 py-2.5 text-sm text-[#172033] placeholder-[#647067]/60 focus:outline-none focus:border-[#087A35] focus:bg-white transition font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-1.5">
              Assign to Laboratory (Isolation Boundary)
            </label>
            <select
              required
              value={assignedLabId}
              onChange={(e) => setAssignedLabId(e.target.value)}
              className="w-full bg-[#F7F9F7] border border-[#E5EBE6] rounded-xl px-4 py-2.5 text-sm text-[#172033] focus:outline-none focus:border-[#087A35] focus:bg-white transition cursor-pointer"
            >
              <option value="">-- Select Campus Laboratory --</option>
              {labs
                .filter((l) => l.isActive)
                .map((lab) => (
                  <option key={lab._id} value={lab._id}>
                    {lab.labName} ({lab.labId} • {lab.labBlock})
                  </option>
                ))}
            </select>
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
                  Creating Staff Account...
                </>
              ) : (
                'Create Assistant Account'
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Account Created Success Modal with Temporary Password */}
      {successInfo && (
        <Modal
          isOpen={true}
          onClose={() => setSuccessInfo(null)}
          title="Staff Account Created Successfully"
          subtitle="An account has been generated. Provide these login details to the assistant."
        >
          <div className="space-y-4">
            <div className="p-4 bg-[#EAF5ED] border border-[#BDE3CA] rounded-2xl flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-[#087A35] shrink-0" />
              <div>
                <p className="text-xs font-bold text-[#087A35]">{successInfo.name}</p>
                <p className="text-xs text-[#647067]">{successInfo.email}</p>
              </div>
            </div>

            <div className="p-4 bg-[#F7F9F7] border border-[#E5EBE6] rounded-2xl space-y-2">
              <span className="text-[10px] text-[#647067] font-bold uppercase tracking-wider block">
                Temporary Account Password
              </span>
              <div className="flex items-center justify-between">
                <span className="font-mono text-base font-extrabold text-[#087A35]">
                  {successInfo.tempPassword}
                </span>
                <button
                  type="button"
                  onClick={handleCopyPassword}
                  className="px-3 py-1.5 bg-white border border-[#CBD5E1] hover:border-[#087A35] rounded-xl text-xs font-bold text-[#172033] flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                >
                  <Copy className="w-3.5 h-3.5 text-[#087A35]" />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-[11px] text-[#647067]">
                The assistant will be required to establish a permanent password upon first login.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSuccessInfo(null)}
              className="w-full py-2.5 bg-[#087A35] hover:bg-[#075C2B] text-white font-bold rounded-xl text-xs transition"
            >
              Done & Return to List
            </button>
          </div>
        </Modal>
      )}

    </div>
  );
};

export default ManageAssistants;
