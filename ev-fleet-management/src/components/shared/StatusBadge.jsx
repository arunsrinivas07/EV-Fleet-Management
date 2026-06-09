import React from 'react';
import { Zap, Play, Pause, Wrench } from 'lucide-react';

const statusConfig = {
  running: { label: 'Running', icon: Play, className: 'badge-running' },
  charging: { label: 'Charging', icon: Zap, className: 'badge-charging' },
  idle: { label: 'Idle', icon: Pause, className: 'badge-idle' },
  workshop: { label: 'Workshop', icon: Wrench, className: 'badge-workshop' },
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.idle;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${config.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
        status === 'running' ? 'bg-emerald-500' :
        status === 'charging' ? 'bg-blue-500' :
        status === 'idle' ? 'bg-amber-500' : 'bg-red-500'
      }`} />
      {config.label}
    </span>
  );
}
