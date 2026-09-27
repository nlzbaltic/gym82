'use client';

import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Illustrative photos until the gym's own photography is ready.
const photos = [
 { src: '/assets/gym.jpg', alt: 'Brīvo svaru zona' },
 { src: '/assets/gym-2.jpg', alt: 'Plaša treniņu zāle ar trenažieriem' },
 { src: '/assets/gym-3.jpg', alt: 'Hanteļu treniņš' },
 { src: '/assets/gym-4.jpg', alt: 'Kardio un treniņu zona' },
];

export function Gallery() {
 const ref = useRef<HTMLDivElement>(null);
 const [active, setActive] = useState(0);
 const onScroll = () => { const el = ref.current; if (el) setActive(Math.round(el.scrollLeft / el.clientWidth)); };
 const goTo = (i: number) => { const el = ref.current; if (el) el.scrollTo({ left: Math.max(0, Math.min(photos.length - 1, i)) * el.clientWidth, behavior: 'smooth' }); };
 return <div className="gym-visual gallery" role="region" aria-roledescription="karuselis" aria-label="Sporta zāles foto">
  <div className="gallery-track" ref={ref} onScroll={onScroll}>{photos.map((p, i) => <img key={p.src} src={p.src} alt={p.alt} loading={i ? 'lazy' : 'eager'} draggable={false}/>)}</div>
  <div className="image-label"><span>{active + 1} / {photos.length} · Vieta tavam nākamajam līmenim</span><span className="gallery-arrows"><button type="button" aria-label="Iepriekšējā bilde" onClick={() => goTo(active - 1)} disabled={active === 0}><ChevronLeft size={18}/></button><button type="button" aria-label="Nākamā bilde" onClick={() => goTo(active + 1)} disabled={active === photos.length - 1}><ChevronRight size={18}/></button></span></div>
  <div className="gallery-dots">{photos.map((p, i) => <button key={p.src} type="button" aria-label={`Rādīt ${i + 1}. bildi`} className={i === active ? 'active' : ''} onClick={() => goTo(i)}/>)}</div>
 </div>;
}
