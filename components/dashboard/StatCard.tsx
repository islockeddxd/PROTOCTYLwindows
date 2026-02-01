'use client';

import { ReactNode } from 'react';
import clsx from 'clsx';

interface StatCardProps {
  title: string;
  value: string;
  subValue?: string;
  icon: ReactNode;
  color: 'blue' | 'purple' | 'green' | 'orange';
}

export default function StatCard({ title, value, subValue, icon, color }: StatCardProps) {
  const colorStyles = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-blue-500/10',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-purple-500/10',
    green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/10',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20 shadow-orange-500/10',
  };

  return (
    <div className="bg-[#09090b] border border-white/5 p-6 rounded-2xl relative overflow-hidden group hover:border-white/10 transition-colors">
      <div className={clsx(
        "absolute -right-6 -top-6 w-24 h-24 rounded-full blur-3xl opacity-20 transition-opacity group-hover:opacity-40", 
        color === 'blue' && "bg-blue-500",
        color === 'purple' && "bg-purple-500",
        color === 'green' && "bg-emerald-500",
        color === 'orange' && "bg-orange-500"
      )} />
      
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-white tracking-tight">{value}</h3>
          {subValue && <p className="text-xs text-zinc-500 mt-1">{subValue}</p>}
        </div>
        <div className={clsx("p-3 rounded-xl border shadow-[0_0_15px_rgba(0,0,0,0.2)]", colorStyles[color])}>
          {icon}
        </div>
      </div>
    </div>
  );
}
