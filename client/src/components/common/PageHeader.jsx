import React from 'react';

const PageHeader = ({
  badge,
  badgeIcon: BadgeIcon,
  title,
  description,
  actions,
  className = '',
}) => {
  return (
    <div
      className={`relative rounded-3xl p-6 sm:p-8 border border-[#E5EBE6] bg-white shadow-sm overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5 ${className}`}
    >
      <div className="max-w-2xl">
        {badge && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF5ED] border border-[#BDE3CA] text-[#087A35] text-xs font-bold tracking-wider uppercase mb-2.5">
            {BadgeIcon && <BadgeIcon className="w-3.5 h-3.5" />}
            <span>{badge}</span>
          </div>
        )}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-xs sm:text-sm text-[#647067] mt-1.5 leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-3 shrink-0 self-start md:self-auto">
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
