import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

export const metadata: Metadata = {
 title: { default: 'GYM82 | Fitnesa klubs Smiltenē', template: '%s | GYM82' },
 description: 'Mūsdienīgs fitnesa klubs Smiltenē ar elastīgiem abonementiem un individuāliem treniņiem.',
 icons: { icon: '/assets/logo-white.svg' },
};

export const viewport: Viewport = { themeColor: '#111212' };

// Applies the saved theme before first paint to avoid a flash.
const themeScript = `(function(){try{var t=localStorage.getItem('gym82-theme');document.documentElement.dataset.theme=t==='light'?'light':'dark';if(t==='light'){var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content','#f5f5f0')}}catch(e){document.documentElement.dataset.theme='dark'}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
 return <html lang="lv" data-theme="dark" suppressHydrationWarning>
  <head><script dangerouslySetInnerHTML={{ __html: themeScript }}/></head>
  <body><AuthProvider><SiteHeader/>{children}<SiteFooter/></AuthProvider></body>
 </html>;
}
