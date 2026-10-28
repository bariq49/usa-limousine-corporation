import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import Providers from "@/providers/query-provider";
import { getAppUrl } from "@/lib/api/base-url";
import { PLATFORM } from "@usa-limousine-corporation/config";
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

const baseUrl = getAppUrl();
/** Analytics are optional; nothing loads unless these are set. */
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const siteTitle = `${PLATFORM.shortName} | Premium Airport Car Service New Jersey & NYC`;
const siteDescription = `${PLATFORM.shortName} provides luxury car service, executive chauffeur service, and reliable airport transportation across New Jersey, New York City, Newark (EWR), and JFK.`;
const siteKeywords = "airport car service new jersey, airport chauffeur service, limousine service in new york city, executive transportation services, luxury car service new jersey, ewr airport pickup, hourly car service nyc";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: siteTitle,
    template: `%s | ${PLATFORM.shortName}`,
  },
  description: siteDescription,
  keywords: siteKeywords,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: baseUrl,
    siteName: PLATFORM.shortName,
    locale: 'en',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} h-full antialiased`}
    >
      <head>
        {GTM_ID ? (
          <Script id="google-tag-manager" strategy="lazyOnload">
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${GTM_ID}');
            `}
          </Script>
        ) : null}
        {GA_ID ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="lazyOnload"
            />
            <Script id="google-gtag" strategy="lazyOnload">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        ) : null}
        {/* Schema Markup */}
        <Script
          id="schema-markup"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              name: siteTitle,
              image: `${baseUrl}/icon.png`,
              description: siteDescription,
              "@id": baseUrl,
              url: baseUrl,
              telephone: PLATFORM.contact.phoneE164,
              address: {
                "@type": "PostalAddress",
                streetAddress: PLATFORM.contact.address.display,
                addressLocality: PLATFORM.contact.address.city,
                addressRegion: PLATFORM.contact.address.region,
                postalCode: PLATFORM.contact.address.postalCode,
                addressCountry: PLATFORM.contact.address.country,
              },
              openingHoursSpecification: {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ],
                opens: "00:00",
                closes: "23:59",
              },
              sameAs: Object.values(PLATFORM.social),
            }),
          }}
        />
      </head>
  <body className="min-h-full flex flex-col overflow-x-hidden">
        {GTM_ID ? (
          <noscript
            dangerouslySetInnerHTML={{
              __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
            }}
          />
        ) : null}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
