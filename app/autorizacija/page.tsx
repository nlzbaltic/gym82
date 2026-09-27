import type { Metadata } from 'next';
import { AuthScreen } from '@/components/AuthScreen';

export const metadata: Metadata = { title: 'Pieslēgties', robots: { index: false } };

export default function Page() {
 return <AuthScreen mode="login"/>;
}
