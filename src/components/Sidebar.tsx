'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type Item = {
  href: string;
  label: string;
  icon: React.ReactNode;
  external?: boolean;
  disabled?: boolean;
};

const Icon = {
  home: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12l9-9 9 9"></path>
      <path d="M5 10v10h14V10"></path>
    </svg>
  ),
  calc: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="3" width="16" height="18" rx="3"></rect>
      <path d="M8 7h8M8 11h2M12 11h2M16 11h.01M8 15h2M12 15h2M16 15h.01M8 19h2M12 19h2M16 19h.01"></path>
    </svg>
  ),
  mockup: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="14" rx="2"></rect>
      <path d="M3 9h18M8 21h8"></path>
    </svg>
  ),
  prod: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 3h7v7"></path>
      <path d="M10 14L21 3"></path>
      <path d="M21 14v7H3V3h7"></path>
    </svg>
  ),
  mkt: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11l18-8-5 18-4-8-9-2z"></path>
    </svg>
  ),
};

const items: Item[] = [
  { href: '/dashboard',            label: 'Início',      icon: Icon.home  },
  { href: '/dashboard/calculadora',label: 'Calculadora', icon: Icon.calc, disabled: true },
  { href: '/dashboard/mockup',     label: 'Mockup',      icon: Icon.mockup, disabled: true },
  { href: '#',                     label: 'Produção',    icon: Icon.prod,   disabled: true },
  { href: '#',                     label: 'Marketing',   icon: Icon.mkt,    disabled: true },
];

export function Sidebar() {
  const path = usePathname();

  return (
    <aside className="hidden md:flex flex-col items-center gap-2 fixed left-6 top-1/2 -translate-y-1/2 z-30">
      <div className="glass rounded-card p-3 flex flex-col gap-2">
        <div className="w-11 h-11 rounded-full bg-accent flex items-center justify-center text-white font-bold text-sm mb-1">
          NS
        </div>
        {items.map((it) => {
          const active = path === it.href;
          const baseCls =
            'w-11 h-11 rounded-2xl flex items-center justify-center transition-all';
          const activeCls = active
            ? 'bg-ink text-cream dark:bg-cream dark:text-ink shadow-md'
            : 'hover:bg-black/5 dark:hover:bg-white/5';
          const dimCls = it.disabled ? 'opacity-40 cursor-not-allowed' : '';

          if (it.disabled) {
            return (
              <div key={it.label} className={`${baseCls} ${dimCls}`} title={`${it.label} (em breve)`}>
                {it.icon}
              </div>
            );
          }
          return (
            <Link key={it.label} href={it.href} className={`${baseCls} ${activeCls}`} title={it.label}>
              {it.icon}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
