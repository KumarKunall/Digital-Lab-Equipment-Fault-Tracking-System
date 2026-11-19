import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Cpu,
  Plus,
  QrCode,
  Edit2,
  Archive,
  Printer,
  CheckCircle2,
  AlertCircle,
  Search,
  ExternalLink,
  Download,
  Copy,
  ChevronDown,
  ChevronUp,
  Loader2,
  Building2,
  Calendar
} from 'lucide-react';
import { OperationalStatusBadge, CalibrationStatusBadge } from '../../utils/statusBadges';
import PageHeader from '../../components/common/PageHeader';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';

const EquipmentManagement = () => {
  const { user } = useAuth();
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Active QR state
  const [qrData, setQrData] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [expandedQrId, setExpandedQrId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Active Edit state
  const [selectedItem, setSelectedItem] = useState(null);
  const [editStatus, setEditStatus] = useState('Ready to Use');
  const [editLocation, setEditLocation] = useState('');

  // Add Form states
  const todayStr = new Date().toISOString().split('T')[0];
  const [name, setName] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [model, setModel] = useState('');
  const [location, setLocation] = useState('');
  const [additionDate, setAdditionDate] = useState(todayStr);
  const [installationDate, setInstallationDate] = useState(todayStr);
  const [operationalStatus, setOperationalStatus] = useState('Ready to Use');
  const [selectedLabId, setSelectedLabId] = useState('');
  const [labs, setLabs] = useState([]);
  const [requiresCalibration, setRequiresCalibration] = useState(true);
  const [calibrationIntervalDays, setCalibrationIntervalDays] = useState(180);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchEquipment = async () => {
    try {
      const res = await api.get(`/equipment?search=${search}`);
      setEquipment(res.data.data || []);
    } catch (err) {
      console.error('Failed to load equipment:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, [search]);

  // Fetch available labs for assignment dropdown
  useEffect(() => {
    const fetchLabs = async () => {
      try {
        const res = await api.get('/labs');
        const labList = res.data.data || [];
        setLabs(labList);
        if (labList.length > 0) {
          const defaultLab = user?.assignedLabId?._id || user?.assignedLabId || labList[0]._id;
          setSelectedLabId(defaultLab);
        }
      } catch (err) {
        console.error('Failed to load laboratories:', err);
      }
    };
    fetchLabs();
  }, [user]);

  // Open QR modal directly from the item
  const handleSelectQrItem = (item) => {
    const qrImg = item.qrCodeDataUrl || item.qrDataUrl;
    if (qrImg) {
      setQrData({
        publicId: item.publicId,
        equipmentName: item.name,
        serialNumber: item.serialNumber,
        labName: item.labId?.labName || user?.assignedLab?.labName || 'Laboratory',
        labBlock: item.labId?.labBlock || user?.assignedLab?.labBlock || '',
        qrCodeDataUrl: qrImg,
        qrDataUrl: qrImg,
        targetUrl: item.targetUrl || `${window.location.origin}/equipment/${item.publicId}`
      });
      setShowQrModal(true);
    } else {
      handleOpenQr(item._id);
    }
  };

  // Fallback: Fetch QR from backend if not pre-attached
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
    const qrImg = qrData?.qrCodeDataUrl || qrData?.qrDataUrl;
    if (!qrImg) return;
    const link = document.createElement('a');
    link.href = qrImg;
    link.download = `QR_${(qrData.equipmentName || 'equipment').replace(/\s+/g, '_')}_${qrData.serialNumber || qrData.publicId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyPublicId = (pubId) => {
    navigator.clipboard.writeText(pubId);
    setCopiedId(pubId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Open Edit Modal
  const handleOpenEdit = (item) => {
    setSelectedItem(item);
    setEditStatus(item.operationalStatus || 'Ready to Use');
    setEditLocation(item.location || '');
    setError('');
    setShowEditModal(true);
  };

  // Reset Add Form fields
  const handleResetForm = () => {
    setName('');
    setSerialNumber('');
    setModel('');
    setLocation('');
    setAdditionDate(todayStr);
    setInstallationDate(todayStr);
    setOperationalStatus('Ready to Use');
    setRequiresCalibration(true);
    setCalibrationIntervalDays(180);
    setError('');
    if (labs.length > 0) {
      setSelectedLabId(user?.assignedLabId?._id || user?.assignedLabId || labs[0]._id);
    }
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError('');

    try {
      await api.patch(`/equipment/${selectedItem._id}`, {
        operationalStatus: editStatus,
        location: editLocation
      });

      setShowEditModal(false);
      setSuccessMsg(`Equipment '${selectedItem.name}' updated successfully.`);
      fetchEquipment();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update equipment');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle Archive
  const handleArchive = async (id, eqName) => {
    if (!window.confirm(`Are you sure you want to archive '${eqName}'? It will be removed from student view.`)) {
      return;
    }

    try {
      await api.patch(`/equipment/${id}/archive`);
      setSuccessMsg(`Equipment '${eqName}' has been archived.`);
      fetchEquipment();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to archive equipment');
    }
  };

  // Handle Add Equipment Submit
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Duplicate serial number check against current catalog
    const isDuplicate = equipment.some(
      (eq) => eq.serialNumber && eq.serialNumber.trim().toLowerCase() === serialNumber.trim().toLowerCase()
    );
    if (isDuplicate) {
      setError(`An instrument with serial number '${serialNumber.trim()}' already exists in this catalog.`);
      return;
    }

    setSubmitLoading(true);

    try {
      const payload = {
        name: name.trim(),
        serialNumber: serialNumber.trim(),
        model: model ? model.trim() : '',
        location: location.trim(),
        additionDate,
        installationDate: installationDate || additionDate,
        operationalStatus,
        requiresCalibration,
        calibrationIntervalDays: requiresCalibration ? Number(calibrationIntervalDays) : undefined
      };

      if (selectedLabId) {
        payload.labId = selectedLabId;
      }

      const res = await api.post('/equipment', payload);
      const newEquipment = res.data.data;

      setShowAddModal(false);
      handleResetForm();
      setSuccessMsg(`Equipment '${newEquipment.name}' created successfully with QR ID: ${newEquipment.publicId}`);

      // Refresh equipment catalog
      await fetchEquipment();

      // Automatically generate and present the QR code dialog
      if (newEquipment._id) {
        handleOpenQr(newEquipment._id);
      }

      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add equipment');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="p-5 sm:p-8 max-w-7xl mx-auto w-full space-y-7">
      
      {/* Header */}
      <PageHeader
        badge="Laboratory Inventory"
        badgeIcon={Cpu}
        title="Equipment Management"
        description="Catalog laboratory instruments, manage operational status, generate high-resolution QR labels, and track physical bench allocations."
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
            + Add New Equipment
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

      {/* Search Bar */}
      <div className="bg-white border border-[#E5EBE6] rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <input
            type="text"
            placeholder="Search equipment name, serial number, model, bench..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#F7F9F7] border border-[#E5EBE6] rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#172033] placeholder-[#647067] focus:outline-none focus:border-[#087A35] focus:bg-white transition"
          />
          <Search className="w-4 h-4 text-[#647067] absolute left-3 top-3" />
        </div>
        <span className="text-xs text-[#647067] font-semibold">
          {equipment.length} Instruments in Catalog
        </span>
      </div>

      {/* Equipment Table */}
      <div className="rounded-3xl border border-[#E5EBE6] bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F9F7] text-[#647067] font-bold border-b border-[#E5EBE6] uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-4">Instrument Details</th>
                <th className="px-6 py-4">Model & Serial</th>
                <th className="px-6 py-4">Bench Location</th>
                <th className="px-6 py-4">Operational Status</th>
                <th className="px-6 py-4">Calibration Health</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EBE6]">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-[#647067]">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#087A35] mb-2" />
                    Loading equipment catalog...
                  </td>
                </tr>
              ) : equipment.length > 0 ? (
                equipment.map((item) => {
                  const isExpanded = expandedQrId === item._id;

                  return (
                    <React.Fragment key={item._id}>
                      <tr className="hover:bg-[#F7F9F7]/60 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[#EAF5ED] text-[#087A35] border border-[#BDE3CA] flex items-center justify-center shrink-0">
                              <Cpu className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="font-bold text-[#172033] block text-sm">{item.name}</span>
                              <span className="text-[11px] text-[#647067]">
                                Added: {new Date(item.additionDate || item.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="font-mono text-xs font-bold text-[#172033] block">
                            SN: {item.serialNumber}
                          </span>
                          <span className="text-[#647067] text-[11px]">{item.model || 'Standard Model'}</span>
                        </td>

                        <td className="px-6 py-4 text-[#172033] font-medium">{item.location}</td>

                        <td className="px-6 py-4">
                          <OperationalStatusBadge status={item.operationalStatus} />
                        </td>

                        <td className="px-6 py-4">
                          <CalibrationStatusBadge
                            status={item.calibrationHealth?.status}
                            daysRemaining={item.calibrationHealth?.daysRemaining}
                          />
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Inline QR Toggle */}
                            <button
                              type="button"
                              onClick={() => setExpandedQrId(isExpanded ? null : item._id)}
                              className={`p-2 rounded-xl transition cursor-pointer border ${
                                isExpanded
                                  ? 'bg-[#087A35] text-white border-[#087A35]'
                                  : 'bg-[#EAF5ED] text-[#087A35] hover:bg-[#DDF2E3] border-[#BDE3CA]'
                              }`}
                              title="Toggle inline QR code"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                            </button>

                            {/* Full QR Modal */}
                            <button
                              type="button"
                              onClick={() => handleSelectQrItem(item)}
                              className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-[#CBD5E1] text-[#172033] text-xs font-semibold transition"
                              title="Open QR dialog with print and download"
                            >
                              Print QR
                            </button>

                            {/* Edit */}
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(item)}
                              className="p-2 rounded-xl text-[#647067] hover:text-[#172033] hover:bg-slate-100 transition cursor-pointer"
                              title="Edit location or status"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Archive */}
                            <button
                              type="button"
                              onClick={() => handleArchive(item._id, item.name)}
                              className="p-2 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 transition cursor-pointer"
                              title="Archive equipment"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Inline Expanded QR Code Row */}
                      {isExpanded && (item.qrCodeDataUrl || item.qrDataUrl) && (
                        <tr className="bg-[#EAF5ED]/30 border-b border-[#E5EBE6]">
                          <td colSpan="6" className="px-6 py-4">
                            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-white border border-[#BDE3CA] rounded-2xl shadow-sm">
                              <img
                                src={item.qrCodeDataUrl || item.qrDataUrl}
                                alt="Inline QR"
                                className="w-24 h-24 p-1.5 bg-white border border-[#E5EBE6] rounded-xl shadow-sm"
                              />
                              <div className="flex-1 space-y-1.5 text-center sm:text-left">
                                <div className="flex items-center justify-center sm:justify-start gap-2">
                                  <span className="font-extrabold text-sm text-[#172033]">{item.name}</span>
                                  <span className="font-mono text-xs text-[#087A35] font-bold">
                                    ID: {item.publicId}
                                  </span>
                                </div>
                                <p className="text-xs text-[#647067]">
                                  Target Public URL: {item.targetUrl || `${window.location.origin}/equipment/${item.publicId}`}
                                </p>
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                                  <button
                                    type="button"
                                    onClick={() => handleCopyPublicId(item.publicId)}
                                    className="px-3 py-1.5 rounded-lg bg-[#EAF5ED] border border-[#BDE3CA] text-[#087A35] text-xs font-bold flex items-center gap-1.5"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                    {copiedId === item.publicId ? 'Copied ID!' : 'Copy ID'}
                                  </button>
                                  <Link
                                    to={`/equipment/${item.publicId}`}
                                    target="_blank"
                                    className="px-3 py-1.5 rounded-lg bg-white border border-[#CBD5E1] text-[#172033] text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-50"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5 text-[#087A35]" />
                                    Open Student View
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6">
                    <EmptyState
                      icon={Cpu}
                      title="No equipment found"
                      description="Adjust your search term or add an instrument to the laboratory."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Add Equipment Modal ────────────────────────────────────────── */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          handleResetForm();
          setShowAddModal(false);
        }}
        title="Add Equipment to Inventory"
        subtitle="Register instrument and automatically generate unique QR identification"
      >
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-1.5">
              Equipment Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Digital Storage Oscilloscope 100MHz"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#F7F9F7] border border-[#E5EBE6] rounded-xl px-4 py-2.5 text-sm text-[#172033] placeholder-[#647067]/60 focus:outline-none focus:border-[#087A35] focus:bg-white transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-1.5">
                Serial Number *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. DSO-2024-001"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                className="w-full bg-[#F7F9F7] border border-[#E5EBE6] rounded-xl px-4 py-2.5 text-sm text-[#172033] placeholder-[#647067]/60 focus:outline-none focus:border-[#087A35] focus:bg-white transition font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-1.5">
                Model / Brand / Manufacturer
              </label>
              <input
                type="text"
                placeholder="e.g. Tektronix TBS1102"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-[#F7F9F7] border border-[#E5EBE6] rounded-xl px-4 py-2.5 text-sm text-[#172033] placeholder-[#647067]/60 focus:outline-none focus:border-[#087A35] focus:bg-white transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-1.5">
                Assigned Laboratory
              </label>
              {labs.length > 0 ? (
                <select
                  value={selectedLabId}
                  onChange={(e) => setSelectedLabId(e.target.value)}
                  className="w-full bg-[#F7F9F7] border border-[#E5EBE6] rounded-xl px-4 py-2.5 text-sm text-[#172033] focus:outline-none focus:border-[#087A35] focus:bg-white transition"
                >
                  {labs.map((l) => (
                    <option key={l._id} value={l._id}>
                      {l.labName} ({l.labBlock})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  disabled
                  value={user?.assignedLab?.labName || 'Current Laboratory'}
                  className="w-full bg-[#F7F9F7] border border-[#E5EBE6] rounded-xl px-4 py-2.5 text-sm text-[#647067] opacity-80"
                />
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-1.5">
                Bench / Cabinet Location *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Bench 04, Rack B"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-[#F7F9F7] border border-[#E5EBE6] rounded-xl px-4 py-2.5 text-sm text-[#172033] placeholder-[#647067]/60 focus:outline-none focus:border-[#087A35] focus:bg-white transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-1.5">
                Operational Status
              </label>
              <select
                value={operationalStatus}
                onChange={(e) => setOperationalStatus(e.target.value)}
                className="w-full bg-[#F7F9F7] border border-[#E5EBE6] rounded-xl px-3 py-2.5 text-sm text-[#172033] focus:outline-none focus:border-[#087A35] focus:bg-white transition"
              >
                <option value="Ready to Use">Ready to Use</option>
                <option value="Under Repair">Under Repair</option>
                <option value="Damaged">Damaged</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-1.5">
                Purchase Date
              </label>
              <input
                type="date"
                required
                value={additionDate}
                onChange={(e) => setAdditionDate(e.target.value)}
                className="w-full bg-[#F7F9F7] border border-[#E5EBE6] rounded-xl px-3 py-2.5 text-sm text-[#172033] focus:outline-none focus:border-[#087A35] focus:bg-white transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-1.5">
                Commissioning Date
              </label>
              <input
                type="date"
                required
                value={installationDate}
                onChange={(e) => setInstallationDate(e.target.value)}
                className="w-full bg-[#F7F9F7] border border-[#E5EBE6] rounded-xl px-3 py-2.5 text-sm text-[#172033] focus:outline-none focus:border-[#087A35] focus:bg-white transition"
              />
            </div>
          </div>

          <div className="p-4 bg-[#F7F9F7] border border-[#E5EBE6] rounded-2xl space-y-3">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={requiresCalibration}
                onChange={(e) => setRequiresCalibration(e.target.checked)}
                className="w-4 h-4 text-[#087A35] accent-[#087A35] rounded"
              />
              <span className="text-xs font-bold text-[#172033]">
                Instrument requires mandatory periodic calibration
              </span>
            </label>

            {requiresCalibration && (
              <div>
                <label className="block text-xs font-bold text-[#647067] mb-1">
                  Calibration Interval (Days)
                </label>
                <input
                  type="number"
                  min="30"
                  max="730"
                  value={calibrationIntervalDays}
                  onChange={(e) => setCalibrationIntervalDays(e.target.value)}
                  className="w-full bg-white border border-[#E5EBE6] rounded-xl px-3.5 py-2 text-sm text-[#172033] focus:outline-none focus:border-[#087A35]"
                />
                <span className="text-[11px] text-[#647067] block mt-1">
                  Next due date will automatically be set {calibrationIntervalDays} days from commissioning.
                </span>
              </div>
            )}
          </div>

          <div className="pt-2 flex items-center justify-between gap-3 border-t border-[#E5EBE6]">
            <button
              type="button"
              onClick={handleResetForm}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#647067] hover:bg-slate-100 border border-[#E5EBE6] transition cursor-pointer"
            >
              Reset Form
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  handleResetForm();
                  setShowAddModal(false);
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#647067] hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#087A35] hover:bg-[#075C2B] text-white rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {submitLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating QR & Saving...
                  </>
                ) : (
                  'Save & Generate QR'
                )}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* ── Edit Equipment Modal ───────────────────────────────────────── */}
      {selectedItem && (
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title={`Edit ${selectedItem.name}`}
          subtitle={`SN: ${selectedItem.serialNumber}`}
        >
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 mb-4">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-1.5">
                Operational Status
              </label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full bg-[#F7F9F7] border border-[#E5EBE6] rounded-xl px-4 py-2.5 text-sm text-[#172033] focus:outline-none focus:border-[#087A35] focus:bg-white transition"
              >
                <option value="Ready to Use">Ready to Use (Operational)</option>
                <option value="Under Repair">Under Repair (Under Inspection / Maintenance)</option>
                <option value="Damaged">Damaged (Fault Flagged / Not Operational)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-1.5">
                Bench / Storage Location
              </label>
              <input
                type="text"
                required
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                className="w-full bg-[#F7F9F7] border border-[#E5EBE6] rounded-xl px-4 py-2.5 text-sm text-[#172033] focus:outline-none focus:border-[#087A35] focus:bg-white transition"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#647067] hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitLoading}
                className="px-5 py-2.5 bg-[#087A35] hover:bg-[#075C2B] text-white rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50"
              >
                {submitLoading ? 'Updating...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── QR Code Preview Modal & Strict Printable Wrapper ──────────── */}
      <Modal
        isOpen={showQrModal}
        onClose={() => {
          setShowQrModal(false);
          setQrData(null);
        }}
        title="Equipment Identification QR Code"
        subtitle="Print or download this QR sticker to attach directly to the instrument"
        maxWidth="max-w-md"
      >
        {qrLoading || !qrData ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#087A35] animate-spin" />
            <p className="text-xs text-[#647067] font-mono">Loading QR identification...</p>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* Printable QR Target Container */}
            <div id="printable-qr" className="p-5 bg-white border border-[#E5EBE6] rounded-2xl text-center space-y-3">
              <div className="border-b border-[#E5EBE6] pb-2">
                <h4 className="font-extrabold text-base text-[#172033]">{qrData.equipmentName}</h4>
                <p className="text-xs text-[#647067] font-mono">SN: {qrData.serialNumber}</p>
                <p className="text-xs text-[#087A35] font-bold">{qrData.labName} • {qrData.labBlock}</p>
              </div>

              <div className="p-3 bg-white inline-block">
                <img
                  src={qrData.qrCodeDataUrl || qrData.qrDataUrl}
                  alt={`QR for ${qrData.equipmentName}`}
                  className="w-48 h-48 mx-auto"
                />
              </div>

              <div className="text-[11px] text-[#647067] font-mono border-t border-[#E5EBE6] pt-2">
                Scan with smartphone camera or Google Lens
                <div className="text-[#087A35] font-bold mt-0.5">ID: {qrData.publicId}</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="py-2.5 px-3 bg-[#087A35] hover:bg-[#075C2B] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Print Sticker
              </button>

              <button
                type="button"
                onClick={handleDownloadQr}
                className="py-2.5 px-3 bg-[#EAF5ED] hover:bg-[#DDF2E3] text-[#087A35] border border-[#BDE3CA] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download PNG
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-[#647067] pt-1">
              <button
                type="button"
                onClick={() => handleCopyPublicId(qrData.publicId)}
                className="text-[#087A35] font-bold hover:underline flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                {copiedId === qrData.publicId ? 'Copied Public ID!' : 'Copy Public ID'}
              </button>

              <Link
                to={`/equipment/${qrData.publicId}`}
                target="_blank"
                className="text-[#087A35] font-semibold hover:underline flex items-center gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View Student Profile
              </Link>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default EquipmentManagement;
