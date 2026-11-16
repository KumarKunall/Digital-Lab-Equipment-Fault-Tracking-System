import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Clock, Wrench } from 'lucide-react';

/**
 * Operational Status Badge
 * Values: 'Ready to Use' | 'Under Repair' | 'Damaged'
 */
export const OperationalStatusBadge = ({ status }) => {
  switch (status) {
    case 'Ready to Use':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#EAF5ED] text-[#087A35] border border-[#BDE3CA]">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-[#087A35]" />
          Ready to Use
        </span>
      );
    case 'Under Repair':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <Wrench className="w-3.5 h-3.5 shrink-0 text-amber-600" />
          Under Repair
        </span>
      );
    case 'Damaged':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-600" />
          Damaged
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
          {status || 'Unknown'}
        </span>
      );
  }
};

/**
 * Calibration Status Badge
 * Values: 'Valid' | 'Due Soon' | 'Overdue'
 */
export const CalibrationStatusBadge = ({ status, daysRemaining }) => {
  let displayDays =
    daysRemaining !== undefined
      ? ` (${daysRemaining < 0 ? `${Math.abs(daysRemaining)}d overdue` : daysRemaining === 0 ? 'Today' : `${daysRemaining}d left`})`
      : '';

  switch (status) {
    case 'Valid':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#EAF5ED] text-[#087A35] border border-[#BDE3CA]">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-[#087A35]" />
          Valid{displayDays}
        </span>
      );
    case 'Due Soon':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock className="w-3.5 h-3.5 shrink-0 text-amber-600" />
          Due Soon{displayDays}
        </span>
      );
    case 'Overdue':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-600" />
          Overdue{displayDays}
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
          {status || 'Not Set'}
        </span>
      );
  }
};

/**
 * Ticket Status Badge
 * Values: 'Open' | 'Under Review' | 'In Repair' | 'Resolved' | 'Expired'
 */
export const TicketStatusBadge = ({ status }) => {
  switch (status) {
    case 'Open':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-600" />
          Open
        </span>
      );
    case 'Under Review':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock className="w-3.5 h-3.5 shrink-0 text-amber-600" />
          Under Review
        </span>
      );
    case 'In Repair':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <Wrench className="w-3.5 h-3.5 shrink-0 text-blue-600" />
          In Repair
        </span>
      );
    case 'Resolved':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#EAF5ED] text-[#087A35] border border-[#BDE3CA]">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-[#087A35]" />
          Resolved
        </span>
      );
    case 'Expired':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
          Expired
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
          {status || 'Unknown'}
        </span>
      );
  }
};
