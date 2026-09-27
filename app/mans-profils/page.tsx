import type { Metadata } from 'next';
import { ProfileApp } from '@/components/ProfileApp';

export const metadata: Metadata = { title: 'Mans profils', robots: { index: false } };

export default function Page() {
 return <ProfileApp/>;
}
