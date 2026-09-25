'use client';
import React, { useEffect, useRef } from 'react';
import { Container } from 'react-bootstrap';

export default function YourDoshasPageAdmin() {

    const iframeRef = useRef(null);

  useEffect(() => {
    const onMessage = (event) => {
      // Optionally check event.origin here for security
      if (event?.data?.type === 'SCROLL_TO_TOP') {
        // Scroll the admin window
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // If same-origin, also ensure the iframe scrolls
        try {
          iframeRef.current?.contentWindow?.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (_) {}
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  return (
    <Container className="py-4 d-flex justify-content-center">
      <iframe
        src="/LandingPage/components/YourDoshas"
         ref={iframeRef}
        width="100%"
        height="1000px"
        style={{
         maxWidth: '95%',
          minWidth:'1024px',
          border: '1px solid #ccc',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        }}
      ></iframe>
    </Container>
  );
}
