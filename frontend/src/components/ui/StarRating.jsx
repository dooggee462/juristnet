import { Star } from 'lucide-react';

export function StarRating({ value, onChange, size = 20 }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="flex gap-1">
      {stars.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange?.(s)}
          className={`transition-colors ${onChange ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
        >
          <Star
            size={size}
            className={s <= value ? 'star-filled fill-current' : 'star-empty'}
          />
        </button>
      ))}
    </div>
  );
}

export function StarDisplay({ value, total, size = 16 }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex">
        {[1,2,3,4,5].map((s) => (
          <Star key={s} size={size} className={s <= Math.round(value) ? 'star-filled fill-current' : 'star-empty'} />
        ))}
      </div>
      <span className="text-sm text-white/60">
        {value > 0 ? `${value.toFixed(1)}` : 'Fără recenzii'}
        {total ? ` (${total})` : ''}
      </span>
    </div>
  );
}
