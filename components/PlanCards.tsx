'use client';

import { useRef, useState } from 'react';
import { ArrowUpRight, Check } from 'lucide-react';
import { formatPrice, type Plan } from '@/lib/plans';

export function PlanCard({ plan, onChoose, cta = 'Iegādāties abonementu', current = false }: { plan: Plan; onChoose: (plan: Plan) => void; cta?: string; current?: boolean }) {
 return <article className={`plan ${plan.featured ? 'featured' : ''}`}>
  <div className="plan-top"><span className="eyebrow">{plan.name}</span>{current && <span className="plan-current">Tavs abonements</span>}</div>
  <div className="price">{formatPrice(plan.price)}<span>€</span><small> / {plan.period}</small></div>
  <p>{plan.description}</p>
  <div className="plan-divider"/>
  <ul className="plan-features">{plan.features.map(f => <li key={f}><Check size={16}/>{f}</li>)}</ul>
  <button className={`btn ${plan.featured ? '' : 'outline'}`} onClick={() => onChoose(plan)}>{cta} <ArrowUpRight size={17}/></button>
 </article>;
}

export function PlanCarousel({ plans, onChoose, cta, currentSlug }: { plans: Plan[]; onChoose: (plan: Plan) => void; cta?: string; currentSlug?: string | null }) {
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
  el.scrollTo({ left: card.offsetLeft - parseFloat(getComputedStyle(el).paddingLeft || '0'), behavior: 'smooth' });
 };
 return <div className="plans-carousel">
  <div className="plans" ref={ref} onScroll={onScroll}>{plans.map(plan => <PlanCard key={plan.slug} plan={plan} onChoose={onChoose} cta={cta} current={plan.slug === currentSlug}/>)}</div>
  <div className="plan-dots">{plans.map((plan, i) => <button key={plan.slug} type="button" className={i === active ? 'active' : ''} aria-label={`Rādīt: ${plan.name}`} aria-current={i === active} onClick={() => goTo(i)}/>)}</div>
 </div>;
}
