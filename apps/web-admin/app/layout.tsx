import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'HALO Admin Portal',
  description: 'HALO Virtual Wardrobe & 3D Dressing Platform Administration',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-halo-canvas text-halo-plum antialiased selection:bg-halo-lilac selection:text-halo-plum">
        {/* Ambient Pastel Glows in Background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-halo-lilac/40 blur-3xl" />
          <div className="absolute top-1/3 -left-32 w-96 h-96 rounded-full bg-halo-blush/35 blur-3xl" />
          <div className="absolute -bottom-32 right-1/4 w-[32rem] h-[32rem] rounded-full bg-halo-powder/45 blur-3xl" />
        </div>
        {children}
      </body>
    </html>
  );
}

