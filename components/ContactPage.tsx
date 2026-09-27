'use client';

import { useState } from 'react';
import { ArrowUpRight, Building2, Clock3, Mail, MapPin, Phone } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { MAPS_EMBED_URL, MAPS_URL, site, WAZE_URL } from '@/lib/site';
import { useAuth } from './AuthProvider';
import { Faq } from './Faq';

export function ContactPage() {
 const { user, profile } = useAuth();
 const [state, setState] = useState<{ status: 'idle' | 'busy' | 'done' | 'error'; text: string }>({ status: 'idle', text: '' });

 const submit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  const form = e.currentTarget;
  const data = new FormData(form);
  if (data.get('website')) return;
  if (!supabase) { setState({ status: 'error', text: `Forma sāks darboties pēc datubāzes pieslēgšanas. Tikmēr raksti uz ${site.email}.` }); return; }
  setState({ status: 'busy', text: '' });
  const { error } = await supabase.from('contact_messages').insert({
   name: String(data.get('name')).trim(),
   email: String(data.get('email')).trim(),
   phone: String(data.get('phone') || '').trim() || null,
   message: String(data.get('message')).trim(),
  });
  if (error) { setState({ status: 'error', text: `Neizdevās nosūtīt. Lūdzu, mēģini vēlreiz vai raksti uz ${site.email}.` }); return; }
  form.reset();
  setState({ status: 'done', text: 'Paldies! Ziņa saņemta, atbildēsim tuvākajā laikā.' });
 };

 return <main>
  <section className="section contact-page">
   <div className="section-heading"><div><h1>Sazinies ar mums.</h1></div><p className="section-intro">Jautājumi par abonementiem, treniņiem vai zāli? Uzraksti, piezvani vai vienkārši ienāc.</p></div>
   <div className="contact-grid">
    <div className="contact-info">
     <article className="contact-item"><span className="icon-box"><MapPin size={21}/></span><div><h2>Adrese</h2><p>{site.address}</p><div className="contact-links"><a className="waze-link" href={WAZE_URL} target="_blank" rel="noopener noreferrer"><img src="/assets/waze.png" alt="" width={22} height={22}/><span>Brauc ar Waze</span></a><a className="text-button" href={MAPS_URL} target="_blank" rel="noopener noreferrer">Google Maps <ArrowUpRight size={16}/></a></div></div></article>
     <article className="contact-item"><span className="icon-box"><Phone size={21}/></span><div><h2>Tālrunis</h2><a href={`tel:${site.phone.replace(/\s/g, '')}`}>{site.phone}</a></div></article>
     <article className="contact-item"><span className="icon-box"><Mail size={21}/></span><div><h2>E-pasts</h2><a href={`mailto:${site.email}`}>{site.email}</a></div></article>
     <article className="contact-item"><span className="icon-box"><Clock3 size={21}/></span><div><h2>Darba laiks</h2><p>Katru dienu {site.hours}</p><p className="muted">Ieejas laiks atkarīgs no izvēlētā abonementa.</p></div></article>
     <article className="contact-item"><span className="icon-box"><Building2 size={21}/></span><div><h2>Rekvizīti</h2><dl className="requisites"><dt>Uzņēmums</dt><dd>{site.company.name}</dd><dt>Reģ. nr.</dt><dd>{site.company.regNo}</dd><dt>PVN nr.</dt><dd>{site.company.vatNo}</dd><dt>Juridiskā adrese</dt><dd>{site.company.legalAddress}</dd></dl></div></article>
    </div>
    <form className="contact-form" onSubmit={submit} aria-labelledby="contact-form-title">
     <h2 id="contact-form-title">Uzdod jautājumu</h2>
     <p className="muted">Atbildēsim uz tavu e-pastu.</p>
     {state.status === 'done' ? <p className="form-message" role="status">{state.text}</p> : <>
      <label htmlFor="c-name">Vārds</label><input id="c-name" name="name" autoComplete="name" required maxLength={120} defaultValue={profile?.full_name || ''} key={`n-${profile?.full_name}`}/>
      <label htmlFor="c-email">E-pasta adrese</label><input id="c-email" name="email" type="email" autoComplete="email" required maxLength={200} defaultValue={user?.email || ''} key={`e-${user?.email}`}/>
      <label htmlFor="c-phone">Telefona numurs (neobligāti)</label><input id="c-phone" name="phone" type="tel" autoComplete="tel" maxLength={40} placeholder="+371"/>
      <label htmlFor="c-message">Jautājums</label><textarea id="c-message" name="message" rows={5} required maxLength={3000}/>
      <input className="hp-field" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"/>
      <button className="btn" disabled={state.status === 'busy'}>{state.status === 'busy' ? 'Sūta…' : 'Nosūtīt'} <ArrowUpRight size={17}/></button>
      <p className={`form-message${state.status === 'error' ? ' error' : ''}`} role="status">{state.text}</p>
     </>}
    </form>
   </div>
   <div className="contact-map"><iframe title={`Karte: ${site.address}`} src={MAPS_EMBED_URL} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen/></div>
  </section>
  <Faq/>
 </main>;
}
