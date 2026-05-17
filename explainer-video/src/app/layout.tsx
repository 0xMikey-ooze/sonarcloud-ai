import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Explainer Video',
  description: 'Prompt → MP4 explainer video',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
