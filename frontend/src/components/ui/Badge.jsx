import { BadgeCheck } from 'lucide-react';

export function VerifiedBadge({ size = 'sm' }) {
  const sizes = { sm: 'text-xs px-2 py-0.5 gap-1', md: 'text-sm px-3 py-1 gap-1.5' };
  const iconSizes = { sm: 14, md: 16 };
  return (
    <span className={`inline-flex items-center ${sizes[size]} rounded-full font-semibold bg-brand-600/20 text-brand-300 border border-brand-500/30`}>
      <BadgeCheck size={iconSizes[size]} className="text-brand-400" />
      Verificat
    </span>
  );
}

export function SubBadge({ status }) {
  const map = {
    ACTIVE: { label: 'Activ', cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    TRIALING: { label: 'Perioadă de probă', cls: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    PAST_DUE: { label: 'Plată restantă', cls: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
    CANCELED: { label: 'Anulat', cls: 'bg-red-500/20 text-red-300 border-red-500/30' },
    INACTIVE: { label: 'Inactiv', cls: 'bg-white/10 text-white/50 border-white/10' },
  };
  const { label, cls } = map[status] ?? map.INACTIVE;
  return (
    <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full font-semibold border ${cls}`}>
      {label}
    </span>
  );
}
