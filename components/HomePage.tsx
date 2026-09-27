'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, Clock3, DoorOpen, Dumbbell, Plus, ShieldCheck, Smartphone, UsersRound, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { plans, type Plan } from '@/lib/plans';
import { useAuth } from './AuthProvider';
import { PlanCarousel } from './PlanCards';
import { Gallery } from './Gallery';
import { Faq } from './Faq';

type Trainer = { name: string; specialty: string; description: string; icon: typeof Dumbbell; phone: string; email?: string; photo?: string; bio?: string; tags?: string[] };
const trainers: Trainer[] = [
 { name: 'Jānis', specialty: 'Spēka treniņi', description: 'Apgūsti vingrinājumu tehniku un veido treniņu plānu atbilstoši savai pieredzei.', icon: Dumbbell, phone: '+371 26 335 179', email: 'janis@gym82.lv', photo: '/assets/treneri/janis.jpg',
  bio: 'Kustība man nav pienākums, bet veids, kā uzlādēties. Vai tas būtu smags pietupiens zālē vai garš brauciens ar riteni, labākais brīdis ir tad, kad saproti, ka vari vairāk nekā vakar.', tags: ['Powerlifting', 'Riteņbraukšana'] },
 { name: 'Jānis', specialty: 'Funkcionālie treniņi', description: 'Attīsti izturību, koordināciju un kustību kvalitāti ar daudzveidīgiem vingrinājumiem.', icon: Clock3, phone: '+371 22 33 44 55' },
];

const features: [typeof Dumbbell, string, string][] = [
 [Dumbbell, 'Brīvie svari un spēka zona.', 'Stieņi, hanteles un statīvi, lai kļūtu stiprāks droši un pakāpeniski.'],
 [UsersRound, 'Trenažieri visam ķermenim.', 'Ērts sākums iesācējiem un pietiekami slodzes pieredzējušiem.'],
 [Clock3, 'Atvērts 05:00–24:00.', 'Trenējies pirms darba, pusdienlaikā vai vēlu vakarā, kad tev ir ērti.'],
 [Smartphone, 'Viss tavā telefonā.', 'Abonements, treniņu statistika un ieeja zālē vienuviet tavā profilā.'],
];

export function HomePage() {
 const router = useRouter();
 const { user } = useAuth();
 const [modal, setModal] = useState<null | 'booking' | 'apply'>(null);
 const [trainer, setTrainer] = useState(trainers[0]);
 const [bookingMessage, setBookingMessage] = useState('');
 const [bookingDraft, setBookingDraft] = useState('');
 const [apply, setApply] = useState<{ state: 'idle' | 'busy' | 'done' | 'error'; text: string }>({ state: 'idle', text: '' });
 const dialogRef = useRef<HTMLDialogElement>(null);
 const previousFocus = useRef<HTMLElement | null>(null);
 useEffect(() => { const d = dialogRef.current; if (modal) { previousFocus.current = document.activeElement as HTMLElement; if (!d?.open) d?.showModal(); } else { d?.close(); previousFocus.current?.focus(); } }, [modal]);
 useEffect(() => { document.body.style.overflow = modal ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [modal]);
 const choosePlan = (plan: Plan) => router.push(user ? `/mans-profils?abonements=${plan.slug}` : `/registracija?abonements=${plan.slug}`);
 const close = () => setModal(null);

 const submitApplication = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  const data = new FormData(e.currentTarget);
  if (data.get('website')) return;
  if (!supabase) { setApply({ state: 'error', text: 'Pieteikumu varēs nosūtīt, kad pieslēgsim datubāzi. Tikmēr raksti uz info@gym82.lv.' }); return; }
  setApply({ state: 'busy', text: '' });
  const { error } = await supabase.from('trainer_applications').insert({ name: String(data.get('name')).trim(), email: String(data.get('email')).trim(), phone: String(data.get('phone')).trim(), specialty: String(data.get('specialty') || '').trim() || null, message: String(data.get('message') || '').trim() || null });
  setApply(error ? { state: 'error', text: 'Neizdevās nosūtīt. Lūdzu, mēģini vēlreiz vai raksti uz info@gym82.lv.' } : { state: 'done', text: 'Paldies! Pieteikums saņemts, sazināsimies ar tevi tuvākajās dienās.' });
 };

 return <>
  <main>
   <section className="hero"><div className="hero-photo"/><div className="hero-shade"/><div className="hero-content"><h1>Mūsdienīgs fitnesa klubs <span>Smiltenē</span></h1><p>Smiltenē atvērta jauna sporta zāle. Trenējies pirms darba, pusdienlaikā vai vakarā, tepat netālu no mājām. Pirmais treniņš ir bez maksas.</p><div className="hero-actions"><a href="#abonementi" className="btn">Iegādāties abonementu <ArrowUpRight size={18}/></a><button className="btn outline" onClick={()=>choosePlan(plans[0])}>Bezmaksas izmēģinājuma treniņš <ArrowUpRight size={18}/></button></div></div></section>
   <div className="ticker" aria-label="Spēks, disciplīna, izturība, rezultāts"><div className="ticker-track" aria-hidden="true">{[0,1,2,3].map(copy=><div className="ticker-group" key={copy}>{['Spēks','Disciplīna','Izturība','Rezultāts'].map(word=><span className="ticker-word" key={word}>{word}<svg className="ticker-separator" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2.5v19M2.5 12h19M5.3 5.3l13.4 13.4M18.7 5.3 5.3 18.7" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round"/></svg></span>)}</div>)}</div></div>
   <section className="section about" id="par-mums"><div className="section-heading"><div><h2>Gribi vairāk enerģijas un justies stiprāks? <span className="muted">Sāc tepat Smiltenē.</span></h2></div><p className="section-intro">Nav jāgaida pirmdiena vai jābrauc uz citu pilsētu. Viss, kas vajadzīgs regulāriem treniņiem, ir vienā vietā un tuvu mājām.</p></div><div className="about-grid"><Gallery/><div className="features">{features.map(([I,title,desc])=><article className="feature" key={title}><span className="icon-box"><I size={23}/></span><div><h3>{title}</h3><p>{desc}</p></div></article>)}</div></div></section>
   <section className="membership section" id="abonementi"><div className="section-heading"><div><h2>Izvēlies abonementu, kas iederas tavā ikdienā.</h2></div><div className="section-intro"><p>No bezmaksas pirmā treniņa līdz neierobežotiem apmeklējumiem, izvēlies sev piemērotāko iespēju.</p><span className="sample-label">4 veidi, kā sākt</span></div></div><PlanCarousel plans={plans} onChoose={choosePlan}/><p className="plans-note"><ShieldCheck size={16}/> Tiešsaistes maksājumus pieslēgsim drīzumā.</p></section>
   <section className="section trainers" id="treneri"><div className="section-heading"><div><h2>Atrodi treneri, kurš palīdzēs sasniegt tavus mērķus.</h2></div><p className="section-intro">Izvēlies treniņu virzienu un sazinies ar treneri, lai vienotos par sev piemērotāko laiku.</p></div><div className="trainer-grid">
    {trainers.map(t=><article className="trainer-card" key={t.specialty}><div className={`trainer-portrait${t.photo?' has-photo':''}`}>{t.photo?<img src={t.photo} alt={`Treneris ${t.name}`} loading="lazy" width={800} height={800}/>:<><t.icon strokeWidth={1}/><span>Individuālie treniņi</span></>}</div><div className="trainer-info"><h3>{t.name}</h3><p className="trainer-specialty">{t.specialty}</p>{t.tags&&<ul className="trainer-tags" aria-label="Intereses">{t.tags.map(tag=><li key={tag}>{tag}</li>)}</ul>}{t.bio?<blockquote className="trainer-bio">{t.bio}</blockquote>:<p>{t.description}</p>}<div className="trainer-contacts"><a className="trainer-phone" href={`tel:${t.phone.replace(/\s/g,'')}`}>{t.phone}</a>{t.email&&<a className="trainer-email" href={`mailto:${t.email}`}>{t.email}</a>}</div><button className="btn outline" onClick={()=>{setTrainer(t);setBookingMessage('');setBookingDraft('');setModal('booking');}}>Pieteikties treniņam <ArrowUpRight size={17}/></button></div></article>)}
    <article className="trainer-card trainer-join"><div className="trainer-portrait"><Plus strokeWidth={1}/><span>Karjera GYM82</span></div><div className="trainer-info"><h3>Gribi kļūt par treneri GYM82?</h3><p className="trainer-specialty">Personīgie un grupu treniņi</p><p>Ja tev patīk strādāt ar cilvēkiem un palīdzēt viņiem kļūt stiprākiem, piesakies. Parunāsim par sadarbību un treniņu laikiem.</p><button className="btn" onClick={()=>{setApply({state:'idle',text:''});setModal('apply');}}>Pieteikties par treneri <ArrowUpRight size={17}/></button></div></article>
   </div></section>
   <Faq/>
   <section className="final-cta"><div><div><h2>Neatliec uz pirmdienu. Tavs pirmais treniņš ir bez maksas.</h2><p>Katra nedēļa, ko atliec, ir nedēļa, ko jau varēji trenēties. Piesakies šodien un nāc jau rīt no rīta.</p></div><button className="btn dark-btn" onClick={()=>choosePlan(plans[0])}>Pieteikties bezmaksas treniņam <ArrowUpRight size={20}/></button></div></section>
  </main>
  <dialog ref={dialogRef} className="modal" onCancel={close} onClick={e=>{if(e.target===e.currentTarget)close();}} aria-labelledby="modal-title"><button className="modal-close" aria-label="Aizvērt" onClick={close}><X/></button>
   {modal==='apply'?<><span className="icon-box"><DoorOpen/></span><h2 id="modal-title">Kļūsti par treneri GYM82.</h2><p className="muted">Pastāsti par sevi, un mēs sazināsimies.</p>{apply.state==='done'?<p className="form-message" role="status">{apply.text}</p>:<form onSubmit={submitApplication}><label htmlFor="apply-name">Vārds un uzvārds</label><input id="apply-name" name="name" autoComplete="name" required maxLength={120}/><label htmlFor="apply-email">E-pasta adrese</label><input id="apply-email" name="email" type="email" autoComplete="email" required maxLength={200}/><label htmlFor="apply-phone">Telefona numurs</label><input id="apply-phone" name="phone" type="tel" autoComplete="tel" required maxLength={40} placeholder="+371"/><label htmlFor="apply-specialty">Specializācija (neobligāti)</label><input id="apply-specialty" name="specialty" maxLength={200} placeholder="Piemēram, spēka treniņi, joga"/><label htmlFor="apply-message">Pieredze un kvalifikācija (neobligāti)</label><textarea id="apply-message" name="message" rows={4} maxLength={3000}/><input className="hp-field" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"/><button className="btn" disabled={apply.state==='busy'}>{apply.state==='busy'?'Sūta…':'Nosūtīt pieteikumu'} <ArrowUpRight size={17}/></button><p className={`form-message${apply.state==='error'?' error':''}`} role="status">{apply.text}</p></form>}</>
   :<><h2 id="modal-title">Piesaki treniņu sev vēlamajā laikā.</h2><p className="muted">{trainer.name}, {trainer.specialty.toLowerCase()}. Izvēlētais laiks ir vēlme, nevis apstiprināta rezervācija.</p><form onChange={()=>{setBookingDraft('');setBookingMessage('');}} onSubmit={e=>{e.preventDefault();const data=new FormData(e.currentTarget);setBookingDraft(`Sveiks, Jāni! Vēlos pieteikties treniņam: ${trainer.specialty}. Mans vārds: ${data.get('name')}. E-pasts: ${data.get('email')}. Vēlamais datums: ${data.get('date')}, laiks: ${data.get('time')}. ${data.get('goal') ? `Mērķis: ${data.get('goal')}.` : ''} Lūdzu, apstiprini pieejamību.`);setBookingMessage('Ziņa ir sagatavota. Nosūti to trenerim WhatsApp, lai vienotos par treniņu.');}}><label htmlFor="booking-name">Vārds</label><input id="booking-name" name="name" autoComplete="given-name" required maxLength={100}/><label htmlFor="booking-email">E-pasta adrese</label><input id="booking-email" name="email" type="email" autoComplete="email" required defaultValue={user?.email || ''}/><div className="booking-datetime"><div><label htmlFor="booking-date">Vēlamais datums</label><input id="booking-date" name="date" type="date" min={new Date().toLocaleDateString('sv-SE')} required/></div><div><label htmlFor="booking-time">Vēlamais laiks</label><input id="booking-time" name="time" type="time" required/></div></div><label htmlFor="booking-goal">Ko vēlies sasniegt? (neobligāti)</label><textarea id="booking-goal" name="goal" rows={3} maxLength={1000} placeholder="Piemēram, apgūt pareizu vingrinājumu tehniku"/><p className="booking-note">Sagatavosim ziņu trenerim. Nosūtīšanu apstiprināsi WhatsApp.</p><button className="btn" type="submit">Sagatavot pieteikumu <ArrowUpRight size={17}/></button></form><p className="form-message" role="status">{bookingMessage}</p>{bookingDraft&&<div className="booking-summary"><p>{bookingDraft}</p><a className="btn" href={`https://wa.me/${trainer.phone.replace(/\D/g,'')}?text=${encodeURIComponent(bookingDraft)}`} target="_blank" rel="noopener noreferrer">Atvērt WhatsApp <ArrowUpRight size={17}/></a></div>}<a className="trainer-phone booking-call" href={`tel:${trainer.phone.replace(/\s/g,'')}`}>Vai piezvani: {trainer.phone}</a></>}
  </dialog>
 </>;
}
