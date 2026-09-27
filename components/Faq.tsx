'use client';

import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';

export const faqs: [string, string][] = [
 ['Kā iegādāties abonementu?', 'Izvēlies abonementu, izveido profilu un aktivizē to savā profilā. Tiešsaistes maksājumus pieslēgsim drīzumā.'],
 ['Vai varu trenēties, ja esmu iesācējs?', 'Protams. Sāc savā tempā un ar sev piemērotu slodzi. Vari pieteikties pie trenera, lai apgūtu vingrinājumu tehniku un izvēlētos piemērotu slodzi.'],
 ['Kas jāņem līdzi uz treniņu?', 'Ērts sporta apģērbs, tīri maiņas apavi, dvielis un ūdens pudele. Pārējais, tava vēlme kustēties.'],
 ['Kā darbojas ieeja ar telefonu?', 'Ar aktīvu abonementu zāles durvis atver ar pogu savā profilā. Katra diena, kad atver durvis, tiek uzskaitīta kā treniņš. Durvju sistēmu pieslēgsim pirms atvēršanas.'],
 ['Kur atrodas sporta zāle un kāds ir darba laiks?', 'Mēs atrodamies Smiltenē, Daugavas ielā 1A. Sporta zāle strādā katru dienu 05:00–24:00, ieejas laiks atkarīgs no izvēlētā abonementa.'],
];
faqs.push(['Vai abonementu var atcelt?', 'Jā. Aktīvo abonementu vari atcelt savā profilā sadaļā Mans profils. Pēc atcelšanas ieeja zālē ar šo abonementu vairs nedarbojas.']);

export function Faq({ id = 'buj', title = 'Biežāk uzdotie jautājumi', intro = 'Viss svarīgais, kas jāzina pirms pirmā treniņa.' }: { id?: string; title?: string; intro?: string }) {
 const [open, setOpen] = useState<number | null>(0);
 return <section className="section faq-section" id={id}>
  <div><h2>{title}</h2><p className="muted faq-intro">{intro}</p></div>
  <div className="faqs">{faqs.map(([q, a], i) => <article className={`faq ${open === i ? 'expanded' : ''}`} key={q}><h3><button aria-expanded={open === i} aria-controls={`${id}-${i}`} onClick={() => setOpen(open === i ? null : i)}>{q}{open === i ? <Minus size={19}/> : <Plus size={19}/>}</button></h3><div id={`${id}-${i}`} hidden={open !== i}><p>{a}</p></div></article>)}</div>
 </section>;
}
