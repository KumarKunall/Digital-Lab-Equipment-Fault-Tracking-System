import React from 'react';
import { PackageOpen } from 'lucide-react';

const EmptyState = ({
  icon: Icon = PackageOpen,
  title = 'No records found',
  description = 'There are no items matching your criteria at this moment.',
  action,
  className = '',
}) => {
  return (
    <div
      className={`py-12 px-4 text-center flex flex-col items-center justify-center max-w-sm mx-auto ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-[#EAF5ED] border border-[#BDE3CA] text-[#087A35] flex items-center justify-center mb-3.5 shadow-sm">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-[#172033]">{title}</h3>
      <p className="text-xs text-[#647067] mt-1 leading-relaxed">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};

export default EmptyState;
