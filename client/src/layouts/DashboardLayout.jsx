import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Building2,
  Users,
  FileSpreadsheet,
  Cpu,
  CalendarCheck2,
  AlertOctagon,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Wrench,
  GraduationCap,
  ChevronRight,
  ArrowRightCircle
} from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'Admin';
  const isAssistant = user?.role === 'Assistant';
  const isStudent = user?.role === 'Student';
  const assignedLab = user?.assignedLab;

  const mainDashboardPath = isAdmin
    ? '/admin'
    : isAssistant
    ? '/assistant'
    : '/student';

  const adminNav = [
    { to: '/admin', label: 'Overview', icon: LayoutDashboard },
    { to: '/admin/labs', label: 'Laboratories', icon: Building2 },
    { to: '/admin/assistants', label: 'Lab Assistants', icon: Users },
    { to: '/admin/reports', label: 'Audit Reports', icon: FileSpreadsheet },
  ];

  const assistantNav = [
    { to: '/assistant', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/assistant/equipment', label: 'Equipment Inventory', icon: Cpu },
    { to: '/assistant/calibrations', label: 'Calibration Schedule', icon: CalendarCheck2 },
    { to: '/assistant/tickets', label: 'Damaged Queue', icon: AlertOctagon },
  ];

  const studentNav = [
    { to: '/student', label: 'My Fault Tickets', icon: LayoutDashboard },
  ];

  const navLinks = isAdmin ? adminNav : isAssistant ? assistantNav : studentNav;

  return (
    <div className="min-h-screen bg-[#F7F9F7] text-[#172033] flex flex-col md:flex-row relative">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-[#E5EBE6] z-20 shrink-0">
        
        {/* Brand Header */}
        <div className="p-5 border-b border-[#E5EBE6]">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#EAF5ED] border border-[#BDE3CA] flex items-center justify-center text-[#087A35] transition-transform group-hover:scale-105 shrink-0">
              <img src="/favicon.svg" alt="LabEquip" className="w-7 h-7" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-extrabold tracking-tight text-[#172033] flex items-center gap-0.5">
                Lab<span className="text-[#087A35]">Equip</span>
              </h1>
              <p className="text-[10px] text-[#647067] tracking-wider font-bold uppercase truncate">
                {isAdmin ? 'System Admin' : isAssistant ? 'Lab Assistant' : 'Student Portal'}
              </p>
            </div>
          </Link>
        </div>

        {/* Go to Main Dashboard Button */}
        <div className="px-4 pt-4">
          <button
            onClick={() => navigate(mainDashboardPath)}
            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#EAF5ED] hover:bg-[#DDF2E3] border border-[#BDE3CA] text-[#087A35] text-xs font-bold transition shadow-sm cursor-pointer"
          >
            <ArrowRightCircle className="w-4 h-4 text-[#087A35]" />
            Go to Main Dashboard
          </button>
        </div>

        {/* Assigned Lab Banner (For Assistants) */}
        {isAssistant && assignedLab && (
          <div className="mx-4 my-3 p-3.5 rounded-2xl bg-[#F7F9F7] border border-[#E5EBE6] text-xs">
            <span className="text-[#087A35] font-bold block uppercase tracking-wider text-[9px] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#087A35] animate-pulse" />
              Assigned Laboratory
            </span>
            <div className="text-[#172033] font-bold text-sm mt-1 truncate">
              {assignedLab.labName || 'Assigned Lab'}
            </div>
            <span className="text-[#647067] text-[11px] block mt-0.5 font-mono">
              Code: {assignedLab.labId || 'LAB'} • {assignedLab.labBlock || ''}
            </span>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          <p className="px-3 text-[10px] font-bold text-[#647067] uppercase tracking-wider mb-2">
            Navigation Menu
          </p>
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin' || item.to === '/assistant' || item.to === '/student'}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#EAF5ED] text-[#087A35] font-bold border-l-4 border-[#087A35]'
                    : 'text-[#647067] hover:text-[#172033] hover:bg-[#F7F9F7]'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-40" />
            </NavLink>
          ))}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-[#E5EBE6] bg-white">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="truncate">
              <p className="text-xs font-bold text-[#172033] truncate">{user?.name}</p>
              <span className="inline-flex items-center gap-1 text-[11px] text-[#087A35] font-semibold mt-0.5">
                {isAdmin ? (
                  <ShieldCheck className="w-3 h-3 text-[#087A35]" />
                ) : isAssistant ? (
                  <Wrench className="w-3 h-3 text-[#087A35]" />
                ) : (
                  <GraduationCap className="w-3 h-3 text-blue-600" />
                )}
                {user?.role}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-red-700 hover:text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="md:hidden bg-white text-[#172033] p-4 flex items-center justify-between border-b border-[#E5EBE6] sticky top-0 z-30 shadow-sm">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#EAF5ED] border border-[#BDE3CA] flex items-center justify-center text-[#087A35]">
            <img src="/favicon.svg" alt="LabEquip" className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-sm tracking-tight text-[#172033]">
            Lab<span className="text-[#087A35]">Equip</span>
          </span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl border border-[#E5EBE6] text-[#647067] hover:text-[#172033] hover:bg-[#F7F9F7]"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#E5EBE6] px-4 py-4 space-y-2 z-30 shadow-lg">
          <button
            onClick={() => {
              navigate(mainDashboardPath);
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3.5 py-2.5 bg-[#EAF5ED] text-[#087A35] font-bold text-xs rounded-xl border border-[#BDE3CA] mb-2"
          >
            <ArrowRightCircle className="w-4 h-4" />
            Go to Main Dashboard
          </button>
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                  isActive
                    ? 'bg-[#EAF5ED] text-[#087A35] font-bold'
                    : 'text-[#647067] hover:text-[#172033] hover:bg-[#F7F9F7]'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
          <div className="pt-2 border-t border-[#E5EBE6]">
            <p className="text-xs font-semibold text-[#172033] px-2 py-1">{user?.name} ({user?.role})</p>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl mt-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
