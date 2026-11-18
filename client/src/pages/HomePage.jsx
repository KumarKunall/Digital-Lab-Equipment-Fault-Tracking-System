import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  QrCode,
  Wrench,
  Calendar,
  Users,
  ArrowRight,
  Play,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  FileClock,
  FlaskConical,
  Layers3,
  Menu,
  ScanLine,
  ShieldCheck,
  GraduationCap,
  HelpCircle,
  Zap,
  Tag,
  RefreshCw,
  X,
  User,
  Search,
  ExternalLink,
} from 'lucide-react';
import heroLabImg from '../assets/hero-lab.jpg';
import '../styles/LandingPage.css';

/* ─── Component ─── */
const HomePage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'features', label: 'Features' },
    { id: 'workflow', label: 'How It Works' },
    { id: 'roles', label: 'Roles' },
    { id: 'about', label: 'About' },
  ];

  useEffect(() => {
    if (window.location.hash) {
      const hashId = window.location.hash.replace('#', '');
      if (['home', 'features', 'workflow', 'roles', 'about'].includes(hashId)) {
        setActiveSection(hashId);
      }
    }
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const headerOffset = 140;
      for (let i = navItems.length - 1; i >= 0; i--) {
        const item = navItems[i];
        const el = document.getElementById(item.id);
        if (el) {
          const top = el.offsetTop - headerOffset;
          if (scrollY >= top) {
            setActiveSection(item.id);
            return;
          }
        }
      }
      setActiveSection('home');
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('hashchange', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('hashchange', handleScroll);
    };
  }, []);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };
  const closeMenu = () => setMobileMenuOpen(false);

  const keyFeatures = [
    { icon: QrCode, title: 'QR-Based Access', description: 'Scan QR to view equipment details instantly.' },
    { icon: Wrench, title: 'Fault Tracking', description: 'Report issues with severity and photos.' },
    { icon: Calendar, title: 'Calibration Management', description: 'Track calibration dates and maintenance history.' },
    { icon: Users, title: 'Role-Based Access', description: 'Separate access for students, technicians and administrators.' },
  ];

  const workflowSteps = [
    { number: '01', icon: QrCode, title: 'Scan QR', description: 'Students scan the instrument QR sticker via smartphone camera or Google Lens to open its public view page without logging in.' },
    { number: '02', icon: Wrench, title: 'Report Fault', description: 'Students submit description and live damage photo. A traceable Ticket ID is generated and staff is alerted.' },
    { number: '03', icon: FileClock, title: 'Assistant Reviews & Updates', description: 'The assigned Lab Assistant inspects the instrument, initiates repairs, logs calibration, and updates status.' },
    { number: '04', icon: CheckCircle2, title: 'Track Status', description: 'Students follow repair progress with real-time status updates and resolution notes.' },
  ];

  const roles = [
    {
      title: 'Administrator',
      subtitle: 'Institutional Oversight',
      description: 'Manage campus laboratories, authorize lab assistant staff, monitor compliance ledgers, and view equipment damage trends.',
      icon: ShieldCheck,
      to: '/login?role=Admin',
      btnLabel: 'Admin Portal',
      features: [
        'Create, archive and reactivate laboratories',
        'Staff account creation with instant credentials',
        'System compliance rate and damage ranking',
        'Read-only audit and calibration ledgers',
      ],
    },
    {
      title: 'Lab Assistant',
      subtitle: 'Laboratory Operations',
      description: 'Strict lab-isolated console for managing equipment inventories, generating QR labels, tracking calibrations, and closing fault tickets.',
      icon: Wrench,
      to: '/login?role=Assistant',
      btnLabel: 'Assistant Portal',
      features: [
        'Strict lab isolation for assigned facility',
        'Generate, print and download QR code labels',
        'Log completed calibrations with next-due alarms',
        'Review reported damage photos and manage repairs',
      ],
    },
    {
      title: 'Student',
      subtitle: 'Public & Authenticated Access',
      description: 'Zero-friction fault reporting directly from equipment QR stickers, with personal portal access to track all reported tickets.',
      icon: GraduationCap,
      to: '/login?role=Student',
      btnLabel: 'Student Login',
      features: [
        'Instant public QR scan without prior login',
        'Capture damage photos via smartphone camera',
        'Track repair status by Ticket ID and Roll Number',
        'Dedicated student dashboard for ticket history',
      ],
    },
  ];

  const faqs = [
    { question: 'How do I use this application to report a damaged lab instrument?', answer: "Simply point your smartphone camera or Google Lens at the physical QR code sticker on the laboratory instrument. The QR code opens the equipment's public view page. Click 'Report Fault / Damage', fill in your student details, describe the malfunction, attach a photograph, and submit. The assigned Lab Assistant is instantly alerted." },
    { question: 'How does Student Login work?', answer: "When you submit your first fault report, the system creates a Student account for you and emails your login credentials (your Student Roll Number and a secure temporary password). You can then click 'Login', select 'Student Login', enter your Roll Number and password, and track all your submitted tickets." },
    { question: 'What functionality is available to Lab Assistants?', answer: "Lab Assistants have strict laboratory-isolated access. Once assigned to a lab, they can register equipment, generate and print QR codes, maintain immutable calibration logs, and manage the fault ticket queue (transitioning status from Open to Under Review, In Repair, or Resolved)." },
    { question: 'How does ticket tracking work without logging in?', answer: "You can visit the 'Track Ticket' page anytime from the navigation or home page. Enter your unique Ticket ID and Student Roll Number to view live repair progress, assigned technician updates, and completion notes." },
    { question: 'What do the different ticket statuses mean?', answer: "• Open: Ticket has been created and assigned to the lab assistant.\n• Under Review: The assistant is inspecting the reported issue.\n• In Repair: The instrument is currently being serviced or repaired.\n• Resolved: The fault has been repaired, verified, and closed with notes." },
    { question: 'How does the Forgot Password feature work?', answer: "If you forget your password, click 'Forgot Password?' on the Login page. Enter your registered email to receive a secure 6-digit OTP code valid for 5 minutes. Enter the OTP to verify your identity, then create and confirm a new password." },
  ];

  return (
    <div className="min-h-screen bg-white text-[#172033] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E5EBE6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/labequip-logo.svg" alt="LabEquip" className="h-10 sm:h-11 w-auto object-contain" />
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
            {navItems.map(item => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={() => setActiveSection(item.id)}
                  className={`transition pb-1 ${isActive ? 'text-[#087A35] font-bold border-b-2 border-[#087A35]' : 'text-[#647067] hover:text-[#087A35]'}`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>
          <div className="hidden sm:flex items-center gap-3">
            <Link to="/track-ticket" className="text-xs font-semibold text-[#647067] hover:text-[#087A35] px-3 py-2 transition">Track Ticket</Link>
            <Link to="/login" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#087A35] hover:bg-[#075C2B] text-white text-xs font-bold transition shadow-sm cursor-pointer">
              <User className="w-4 h-4" />
              Login
            </Link>
          </div>
          <button type="button" className="md:hidden p-2 rounded-xl text-[#647067] hover:text-[#172033] hover:bg-slate-100" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileMenuOpen}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-[#E5EBE6] px-5 py-4 space-y-2">
            {navItems.map(item => {
              const isActive = activeSection === item.id;
              return (
                <a key={item.id} href={`#${item.id}`} onClick={() => { setActiveSection(item.id); setMobileMenuOpen(false); }} className={`block text-sm px-3 py-2 rounded-xl transition ${isActive ? 'font-bold text-[#087A35] bg-[#EAF5ED]' : 'font-semibold text-[#647067] hover:text-[#087A35] hover:bg-[#F7F9F7]'}`}>{item.label}</a>
              );
            })}
            <div className="pt-3 border-t border-[#E5EBE6] flex flex-col gap-2">
              <Link to="/track-ticket" onClick={() => setMobileMenuOpen(false)} className="block text-xs font-semibold text-center text-[#647067] py-2 bg-slate-50 rounded-xl">Track Ticket Status</Link>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#087A35] text-white text-xs font-bold">
                <User className="w-4 h-4" />
                Login
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main */}
      <main className="flex-1">
        {/* Hero Section */}
        <section id="home" className="relative overflow-hidden bg-white border-b border-[#E5EBE6]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-center min-h-[460px] lg:min-h-[500px] py-10 lg:py-0">
              <div className="lg:col-span-6 lg:pr-8 space-y-6 z-10">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#172033] tracking-tight leading-[1.15]">
                  Simplify Lab Equipment <br />
                  <span className="text-[#087A35]">Management</span>
                </h1>
                <p className="text-sm sm:text-base text-[#647067] max-w-lg leading-relaxed">
                  Track equipment, report faults, manage repairs and maintain calibration records — all in one place.
                </p>
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link to="/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#087A35] hover:bg-[#075C2B] text-white text-sm font-bold transition shadow-sm">
                    Get Started
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <button type="button" onClick={() => setDemoModalOpen(true)} className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white hover:bg-[#F7F9F7] text-[#087A35] border border-[#CBD8CE] text-sm font-bold transition cursor-pointer">
                    <Play className="w-3.5 h-3.5 fill-[#087A35]" />
                    Watch Demo
                  </button>
                </div>
              </div>
              <div className="lg:col-span-6 relative mt-8 lg:mt-0 flex justify-center lg:justify-end">
                <div className="relative w-full max-w-lg lg:max-w-none rounded-3xl overflow-hidden shadow-lg border border-[#E5EBE6]">
                  <svg className="hidden lg:block absolute left-0 top-0 bottom-0 h-full w-24 text-white pointer-events-none z-10" viewBox="0 0 100 500" preserveAspectRatio="none" fill="currentColor"><path d="M0,0 L0,500 C40,400 80,300 30,150 C10,90 0,30 0,0 Z" /></svg>
                  <div className="hidden lg:block absolute -left-12 top-0 bottom-0 w-24 bg-[#EAF5ED]/70 rounded-r-full blur-sm pointer-events-none z-0" />
                  <img src={heroLabImg} alt="Laboratory Equipment: Digital Oscilloscope, Multimeter and QR code stand" className="w-full h-[320px] sm:h-[400px] object-cover object-center" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-12 sm:py-16 bg-[#F7F9F7] border-b border-[#E5EBE6]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-8">
              <span className="w-8 h-1.5 rounded-full bg-[#087A35]" />
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#172033] tracking-tight">Key Features</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {keyFeatures.map((feat, i) => (
                <div key={i} className="feature-card bg-white rounded-2xl p-6 border border-[#E5EBE6] shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-[#EAF5ED] text-[#087A35] border border-[#BDE3CA] flex items-center justify-center mb-4">
                      <feat.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-[#172033] mb-1.5">{feat.title}</h3>
                    <p className="text-xs sm:text-sm text-[#647067] leading-relaxed">{feat.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Workflow Section */}
        <section id="workflow" className="py-16 sm:py-20 bg-white border-b border-[#E5EBE6]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold text-[#087A35] uppercase tracking-wider bg-[#EAF5ED] px-3.5 py-1 rounded-full border border-[#BDE3CA] inline-block mb-3">End-to-End Workflow</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">How LabEquip Works</h2>
              <p className="text-sm text-[#647067] mt-2">From physical QR scan to ticket resolution — a seamless cycle keeping university laboratories compliant and functional.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {workflowSteps.map((step, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-[#F7F9F7] border border-[#E5EBE6] relative flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-black text-[#087A35]/30 font-mono">{step.number}</span>
                      <div className="w-10 h-10 rounded-xl bg-white border border-[#E5EBE6] text-[#087A35] flex items-center justify-center shadow-sm">
                        <step.icon className="w-5 h-5" />
                      </div>
                    </div>
                    <h3 className="text-base font-bold text-[#172033] mb-1.5">{step.title}</h3>
                    <p className="text-xs text-[#647067] leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Roles Section */}
        <section id="roles" className="py-16 sm:py-20 bg-[#F7F9F7] border-b border-[#E5EBE6]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold text-[#087A35] uppercase tracking-wider bg-[#EAF5ED] px-3.5 py-1 rounded-full border border-[#BDE3CA] inline-block mb-3">Role-Based Portals</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">Access for Every Role</h2>
              <p className="text-sm text-[#647067] mt-2">Tailored workspaces ensure strict isolation, data integrity, and operational focus for all campus users.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {roles.map((r, i) => (
                <div key={i} className="bg-white rounded-3xl p-7 border border-[#E5EBE6] shadow-sm flex flex-col justify-between hover:border-[#BDE3CA] transition">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-[#EAF5ED] text-[#087A35] border border-[#BDE3CA] flex items-center justify-center mb-5">
                      <r.icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold text-[#087A35] uppercase tracking-wider">{r.subtitle}</span>
                    <h3 className="text-xl font-extrabold text-[#172033] mt-0.5 mb-2.5">{r.title}</h3>
                    <p className="text-xs sm:text-sm text-[#647067] leading-relaxed mb-6">{r.description}</p>
                    <ul className="space-y-2.5 border-t border-[#E5EBE6] pt-5 mb-6 text-xs text-[#172033]">
                      {r.features.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-[#087A35] shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Link to={r.to} className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#EAF5ED] hover:bg-[#DDF2E3] text-[#087A35] font-bold text-xs border border-[#BDE3CA] transition">
                    {r.btnLabel}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-16 sm:py-20 bg-white border-b border-[#E5EBE6]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center space-y-5">
              <span className="text-xs font-bold text-[#087A35] uppercase tracking-wider bg-[#EAF5ED] px-3.5 py-1 rounded-full border border-[#BDE3CA] inline-block">About the Project</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">Centralized University Laboratory Management</h2>
              <p className="text-sm sm:text-base text-[#647067] leading-relaxed">
                LabEquip provides a unified platform to maintain institutional accountability across engineering, science, and computer laboratories. By combining automated QR label generation, transparent fault reporting, and proactive calibration scheduling, LabEquip minimizes experiment downtime and maximizes laboratory safety.
              </p>
              <div className="pt-4 flex flex-wrap justify-center gap-3">
                <Link to="/track-ticket" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-[#172033] border border-[#CBD5E1] text-xs font-bold transition">
                  <Search className="w-4 h-4 text-[#087A35]" />
                  Track an Existing Ticket
                </Link>
                <Link to="/login" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#087A35] hover:bg-[#075C2B] text-white text-xs font-bold transition">
                  Sign In to Console
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs Section */}
        <section id="faqs" className="py-16 sm:py-20 bg-[#F7F9F7] border-b border-[#E5EBE6]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-xs font-bold text-[#087A35] uppercase tracking-wider bg-[#EAF5ED] px-3.5 py-1 rounded-full border border-[#BDE3CA] inline-block mb-3">Got Questions?</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">Frequently Asked Questions</h2>
            </div>
            <div className="space-y-3.5">
              {faqs.map((faq, idx) => (
                <div key={idx} className="rounded-2xl bg-white border border-[#E5EBE6] overflow-hidden transition">
                  <button type="button" onClick={() => toggleFaq(idx)} className="w-full text-left p-5 flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-[#172033] hover:text-[#087A35] transition cursor-pointer">
                    <span>{faq.question}</span>
                    <ChevronDown className={`w-5 h-5 text-[#647067] shrink-0 transition-transform ${activeFaq === idx ? 'rotate-180 text-[#087A35]' : ''}`} />
                  </button>
                  {activeFaq === idx && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-[#647067] leading-relaxed border-t border-[#E5EBE6] pt-4 whitespace-pre-line bg-[#F7F9F7]/50">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Watch Demo Modal */}
        {demoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white border border-[#E5EBE6] rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative">
              <button onClick={() => setDemoModalOpen(false)} className="absolute top-5 right-5 text-slate-400 hover:text-[#172033]">
                <X className="w-5 h-5" />
              </button>
              <div className="w-12 h-12 rounded-2xl bg-[#EAF5ED] text-[#087A35] flex items-center justify-center mb-4">
                <Play className="w-6 h-6 fill-[#087A35]" />
              </div>
              <h3 className="text-lg font-bold text-[#172033]">LabEquip System Demonstration</h3>
              <p className="text-xs text-[#647067] mt-1 mb-5 leading-relaxed">
                Experience the fast 3-step fault reporting cycle: scan the instrument QR, snap the damage photograph, and receive automated email updates as the lab assistant inspects and repairs the hardware.
              </p>
              <div className="p-4 bg-[#F7F9F7] rounded-2xl border border-[#E5EBE6] space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-[#172033]">
                  <QrCode className="w-4 h-4 text-[#087A35]" />
                  Try scanning any equipment label on campus!
                </div>
                <p className="text-[#647067]">Alternatively, test the ticket lookup tool using your Ticket ID and Roll Number.</p>
              </div>
              <div className="mt-5 flex items-center justify-end gap-3">
                <Link to="/track-ticket" onClick={() => setDemoModalOpen(false)} className="px-4 py-2 text-xs font-bold text-[#087A35] hover:bg-[#EAF5ED] rounded-xl transition">
                  Track a Ticket
                </Link>
                <button type="button" onClick={() => setDemoModalOpen(false)} className="px-5 py-2 text-xs font-bold bg-[#087A35] hover-bg-[#075C2B] text-white rounded-xl transition">
                  Got It
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E5EBE6] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-[#E5EBE6]">
            <Link to="/" className="flex items-center gap-3">
              <img src="/labequip-logo.svg" alt="LabEquip" className="h-9 w-auto object-contain" />
            </Link>
            <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-[#647067]">
              <a href="#home" className="hover:text-[#087A35]">Home</a>
              <a href="#features" className="hover:text-[#087A35]">Features</a>
              <a href="#workflow" className="hover:text-[#087A35]">How It Works</a>
              <a href="#roles" className="hover:text-[#087A35]">Roles</a>
              <a href="#about" className="hover:text-[#087A35]">About</a>
              <Link to="/track-ticket" className="text-[#087A35] hover:underline">Track Ticket</Link>
              <Link to="/login" className="hover:text-[#087A35]">Staff & Student Login</Link>
            </div>
          </div>
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#647067]">
            <p>© {new Date().getFullYear()} LabEquip — Local Lab Equipment Calibration & Fault Tracking System.</p>
            <p>Designed for university laboratory compliance and equipment lifecycle management.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
