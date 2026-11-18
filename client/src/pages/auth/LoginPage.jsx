import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Lock,
  Mail,
  AlertCircle,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  Clock3,
  Loader2,
  RefreshCw,
  Eye,
  EyeOff,
  UserCheck,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';

const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role');

  // Active Login Mode: 'staff' (Admin/Assistant) or 'student'
  const [activeTab, setActiveTab] = useState(initialRole === 'Student' ? 'student' : 'staff');

  // Form states
  const [identifier, setIdentifier] = useState(''); // Email for staff, Roll Number for student
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forced Password Change Modal (for first login with temp password)
  const [showFirstChangeModal, setShowFirstChangeModal] = useState(false);
  const [currentTempPass, setCurrentTempPass] = useState('');
  const [newFirstPass, setNewFirstPass] = useState('');
  const [confirmFirstPass, setConfirmFirstPass] = useState('');
  const [firstChangeLoading, setFirstChangeLoading] = useState(false);
  const [firstChangeError, setFirstChangeError] = useState('');
  const [loggedUserPending, setLoggedUserPending] = useState(null);

  // ── Forgot Password Modal States ──────────────────────────────────────────
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newForgotPass, setNewForgotPass] = useState('');
  const [confirmForgotPass, setConfirmForgotPass] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const { login, updateUser } = useAuth();
  const navigate = useNavigate();

  // Handle countdown for resend OTP cooldown
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const isStudent = activeTab === 'student';
      const userData = await login(identifier, password, isStudent);

      // Check if user is forced to change password on first login
      if (userData.mustChangePassword) {
        setLoggedUserPending(userData);
        setCurrentTempPass(password);
        setShowFirstChangeModal(true);
        setLoading(false);
        return;
      }

      // Role-based routing
      if (userData.role === 'Admin') {
        navigate('/admin');
      } else if (userData.role === 'Assistant') {
        navigate('/assistant');
      } else {
        navigate('/student');
      }
    } catch (err) {
      const status = err.response?.status;
      const serverMsg = err.response?.data?.message || '';

      if (status === 503 || serverMsg.toLowerCase().includes('database not connected')) {
        setError(
          '⚠️ Database is not reachable. The server admin must whitelist the server IP in MongoDB Atlas.'
        );
      } else if (status === 401) {
        setError(
          activeTab === 'student'
            ? 'Invalid Student Roll Number or password. Please verify and try again.'
            : 'Invalid email address or password. Please verify and try again.'
        );
      } else if (!err.response) {
        setError('Cannot reach the server. Make sure the backend is running on port 5000.');
      } else {
        setError(serverMsg || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── First Login Force Password Change ─────────────────────────────────────
  const handleFirstChangeSubmit = async (e) => {
    e.preventDefault();
    setFirstChangeError('');

    if (newFirstPass.length < 6) {
      setFirstChangeError('New password must be at least 6 characters.');
      return;
    }
    if (newFirstPass !== confirmFirstPass) {
      setFirstChangeError('New passwords do not match.');
      return;
    }

    setFirstChangeLoading(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: currentTempPass,
        newPassword: newFirstPass
      });

      if (loggedUserPending) {
        updateUser({ mustChangePassword: false });
        setShowFirstChangeModal(false);

        if (loggedUserPending.role === 'Admin') {
          navigate('/admin');
        } else if (loggedUserPending.role === 'Assistant') {
          navigate('/assistant');
        } else {
          navigate('/student');
        }
      }
    } catch (err) {
      setFirstChangeError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setFirstChangeLoading(false);
    }
  };

  // ── Forgot Password Handlers ──────────────────────────────────────────────
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', { email: forgotEmail.trim() });
      setForgotSuccess(res.data.message || 'Verification OTP code dispatched to your email.');
      setForgotStep(2);
      setResendCooldown(60);
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Failed to dispatch reset code.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotLoading(true);

    try {
      const res = await api.post('/auth/verify-otp', {
        email: forgotEmail.trim(),
        otp: otp.trim()
      });
      setResetToken(res.data.resetToken);
      setForgotSuccess('OTP verified successfully! Create your new password.');
      setForgotStep(3);
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Invalid or expired OTP code.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotError('');

    if (newForgotPass.length < 6) {
      setForgotError('New password must be at least 6 characters.');
      return;
    }
    if (newForgotPass !== confirmForgotPass) {
      setForgotError('Passwords do not match.');
      return;
    }

    setForgotLoading(true);
    try {
      await api.post('/auth/reset-password', {
        resetToken,
        newPassword: newForgotPass
      });
      setForgotStep(4);
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setForgotError('');
    setForgotLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: forgotEmail.trim() });
      setForgotSuccess('A fresh 6-digit verification code has been dispatched.');
      setResendCooldown(60);
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9F7] text-[#172033] flex flex-col justify-between py-8 px-4">
      
      {/* Top Bar with Logo & Return Link */}
      <div className="max-w-md mx-auto w-full flex items-center justify-between mb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#647067] hover:text-[#087A35] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        <Link to="/track-ticket" className="text-xs font-semibold text-[#087A35] hover:underline">
          Track a Fault Ticket
        </Link>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md mx-auto w-full bg-white border border-[#E5EBE6] rounded-3xl p-7 sm:p-8 shadow-sm space-y-6">
        
        {/* Horizontal Brand Logo */}
        <div className="text-center">
          <Link to="/" className="inline-block">
            <img
              src="/labequip-logo.svg"
              alt="LabEquip"
              className="h-10 w-auto mx-auto object-contain"
            />
          </Link>
          <p className="text-xs text-[#647067] mt-3 font-medium">
            Sign in to access your laboratory operations console
          </p>
        </div>

        {/* Tab Switcher (Staff vs Student) */}
        <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-[#F7F9F7] rounded-2xl border border-[#E5EBE6]">
          <button
            type="button"
            onClick={() => {
              setActiveTab('staff');
              setError('');
              setIdentifier('');
            }}
            className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
              activeTab === 'staff'
                ? 'bg-white text-[#087A35] shadow-sm border border-[#BDE3CA]'
                : 'text-[#647067] hover:text-[#172033]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Staff (Admin / Assistant)
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('student');
              setError('');
              setIdentifier('');
            }}
            className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
              activeTab === 'student'
                ? 'bg-white text-[#087A35] shadow-sm border border-[#BDE3CA]'
                : 'text-[#647067] hover:text-[#172033]'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            Student Login
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-1.5">
              {activeTab === 'student' ? 'Student Roll Number' : 'Work Email Address'}
            </label>
            <div className="relative">
              <input
                type={activeTab === 'student' ? 'text' : 'email'}
                required
                autoComplete={activeTab === 'student' ? 'username' : 'email'}
                placeholder={activeTab === 'student' ? 'e.g. 2315001383' : 'e.g. staff@univ.edu'}
                value={identifier}
                onChange={(e) =>
                  setIdentifier(activeTab === 'student' ? e.target.value.toUpperCase() : e.target.value)
                }
                className="w-full bg-[#F7F9F7] border border-[#E5EBE6] rounded-xl px-4 py-2.5 text-sm text-[#172033] placeholder-[#647067]/60 focus:outline-none focus:border-[#087A35] focus:bg-white transition"
              />
              <div className="absolute right-3.5 top-3 text-[#647067]">
                {activeTab === 'student' ? (
                  <UserCheck className="w-4 h-4" />
                ) : (
                  <Mail className="w-4 h-4" />
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(true);
                  setForgotStep(1);
                  setForgotError('');
                  setForgotSuccess('');
                }}
                className="text-xs font-semibold text-[#087A35] hover:underline cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="Enter your account password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#F7F9F7] border border-[#E5EBE6] rounded-xl px-4 py-2.5 text-sm text-[#172033] placeholder-[#647067]/60 focus:outline-none focus:border-[#087A35] focus:bg-white transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-[#647067] hover:text-[#172033]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#087A35] hover:bg-[#075C2B] text-white font-bold rounded-xl text-xs sm:text-sm transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Verifying Credentials...
              </>
            ) : (
              `Sign In as ${activeTab === 'student' ? 'Student' : 'Staff'}`
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-[#E5EBE6] text-center text-xs text-[#647067]">
          <span>Need to report a broken instrument? </span>
          <Link to="/" className="text-[#087A35] font-bold hover:underline">
            Scan equipment QR code
          </Link>
        </div>
      </div>

      <footer className="text-center text-[11px] text-[#647067] py-4">
        Local Lab Equipment Calibration & Fault Tracking System • LabEquip
      </footer>

      {/* ── First-time Login Password Change Modal ────────────────────── */}
      {showFirstChangeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white border border-[#E5EBE6] rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#EAF5ED] text-[#087A35] border border-[#BDE3CA] flex items-center justify-center mx-auto">
              <KeyRound className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-[#172033]">Create Permanent Password</h3>
              <p className="text-xs text-[#647067] mt-1 leading-relaxed">
                You logged in with a temporary system password. Please establish a personal password to activate your account.
              </p>
            </div>

            {firstChangeError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                {firstChangeError}
              </div>
            )}

            <form onSubmit={handleFirstChangeSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#172033] mb-1">New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={newFirstPass}
                  onChange={(e) => setNewFirstPass(e.target.value)}
                  className="w-full bg-[#F7F9F7] border border-[#E5EBE6] rounded-xl px-3.5 py-2 text-sm text-[#172033] focus:outline-none focus:border-[#087A35]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#172033] mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Re-enter new password"
                  value={confirmFirstPass}
                  onChange={(e) => setConfirmFirstPass(e.target.value)}
                  className="w-full bg-[#F7F9F7] border border-[#E5EBE6] rounded-xl px-3.5 py-2 text-sm text-[#172033] focus:outline-none focus:border-[#087A35]"
                />
              </div>
              <button
                type="submit"
                disabled={firstChangeLoading}
                className="w-full py-2.5 bg-[#087A35] hover:bg-[#075C2B] text-white font-bold rounded-xl text-xs transition"
              >
                {firstChangeLoading ? 'Updating Password...' : 'Save Password & Continue'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Forgot Password 4-Step Modal ──────────────────────────────── */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white border border-[#E5EBE6] rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative space-y-4">
            
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-5 right-5 text-[#647067] hover:text-[#172033]"
            >
              ✕
            </button>

            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#EAF5ED] text-[#087A35] border border-[#BDE3CA] flex items-center justify-center mx-auto mb-2">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#172033]">
                {forgotStep === 1 && 'Reset Your Password'}
                {forgotStep === 2 && 'Enter 6-Digit OTP Code'}
                {forgotStep === 3 && 'Set New Password'}
                {forgotStep === 4 && 'Password Reset Complete'}
              </h3>
              <p className="text-xs text-[#647067] mt-1">
                {forgotStep === 1 && 'Enter your registered email address to receive a verification OTP.'}
                {forgotStep === 2 && `Enter the 6-digit code sent to ${forgotEmail}`}
                {forgotStep === 3 && 'Choose a strong new password for your account.'}
                {forgotStep === 4 && 'Your password has been changed. You can now sign in.'}
              </p>
            </div>

            {forgotError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                {forgotError}
              </div>
            )}
            {forgotSuccess && forgotStep !== 4 && (
              <div className="p-3 rounded-xl bg-[#EAF5ED] border border-[#BDE3CA] text-[#087A35] text-xs">
                {forgotSuccess}
              </div>
            )}

            {/* Step 1: Email */}
            {forgotStep === 1 && (
              <form onSubmit={handleRequestOtp} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#172033] mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. staff@univ.edu"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full bg-[#F7F9F7] border border-[#E5EBE6] rounded-xl px-3.5 py-2.5 text-sm text-[#172033] focus:outline-none focus:border-[#087A35]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-2.5 bg-[#087A35] hover:bg-[#075C2B] text-white font-bold rounded-xl text-xs transition"
                >
                  {forgotLoading ? 'Sending OTP Code...' : 'Send Verification OTP'}
                </button>
              </form>
            )}

            {/* Step 2: OTP */}
            {forgotStep === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#172033] mb-1">6-Digit Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full bg-[#F7F9F7] border border-[#E5EBE6] rounded-xl px-3.5 py-2.5 text-center text-lg font-mono tracking-widest text-[#172033] focus:outline-none focus:border-[#087A35]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-2.5 bg-[#087A35] hover:bg-[#075C2B] text-white font-bold rounded-xl text-xs transition"
                >
                  {forgotLoading ? 'Verifying...' : 'Verify OTP'}
                </button>
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0 || forgotLoading}
                    className="text-xs text-[#087A35] font-semibold hover:underline disabled:text-slate-400"
                  >
                    {resendCooldown > 0 ? `Resend Code in ${resendCooldown}s` : 'Resend OTP Code'}
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: New Password */}
            {forgotStep === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#172033] mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Minimum 6 characters"
                    value={newForgotPass}
                    onChange={(e) => setNewForgotPass(e.target.value)}
                    className="w-full bg-[#F7F9F7] border border-[#E5EBE6] rounded-xl px-3.5 py-2.5 text-sm text-[#172033] focus:outline-none focus:border-[#087A35]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#172033] mb-1">Confirm Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Re-enter password"
                    value={confirmForgotPass}
                    onChange={(e) => setConfirmForgotPass(e.target.value)}
                    className="w-full bg-[#F7F9F7] border border-[#E5EBE6] rounded-xl px-3.5 py-2.5 text-sm text-[#172033] focus:outline-none focus:border-[#087A35]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-2.5 bg-[#087A35] hover:bg-[#075C2B] text-white font-bold rounded-xl text-xs transition"
                >
                  {forgotLoading ? 'Updating Password...' : 'Reset Password'}
                </button>
              </form>
            )}

            {/* Step 4: Success */}
            {forgotStep === 4 && (
              <div className="text-center space-y-4 py-2">
                <CheckCircle2 className="w-12 h-12 text-[#087A35] mx-auto" />
                <p className="text-xs text-[#647067]">
                  Your password has been successfully reset. You can now log in with your new credentials.
                </p>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="w-full py-2.5 bg-[#087A35] hover:bg-[#075C2B] text-white font-bold rounded-xl text-xs transition"
                >
                  Return to Sign In
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default LoginPage;
