'use client';

import { Container } from 'react-bootstrap';

export default function BooksArticlesPageAdmin() {
  return (
    <Container className="py-4 d-flex justify-content-center">
      <iframe
        src="/LandingPage/components/BookArticles"
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
