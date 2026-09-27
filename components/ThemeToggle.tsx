'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

type Theme = 'dark' | 'light';

export function useTheme() {
 const [theme, setTheme] = useState<Theme>('dark');
 useEffect(() => {
  setTheme(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');
 }, []);
 const toggle = () => {
  const next: Theme = theme === 'light' ? 'dark' : 'light';
  document.documentElement.dataset.theme = next;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', next === 'light' ? '#f5f5f0' : '#111212');
  try { localStorage.setItem('gym82-theme', next); } catch {}
  setTheme(next);
 };
 return { theme, toggle };
}

export function ThemeToggle({ withLabel = false, className = '' }: { withLabel?: boolean; className?: string }) {
 const { theme, toggle } = useTheme();
 const label = theme === 'light' ? 'Ieslēgt tumšo režīmu' : 'Ieslēgt gaišo režīmu';
 return <button type="button" className={`theme-toggle ${className}`} onClick={toggle} aria-label={label} title={label}>
  {theme === 'light' ? <Moon size={18}/> : <Sun size={18}/>}
  {withLabel && <span>{theme === 'light' ? 'Tumšais režīms' : 'Gaišais režīms'}</span>}
 </button>;
}
