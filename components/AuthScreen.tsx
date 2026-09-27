'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Eye, EyeOff, KeyRound, UserRound } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { planBySlug } from '@/lib/plans';
import { useAuth } from './AuthProvider';

type Mode = 'login' | 'register' | 'reset';

export const authErrorText = (message: string) => {
 if (/invalid login credentials/i.test(message)) return 'Nepareizs e-pasts vai parole.';
 if (/email not confirmed/i.test(message)) return 'Vispirms apstiprini savu e-pastu, izmantojot saiti vēstulē.';
 if (/already (registered|exists)/i.test(message)) return 'Šis e-pasts jau ir reģistrēts. Pieslēdzies vai atjauno paroli.';
 if (/different from the old/i.test(message)) return 'Jaunajai parolei jāatšķiras no iepriekšējās.';
 if (/rate limit|security purposes|too many/i.test(message)) return 'Pārāk daudz mēģinājumu. Lūdzu, mēģini pēc brīža.';
 if (/password/i.test(message)) return 'Parolei jābūt vismaz 8 simbolus garai.';
 return 'Neizdevās. Lūdzu, mēģini vēlreiz.';
};

const copy: Record<Mode | 'newpass', [string, string, string]> = {
 login: ['Pieslēdzies savam profilam.', 'Pārvaldi abonementu un seko saviem treniņiem.', 'Pieslēgties'],
 register: ['Izveido savu profilu.', 'Reģistrējies ar e-pastu un paroli, un aktivizē abonementu dažās minūtēs.', 'Izveidot profilu'],
 reset: ['Atjauno paroli.', 'Ievadi e-pastu, un nosūtīsim saiti paroles maiņai.', 'Nosūtīt saiti'],
 newpass: ['Izveido jaunu paroli.', 'Ievadi jauno paroli savam profilam.', 'Saglabāt paroli'],
};

function PasswordField({ id, label, value, onChange, autoComplete, minLength, extra }: { id: string; label: string; value: string; onChange: (v: string) => void; autoComplete: string; minLength?: number; extra?: React.ReactNode }) {
 const [show, setShow] = useState(false);
 return <>
  <div className="label-row"><label htmlFor={id}>{label}</label>{extra}</div>
  <div className="password-field"><input id={id} type={show ? 'text' : 'password'} autoComplete={autoComplete} minLength={minLength} required value={value} onChange={e => onChange(e.target.value)}/><button type="button" aria-label={show ? 'Slēpt paroli' : 'Rādīt paroli'} onClick={() => setShow(!show)}>{show ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div>
 </>;
}

export function AuthScreen({ mode }: { mode: Mode }) {
 const router = useRouter();
 const { ready, user, recovery } = useAuth();
 const [planSlug, setPlanSlug] = useState<string | null>(null);
 const [name, setName] = useState('');
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [busy, setBusy] = useState(false);
 const [message, setMessage] = useState('');
 const [isError, setIsError] = useState(false);
 const [done, setDone] = useState(false);
 const view = mode === 'reset' && recovery ? 'newpass' : mode;
 const plan = planBySlug(planSlug);
 const query = planSlug ? `?abonements=${planSlug}` : '';
 const target = `/mans-profils${query}`;

 useEffect(() => {
  const slug = new URLSearchParams(window.location.search).get('abonements');
  if (planBySlug(slug)) setPlanSlug(slug);
 }, []);

 // Signed-in members go straight to their profile, except while setting a new password.
 useEffect(() => {
  if (ready && user && view !== 'newpass') router.replace(target);
 }, [ready, user, view, target, router]);

 const fail = (text: string) => { setIsError(true); setMessage(authErrorText(text)); };

 const submit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!supabase) { setIsError(false); setMessage('Profili būs pieejami, kad pieslēgsim datubāzi.'); return; }
  setBusy(true); setMessage(''); setIsError(false);
  const origin = window.location.origin;
  try {
   if (view === 'login') {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) fail(error.message);
   } else if (view === 'register') {
    const { data, error } = await supabase.auth.signUp({ email: email.trim(), password, options: { data: { full_name: name.trim() }, emailRedirectTo: origin + target } });
    if (error) fail(error.message);
    else if (!data.session) { setDone(true); setMessage('Profils izveidots. Atver e-pastu un apstiprini reģistrāciju, tad varēsi pieslēgties.'); }
   } else if (view === 'reset') {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: origin + '/atjaunot-paroli' });
    if (error) fail(error.message); else { setDone(true); setMessage('Ja šāds profils eksistē, nosūtījām saiti paroles maiņai. Pārbaudi e-pastu.'); }
   } else {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) fail(error.message); else router.replace('/mans-profils');
   }
  } finally { setBusy(false); }
 };

 const [title, subtitle, cta] = copy[view];

 return <main className="auth-page">
  <div className="modal auth-card">
   <span className="icon-box">{view === 'reset' || view === 'newpass' ? <KeyRound/> : <UserRound/>}</span>
   <h1 id="auth-title">{title}</h1>
   <p className="muted">{subtitle}</p>
   {plan && (view === 'login' || view === 'register') && <p className="auth-plan">Izvēlētais abonements: <strong>{plan.name}</strong></p>}
   {(view === 'login' || view === 'register') && <div className="auth-tabs" role="tablist" aria-label="Profils">
    <Link role="tab" aria-selected={view === 'login'} href={`/autorizacija${query}`}>Pieslēgties</Link>
    <Link role="tab" aria-selected={view === 'register'} href={`/registracija${query}`}>Reģistrēties</Link>
   </div>}
   {!done && <form onSubmit={submit} aria-labelledby="auth-title">
    {view === 'register' && <><label htmlFor="auth-name">Vārds</label><input id="auth-name" autoComplete="given-name" required maxLength={120} value={name} onChange={e => setName(e.target.value)}/></>}
    {view !== 'newpass' && <><label htmlFor="email">E-pasta adrese</label><input id="email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tavs@epasts.lv" required/></>}
    {view !== 'reset' && <PasswordField id="password" label={view === 'newpass' ? 'Jaunā parole' : 'Parole'} value={password} onChange={setPassword} autoComplete={view === 'login' ? 'current-password' : 'new-password'} minLength={view === 'login' ? undefined : 8} extra={view === 'login' ? <Link className="link-small" href="/atjaunot-paroli">Aizmirsi paroli?</Link> : null}/>}
    {(view === 'register' || view === 'newpass') && <small className="field-hint">Vismaz 8 simboli.</small>}
    <button className="btn" disabled={busy}>{busy ? 'Lūdzu, uzgaidi…' : cta}</button>
   </form>}
   <p className={`form-message${isError ? ' error' : ''}`} role="status">{message}</p>
   {(view === 'reset' || done) && <Link className="text-button back-link" href={`/autorizacija${query}`}><ChevronLeft size={16}/> Atpakaļ uz pieslēgšanos</Link>}
  </div>
 </main>;
}
