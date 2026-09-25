'use client';
import React from 'react';

const BhagavadGitaQuote = ({data , quoteimagepreview}) => {
  return (
    <section>
      <div className="container">
        <div className="geetaMain"  style={{
      backgroundImage: `url(${quoteimagepreview})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    }}>
          <p>{data?.quote}</p>
          <b>-- {data?.writerName}</b>
        </div>
      </div>
    </section>
  );
};

export default BhagavadGitaQuote;
