import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Building2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Wrench,
  ArrowRight,
  ShieldCheck,
  QrCode,
  Printer,
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';
import { OperationalStatusBadge, CalibrationStatusBadge } from '../../utils/statusBadges';

const EquipmentPublicView = () => {
  const { publicId } = useParams();
  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const res = await api.get(`/equipment/public/${publicId}`);
        setEquipment(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Equipment record not found or no longer active');
      } finally {
        setLoading(false);
      }
    };
    fetchEquipment();
  }, [publicId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9F7] flex items-center justify-center p-4">
        <div className="p-8 bg-white border border-[#E5EBE6] rounded-3xl shadow-sm text-center flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#087A35] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-[#647067]">Retrieving equipment profile...</p>
        </div>
      </div>
    );
  }

  if (error || !equipment) {
    return (
      <div className="min-h-screen bg-[#F7F9F7] flex items-center justify-center p-4">
        <div className="bg-white border border-[#E5EBE6] rounded-3xl max-w-md w-full p-8 text-center shadow-sm">
          <div className="w-12 h-12 bg-red-50 text-red-600 border border-red-200 rounded-2xl flex items-center justify-center mx-auto mb-3.5">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-[#172033]">Equipment Record Not Found</h2>
          <p className="text-xs text-[#647067] mt-1 mb-6 leading-relaxed">{error}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#087A35] hover:bg-[#075C2B] text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  const isReady = equipment.operationalStatus === 'Ready to Use';

  return (
    <div className="min-h-screen bg-[#F7F9F7] text-[#172033] py-8 px-4 flex flex-col justify-between">
      
      <div className="max-w-md mx-auto w-full">
        
        {/* Top Header with Return & Brand */}
        <div className="flex items-center justify-between mb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#647067] hover:text-[#087A35] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Home
          </Link>
          <img src="/labequip-logo.svg" alt="LabEquip" className="h-7 w-auto object-contain" />
        </div>

        {/* Verification Pill */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF5ED] border border-[#BDE3CA] text-[#087A35] text-[11px] font-bold tracking-wider uppercase">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified University Laboratory Instrument
          </div>
        </div>

        {/* Equipment Main Profile Card */}
        <div className="bg-white border border-[#E5EBE6] rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
          
          {/* Status Alert Banner */}
          {isReady ? (
            <div className="p-4 rounded-2xl bg-[#EAF5ED] border border-[#BDE3CA] text-[#087A35] flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#087A35] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold">Instrument is Ready to Use</p>
                <p className="text-[11px] text-[#087A35]/80 mt-0.5 leading-relaxed">
                  Verified operational for student experiments. Report any unexpected faults immediately.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold">Do Not Power On / Under Inspection</p>
                <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                  This instrument has been flagged for repair or damage inspection.
                </p>
              </div>
            </div>
          )}

          {/* Instrument Title & Serial */}
          <div>
            <span className="font-mono text-xs text-[#087A35] block uppercase tracking-wider font-bold">
              SN: {equipment.serialNumber} {equipment.model ? `• ${equipment.model}` : ''}
            </span>
            <h1 className="text-2xl font-extrabold text-[#172033] mt-1 tracking-tight">
              {equipment.name}
            </h1>
          </div>

          {/* Key Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs border-t border-b border-[#E5EBE6] py-5">
            <div>
              <span className="text-[#647067] block text-[11px] font-bold uppercase tracking-wider">
                Laboratory
              </span>
              <p className="font-bold text-[#172033] mt-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#087A35]" />
                {equipment.labName}
              </p>
              <span className="text-[10px] text-[#647067] font-mono">
                {equipment.labBlock} ({equipment.labId})
              </span>
            </div>

            <div>
              <span className="text-[#647067] block text-[11px] font-bold uppercase tracking-wider">
                Bench Location
              </span>
              <p className="font-bold text-[#172033] mt-1">{equipment.location}</p>
            </div>

            <div>
              <span className="text-[#647067] block text-[11px] font-bold uppercase tracking-wider">
                Operational Status
              </span>
              <div className="mt-1.5">
                <OperationalStatusBadge status={equipment.operationalStatus} />
              </div>
            </div>

            <div>
              <span className="text-[#647067] block text-[11px] font-bold uppercase tracking-wider">
                Calibration Status
              </span>
              <div className="mt-1.5">
                <CalibrationStatusBadge
                  status={equipment.calibrationHealth?.status}
                  daysRemaining={equipment.calibrationHealth?.daysRemaining}
                />
              </div>
            </div>
          </div>

          {/* Calibration Notice */}
          <div className="text-xs text-[#647067] flex items-center justify-between font-medium">
            <span>Next Calibration Due:</span>
            <span className="font-mono font-bold text-[#172033]">
              {equipment.nextCalibrationDate
                ? new Date(equipment.nextCalibrationDate).toLocaleDateString()
                : 'N/A (Exempt)'}
            </span>
          </div>

          {/* QR Code Identification Card */}
          {equipment.qrCodeDataUrl && (
            <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-[#F7F9F7] border border-[#E5EBE6]">
              <div className="p-2 bg-white rounded-xl shrink-0 border border-[#E5EBE6] shadow-sm">
                <img src={equipment.qrCodeDataUrl} alt="Equipment QR Code" className="w-16 h-16" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#172033] flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5 text-[#087A35]" />
                  Verified Equipment QR Code
                </p>
                <p className="text-[11px] text-[#647067] font-mono mt-0.5 truncate">
                  ID: <span className="text-[#087A35] font-bold">{equipment.publicId}</span>
                </p>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="mt-1.5 text-[11px] text-[#087A35] hover:text-[#075C2B] font-bold inline-flex items-center gap-1 cursor-pointer transition"
                >
                  <Printer className="w-3 h-3" />
                  Print / Save QR Label
                </button>
              </div>
            </div>
          )}

          {/* Action: Raise Ticket Button */}
          <div className="pt-2">
            <Link
              to={`/equipment/${equipment.publicId}/report`}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl text-xs sm:text-sm transition shadow-sm cursor-pointer"
            >
              <Wrench className="w-4 h-4" />
              Report Fault / Damage (Raise Ticket)
            </Link>
          </div>
        </div>

        {/* Track Ticket / Sign In Link */}
        <div className="text-center mt-6">
          <Link
            to="/login?role=Student"
            className="text-xs text-[#647067] hover:text-[#087A35] font-semibold inline-flex items-center gap-1.5 transition"
          >
            Already submitted a fault report? Sign in as Student <ArrowRight className="w-3.5 h-3.5 text-[#087A35]" />
          </Link>
        </div>
      </div>

      <footer className="text-center text-[11px] text-[#647067] py-4 mt-8">
        Local Lab Equipment Calibration & Fault Tracking System • LabEquip
      </footer>
    </div>
  );
};

export default EquipmentPublicView;
