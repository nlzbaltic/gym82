import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'GYM82 | Sporta zāle Smiltenē', description: 'Sporta zāle ar elastīgiem abonementiem un individuāliem treniņiem.', icons: { icon: '/assets/logo-white.svg' } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="lv"><body>{children}</body></html>; }
