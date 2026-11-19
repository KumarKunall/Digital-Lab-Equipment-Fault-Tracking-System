import React from 'react';

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'green', // 'green' | 'amber' | 'red' | 'blue'
  className = '',
}) => {
  const colorStyles = {
    green: {
      bg: 'bg-[#EAF5ED]',
      text: 'text-[#087A35]',
      border: 'border-[#BDE3CA]',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'border-amber-200',
    },
    red: {
      bg: 'bg-red-50',
      text: 'text-red-600',
      border: 'border-red-200',
    },
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-200',
    },
  };

  const style = colorStyles[color] || colorStyles.green;

  return (
    <div
      className={`p-6 rounded-2xl bg-white border border-[#E5EBE6] shadow-sm flex items-center justify-between hover:border-[#CBD5E1] transition-all ${className}`}
    >
      <div>
        <span className="text-xs font-semibold text-[#647067] uppercase tracking-wider block">
          {title}
        </span>
        <div className="text-3xl font-extrabold text-[#172033] mt-1.5 tracking-tight">
          {value !== undefined && value !== null ? value : '—'}
        </div>
        {subtitle && (
          <span className="text-xs text-[#647067] mt-1 block font-medium">
            {subtitle}
          </span>
        )}
      </div>
      {Icon && (
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${style.bg} ${style.text} ${style.border}`}
        >
          <Icon className="w-6 h-6" />
        </div>
      )}
    </div>
  );
};

export default StatCard;
