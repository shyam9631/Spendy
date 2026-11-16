import {
  BookOpen,
  Bus,
  Gamepad2,
  Package,
  Smartphone,
  Utensils,
} from 'lucide-react';
import { Category } from '../types/spendy';

interface CategoryIconProps {
  category: Category;
  className?: string;
}

export function CategoryIcon({ category, className = 'w-4 h-4' }: CategoryIconProps) {
  switch (category) {
    case 'Food':
      return <Utensils className={className} aria-hidden="true" />;
    case 'Travel':
      return <Bus className={className} aria-hidden="true" />;
    case 'Study':
      return <BookOpen className={className} aria-hidden="true" />;
    case 'Fun':
      return <Gamepad2 className={className} aria-hidden="true" />;
    case 'Recharge':
      return <Smartphone className={className} aria-hidden="true" />;
    case 'Others':
    default:
      return <Package className={className} aria-hidden="true" />;
  }
}

export function getCategoryIconStyle(category: Category): string {
  switch (category) {
    case 'Food':
      return 'bg-violet-500/15 text-violet-300 border-violet-500/25';
    case 'Travel':
      return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/25';
    case 'Study':
      return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25';
    case 'Fun':
      return 'bg-pink-500/15 text-pink-300 border-pink-500/25';
    case 'Recharge':
      return 'bg-amber-500/15 text-amber-300 border-amber-500/25';
    case 'Others':
    default:
      return 'bg-zinc-500/15 text-zinc-300 border-zinc-500/25';
  }
}
