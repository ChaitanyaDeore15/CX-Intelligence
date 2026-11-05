import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ title: string; subtitle?: string; action?: React.ReactNode; className?: string }> = ({
  title,
  subtitle,
  action,
  className = '',
}) => {
  return (
    <div className={`p-5 border-b border-slate-100 flex items-center justify-between ${className}`}>
      <div>
        <h3 className="font-semibold text-slate-900 text-base">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return <div className={`p-5 ${className}`}>{children}</div>;
};

export const MetricCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  change?: { value: string; positive: boolean };
  icon?: React.ReactNode;
  denominatorInfo?: string;
  className?: string;
}> = ({ title, value, subtitle, change, icon, denominatorInfo, className = '' }) => {
  return (
    <Card className={`p-5 flex flex-col justify-between ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</span>
        {icon && <div className="p-2 bg-slate-50 rounded-lg text-slate-600">{icon}</div>}
      </div>
      <div className="mt-3">
        <div className="text-2xl font-bold text-slate-900 tracking-tight">{value}</div>
        {(subtitle || change) && (
          <div className="mt-1 flex items-center gap-2 text-xs">
            {change && (
              <span
                className={`font-semibold ${
                  change.positive ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {change.positive ? '↑' : '↓'} {change.value}
              </span>
            )}
            {subtitle && <span className="text-slate-500">{subtitle}</span>}
          </div>
        )}
        {denominatorInfo && (
          <div className="mt-2 text-[11px] text-slate-400 font-mono">
            Denominator: {denominatorInfo}
          </div>
        )}
      </div>
    </Card>
  );
};
