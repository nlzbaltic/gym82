'use client';

import Link from 'next/link';
import { ArrowUpRight, UserRound } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { Logo } from './Logo';
import { WAZE_URL } from './SiteHeader';

export function SiteFooter() {
 const { user } = useAuth();
 return <footer className="footer" id="kontakti">
  <div className="footer-main">
   <div className="footer-brand"><Link className="brand" href="/" aria-label="Sākumlapa"><Logo/></Link><p>Vieta regulāriem treniņiem, kurā vari koncentrēties uz savu pašsajūtu un progresu.</p><Link className="btn outline" href={user ? '/mans-profils' : '/autorizacija'}><UserRound size={17}/> Mans profils</Link></div>
   <div className="footer-column"><h3>Iepazīsti zāli</h3><Link href="/#par-mums">Par mums</Link><Link href="/#treneri">Treneri un treniņi</Link><Link href="/#buj">Biežāk uzdotie jautājumi</Link><a href={WAZE_URL} target="_blank" rel="noopener noreferrer">Smiltene, brauc ar Waze</a></div>
   <div className="footer-column footer-hours"><h3>Darba laiks</h3><p className="opening-hours">05:00–24:00</p><p className="footer-address">Ieejas laiks atkarīgs no izvēlētā abonementa.</p></div>
   <div className="footer-column footer-details"><h3>Rekvizīti un kontakti</h3><p className="company-name">SIA LATLA ECO</p><a href="mailto:info@gym82.lv">info@gym82.lv</a><a href="tel:+37122334455">+371 22 33 44 55</a></div>
  </div>
  <div className="footer-lower"><p>Skolēniem pieejama 20% atlaide.</p><a className="text-button" href="mailto:info@gym82.lv">Sazinies ar mums <ArrowUpRight size={17}/></a></div>
  <div className="footer-bottom"><span>© {new Date().getFullYear()} Visas tiesības aizsargātas.</span><a href="#">Atgriezties augšā ↑</a></div>
 </footer>;
}
