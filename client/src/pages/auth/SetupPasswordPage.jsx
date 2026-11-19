import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { KeyRound, CheckCircle2, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';

const SetupPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setLoading(true);

    try {
      await api.post('/auth/setup-password', {
        token,
        newPassword: password
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to set password. Token may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9F7] text-[#172033] flex flex-col justify-between py-10 px-4">
      
      <div className="max-w-md mx-auto w-full mb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#647067] hover:text-[#087A35] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>

      <div className="w-full max-w-md mx-auto bg-white border border-[#E5EBE6] rounded-3xl p-7 sm:p-8 shadow-sm">
        
        <div className="text-center mb-6">
          <Link to="/" className="inline-block mb-4">
            <img src="/labequip-logo.svg" alt="LabEquip" className="h-10 w-auto mx-auto object-contain" />
          </Link>
          <div className="w-12 h-12 rounded-2xl bg-[#EAF5ED] text-[#087A35] border border-[#BDE3CA] mx-auto flex items-center justify-center mb-3">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-[#172033] tracking-tight">Set Your Password</h2>
          <p className="text-xs text-[#647067] mt-1 leading-relaxed">
            Welcome to LabEquip. Please establish a secure password to activate your staff account.
          </p>
        </div>

        {success ? (
          <div className="p-5 rounded-2xl bg-[#EAF5ED] border border-[#BDE3CA] text-center text-[#087A35] text-xs">
            <CheckCircle2 className="w-10 h-10 text-[#087A35] mx-auto mb-2" />
            <p className="font-bold text-sm">Password set successfully!</p>
            <p className="text-xs text-[#647067] mt-1">Redirecting you to the sign in page...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <input
                type="password"
                required
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#F7F9F7] border border-[#E5EBE6] rounded-xl px-4 py-2.5 text-sm text-[#172033] focus:outline-none focus:border-[#087A35] focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <input
                type="password"
                required
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#F7F9F7] border border-[#E5EBE6] rounded-xl px-4 py-2.5 text-sm text-[#172033] focus:outline-none focus:border-[#087A35] focus:bg-white transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#087A35] hover:bg-[#075C2B] text-white font-bold py-3 rounded-xl text-xs sm:text-sm transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Activating Account...
                </>
              ) : (
                'Set Password & Activate'
              )}
            </button>
          </form>
        )}
      </div>

      <footer className="text-center text-[11px] text-[#647067] py-4">
        Local Lab Equipment Calibration & Fault Tracking System • LabEquip
      </footer>
    </div>
  );
};

export default SetupPasswordPage;
