import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  FileClock,
  FlaskConical,
  Layers3,
  Menu,
  QrCode,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Wrench,
  X,
  GraduationCap,
  HelpCircle,
  Zap,
  Users,
  Tag,
  RefreshCw,
} from "lucide-react";

import "../styles/HomePage.css";

/* ─── Static Data ─── */
const features = [
  {
    num: "01",
    icon: Layers3,
    title: "Centralized Equipment Inventory",
    description:
      "Maintain organized records of laboratory instruments, serial numbers, locations, operational conditions, and equipment history.",
    color: "hp-fi-blue",
  },
  {
    num: "02",
    icon: QrCode,
    title: "Smart QR Identification",
    description:
      "Generate a unique QR code for every instrument. Scan it using Google Lens or a mobile camera to instantly open its equipment profile.",
    color: "hp-fi-cyan",
  },
  {
    num: "03",
    icon: CalendarClock,
    title: "Calibration Management",
    description:
      "Monitor last calibration dates, upcoming due dates, overdue equipment, and preserve every completed calibration record.",
    color: "hp-fi-violet",
  },
  {
    num: "04",
    icon: ClipboardCheck,
    title: "Digital Fault Tracking",
    description:
      "Allow students to report damaged instruments with photographs and help assistants manage the complete repair lifecycle.",
    color: "hp-fi-emerald",
  },
];

const workflow = [
  {
    number: "01",
    icon: Wrench,
    title: "Register Equipment",
    description:
      "The Lab Assistant adds equipment details directly into their assigned laboratory inventory.",
  },
  {
    number: "02",
    icon: QrCode,
    title: "Generate & Scan QR",
    description:
      "A unique QR label is generated. Students scan it via camera or Google Lens to view instrument details.",
  },
  {
    number: "03",
    icon: FileClock,
    title: "Report a Fault",
    description:
      "Students submit a fault description and damage photo. The system creates a traceable ticket and notifies staff.",
  },
  {
    number: "04",
    icon: CheckCircle2,
    title: "Resolve & Maintain",
    description:
      "The Lab Assistant reviews the ticket, manages repairs, and updates the status with real-time email alerts to the student.",
  },
];

const portals = [
  {
    title: "Administrator",
    subtitle: "System Management",
    description:
      "Manage laboratories, archive and restore labs, create Lab Assistant accounts, and monitor global read-only reports.",
    icon: ShieldCheck,
    accent: "hp-portal-blue",
    action: "Access Admin Portal",
    to: "/login?role=Admin",
    points: [
      "Create, archive and restore laboratories",
      "Direct Lab Assistant account creation",
      "Automatic credentials dispatch via email",
      "Calibrated and damaged equipment reports",
    ],
  },
  {
    title: "Lab Assistant",
    subtitle: "Laboratory Operations",
    description:
      "Manage assigned laboratory equipment, generate QR labels, maintain calibration records, and resolve fault tickets.",
    icon: Wrench,
    accent: "hp-portal-green",
    action: "Access Assistant Portal",
    to: "/login?role=Assistant",
    points: [
      "Strict lab-isolated inventory control",
      "Generate and print high-res QR codes",
      "Optional calibration scheduling",
      "Receive real-time fault email notifications",
    ],
  },
  {
    title: "Student",
    subtitle: "Fault Reporting & Dashboard",
    description:
      "Scan equipment QR codes to report faults with photographs. Automatically receive login credentials and track all your tickets.",
    icon: GraduationCap,
    accent: "hp-portal-violet",
    action: "Login as Student",
    to: "/login?role=Student",
    points: [
      "Instant QR scan fault submission",
      "Damage photo attachment",
      "Personal Student Dashboard access",
      "Automated email updates on ticket progress",
    ],
  },
];

const faqs = [
  {
    question: "How do I use this application to report a damaged lab instrument?",
    answer:
      "Simply point your smartphone camera or Google Lens at the physical QR code sticker on the laboratory instrument. The QR code opens the equipment's public view page. Click 'Report Fault / Damage', fill in your student details, describe the malfunction, attach a photograph, and submit. The assigned Lab Assistant is instantly alerted via automated email.",
  },
  {
    question: "How does Student Login work?",
    answer:
      "When you submit your first fault report, the system automatically creates a Student account for you and emails your login credentials (your Student Roll Number and a secure temporary password). You can then click 'Login' on the top navigation, switch to 'Student Login', enter your Roll Number and password, and access your dedicated dashboard to track all your submitted tickets.",
  },
  {
    question: "What functionality is available to Lab Assistants?",
    answer:
      "Lab Assistants have strict laboratory-isolated access. Once assigned to a lab (e.g., Chemistry Lab 1), they can register equipment (with optional calibration requirements), generate and print QR codes, maintain immutable calibration logs, and manage the fault ticket queue (transitioning status from Open to Under Review, In Repair, or Resolved).",
  },
  {
    question: "How does ticket tracking work?",
    answer:
      "Students can log into their Student Dashboard to view the live status, submission dates, photos, and resolution notes for all their reported tickets. Whenever a Lab Assistant updates a ticket status, the system automatically dispatches an email notification to the student with the latest progress.",
  },
  {
    question: "What do the different ticket statuses mean?",
    answer:
      "• Open: Ticket has been created and assigned to the lab's assistant.\n• Under Review: The assistant is inspecting the reported issue.\n• In Repair: The instrument is currently being serviced or repaired.\n• Resolved: The fault has been repaired, verified, and closed with notes.\n• Expired: The ticket has lapsed or was superseded by scheduled replacement.",
  },
  {
    question: "How does the Forgot Password feature work?",
    answer:
      "If you forget your password (whether you are an Administrator, Lab Assistant, or Student), click 'Forgot Password?' on the Login page. Enter your registered email address to receive a secure 6-digit OTP code valid for 5 minutes. Enter the OTP to verify your identity, then create and confirm your new password.",
  },
];

/* ─── Component ─── */
const HomePage = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (i) => setOpenFaq(openFaq === i ? null : i);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="hp-root">

      {/* ── Animated Background ── */}
      <div className="hp-bg" aria-hidden="true">
        <div className="hp-bg-grid" />
        <div className="hp-orb-1" />
        <div className="hp-orb-2" />
        <div className="hp-orb-3" />
      </div>

      {/* ══════════════ HEADER ══════════════ */}
      <header className="hp-header">
        <div className="hp-header-inner">

          {/* Logo */}
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="hp-logo-mark">
              <FlaskConical size={20} />
            </div>
            <div>
              <div className="hp-logo-text-main">
                Lab<span>Track</span>
              </div>
              <div className="hp-logo-text-sub">DIGITAL LAB MANAGEMENT</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hp-nav">
            <a className="hp-nav-link" href="#overview">Overview</a>
            <a className="hp-nav-link" href="#features">Features</a>
            <a className="hp-nav-link" href="#workflow">How It Works</a>
            <a className="hp-nav-link" href="#portals">Portals</a>
            <a className="hp-nav-link" href="#faqs">FAQ</a>
          </nav>

          {/* CTA + Hamburger */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="hp-header-cta-wrap">
              <Link to="/login" className="hp-header-cta">
                Sign In <ArrowRight size={14} />
              </Link>
            </div>
            <button
              className="hp-menu-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <nav className="hp-mobile-nav" id="mobile-navigation">
            <a href="#overview" onClick={closeMenu}>Overview</a>
            <a href="#features" onClick={closeMenu}>Features</a>
            <a href="#workflow" onClick={closeMenu}>How It Works</a>
            <a href="#portals" onClick={closeMenu}>Portals</a>
            <a href="#faqs" onClick={closeMenu}>FAQ</a>
            <Link to="/login" className="hp-mobile-cta" onClick={closeMenu}>
              Sign In to Portal
            </Link>
          </nav>
        )}
      </header>

      <main>

        {/* ══════════════ HERO ══════════════ */}
        <section id="overview" className="hp-section hp-hero">
          <div className="hp-hero-grid">

            {/* Left — Copy */}
            <div className="hp-reveal">
              <div className="hp-hero-eyebrow">
                <span className="hp-hero-eyebrow-dot" />
                Modern Laboratory Operations
              </div>

              <h1 className="hp-hero-h1">
                Digital Lab Equipment<br />
                <span className="hp-gradient-text">Fault &amp; Calibration</span><br />
                Tracking
              </h1>

              <p className="hp-hero-desc">
                A unified platform connecting Administrators, Lab Assistants,
                and Students. Scan physical QR labels with any smartphone to
                report faulty hardware, receive real-time email updates, and
                maintain complete audit compliance.
              </p>

              <div className="hp-hero-actions">
                <Link to="/login" className="hp-btn-primary">
                  Sign In to Portal <ArrowRight size={16} />
                </Link>
                <a href="#workflow" className="hp-btn-ghost">
                  <ScanLine size={16} /> Explore Workflow
                </a>
              </div>

              <div className="hp-hero-highlights">
                {[
                  "Automated Email Alerts",
                  "Student Ticket Dashboard",
                  "QR-Based Identification",
                  "Strict Lab Isolation",
                ].map((item) => (
                  <div key={item} className="hp-highlight-pill">
                    <CheckCircle2 size={14} />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Dashboard Visual */}
            <div className="hp-reveal hp-reveal-d2 hp-hero-visual">
              <div className="hp-hero-visual-glow" />

              <div className="hp-dashboard-card">
                {/* macOS-style topbar */}
                <div className="hp-dc-topbar">
                  <div className="hp-dc-dots">
                    <span /><span /><span />
                  </div>
                  <div className="hp-dc-title">SYSTEM MONITORING</div>
                  <div className="hp-dc-status">ALL SYSTEMS ACTIVE</div>
                </div>

                <div className="hp-dc-body">
                  <div className="hp-dc-stats">
                    {/* Stat 1 */}
                    <div className="hp-stat-tile">
                      <div className="hp-stat-icon">
                        <Layers3 size={16} style={{ color: "#22d3ee" }} />
                      </div>
                      <div className="hp-stat-label">INVENTORY</div>
                      <div className="hp-stat-value">Smart Labs</div>
                      <div className="hp-stat-sub">Centralized tracking</div>
                    </div>
                    {/* Stat 2 */}
                    <div className="hp-stat-tile">
                      <div className="hp-stat-icon">
                        <QrCode size={16} style={{ color: "#60a5fa" }} />
                      </div>
                      <div className="hp-stat-label">QR SCAN</div>
                      <div className="hp-stat-value">Google Lens</div>
                      <div className="hp-stat-sub">Instant profile view</div>
                    </div>
                    {/* Stat 3 */}
                    <div className="hp-stat-tile">
                      <div className="hp-stat-icon">
                        <CalendarClock size={16} style={{ color: "#a78bfa" }} />
                      </div>
                      <div className="hp-stat-label">CALIBRATION</div>
                      <div className="hp-stat-value">Automated</div>
                      <div className="hp-stat-sub">Overdue alerts</div>
                    </div>
                    {/* Stat 4 */}
                    <div className="hp-stat-tile">
                      <div className="hp-stat-icon">
                        <ClipboardCheck size={16} style={{ color: "#34d399" }} />
                      </div>
                      <div className="hp-stat-label">MAINTENANCE</div>
                      <div className="hp-stat-value">Fault Tickets</div>
                      <div className="hp-stat-sub">Real-time updates</div>
                    </div>
                  </div>

                  {/* Status strip */}
                  <div className="hp-dc-strip">
                    <div className="hp-dc-strip-left">
                      <Activity size={13} />
                      Automated Nodemailer Gmail Integration
                    </div>
                    <div className="hp-dc-strip-badge">ACTIVE</div>
                  </div>
                </div>
              </div>

              {/* Floating Chip */}
              <div className="hp-float-chip">
                <div className="hp-float-chip-icon">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  Ticket Resolved
                  <small>Lab Assistant notified</small>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════ STATS BAR ══════════════ */}
        <div className="hp-stats-bar">
          <div className="hp-stats-bar-inner">
            <div className="hp-stat-block">
              <div className="hp-stat-block-num">3<span>+</span></div>
              <div className="hp-stat-block-label">Active Laboratories</div>
            </div>
            <div className="hp-stat-block">
              <div className="hp-stat-block-num">100<span>%</span></div>
              <div className="hp-stat-block-label">Digital Fault Tickets</div>
            </div>
            <div className="hp-stat-block">
              <div className="hp-stat-block-num">QR<span>+</span></div>
              <div className="hp-stat-block-label">Smart QR Labels</div>
            </div>
            <div className="hp-stat-block">
              <div className="hp-stat-block-num">3<span>×</span></div>
              <div className="hp-stat-block-label">Role-Based Portals</div>
            </div>
          </div>
        </div>

        {/* ══════════════ FEATURES ══════════════ */}
        <section id="features" className="hp-section hp-features">
          <div className="hp-section-header">
            <div className="hp-label">
              <Zap size={12} /> Core Capabilities
            </div>
            <h2>Built for Modern Technical Labs</h2>
            <p>
              Streamline laboratory inventory control, calibration audits, and
              fault troubleshooting with integrated role-based security.
            </p>
          </div>

          <div className="hp-features-grid">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className={`hp-feature-card hp-reveal hp-reveal-d${i + 1}`}
                >
                  <div className="hp-feature-num">{f.num}</div>
                  <div className={`hp-feature-icon-wrap ${f.color}`}>
                    <Icon size={22} />
                  </div>
                  <h3>{f.title}</h3>
                  <p>{f.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ══════════════ WORKFLOW ══════════════ */}
        <section id="workflow" className="hp-section hp-workflow">
          <div className="hp-section-header">
            <div className="hp-label">
              <RefreshCw size={12} /> Step-by-Step Architecture
            </div>
            <h2>How the System Operates</h2>
            <p>
              A transparent fault tracking and calibration lifecycle from
              hardware registration to student issue reporting and final
              resolution.
            </p>
          </div>

          <div className="hp-workflow-wrap">
            {workflow.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="hp-workflow-step">
                  <div className="hp-step-num">{step.number}</div>
                  <div className="hp-step-icon">
                    <Icon size={20} />
                  </div>
                  <div className="hp-step-label">STEP {step.number}</div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ══════════════ PORTALS ══════════════ */}
        <section id="portals" className="hp-section hp-portals">
          <div className="hp-section-header">
            <div className="hp-label">
              <Users size={12} /> Role-Based Access
            </div>
            <h2>Tailored Portals for Every User</h2>
            <p>
              Dedicated interfaces ensure that Administrators, Lab Assistants,
              and Students have the exact tools and security boundaries they
              need.
            </p>
          </div>

          <div className="hp-portals-grid">
            {portals.map((portal) => {
              const Icon = portal.icon;
              return (
                <div key={portal.title} className={`hp-portal-card ${portal.accent}`}>
                  <div className="hp-portal-body">
                    <div className="hp-portal-icon-wrap">
                      <Icon size={24} />
                    </div>
                    <div className="hp-portal-subtitle">{portal.subtitle}</div>
                    <h3>{portal.title}</h3>
                    <p>{portal.description}</p>

                    <div className="hp-portal-checklist">
                      {portal.points.map((pt) => (
                        <div key={pt} className="hp-portal-check-item">
                          <CheckCircle2 size={13} />
                          <span>{pt}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="hp-portal-footer">
                    <Link to={portal.to} className="hp-portal-btn">
                      {portal.action} <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ══════════════ FAQ ══════════════ */}
        <section id="faqs" className="hp-section hp-faq" style={{ margin: "0 auto" }}>
          <div className="hp-section-header">
            <div className="hp-label">
              <HelpCircle size={12} /> Frequently Asked Questions
            </div>
            <h2>Questions &amp; Answers</h2>
            <p>
              Everything you need to know about navigating the system, reporting
              faults, tracking ticket status, and password management.
            </p>
          </div>

          <div className="hp-faq-list">
            {faqs.map((faq, index) => (
              <div
                key={faq.question}
                className={`hp-faq-item${openFaq === index ? " open" : ""}`}
              >
                <button
                  type="button"
                  className="hp-faq-btn"
                  onClick={() => toggleFaq(index)}
                >
                  <span>{faq.question}</span>
                  <ChevronDown size={18} className="hp-faq-chevron" />
                </button>
                {openFaq === index && (
                  <div className="hp-faq-answer">{faq.answer}</div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════ FINAL CTA ══════════════ */}
        <section className="hp-section hp-cta-section">
          <div className="hp-cta-box">
            <div className="hp-cta-icon">
              <Activity size={28} />
            </div>
            <h2>
              Better Visibility.{" "}
              <span className="hp-gradient-text">Better Maintenance.</span>
            </h2>
            <p>
              Sign in to manage laboratory inventory, maintain equipment
              calibrations, or review your student fault tickets.
            </p>
            <div className="hp-cta-actions">
              <Link to="/login" className="hp-btn-primary">
                Sign In to System <ArrowRight size={16} />
              </Link>
              <a href="#overview" className="hp-btn-ghost">
                Learn More
              </a>
            </div>
          </div>
        </section>

      </main>

      {/* ══════════════ FOOTER ══════════════ */}
      <footer className="hp-footer">
        <div className="hp-footer-inner">
          <div className="hp-footer-grid">

            {/* Brand */}
            <div className="hp-footer-about">
              <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
                <div className="hp-logo-mark">
                  <FlaskConical size={18} />
                </div>
                <div>
                  <div className="hp-logo-text-main">Lab<span>Track</span></div>
                  <div className="hp-logo-text-sub">LABORATORY MANAGEMENT</div>
                </div>
              </Link>
              <p>
                A centralized platform for laboratory equipment identification,
                calibration visibility, and digital fault management with
                automated email notifications.
              </p>
            </div>

            {/* Quick Links */}
            <div className="hp-footer-col">
              <h4>Quick Links</h4>
              <a href="#overview">Overview</a>
              <a href="#features">Features</a>
              <a href="#workflow">Workflow</a>
              <a href="#portals">Portals</a>
              <a href="#faqs">FAQ</a>
            </div>

            {/* Access Portals */}
            <div className="hp-footer-col">
              <h4>Access Portals</h4>
              <Link to="/login?role=Admin">Administrator</Link>
              <Link to="/login?role=Assistant">Lab Assistant</Link>
              <Link to="/login?role=Student">Student Portal</Link>
            </div>

            {/* Project Details */}
            <div className="hp-footer-col">
              <h4>Project Details</h4>
              <p><GraduationCap size={14} style={{ display: "inline", marginRight: 6, color: "#22d3ee" }} />B.Tech Major Project</p>
              <p><FlaskConical size={14} style={{ display: "inline", marginRight: 6, color: "#22d3ee" }} />GLA University</p>
              <p><BadgeCheck size={14} style={{ display: "inline", marginRight: 6, color: "#22d3ee" }} />Group G137</p>
            </div>
          </div>

          <div className="hp-footer-bottom">
            <span>© {new Date().getFullYear()} Digital Lab Equipment Fault Tracking System.</span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              Designed for smarter laboratory operations
              <Sparkles size={12} style={{ color: "#22d3ee" }} />
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default HomePage;
