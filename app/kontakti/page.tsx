import type { Metadata } from 'next';
import { ContactPage } from '@/components/ContactPage';

export const metadata: Metadata = { title: 'Kontakti', description: 'GYM82 kontakti, adrese Smiltenē, darba laiks un rekvizīti.' };

export default function Page() {
 return <ContactPage/>;
}
