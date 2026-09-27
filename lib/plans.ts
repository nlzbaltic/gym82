export type Plan = {
 slug: string;
 name: string;
 price: number;
 period: string;
 description: string;
 features: string[];
 featured?: boolean;
 badge?: string;
};

// Display data. Prices, limits and hours are enforced by the `plans` table in Supabase.
export const plans: Plan[] = [
 { slug: 'pirmais-solis', name: 'Pirmais solis', price: 0, period: 'bezmaksas treniņš', description: 'Iepazīsti zāli savā pirmajā treniņā.', features: ['Viens bezmaksas treniņš', 'Iepazīsti sporta zāli', 'Izmēģini treniņu zonas'] },
 { slug: 'vienreizejs', name: 'Vienreizējs apmeklējums', price: 4, period: 'viens apmeklējums', description: 'Nāc trenēties tad, kad tev ir laiks.', features: ['Viens apmeklējums', 'Ieeja 05:00–24:00', 'Bez ilgtermiņa saistībām'] },
 { slug: 'rits', name: 'Rīts', price: 24.95, period: '12 apmeklējumi', description: 'Sāc dienu ar treniņu, kamēr pilsēta vēl mostas.', features: ['12 apmeklējumi', 'Ieeja 05:00–13:00', 'Abonements tavā profilā'] },
 { slug: 'ultra', name: 'Ultra', price: 44.95, period: 'bez ierobežojuma', description: 'Trenējies tik bieži, cik vēlies.', features: ['Neierobežoti apmeklējumi', 'Ieeja 05:00–24:00', 'Abonements tavā profilā'], featured: true, badge: 'Populārākais' },
];

const retired: Plan[] = [
 { slug: 'aktivais', name: 'Aktīvais', price: 34.95, period: '16 apmeklējumi', description: '', features: [] },
];

export const planBySlug = (slug: string | null | undefined) => plans.find(p => p.slug === slug);
export const planName = (slug: string) => (plans.find(p => p.slug === slug) ?? retired.find(p => p.slug === slug))?.name ?? slug;

export const formatPrice = (price: number) => price === 0 ? '0' : price.toFixed(2).replace('.', ',');
