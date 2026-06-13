import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import Script from 'next/script'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MindFlow AI — Your AI wellness companion',
  description: 'AI-powered journaling for mental wellness. Free to start.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-RN5GWMDVJ1"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-RN5GWMDVJ1');
          `}
        </Script>
      </head>
      <body className={geist.className}>{children}</body>
    </html>
  )
}