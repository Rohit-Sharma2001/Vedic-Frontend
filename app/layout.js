// app/layout.js
import 'styles/theme.scss';
import "bootstrap-icons/font/bootstrap-icons.css";
import { LanguageProvider } from 'context/languageContext';
import ScrollToTopClient from './ScrollToTopClient';
import Script from "next/script";

export const metadata = {
  title: 'Vedic Yours',
  description: 'Dash UI - Next JS admin dashboard template is free and available on GitHub. Create your stunning web apps with our Free Next js template. An open-source admin dashboard built using the new router, server components, and everything new in Next.js 13.',
  keywords: 'Dash UI, Next.js 13, Admin dashboard, admin template, web apps, bootstrap 5, admin theme',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@200;300;400;500;600;700;800;900&display=swap"
          rel="stylesheet" 
        />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.css" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick-theme.css" />
        <link href="css/style.css" rel="stylesheet" />
      </head>
      <body>
        <LanguageProvider>
          <ScrollToTopClient>{children}</ScrollToTopClient>
        </LanguageProvider>

        {/* External scripts */}
        <Script src="https://code.jquery.com/jquery-3.7.1.min.js" strategy="beforeInteractive" />
        <Script src="https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.min.js" strategy="lazyOnload" />
        <Script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js" strategy="lazyOnload" />
        <Script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
