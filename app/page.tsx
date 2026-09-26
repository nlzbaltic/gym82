'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ArrowRight, Check, Plus, Minus, Menu, X, Dumbbell, Clock3, Smartphone, LockKeyhole, UserRound, LogOut, ChevronLeft, ChevronDown, ShieldCheck, Mail, Activity, CalendarCheck, DoorOpen, Eye, EyeOff, KeyRound } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

type Plan = { name: string; price: number; period: string; description: string; features: string[]; featured?: boolean };
const plans: Plan[] = [
 { name: 'Pirmais solis', price: 0, period: 'bezmaksas treniņš', description: 'Iepazīsti zāli savā pirmajā treniņā.', features: ['Viens bezmaksas treniņš', 'Iepazīsti sporta zāli', 'Izmēģini treniņu zonas'] },
 { name: 'Rīts', price: 24.95, period: '12 apmeklējumi', description: 'Izmanto dienas pirmo pusi treniņam.', features: ['12 apmeklējumi', 'Ieeja 05:00–13:00', 'Abonements tavā profilā'] },
 { name: 'Aktīvais', price: 34.95, period: '16 apmeklējumi', description: 'Trenējies regulāri sev ērtā ritmā.', features: ['16 apmeklējumi', 'Visas treniņu zonas', 'Abonements tavā profilā'], featured: true },
 { name: 'Ultra', price: 44.95, period: 'bez ierobežojuma', description: 'Trenējies tik bieži, cik vēlies.', features: ['Neierobežoti apmeklējumi', 'Ieeja 05:00–24:00', 'Abonements tavā profilā'] },
];
const formatPrice = (price: number) => price === 0 ? '0' : price.toFixed(2).replace('.', ',');
const faqs = [
 ['Kā iegādāties abonementu?', 'Izvēlies sev piemērotāko abonementu un atver savu profilu. Pašlaik šī ir lapas priekšskatījuma versija, maksājumu veikšana vēl nav pieejama.'],
 ['Vai varu trenēties, ja esmu iesācējs?', 'Protams. Sāc savā tempā un ar sev piemērotu slodzi. Vari pieteikties pie trenera, lai apgūtu vingrinājumu tehniku un izvēlētos piemērotu slodzi.'],
 ['Kas jāņem līdzi uz treniņu?', 'Ērts sporta apģērbs, tīri maiņas apavi, dvielis un ūdens pudele. Pārējais, tava vēlme kustēties.'],
 ['Kā darbojas ieeja ar telefonu?', 'Nākotnē aktīva abonementa īpašnieki varēs atvērt zāles durvis savā klienta profilā. Šo iespēju ieslēgsim pēc durvju sistēmas uzstādīšanas.'],
 ['Kur atrodas sporta zāle un kāds ir darba laiks?', 'Sporta zāles darba laiks ir 05:00–24:00. Ieejas laiks atkarīgs no izvēlētā abonementa. Precīzu adresi izziņosim pirms atvēršanas.'],
];
type AuthMode = 'login' | 'register' | 'reset' | 'newpass';
const authTitles: Record<AuthMode, [string, string, string]> = {
 login: ['Pieslēdzies savam profilam.', 'Pārvaldi abonementu un seko saviem treniņiem.', 'Pieslēgties'],
 register: ['Izveido savu profilu.', 'Reģistrējies ar e-pastu un paroli.', 'Izveidot profilu'],
 reset: ['Atjauno paroli.', 'Ievadi e-pastu, un nosūtīsim saiti paroles maiņai.', 'Nosūtīt saiti'],
 newpass: ['Izveido jaunu paroli.', 'Ievadi jauno paroli savam profilam.', 'Saglabāt paroli'],
};
const authErrorText = (message: string) => {
 if (/invalid login credentials/i.test(message)) return 'Nepareizs e-pasts vai parole.';
 if (/email not confirmed/i.test(message)) return 'Vispirms apstiprini savu e-pastu, izmantojot saiti vēstulē.';
 if (/already (registered|exists)/i.test(message)) return 'Šis e-pasts jau ir reģistrēts. Pieslēdzies vai atjauno paroli.';
 if (/different from the old/i.test(message)) return 'Jaunajai parolei jāatšķiras no iepriekšējās.';
 if (/password/i.test(message)) return 'Parolei jābūt vismaz 8 simbolus garai.';
 if (/rate limit|security purposes|too many/i.test(message)) return 'Pārāk daudz mēģinājumu. Lūdzu, mēģini pēc brīža.';
 return 'Neizdevās. Lūdzu, mēģini vēlreiz.';
};
const dayStart = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
const formatVisitDay = (iso: string) => {
 const date = new Date(iso);
 const days = Math.round((dayStart(new Date()) - dayStart(date)) / 864e5);
 if (days === 0) return 'Šodien';
 if (days === 1) return 'Vakar';
 return date.toLocaleDateString('lv-LV', {day: 'numeric', month: 'short'});
};
const formatVisitTime = (iso: string) => new Date(iso).toLocaleTimeString('lv-LV', {hour: '2-digit', minute: '2-digit'});
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export default function Home() {
 const [menu, setMenu] = useState(false);
 const [scrolled, setScrolled] = useState(false);
 const [modal, setModal] = useState<'login' | 'plan' | 'trainer' | null>(null);
 const [trainer, setTrainer] = useState('Spēka treniņi');
 const [bookingMessage, setBookingMessage] = useState('');
 const [bookingDraft, setBookingDraft] = useState('');
 const [selected, setSelected] = useState<Plan>(plans[2]);
 const [dashboard, setDashboard] = useState(false);
 const [email, setEmail] = useState('');
 const [accountEmail, setAccountEmail] = useState<string | null>(null);
 const [accountId, setAccountId] = useState<string | null>(null);
 const [authMode, setAuthMode] = useState<AuthMode>('login');
 const [password, setPassword] = useState('');
 const [fullName, setFullName] = useState('');
 const [showPassword, setShowPassword] = useState(false);
 const [messageError, setMessageError] = useState(false);
 const [stats, setStats] = useState<{count:number; last:string | null}>({count:0, last:null});
 const [detailsOpen, setDetailsOpen] = useState(false);
 const wantsDashboard = useRef(false);
 const [profile, setProfile] = useState({full_name:'', phone:'', is_student:false});
 const [profileMessage, setProfileMessage] = useState('');
 const [profileBusy, setProfileBusy] = useState(false);
 const [message, setMessage] = useState('');
 const [busy, setBusy] = useState(false);
 const [faq, setFaq] = useState<number | null>(0);
 const menuRef = useRef<HTMLDialogElement>(null);
 const dialogRef = useRef<HTMLDialogElement>(null);
 const previousFocus = useRef<HTMLElement | null>(null);
 useEffect(() => {
  if (!supabase) return;
  const hash = window.location.hash;
  if (hash.includes('access_token') && !hash.includes('type=recovery')) wantsDashboard.current = true;
  const {data:{subscription}} = supabase.auth.onAuthStateChange((event, session) => {
   setAccountEmail(session?.user.email ?? null);
   setAccountId(session?.user.id ?? null);
   if (event === 'PASSWORD_RECOVERY') { wantsDashboard.current = false; setAuthMode('newpass'); setPassword(''); setMessage(''); setModal('login'); return; }
   if (session && wantsDashboard.current && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) { wantsDashboard.current = false; setDashboard(true); setModal(null); window.scrollTo(0,0); }
  });
  return () => subscription.unsubscribe();
 }, []);
 useEffect(() => {
  const drawer = menuRef.current;
  if (menu) { drawer?.showModal(); return; }
  if (modal) { drawer?.close(); return; }
  const timer = window.setTimeout(() => drawer?.close(), 320);
  return () => window.clearTimeout(timer);
 }, [menu, modal]);
 useEffect(() => {
  const desktop = window.matchMedia('(min-width: 761px)');
  const closeOnDesktop = () => { if (desktop.matches) setMenu(false); };
  desktop.addEventListener('change', closeOnDesktop);
  return () => desktop.removeEventListener('change', closeOnDesktop);
 }, []);
 useEffect(() => { const d=dialogRef.current; if(modal) { previousFocus.current=document.activeElement as HTMLElement; d?.showModal(); } else { d?.close(); previousFocus.current?.focus(); } }, [modal]);
 useEffect(() => {document.body.style.overflow=menu || modal ? 'hidden' : ''; return () => {document.body.style.overflow='';};}, [menu, modal]);
 useEffect(() => { const onScroll = () => setScrolled(window.scrollY > 40); onScroll(); window.addEventListener('scroll', onScroll, {passive:true}); return () => window.removeEventListener('scroll', onScroll); }, []);
 useEffect(() => {
  if (!supabase || !accountId) return;
  let active = true;
  supabase.from('profiles').select('full_name, phone, is_student').eq('id', accountId).maybeSingle().then(({data}) => {
   if (active && data) setProfile({full_name: data.full_name ?? '', phone: data.phone ?? '', is_student: !!data.is_student});
  });
  return () => { active = false; };
 }, [accountId]);
 useEffect(() => {
  if (!supabase || !accountId) return;
  let active = true;
  supabase.rpc('my_visit_stats').then(({data}) => {
   const row = Array.isArray(data) ? data[0] : data;
   if (active && row) setStats({count: row.visits_last_year ?? 0, last: row.last_visit ?? null});
  });
  return () => { active = false; };
 }, [accountId]);
 const saveProfile = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!supabase || !accountId) return;
  setProfileBusy(true); setProfileMessage('');
  const {error} = await supabase.from('profiles').update({full_name: profile.full_name.trim(), phone: profile.phone.trim(), is_student: profile.is_student}).eq('id', accountId);
  setProfileMessage(error ? 'Neizdevās saglabāt. Lūdzu, mēģini vēlreiz.' : 'Dati saglabāti.');
  setProfileBusy(false);
 };
 const openLogin = () => {setMessage('');setMessageError(false);setAuthMode('login');setModal('login');setMenu(false);};
 const switchAuth = (mode: AuthMode) => {setAuthMode(mode);setMessage('');setMessageError(false);};
 const signOut = async () => {await supabase?.auth.signOut();setDashboard(false);setProfile({full_name:'', phone:'', is_student:false});setStats({count:0, last:null});setDetailsOpen(false);};
 const choosePlan = (plan: Plan) => {setSelected(plan);setModal('plan');};
 const showDemo = () => {setModal(null);setDashboard(true);window.scrollTo(0,0);};
 const authSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!supabase) { setMessageError(false); setMessage('Pieslēgšanās būs pieejama, kad atvērsim reģistrāciju. Tikmēr apskati profila paraugu.'); return; }
  setBusy(true); setMessage(''); setMessageError(false);
  const fail = (text: string) => { setMessageError(true); setMessage(authErrorText(text)); };
  const origin = window.location.origin;
  try {
   if (authMode === 'login') {
    wantsDashboard.current = true;
    const {error} = await supabase.auth.signInWithPassword({email: email.trim(), password});
    if (error) { wantsDashboard.current = false; fail(error.message); } else setPassword('');
   } else if (authMode === 'register') {
    wantsDashboard.current = true;
    const {data, error} = await supabase.auth.signUp({email: email.trim(), password, options: {data: {full_name: fullName.trim()}, emailRedirectTo: origin}});
    if (error) { wantsDashboard.current = false; fail(error.message); }
    else if (!data.session) { wantsDashboard.current = false; setPassword(''); setMessage('Profils izveidots. Atver e-pastu un apstiprini reģistrāciju, tad varēsi pieslēgties.'); }
   } else if (authMode === 'reset') {
    const {error} = await supabase.auth.resetPasswordForEmail(email.trim(), {redirectTo: origin});
    if (error) fail(error.message); else setMessage('Ja šāds profils eksistē, nosūtījām saiti paroles maiņai.');
   } else {
    const {error} = await supabase.auth.updateUser({password});
    if (error) fail(error.message); else { setPassword(''); setModal(null); setDashboard(true); window.scrollTo(0,0); }
   }
  } finally { setBusy(false); }
 };
 const firstName = profile.full_name.trim().split(/\s+/)[0] || '';
 return <>
  <div className="announcement"><span>-20% atlaide skolēniem</span><a href="#abonementi" onClick={()=>setDashboard(false)}>Apskatīt abonementus <ArrowUpRight size={13}/></a></div>
  <header className={`header${scrolled ? ' is-scrolled' : ''}`}><a href="#" className="brand" onClick={()=>setDashboard(false)} aria-label="GYM82 sākumlapa"><img src="/assets/logo-white.svg" alt="GYM82"/></a>
   <nav className="nav" aria-label="Galvenā navigācija">{[['Par mums','par-mums'],['Abonementi','abonementi'],['Treneri','treneri'],['Jautājumi','buj']].map(([label,id])=><a key={id} href={`#${id}`} onClick={()=>{setDashboard(false);setMenu(false);}}>{label}</a>)}</nav>
   <div className="header-actions"><button aria-label="Mans profils" className="login-link" onClick={()=>accountEmail ? setDashboard(true) : openLogin()}><UserRound size={16}/><span>Mans profils</span></button><a className="btn small" href="#abonementi" onClick={()=>setDashboard(false)}>Iegādāties abonementu <ArrowUpRight size={16}/></a><button className="menu-button" aria-label={menu?'Aizvērt izvēlni':'Atvērt izvēlni'} aria-expanded={menu} aria-controls="mobile-menu" onClick={()=>setMenu(!menu)}>{menu?<X/>:<Menu/>}</button></div>
  </header>
  <dialog ref={menuRef} id="mobile-menu" className="mobile-drawer" data-open={menu} aria-label="Mobilā izvēlne" onCancel={e=>{e.preventDefault();setMenu(false);}} onClick={e=>{if(e.target===e.currentTarget)setMenu(false);}}>
   <div className="drawer-panel"><div className="drawer-header"><img src="/assets/logo-white.svg" alt="GYM82"/><button className="drawer-close" onClick={()=>setMenu(false)} aria-label="Aizvērt izvēlni"><X size={25}/></button></div>
    <nav className="drawer-links" aria-label="Mobilā navigācija">{[['Par mums','par-mums'],['Abonementi','abonementi'],['Treneri','treneri'],['Jautājumi','buj'],['Kontakti','kontakti']].map(([label,id],index)=><a className="drawer-reveal" style={{animationDelay:`${100+index*65}ms`}} key={id} href={`#${id}`} onClick={()=>{setDashboard(false);setMenu(false);}}>{label}<ArrowUpRight size={23}/></a>)}</nav>
    <div className="drawer-actions drawer-reveal" style={{animationDelay:'440ms'}}><a className="btn" href="#abonementi" onClick={()=>{setDashboard(false);setMenu(false);}}>Iegādāties abonementu <ArrowUpRight size={17}/></a><button className="btn outline" onClick={()=>{setMenu(false);if(accountEmail){setDashboard(true);window.scrollTo(0,0);}else openLogin();}}><UserRound size={18}/> Mans profils</button></div>
   </div>
  </dialog>
  {dashboard ? <main className="dashboard app section">
   <div className="app-bar"><button className="text-button" onClick={()=>setDashboard(false)}><ChevronLeft size={16}/> Sākums</button>{accountEmail?<button className="text-button" onClick={signOut}><LogOut size={16}/> Iziet</button>:<span className="app-badge">Profila paraugs</span>}</div>
   <div className="app-hello"><span className="app-avatar" aria-hidden="true">{(firstName || accountEmail || 'G').charAt(0).toUpperCase()}</span><div><h1>{firstName ? `Sveiki, ${firstName}!` : 'Sveiki!'}</h1><p className="muted">{accountEmail || 'Šādi izskatīsies tavs profils.'}</p></div></div>
   <div className="app-tiles">
    <article className="app-tile"><span className="tile-icon"><Activity size={19}/></span><div><strong className="tile-value">{stats.count}</strong><span className="tile-label">{stats.count === 1 ? 'treniņš' : 'treniņi'} pēdējā gada laikā</span></div></article>
    <article className="app-tile"><span className="tile-icon"><CalendarCheck size={19}/></span><div><strong className="tile-value">{stats.last ? formatVisitDay(stats.last) : '–'}</strong><span className="tile-label">{stats.last ? `Pēdējais treniņš plkst. ${formatVisitTime(stats.last)}` : 'Pēdējais treniņš'}</span></div></article>
    <article className="app-tile tile-member"><span className="tile-icon"><Dumbbell size={19}/></span><a href="#profile-plans" className="tile-link">Izvēlēties <ArrowUpRight size={14}/></a><div><strong className="tile-value small">Nav aktīva</strong><span className="tile-label">abonementa</span></div></article>
    <article className="app-tile"><span className="tile-icon"><DoorOpen size={19}/></span><button className="tile-link" disabled><LockKeyhole size={13}/> Atvērt</button><div><strong className="tile-value small">Zāles durvis</strong><span className="tile-label">Drīzumā varēsi atvērt ar telefonu</span></div></article>
   </div>
   <p className="app-note">Treniņš tiek uzskaitīts, kad atver zāles durvis savā profilā. Vairākas atvēršanas vienā dienā skaitās kā viens treniņš.</p>
   {accountEmail&&<section className="app-section"><button className="app-row" aria-expanded={detailsOpen} aria-controls="profile-form" onClick={()=>setDetailsOpen(!detailsOpen)}><span className="tile-icon"><UserRound size={19}/></span><span><strong>Mani dati</strong><small>{profile.full_name || 'Pievieno vārdu un telefonu'}</small></span><ChevronDown size={20}/></button>{detailsOpen&&<form id="profile-form" className="profile-form app-form" onSubmit={saveProfile}><label htmlFor="profile-name">Vārds un uzvārds</label><input id="profile-name" autoComplete="name" maxLength={120} value={profile.full_name} onChange={e=>setProfile({...profile, full_name:e.target.value})}/><label htmlFor="profile-phone">Telefona numurs</label><input id="profile-phone" type="tel" autoComplete="tel" maxLength={30} placeholder="+371" value={profile.phone} onChange={e=>setProfile({...profile, phone:e.target.value})}/><label className="profile-check"><input type="checkbox" checked={profile.is_student} onChange={e=>setProfile({...profile, is_student:e.target.checked})}/><span>Esmu skolēns un vēlos pieteikties 20% atlaidei</span></label><button className="btn" disabled={profileBusy}>{profileBusy?'Saglabā…':'Saglabāt'}</button><p className="form-message" role="status">{profileMessage}</p></form>}</section>}
   <section id="profile-plans" className="app-section"><div className="app-section-head"><h2>Abonementi</h2><span className="muted">Pirkumi drīzumā</span></div><PlanCarousel plans={plans} onChoose={choosePlan}/></section>
  </main> : <main>
   <section className="hero"><div className="hero-photo"/><div className="hero-shade"/><div className="hero-content"><h1>Mūsdienīgs fitnesa klubs <span>Smiltenē</span></h1><p>Trenējies savā tempā ar visu nepieciešamo, lai justos labāk un kļūtu stiprāks.</p><div className="hero-actions"><a href="#abonementi" className="btn">Iegādāties abonementu <ArrowUpRight size={18}/></a><button className="btn outline" onClick={()=>choosePlan(plans[0])}>Bezmaksas izmēģinājuma treniņš <ArrowUpRight size={18}/></button></div></div></section>
   <div className="ticker" aria-label="Spēks, disciplīna, izturība, rezultāts"><div className="ticker-track" aria-hidden="true">{[0,1,2,3].map(copy=><div className="ticker-group" key={copy}>{['Spēks','Disciplīna','Izturība','Rezultāts'].map(word=><span className="ticker-word" key={word}>{word}<span className="ticker-separator">✳</span></span>)}</div>)}</div></div>
   <section className="section about" id="par-mums"><div className="section-heading"><div><h2>Šeit atradīsi visu, kas vajadzīgs <span className="muted">taviem treniņiem.</span></h2></div><p className="section-intro">Plaša treniņu zona, brīvie svari un trenažieri gan pirmajiem treniņiem, gan pieredzējušiem sportotājiem.</p></div><div className="about-grid"><div className="gym-visual"><img src="/assets/gym.jpg" alt="Sporta zāles brīvo svaru zona, ilustratīvs attēls"/><div className="image-label"><span>Vieta tavam nākamajam līmenim</span><ArrowUpRight/></div></div><div className="features">{[[Dumbbell,'Viss, kas vajadzīgs spēkam.','Brīvie svari, trenažieri un vieta funkcionāliem treniņiem.'],[Clock3,'Trenējies savā ritmā.','Izvēlies abonementu, kas iederas tavā ikdienā.'],[Smartphone,'Pārvaldi abonementu savā telefonā.','Abonements un tā informācija vienuviet, tavā profilā.']].map(([Icon,title,desc],i)=>{const I=Icon as typeof Dumbbell;return <article className="feature" key={i}><span className="icon-box"><I size={23}/></span><div><h3>{String(title)}</h3><p>{String(desc)}</p></div></article>})}</div></div></section>
   <section className="membership section" id="abonementi"><div className="section-heading"><div><h2>Izvēlies abonementu, kas iederas tavā ikdienā.</h2></div><div className="section-intro"><p>No pirmā bezmaksas treniņa līdz neierobežotiem apmeklējumiem, izvēlies sev piemērotāko iespēju.</p><span className="sample-label">4 veidi, kā sākt</span></div></div><PlanCarousel plans={plans} onChoose={choosePlan}/><p className="plans-note"><ShieldCheck size={16}/> Abonementu iegāde būs pieejama drīzumā.</p></section>
   <section className="section trainers" id="treneri"><div className="section-heading"><div><h2>Atrodi treneri, kurš palīdzēs sasniegt tavus mērķus.</h2></div><p className="section-intro">Izvēlies treniņu virzienu un sazinies ar treneri, lai vienotos par sev piemērotāko laiku.</p></div><div className="trainer-grid">{[
 {name:'Spēka treniņi',description:'Apgūsti vingrinājumu tehniku un veido treniņu plānu atbilstoši savai pieredzei.',icon:Dumbbell},
 {name:'Funkcionālie treniņi',description:'Attīsti izturību, koordināciju un kustību kvalitāti ar daudzveidīgiem vingrinājumiem.',icon:Clock3},
 {name:'Pirmais treniņš',description:'Iepazīsti trenažierus un atrodi sev piemērotu slodzi kopā ar treneri.',icon:UserRound}
 ].map(({name,description,icon:Icon})=><article className="trainer-card" key={name}><div className="trainer-portrait"><Icon strokeWidth={1}/><span>Individuālie treniņi</span></div><div className="trainer-info"><h3>Jānis</h3><p className="trainer-specialty">{name}</p><p>{description}</p><a className="trainer-phone" href="tel:+37122334455">+371 22 33 44 55</a><button className="btn outline" onClick={()=>{setTrainer(name);setBookingMessage('');setBookingDraft('');setModal('trainer');}}>Pieteikties treniņam <ArrowUpRight size={17}/></button></div></article>)}</div></section>
   <section className="section faq-section" id="buj"><div><h2>Uzzini visu svarīgo pirms pirmā treniņa.</h2><p className="muted faq-intro">Atbildes uz biežāk uzdotajiem jautājumiem.</p></div><div className="faqs">{faqs.map(([q,a],i)=><article className={`faq ${faq===i?'expanded':''}`} key={q}><h3><button aria-expanded={faq===i} aria-controls={`faq-${i}`} onClick={()=>setFaq(faq===i?null:i)}>{q}{faq===i?<Minus size={19}/>:<Plus size={19}/>}</button></h3><div id={`faq-${i}`} hidden={faq!==i}><p>{a}</p></div></article>)}</div></section>
   <section className="final-cta"><div><h2>Atrodi laiku savam nākamajam treniņam.</h2><a className="btn dark-btn" href="#abonementi">Iegādāties abonementu <ArrowUpRight size={20}/></a></div></section>
  </main>}
  <footer className="footer" id="kontakti"><div className="footer-main"><div className="footer-brand"><a className="brand" href="#" onClick={()=>setDashboard(false)} aria-label="Sākumlapa"><img src="/assets/logo-white.svg" alt="GYM82"/></a><p>Vieta regulāriem treniņiem, kurā vari koncentrēties uz savu pašsajūtu un progresu.</p><button className="btn outline" onClick={()=>accountEmail ? setDashboard(true) : openLogin()}><UserRound size={17}/> Mans profils</button></div><div className="footer-column"><h3>Iepazīsti zāli</h3><a href="#par-mums" onClick={()=>setDashboard(false)}>Par mums</a><a href="#treneri" onClick={()=>setDashboard(false)}>Treneri un treniņi</a><a href="#buj" onClick={()=>setDashboard(false)}>Biežāk uzdotie jautājumi</a></div><div className="footer-column footer-hours"><h3>Darba laiks</h3><p className="opening-hours">05:00–24:00</p><p className="footer-address">Ieejas laiks atkarīgs no izvēlētā abonementa.</p></div><div className="footer-column footer-details"><h3>Rekvizīti un kontakti</h3><p className="company-name">SIA LATLA ECO</p><a href="mailto:info@gym82.lv">info@gym82.lv</a><a href="tel:+37122334455">+371 22 33 44 55</a></div></div><div className="footer-lower"><p>Skolēniem pieejama 20% atlaide.</p><a className="text-button" href="mailto:info@gym82.lv">Sazinies ar mums <ArrowUpRight size={17}/></a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Visas tiesības aizsargātas.</span><a href="#">Atgriezties augšā ↑</a></div></footer>
  <dialog ref={dialogRef} className="modal" onCancel={()=>setModal(null)} onClick={e=>{if(e.target===e.currentTarget)setModal(null);}} aria-labelledby="modal-title"><button className="modal-close" aria-label="Aizvērt" onClick={()=>setModal(null)}><X/></button>{modal==='login'?<><span className="icon-box">{authMode==='reset'||authMode==='newpass'?<KeyRound/>:<UserRound/>}</span><h2 id="modal-title">{authTitles[authMode][0]}</h2><p className="muted">{authTitles[authMode][1]}</p>{(authMode==='login'||authMode==='register')&&<div className="auth-tabs" role="tablist" aria-label="Profils"><button type="button" role="tab" aria-selected={authMode==='login'} onClick={()=>switchAuth('login')}>Pieslēgties</button><button type="button" role="tab" aria-selected={authMode==='register'} onClick={()=>switchAuth('register')}>Reģistrēties</button></div>}<form onSubmit={authSubmit}>{authMode==='register'&&<><label htmlFor="auth-name">Vārds</label><input id="auth-name" autoComplete="given-name" required maxLength={120} value={fullName} onChange={e=>setFullName(e.target.value)}/></>}{authMode!=='newpass'&&<><label htmlFor="email">E-pasta adrese</label><input id="email" type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="tavs@epasts.lv" required/></>}{authMode!=='reset'&&<><div className="label-row"><label htmlFor="password">{authMode==='newpass'?'Jaunā parole':'Parole'}</label>{authMode==='login'&&<button type="button" className="link-small" onClick={()=>switchAuth('reset')}>Aizmirsi paroli?</button>}</div><div className="password-field"><input id="password" type={showPassword?'text':'password'} autoComplete={authMode==='login'?'current-password':'new-password'} minLength={authMode==='login'?undefined:8} required value={password} onChange={e=>setPassword(e.target.value)}/><button type="button" aria-label={showPassword?'Slēpt paroli':'Rādīt paroli'} onClick={()=>setShowPassword(!showPassword)}>{showPassword?<EyeOff size={18}/>:<Eye size={18}/>}</button></div>{authMode!=='login'&&<small className="field-hint">Vismaz 8 simboli.</small>}</>}<button className="btn" disabled={busy}>{busy?'Lūdzu, uzgaidi…':authTitles[authMode][2]}</button></form><p className={`form-message${messageError?' error':''}`} role="status">{message}</p>{authMode==='reset'&&<button className="text-button back-link" onClick={()=>switchAuth('login')}><ChevronLeft size={16}/> Atpakaļ uz pieslēgšanos</button>}{(authMode==='login'||authMode==='register')&&<><div className="modal-divider"/><button className="text-button demo-button" onClick={showDemo}>Apskatīt profila paraugu <ArrowRight size={17}/></button></>}</>:modal==='trainer'?<><h2 id="modal-title">Piesaki treniņu sev vēlamajā laikā.</h2><p className="muted">Jānis, {trainer.toLowerCase()}. Izvēlētais laiks ir vēlme, nevis apstiprināta rezervācija.</p><form onChange={()=>{setBookingDraft('');setBookingMessage('');}} onSubmit={e=>{e.preventDefault();const data=new FormData(e.currentTarget);setBookingDraft(`Sveiks, Jāni! Vēlos pieteikties treniņam: ${trainer}. Mans vārds: ${data.get('name')}. E-pasts: ${data.get('email')}. Vēlamais datums: ${data.get('date')}, laiks: ${data.get('time')}. ${data.get('goal') ? `Mērķis: ${data.get('goal')}.` : ''} Lūdzu, apstiprini pieejamību.`);setBookingMessage('Ziņa ir sagatavota. Nosūti to trenerim WhatsApp, lai vienotos par treniņu.');}}><label htmlFor="booking-name">Vārds</label><input id="booking-name" name="name" autoComplete="given-name" required maxLength={100}/><label htmlFor="booking-email">E-pasta adrese</label><input id="booking-email" name="email" type="email" autoComplete="email" required defaultValue={accountEmail || ''}/><div className="booking-datetime"><div><label htmlFor="booking-date">Vēlamais datums</label><input id="booking-date" name="date" type="date" min={new Date().toLocaleDateString('sv-SE')} required/></div><div><label htmlFor="booking-time">Vēlamais laiks</label><input id="booking-time" name="time" type="time" required/></div></div><label htmlFor="booking-goal">Ko vēlies sasniegt? (neobligāti)</label><textarea id="booking-goal" name="goal" rows={3} maxLength={1000} placeholder="Piemēram, apgūt pareizu vingrinājumu tehniku"/><p className="booking-note">Sagatavosim ziņu trenerim. Nosūtīšanu apstiprināsi WhatsApp.</p><button className="btn" type="submit">Sagatavot pieteikumu <ArrowUpRight size={17}/></button></form><p className="form-message" role="status">{bookingMessage}</p>{bookingDraft&&<div className="booking-summary"><p>{bookingDraft}</p><a className="btn" href={`https://wa.me/37122334455?text=${encodeURIComponent(bookingDraft)}`} target="_blank" rel="noopener noreferrer">Atvērt WhatsApp <ArrowUpRight size={17}/></a></div>}<a className="trainer-phone booking-call" href="tel:+37122334455">Vai piezvani Jānim: +371 22 33 44 55</a></>:<><h2 id="modal-title">Abonements „{selected.name}”</h2><p className="modal-price">{formatPrice(selected.price)} € <small>{selected.period}</small></p><ul className="plan-features">{selected.features.map(f=><li key={f}><Check size={16}/>{f}</li>)}</ul><div className="notice"><LockKeyhole size={20}/><p>Abonementu iegāde būs pieejama, kad atvērsim reģistrāciju. Šajā priekšskatījumā maksājums netiks veikts.</p></div><button className="btn" onClick={showDemo}>Apskatīt klienta profilu <ArrowUpRight size={17}/></button></>}</dialog>
 </>;
}
function PlanCard({plan,onChoose}:{plan:Plan;onChoose:(plan:Plan)=>void}) {return <article className={`plan ${plan.featured?'featured':''}`}><div className="plan-top"><span className="eyebrow">{plan.name}</span></div><div className="price">{formatPrice(plan.price)}<span>€</span><small> / {plan.period}</small></div><p>{plan.description}</p><div className="plan-divider"/><ul className="plan-features">{plan.features.map(f=><li key={f}><Check size={16}/>{f}</li>)}</ul><button className={`btn ${plan.featured?'':'outline'}`} onClick={()=>onChoose(plan)}>Iegādāties abonementu <ArrowUpRight size={17}/></button></article>}
function PlanCarousel({plans,onChoose}:{plans:Plan[];onChoose:(plan:Plan)=>void}) {
 const ref = useRef<HTMLDivElement>(null);
 const [active, setActive] = useState(0);
 const onScroll = () => {
  const el = ref.current; const first = el?.firstElementChild as HTMLElement | null;
  if (!el || !first) return;
  const step = first.offsetWidth + parseFloat(getComputedStyle(el).columnGap || '0');
  setActive(Math.min(plans.length - 1, Math.round(el.scrollLeft / step)));
 };
 const goTo = (index: number) => {
  const el = ref.current; const card = el?.children[index] as HTMLElement | undefined;
  if (!el || !card) return;
  el.scrollTo({left: card.offsetLeft - parseFloat(getComputedStyle(el).paddingLeft || '0'), behavior: 'smooth'});
 };
 return <div className="plans-carousel"><div className="plans" ref={ref} onScroll={onScroll}>{plans.map(plan=><PlanCard key={plan.name} plan={plan} onChoose={onChoose}/>)}</div><div className="plan-dots">{plans.map((plan,i)=><button key={plan.name} type="button" className={i===active?'active':''} aria-label={`Rādīt: ${plan.name}`} aria-current={i===active} onClick={()=>goTo(i)}/>)}</div></div>;
}
