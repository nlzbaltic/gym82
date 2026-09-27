export type Plan = {
 slug: string;
 name: string;
 price: number;
 period: string;
 description: string;
 features: string[];
 featured?: boolean;
};

// Display data. Prices, limits and hours are enforced by the `plans` table in Supabase.
export const plans: Plan[] = [
 { slug: 'pirmais-solis', name: 'Pirmais solis', price: 0, period: 'bezmaksas treniņš', description: 'Iepazīsti zāli savā pirmajā treniņā.', features: ['Viens bezmaksas treniņš', 'Iepazīsti sporta zāli', 'Izmēģini treniņu zonas'] },
 { slug: 'rits', name: 'Rīts', price: 24.95, period: '12 apmeklējumi', description: 'Izmanto dienas pirmo pusi treniņam.', features: ['12 apmeklējumi', 'Ieeja 05:00–13:00', 'Abonements tavā profilā'] },
 { slug: 'aktivais', name: 'Aktīvais', price: 34.95, period: '16 apmeklējumi', description: 'Trenējies regulāri sev ērtā ritmā.', features: ['16 apmeklējumi', 'Visas treniņu zonas', 'Abonements tavā profilā'], featured: true },
 { slug: 'ultra', name: 'Ultra', price: 44.95, period: 'bez ierobežojuma', description: 'Trenējies tik bieži, cik vēlies.', features: ['Neierobežoti apmeklējumi', 'Ieeja 05:00–24:00', 'Abonements tavā profilā'] },
];

export const planBySlug = (slug: string | null | undefined) => plans.find(p => p.slug === slug);

export const formatPrice = (price: number) => price === 0 ? '0' : price.toFixed(2).replace('.', ',');
