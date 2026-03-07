import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface MenuSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function MenuSearch({ value, onChange }: MenuSearchProps) {
  return (
    <div className="relative max-w-md mx-auto mb-8">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      <Input
        type="search"
        placeholder="Gericht suchen…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9 pr-9 rounded-full border-border/50 focus-visible:ring-gold/40 bg-card"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Suche löschen"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
