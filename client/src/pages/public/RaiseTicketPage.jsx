import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Wrench,
  Camera,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Copy,
  Loader2,
  ArrowRight
} from 'lucide-react';

const RaiseTicketPage = () => {
  const { publicId } = useParams();

  // Equipment info state
  const [equipment, setEquipment] = useState(null);
  const [loadingEq, setLoadingEq] = useState(true);

  // Form states
  const [studentName, setStudentName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Submission states
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const res = await api.get(`/equipment/public/${publicId}`);
        setEquipment(res.data.data);
      } catch (err) {
        setError('Equipment details could not be retrieved.');
      } finally {
        setLoadingEq(false);
      }
    };
    fetchEquipment();
  }, [publicId]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        return setError('Please select an image file (JPEG, PNG, WebP)');
      }
      setPhoto(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!photo) {
      return setError('Please upload or snap a photograph of the damaged instrument.');
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('publicId', publicId);
      formData.append('studentName', studentName);
      formData.append('rollNumber', rollNumber);
      formData.append('mobile', mobile);
      if (email) formData.append('email', email);
      formData.append('description', description);
      formData.append('photo', photo);

      const res = await api.post('/tickets/public', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSubmittedTicket(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit fault ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyId = () => {
    if (submittedTicket?.ticketId) {
      navigator.clipboard.writeText(submittedTicket.ticketId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9F7] text-[#172033] py-8 px-4 flex flex-col justify-between">
      
      <div className="max-w-md mx-auto w-full">
        
        {/* Navigation link */}
        <Link
          to={`/equipment/${publicId}`}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#647067] hover:text-[#087A35] mb-5 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Equipment Profile
        </Link>

        {submittedTicket ? (
          /* ── Confirmation Screen ────────────────────────────────────────── */
          <div className="bg-white border border-[#E5EBE6] rounded-3xl p-7 sm:p-8 shadow-sm text-center space-y-5">
            <div className="w-16 h-16 bg-[#EAF5ED] border border-[#BDE3CA] text-[#087A35] rounded-3xl flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-[#172033] tracking-tight">
                Fault Ticket Submitted!
              </h2>
              <p className="text-xs text-[#647067] mt-1.5 leading-relaxed">
                Your report has been dispatched to the assigned lab assistant. Please save your Ticket Reference ID for tracking:
              </p>
            </div>

            <div className="p-4 bg-[#F7F9F7] rounded-2xl border border-[#E5EBE6] flex items-center justify-between">
              <div className="text-left">
                <span className="text-[10px] text-[#647067] block font-bold uppercase tracking-wider">
                  Ticket Reference ID
                </span>
                <span className="font-mono text-base font-extrabold text-[#087A35]">
                  {submittedTicket.ticketId}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyId}
                className="px-3.5 py-1.5 bg-white border border-[#CBD5E1] hover:border-[#087A35] rounded-xl text-xs font-bold text-[#172033] flex items-center gap-1.5 transition cursor-pointer shadow-sm"
              >
                <Copy className="w-3.5 h-3.5 text-[#087A35]" />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <div className="pt-2 space-y-2.5">
              <Link
                to={`/track-ticket?ticketId=${submittedTicket.ticketId}&rollNumber=${rollNumber}`}
                className="w-full inline-flex items-center justify-center gap-2 py-3 bg-[#087A35] hover:bg-[#075C2B] text-white font-bold rounded-xl text-xs sm:text-sm transition shadow-sm"
              >
                Track Repair Progress
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/"
                className="w-full inline-block py-2 text-xs font-semibold text-[#647067] hover:text-[#172033] transition"
              >
                Return to Home
              </Link>
            </div>
          </div>
        ) : (
          /* ── Ticket Submission Form ─────────────────────────────────────── */
          <div className="bg-white border border-[#E5EBE6] rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
            <div className="flex items-center gap-3.5 border-b border-[#E5EBE6] pb-4">
              <div className="w-11 h-11 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center shrink-0">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#172033]">Report Broken Equipment</h2>
                <p className="text-xs text-[#647067] mt-0.5">
                  {equipment ? `${equipment.name} (${equipment.labName})` : 'Loading equipment details...'}
                </p>
              </div>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-1.5">
                  Your Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mohit Kumar"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full bg-[#F7F9F7] border border-[#E5EBE6] rounded-xl px-4 py-2.5 text-sm text-[#172033] placeholder-[#647067]/60 focus:outline-none focus:border-[#087A35] focus:bg-white transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-1.5">
                    Roll Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2315001383"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
                    className="w-full bg-[#F7F9F7] border border-[#E5EBE6] rounded-xl px-4 py-2.5 text-sm text-[#172033] placeholder-[#647067]/60 focus:outline-none focus:border-[#087A35] focus:bg-white transition font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-1.5">
                    Mobile Number
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
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-1.5">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  placeholder="e.g. student@univ.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#F7F9F7] border border-[#E5EBE6] rounded-xl px-4 py-2.5 text-sm text-[#172033] placeholder-[#647067]/60 focus:outline-none focus:border-[#087A35] focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-1.5">
                  Describe Fault / Damage
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="e.g. Channel 1 probe jack is loose and displaying noise artifacts. Screen flickers on power-up."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#F7F9F7] border border-[#E5EBE6] rounded-xl px-4 py-2.5 text-sm text-[#172033] placeholder-[#647067]/60 focus:outline-none focus:border-[#087A35] focus:bg-white transition"
                ></textarea>
              </div>

              {/* Damage Photo Upload */}
              <div>
                <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-1.5">
                  Photograph of Damaged Equipment (Required)
                </label>
                <div className="border-2 border-dashed border-[#CBD5E1] hover:border-[#087A35] rounded-2xl p-4 text-center bg-[#F7F9F7] hover:bg-[#EAF5ED]/30 transition cursor-pointer relative">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {previewUrl ? (
                    <div className="space-y-2">
                      <img
                        src={previewUrl}
                        alt="Damage preview"
                        className="w-32 h-32 object-cover mx-auto rounded-xl border border-[#E5EBE6] shadow-sm"
                      />
                      <span className="text-xs text-[#087A35] font-bold block">
                        Tap to Change Photo
                      </span>
                    </div>
                  ) : (
                    <div className="py-4">
                      <Camera className="w-8 h-8 text-[#087A35] mx-auto mb-1.5" />
                      <span className="text-xs font-bold text-[#172033] block">
                        Tap to Snap Photo with Camera
                      </span>
                      <span className="text-[11px] text-[#647067]">or upload from device gallery</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs sm:text-sm transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting Report & Uploading Photo...
                  </>
                ) : (
                  'Submit Fault Ticket'
                )}
              </button>
            </form>
          </div>
        )}
      </div>

      <footer className="text-center text-[11px] text-[#647067] py-4 mt-8">
        Local Lab Equipment Calibration & Fault Tracking System • LabEquip
      </footer>
    </div>
  );
};

export default RaiseTicketPage;
