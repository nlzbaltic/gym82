'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Activity, ArrowUpRight, CalendarCheck, Check, ChevronDown, DoorOpen, Dumbbell, LockKeyhole, LogOut, TicketPercent, UserRound, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatPrice, planBySlug, plans, type Plan } from '@/lib/plans';
import { useAuth } from './AuthProvider';
import { PlanCarousel } from './PlanCards';

type Membership = {
 id: string;
 plan_slug: string;
 status: 'pending' | 'active' | 'cancelled';
 price_cents: number;
 discount_percent: number | null;
 visits_limit: number | null;
 visits_used: number;
 access_start: string;
 access_end: string;
 starts_at: string;
 ends_at: string;
};

const isActive = (m: Membership) => m.status === 'active' && new Date(m.ends_at) > new Date() && (m.visits_limit === null || m.visits_used < m.visits_limit);
const shortDate = (iso: string) => new Date(iso).toLocaleDateString('lv-LV', { day: 'numeric', month: 'short' });
const hhmm = (t: string) => t.slice(0, 5);
const dayStart = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
const visitDay = (iso: string) => {
 const days = Math.round((dayStart(new Date()) - dayStart(new Date(iso))) / 864e5);
 return days === 0 ? 'Šodien' : days === 1 ? 'Vakar' : shortDate(iso);
};
const visitTime = (iso: string) => new Date(iso).toLocaleTimeString('lv-LV', { hour: '2-digit', minute: '2-digit' });
const rpcError = (message = '') => {
 const map: Record<string, string> = {
  no_active_membership: 'Tev nav aktīva abonementa. Aktivizē abonementu, lai ienāktu zālē.',
  outside_hours: 'Tavs abonements šobrīd neļauj ienākt. Pārbaudi ieejas laiku.',
  too_soon: 'Durvis tikko atvērtas. Uzgaidi dažas sekundes.',
  no_visits_left: 'Abonementa apmeklējumi ir izlietoti.',
  active_exists: 'Tev jau ir aktīvs abonements. Jaunu varēsi aktivizēt, kad tas beigsies.',
  trial_used: 'Bezmaksas treniņu var izmantot tikai vienu reizi.',
  invalid_code: 'Atlaižu kods nav derīgs.',
  unknown_plan: 'Šis abonements nav pieejams.',
  not_authenticated: 'Lūdzu, pieslēdzies no jauna.',
 };
 const key = Object.keys(map).find(k => message.includes(k));
 return key ? map[key] : 'Neizdevās. Lūdzu, mēģini vēlreiz.';
};

export function ProfileApp() {
 const router = useRouter();
 const { ready, user, profile, firstName, refreshProfile, signOut } = useAuth();
 const preview = !supabase;
 const [memberships, setMemberships] = useState<Membership[]>([]);
 const [stats, setStats] = useState<{ count: number; last: string | null }>({ count: 0, last: null });
 const [door, setDoor] = useState<{ state: 'idle' | 'busy' | 'ok' | 'error'; text: string }>({ state: 'idle', text: '' });
 const [detailsOpen, setDetailsOpen] = useState(false);
 const [form, setForm] = useState({ full_name: '', phone: '' });
 const [formBusy, setFormBusy] = useState(false);
 const [formMessage, setFormMessage] = useState('');
 const [buying, setBuying] = useState<Plan | null>(null);
 const [code, setCode] = useState('');
 const [discount, setDiscount] = useState<number | null>(null);
 const [buyBusy, setBuyBusy] = useState(false);
 const [buyMessage, setBuyMessage] = useState<{ text: string; error: boolean }>({ text: '', error: false });
 const [notice, setNotice] = useState('');
 const buyRef = useRef<HTMLDialogElement>(null);
 const leaving = useRef(false);

 const active = memberships.find(isActive) ?? null;
 const activePlan = planBySlug(active?.plan_slug);

 // Not signed in: go to the sign-in page, keeping a chosen plan.
 useEffect(() => {
  if (!preview && ready && !user && !leaving.current) {
   const slug = new URLSearchParams(window.location.search).get('abonements');
   router.replace(`/autorizacija${planBySlug(slug) ? `?abonements=${slug}` : ''}`);
  }
 }, [preview, ready, user, router]);

 const load = useCallback(async () => {
  if (!supabase || !user) return;
  const [m, s] = await Promise.all([
   supabase.from('memberships').select('id, plan_slug, status, price_cents, discount_percent, visits_limit, visits_used, access_start, access_end, starts_at, ends_at').order('created_at', { ascending: false }).limit(10),
   supabase.rpc('my_visit_stats'),
  ]);
  if (m.data) setMemberships(m.data as Membership[]);
  const row = Array.isArray(s.data) ? s.data[0] : s.data;
  if (row) setStats({ count: row.visits_last_year ?? 0, last: row.last_visit ?? null });
 }, [user]);

 useEffect(() => { load(); }, [load]);
 useEffect(() => { if (profile) setForm({ full_name: profile.full_name, phone: profile.phone }); }, [profile]);

 // A plan chosen on the home page opens the activation sheet.
 useEffect(() => {
  if (!user && !preview) return;
  const params = new URLSearchParams(window.location.search);
  const plan = planBySlug(params.get('abonements'));
  if (plan) { openBuy(plan); window.history.replaceState(null, '', '/mans-profils'); }
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [user, preview]);

 useEffect(() => {
  const d = buyRef.current;
  if (buying) { if (!d?.open) d?.showModal(); } else d?.close();
 }, [buying]);

 const openBuy = (plan: Plan) => { setBuying(plan); setCode(''); setDiscount(null); setBuyMessage({ text: '', error: false }); };

 const openDoor = async () => {
  if (!supabase) { setDoor({ state: 'error', text: 'Durvis varēs atvērt pēc pieslēgšanās profilam.' }); return; }
  setDoor({ state: 'busy', text: '' });
  const { data, error } = await supabase.rpc('open_door');
  if (error) { setDoor({ state: 'error', text: rpcError(error.message) }); return; }
  const left = (data as { visits_left: number | null })?.visits_left;
  setDoor({ state: 'ok', text: `Ieeja apstiprināta${left !== null && left !== undefined ? `, atlikuši ${left} apmeklējumi` : ''}. Durvju sistēma vēl nav pieslēgta, tāpēc durvis šobrīd neatvērsies.` });
  load();
 };

 const applyCode = async () => {
  if (!code.trim()) return;
  if (!supabase) { setBuyMessage({ text: 'Atlaižu kodus varēs izmantot pēc pieslēgšanās.', error: true }); return; }
  const { data, error } = await supabase.rpc('check_discount', { p_code: code });
  if (error || !data) { setDiscount(null); setBuyMessage({ text: 'Atlaižu kods nav derīgs.', error: true }); return; }
  setDiscount(data as number); setBuyMessage({ text: `Atlaide ${data}% piemērota.`, error: false });
 };

 const activate = async () => {
  if (!buying) return;
  if (!supabase) { setBuyMessage({ text: 'Abonementu varēs aktivizēt pēc pieslēgšanās profilam.', error: true }); return; }
  setBuyBusy(true);
  const { error } = await supabase.rpc('purchase_membership', { p_plan: buying.slug, p_code: discount ? code : null });
  setBuyBusy(false);
  if (error) { setBuyMessage({ text: rpcError(error.message), error: true }); return; }
  setNotice(`Abonements „${buying.name}” ir aktivizēts.`);
  setBuying(null);
  await load();
  window.scrollTo({ top: 0, behavior: 'smooth' });
 };

 const saveProfile = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!supabase || !user) return;
  setFormBusy(true); setFormMessage('');
  const { error } = await supabase.from('profiles').update({ full_name: form.full_name.trim(), phone: form.phone.trim() }).eq('id', user.id);
  setFormMessage(error ? 'Neizdevās saglabāt. Lūdzu, mēģini vēlreiz.' : 'Dati saglabāti.');
  setFormBusy(false);
  if (!error) refreshProfile();
 };

 const logout = async () => { leaving.current = true; await signOut(); router.replace('/'); };

 if (!preview && (!ready || !user)) return <main className="dashboard app section"><p className="app-loading">Ielādē profilu…</p></main>;

 const price = buying ? buying.price * (100 - (discount ?? 0)) / 100 : 0;
 const visitsLeft = active && active.visits_limit !== null ? active.visits_limit - active.visits_used : null;

 return <main className="dashboard app section">
  <div className="app-bar"><Link className="text-button" href="/"><span aria-hidden="true">←</span> Sākums</Link>{preview ? <span className="app-badge">Profila paraugs</span> : <button className="text-button" onClick={logout}><LogOut size={16}/> Iziet</button>}</div>
  <div className="app-hello"><span className="app-avatar" aria-hidden="true">{(firstName || user?.email || 'G').charAt(0).toUpperCase()}</span><div><h1>{firstName ? `Sveiki, ${firstName}!` : 'Sveiki!'}</h1><p className="muted">{user?.email || 'Šādi izskatīsies tavs profils.'}</p></div></div>
  {notice && <p className="app-toast" role="status"><Check size={16}/> {notice}<button aria-label="Aizvērt" onClick={() => setNotice('')}><X size={16}/></button></p>}
  <div className="app-tiles">
   <article className="app-tile"><span className="tile-icon"><Activity size={19}/></span><div><strong className="tile-value">{stats.count}</strong><span className="tile-label">{stats.count === 1 ? 'treniņš' : 'treniņi'} pēdējā gada laikā</span></div></article>
   <article className="app-tile"><span className="tile-icon"><CalendarCheck size={19}/></span><div><strong className="tile-value">{stats.last ? visitDay(stats.last) : '–'}</strong><span className="tile-label">{stats.last ? `Pēdējais treniņš plkst. ${visitTime(stats.last)}` : 'Pēdējais treniņš'}</span></div></article>
   <article className={`app-tile tile-member${active ? ' is-active' : ''}`}><span className="tile-icon"><Dumbbell size={19}/></span>{!active && <a href="#abonementi" className="tile-link">Izvēlēties <ArrowUpRight size={14}/></a>}<div>{active ? <><strong className="tile-value small">{activePlan?.name ?? 'Abonements'}</strong><span className="tile-label">{visitsLeft === null ? 'Neierobežoti apmeklējumi' : `Atlikuši ${visitsLeft} no ${active.visits_limit}`} · līdz {shortDate(active.ends_at)}</span><span className="tile-label">Ieeja {hhmm(active.access_start)}–{hhmm(active.access_end)}</span></> : <><strong className="tile-value small">Nav aktīva</strong><span className="tile-label">abonementa</span></>}</div></article>
   <article className={`app-tile tile-door is-${door.state}`}><span className="tile-icon"><DoorOpen size={19}/></span><div><strong className="tile-value small">Zāles durvis</strong><span className="tile-label">Atver ar pogu, ienākot zālē</span></div><button className="door-button" onClick={openDoor} disabled={door.state === 'busy'}>{door.state === 'busy' ? 'Pārbauda…' : <><LockKeyhole size={16}/> Atvērt durvis</>}</button></article>
  </div>
  <p className={`door-status${door.state === 'error' ? ' error' : ''}`} role="status" aria-live="polite">{door.text}</p>
  <p className="app-note">Treniņš tiek uzskaitīts, kad atver zāles durvis. Vairākas atvēršanas vienā dienā skaitās kā viens treniņš.</p>

  {!preview && <section className="app-section"><button className="app-row" aria-expanded={detailsOpen} aria-controls="profile-form" onClick={() => setDetailsOpen(!detailsOpen)}><span className="tile-icon"><UserRound size={19}/></span><span><strong>Mani dati</strong><small>{profile?.full_name || 'Pievieno vārdu un telefonu'}</small></span><ChevronDown size={20}/></button>
   {detailsOpen && <form id="profile-form" className="profile-form app-form" onSubmit={saveProfile}><label htmlFor="profile-name">Vārds un uzvārds</label><input id="profile-name" autoComplete="name" maxLength={120} value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })}/><label htmlFor="profile-phone">Telefona numurs</label><input id="profile-phone" type="tel" autoComplete="tel" maxLength={30} placeholder="+371" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}/><button className="btn" disabled={formBusy}>{formBusy ? 'Saglabā…' : 'Saglabāt'}</button><p className="form-message" role="status">{formMessage}</p></form>}
  </section>}

  <section id="abonementi" className="app-section"><div className="app-section-head"><h2>{active ? 'Citi abonementi' : 'Izvēlies abonementu'}</h2><span className="muted">Maksājumi drīzumā</span></div><PlanCarousel plans={plans} onChoose={openBuy} cta="Izvēlēties" currentSlug={active?.plan_slug}/></section>

  {memberships.length > 0 && <section className="app-section"><div className="app-section-head"><h2>Mani abonementi</h2></div><ul className="history">{memberships.map(m => <li key={m.id}><span><strong>{planBySlug(m.plan_slug)?.name ?? m.plan_slug}</strong><small>{shortDate(m.starts_at)} – {shortDate(m.ends_at)}{m.discount_percent ? ` · -${m.discount_percent}%` : ''}</small></span><span className={`history-status${isActive(m) ? ' is-active' : ''}`}>{isActive(m) ? 'Aktīvs' : 'Beidzies'}</span></li>)}</ul></section>}

  <dialog ref={buyRef} className="modal" onCancel={() => setBuying(null)} onClick={e => { if (e.target === e.currentTarget) setBuying(null); }} aria-labelledby="buy-title">
   <button className="modal-close" aria-label="Aizvērt" onClick={() => setBuying(null)}><X/></button>
   {buying && <>
    <h2 id="buy-title">Abonements „{buying.name}”</h2>
    <p className="modal-price">{discount ? <><s>{formatPrice(buying.price)} €</s> </> : null}{formatPrice(price)} € <small>{buying.period}</small></p>
    <ul className="plan-features">{buying.features.map(f => <li key={f}><Check size={16}/>{f}</li>)}</ul>
    {buying.price > 0 && <div className="code-row"><label htmlFor="discount-code" className="sr-only">Atlaižu kods</label><TicketPercent size={18} aria-hidden="true"/><input id="discount-code" placeholder="Atlaižu kods" autoCapitalize="characters" value={code} onChange={e => { setCode(e.target.value); setDiscount(null); }}/><button type="button" className="text-button" onClick={applyCode}>Pielietot</button></div>}
    {active ? <div className="notice"><LockKeyhole size={20}/><p>Tev jau ir aktīvs abonements „{activePlan?.name}”. Jaunu varēsi aktivizēt, kad tas beigsies.</p></div>
     : <div className="notice"><LockKeyhole size={20}/><p>Tiešsaistes maksājumi vēl nav pieslēgti. Abonements tiks aktivizēts uzreiz, bez maksas.</p></div>}
    <p className={`form-message${buyMessage.error ? ' error' : ''}`} role="status">{buyMessage.text}</p>
    <button className="btn" onClick={activate} disabled={buyBusy || !!active}>{buyBusy ? 'Aktivizē…' : 'Aktivizēt abonementu'} <ArrowUpRight size={17}/></button>
   </>}
  </dialog>
 </main>;
}
