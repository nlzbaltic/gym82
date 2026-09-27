'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, Menu, UserRound, X } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';

// Temporary destination until the exact address is confirmed.
export const WAZE_URL = 'https://waze.com/ul?q=Smiltene&navigate=yes';

const links = [['Par mums', '/#par-mums'], ['Abonementi', '/#abonementi'], ['Treneri', '/#treneri'], ['Jautājumi', '/#buj']];

export function SiteHeader() {
 const { ready, user, firstName } = useAuth();
 const pathname = usePathname();
 const [menu, setMenu] = useState(false);
 const [scrolled, setScrolled] = useState(false);
 const menuRef = useRef<HTMLDialogElement>(null);
 const profileHref = user ? '/mans-profils' : '/autorizacija';
 const profileLabel = user ? `Sveiks, ${firstName || 'draugs'}` : 'Mans profils';

 useEffect(() => { setMenu(false); }, [pathname]);
 useEffect(() => {
  const onScroll = () => setScrolled(window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  return () => window.removeEventListener('scroll', onScroll);
 }, []);
 useEffect(() => {
  const drawer = menuRef.current;
  if (menu) { if (!drawer?.open) drawer?.showModal(); return; }
  const timer = window.setTimeout(() => drawer?.close(), 320);
  return () => window.clearTimeout(timer);
 }, [menu]);
 useEffect(() => {
  const desktop = window.matchMedia('(min-width: 761px)');
  const closeOnDesktop = () => { if (desktop.matches) setMenu(false); };
  desktop.addEventListener('change', closeOnDesktop);
  return () => desktop.removeEventListener('change', closeOnDesktop);
 }, []);
 useEffect(() => { document.body.style.overflow = menu ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [menu]);

 return <>
  <div className="announcement"><span>-20% atlaide skolēniem</span><Link href="/#abonementi">Apskatīt abonementus <ArrowUpRight size={13}/></Link></div>
  <header className={`header${scrolled ? ' is-scrolled' : ''}`}>
   <Link href="/" className="brand" aria-label="GYM82 sākumlapa"><Logo/></Link>
   <nav className="nav" aria-label="Galvenā navigācija">{links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</nav>
   <div className="header-actions">
    <a className="waze-link" href={WAZE_URL} target="_blank" rel="noopener noreferrer" aria-label="Brauc uz GYM82 ar Waze, Smiltene"><img src="/assets/waze.svg" alt="" width={22} height={22}/><span>Smiltene</span></a>
    <ThemeToggle className="header-theme"/>
    <Link aria-label={profileLabel} className={`login-link${user ? ' is-member' : ''}${ready ? '' : ' is-pending'}`} href={profileHref}><UserRound size={16}/><span>{profileLabel}</span></Link>
    <Link className="btn small" href="/#abonementi">Iegādāties abonementu <ArrowUpRight size={16}/></Link>
    <button className="menu-button" aria-label={menu ? 'Aizvērt izvēlni' : 'Atvērt izvēlni'} aria-expanded={menu} aria-controls="mobile-menu" onClick={() => setMenu(!menu)}>{menu ? <X/> : <Menu/>}</button>
   </div>
  </header>
  <dialog ref={menuRef} id="mobile-menu" className="mobile-drawer" data-open={menu} aria-label="Mobilā izvēlne" onCancel={e => { e.preventDefault(); setMenu(false); }} onClick={e => { if (e.target === e.currentTarget) setMenu(false); }}>
   <div className="drawer-panel">
    <div className="drawer-header"><Logo/><button className="drawer-close" onClick={() => setMenu(false)} aria-label="Aizvērt izvēlni"><X size={25}/></button></div>
    <nav className="drawer-links" aria-label="Mobilā navigācija">{[...links, ['Kontakti', '/#kontakti']].map(([label, href], index) => <Link className="drawer-reveal" style={{ animationDelay: `${100 + index * 65}ms` }} key={href} href={href} onClick={() => setMenu(false)}>{label}<ArrowUpRight size={23}/></Link>)}</nav>
    <div className="drawer-tools drawer-reveal" style={{ animationDelay: '420ms' }}>
     <a className="waze-link" href={WAZE_URL} target="_blank" rel="noopener noreferrer"><img src="/assets/waze.svg" alt="" width={22} height={22}/><span>Brauc ar Waze: Smiltene</span></a>
     <ThemeToggle withLabel/>
    </div>
    <div className="drawer-actions drawer-reveal" style={{ animationDelay: '480ms' }}>
     <Link className="btn" href="/#abonementi" onClick={() => setMenu(false)}>Iegādāties abonementu <ArrowUpRight size={17}/></Link>
     <Link className="btn outline" href={profileHref} onClick={() => setMenu(false)}><UserRound size={18}/> {profileLabel}</Link>
    </div>
   </div>
  </dialog>
 </>;
}
