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
  X,
  Building2,
  Loader2,
  Copy,
  LayoutDashboard,
  ShieldCheck,
  UserCheck,
  UserX,
  FlaskConical,
  KeyRound,
} from 'lucide-react';
import '../../styles/ManageAssistants.css';

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
        api.get('/labs'),
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

  useEffect(() => { fetchData(); }, []);

  const handleCreateAssistant = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitLoading(true);
    try {
      const res = await api.post('/users/assistants', { name, email, mobile, assignedLabId });
      setSuccessInfo(res.data.data);
      setName(''); setEmail(''); setMobile(''); setAssignedLabId('');
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

  const copyCredentials = () => {
    if (successInfo) {
      const text = `Assistant ID: ${successInfo.assistantId}\nEmail: ${successInfo.email}\nTemporary Password: ${successInfo.tempPassword}\nLogin: http://localhost:5173/login`;
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  // Active assistants first, then alphabetical
  const sortedAssistants = [...assistants].sort((a, b) => {
    if (a.isActive === b.isActive) return a.name.localeCompare(b.name);
    return a.isActive ? -1 : 1;
  });

  const totalCount    = assistants.length;
  const activeCount   = assistants.filter((a) => a.isActive).length;
  const inactiveCount = assistants.filter((a) => !a.isActive).length;
  const labCount      = labs.filter((l) => l.isActive).length;

  return (
    <div className="ma-page">
      {/* Background canvas */}
      <div className="ma-bg" aria-hidden="true">
        <div className="ma-bg-grid" />
        <div className="ma-orb-1" />
        <div className="ma-orb-2" />
      </div>

      <div className="ma-content">

        {/* ── Header Banner ── */}
        <div className="ma-header-banner">
          <div className="ma-banner-left">
            <div className="ma-eyebrow">
              <ShieldCheck />
              Staff Authorization
            </div>
            <h1 className="ma-banner-title">
              Lab Assistants <span>Directory</span>
            </h1>
            <p className="ma-banner-desc">
              Assign technicians to specific laboratories. Account setup invitations are
              dispatched via Nodemailer with secure password links.
            </p>
          </div>
          <div className="ma-banner-right">
            <Link to="/admin" className="ma-btn-ghost">
              <LayoutDashboard />
              Dashboard
            </Link>
            <button
              className="ma-btn-primary"
              onClick={() => { setShowAddModal(true); setSuccessInfo(null); }}
            >
              <Plus />
              Add Lab Assistant
            </button>
          </div>
        </div>

        {/* ── Stats Strip ── */}
        <div className="ma-stats-strip">
          <div className="ma-stat-card blue">
            <div className="ma-stat-icon"><Users size={17} /></div>
            <div className="ma-stat-num">{totalCount}</div>
            <div className="ma-stat-label">Total Assistants</div>
          </div>
          <div className="ma-stat-card green">
            <div className="ma-stat-icon"><UserCheck size={17} /></div>
            <div className="ma-stat-num">{activeCount}</div>
            <div className="ma-stat-label">Active</div>
          </div>
          <div className="ma-stat-card rose">
            <div className="ma-stat-icon"><UserX size={17} /></div>
            <div className="ma-stat-num">{inactiveCount}</div>
            <div className="ma-stat-label">Deactivated</div>
          </div>
          <div className="ma-stat-card cyan">
            <div className="ma-stat-icon"><FlaskConical size={17} /></div>
            <div className="ma-stat-num">{labCount}</div>
            <div className="ma-stat-label">Active Labs</div>
          </div>
        </div>

        {/* ── Error Banner ── */}
        {tableError && (
          <div className="ma-alert error">
            <AlertCircle />
            <span>{tableError}</span>
            <button className="ma-alert-dismiss" onClick={() => setTableError('')}>
              <X size={15} />
            </button>
          </div>
        )}

        {/* ── Success Credentials Box ── */}
        {successInfo && (
          <div className="ma-cred-box">
            <div className="ma-cred-header">
              <div className="ma-cred-title-row">
                <div className="ma-cred-icon"><CheckCircle2 /></div>
                <div>
                  <div className="ma-cred-name">'{successInfo.name}' Created Successfully!</div>
                  <div className="ma-cred-sub">
                    Assigned to <strong style={{ color: '#f1f5f9' }}>{successInfo.assignedLab?.labName || 'Laboratory'}</strong>
                    &nbsp;· Credentials sent to {successInfo.email}
                  </div>
                </div>
              </div>
              <button className="ma-cred-copy-btn" onClick={copyCredentials}>
                <Copy />
                {copied ? 'Copied!' : 'Copy Credentials'}
              </button>
            </div>
            <div className="ma-cred-grid">
              <div>
                <div className="ma-cred-field-label">Assistant ID</div>
                <div className="ma-cred-field-val cyan">{successInfo.assistantId || 'AST-N/A'}</div>
              </div>
              <div>
                <div className="ma-cred-field-label">Login Email</div>
                <div className="ma-cred-field-val white">{successInfo.email}</div>
              </div>
              <div>
                <div className="ma-cred-field-label">Temporary Password</div>
                <div className="ma-cred-field-val amber">{successInfo.tempPassword}</div>
              </div>
            </div>
          </div>
        )}

        {/* ── Assistants Table ── */}
        <div className="ma-table-card">
          <div className="ma-table-topbar">
            <div className="ma-table-topbar-title">
              <Users />
              All Assistants
              <span className="ma-count-badge">{sortedAssistants.length}</span>
            </div>
          </div>

          <div className="ma-table-scroll">
            <table className="ma-table">
              <thead>
                <tr>
                  <th>Assistant ID</th>
                  <th>Assistant Name</th>
                  <th>Email Address</th>
                  <th>Mobile</th>
                  <th>Assigned Laboratory (Isolation)</th>
                  <th>Account Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7}>
                      <div className="ma-loading">
                        <Loader2 />
                        Loading assistants…
                      </div>
                    </td>
                  </tr>
                ) : sortedAssistants.length > 0 ? (
                  sortedAssistants.map((ast) => {
                    const astId = ast._id || ast.id;
                    const isToggling = togglingId === astId;
                    const initials = ast.name?.slice(0, 2).toUpperCase() || '??';
                    const isAssigned = !!(ast.assignedLabId?.labName);

                    return (
                      <tr key={astId} className={!ast.isActive ? 'deactivated' : ''}>
                        {/* ID */}
                        <td>
                          <span className="ma-id-badge">{ast.assistantId || 'LEGACY'}</span>
                        </td>

                        {/* Name */}
                        <td>
                          <div className="ma-name-cell">
                            <div className="ma-avatar">{initials}</div>
                            <span className="ma-name-text">{ast.name}</span>
                          </div>
                        </td>

                        {/* Email */}
                        <td>
                          <div className="ma-contact-cell email">
                            <Mail />
                            {ast.email}
                          </div>
                        </td>

                        {/* Mobile */}
                        <td>
                          <div className="ma-contact-cell phone">
                            <Phone />
                            {ast.mobile}
                          </div>
                        </td>

                        {/* Lab */}
                        <td>
                          <span className={`ma-lab-badge${isAssigned ? '' : ' unassigned'}`}>
                            <Building2 />
                            {ast.assignedLabId?.labName || 'Unassigned (N/A)'}
                          </span>
                        </td>

                        {/* Status */}
                        <td>
                          {ast.isActive ? (
                            <span className="ma-status-badge active">Active</span>
                          ) : (
                            <span className="ma-status-badge inactive">Deactivated</span>
                          )}
                        </td>

                        {/* Action */}
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => handleToggleStatus(astId, ast.isActive)}
                            disabled={isToggling}
                            className={`ma-action-btn ${ast.isActive ? 'deactivate' : 'reactivate'}`}
                          >
                            {isToggling ? 'Updating…' : ast.isActive ? 'Deactivate' : 'Reactivate'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7}>
                      <div className="ma-empty">
                        <Users />
                        <p>No lab assistants registered yet.</p>
                        <button className="ma-empty-link" onClick={() => setShowAddModal(true)}>
                          Add the first assistant →
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>{/* /ma-content */}

      {/* ── Add Assistant Modal ── */}
      {showAddModal && (
        <div className="ma-modal-overlay">
          <div className="ma-modal">
            <button className="ma-modal-close" onClick={() => { setShowAddModal(false); setFormError(''); }}>
              <X />
            </button>

            <div className="ma-modal-header">
              <div className="ma-modal-icon"><Users /></div>
              <div>
                <div className="ma-modal-title">Create Lab Assistant</div>
                <div className="ma-modal-subtitle">Account activated and credentials emailed automatically</div>
              </div>
            </div>

            {formError && (
              <div className="ma-form-error" style={{ marginBottom: 16 }}>
                <AlertCircle />
                <span>{formError}</span>
              </div>
            )}

            <form className="ma-form" onSubmit={handleCreateAssistant}>
              <div className="ma-field">
                <label className="ma-label">Full Name</label>
                <input
                  className="ma-input"
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="ma-field">
                <label className="ma-label">Official Email Address</label>
                <input
                  className="ma-input"
                  type="email"
                  required
                  placeholder="e.g. rahul@labtrack.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="ma-field">
                <label className="ma-label">Mobile Number</label>
                <input
                  className="ma-input"
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                />
              </div>

              <div className="ma-field">
                <label className="ma-label">Assign to Laboratory (Strict Isolation)</label>
                <select
                  className="ma-select"
                  required
                  value={assignedLabId}
                  onChange={(e) => setAssignedLabId(e.target.value)}
                >
                  <option value="">Select physical laboratory…</option>
                  {labs
                    .filter((l) => l.isActive)
                    .map((lab) => (
                      <option key={lab._id} value={lab._id}>
                        {lab.labName} ({lab.labId} - {lab.labBlock})
                      </option>
                    ))}
                </select>
              </div>

              <div className="ma-form-actions">
                <button
                  type="button"
                  className="ma-btn-cancel"
                  onClick={() => { setShowAddModal(false); setFormError(''); }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="ma-btn-primary"
                >
                  {submitLoading && <Loader2 size={14} style={{ animation: 'maSpIn 0.8s linear infinite' }} />}
                  {submitLoading ? 'Registering…' : 'Create & Send Credentials'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAssistants;
