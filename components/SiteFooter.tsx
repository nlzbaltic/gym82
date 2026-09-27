'use client';

import Link from 'next/link';
import { UserRound } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { Logo } from './Logo';
import { site, WAZE_URL } from '@/lib/site';

export function SiteFooter() {
 const { user } = useAuth();
 return <footer className="footer" id="kontakti">
  <div className="footer-main">
   <div className="footer-brand"><Link className="brand" href="/" aria-label="Sākumlapa"><Logo/></Link><p>Vieta regulāriem treniņiem, kurā vari koncentrēties uz savu pašsajūtu un progresu.</p><Link className="btn outline" href={user ? '/mans-profils' : '/autorizacija'}><UserRound size={17}/> Mans profils</Link></div>
   <div className="footer-column"><h3>Iepazīsti zāli</h3><Link href="/#par-mums">Par mums</Link><Link href="/#treneri">Treneri un treniņi</Link><Link href="/kontakti#buj">Biežāk uzdotie jautājumi</Link><Link href="/kontakti">Kontakti</Link><a href={WAZE_URL} target="_blank" rel="noopener noreferrer">Atrast kartē</a></div>
   <div className="footer-column footer-hours"><h3>Darba laiks</h3><p className="opening-hours">05:00–24:00</p><p className="footer-address">Ieejas laiks atkarīgs no izvēlētā abonementa.</p><p className="footer-address">{site.addressShort}</p></div>
   <div className="footer-column footer-details"><h3>Rekvizīti un kontakti</h3><p className="company-name">{site.company.name}</p><p className="footer-address">Reģ. nr. {site.company.regNo}</p><a href={`mailto:${site.email}`}>{site.email}</a><a href={`tel:${site.phone.replace(/\s/g, '')}`}>{site.phone}</a></div>
  </div>
  
  <div className="footer-bottom"><span>© {new Date().getFullYear()} Visas tiesības aizsargātas.</span><a className="footer-credit" href="https://nlzbaltic.lv" target="_blank" rel="noopener">Web aplikācijas izstrāde: nlzbaltic.lv</a><a href="#">Atgriezties augšā ↑</a></div>
 </footer>;
}
