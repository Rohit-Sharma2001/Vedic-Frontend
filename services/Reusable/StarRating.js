const StarRating = ({ value = 0, size = 24 }) => {
  const fullStars = Math.floor(value);
  const hasHalf = value - fullStars >= 0.25 && value - fullStars < 0.75;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  const starStyle = {
    width: `${size}px`,
    height: `${size}px`,
    marginRight: "4px",
  };

  return (
    <div className="d-inline-flex align-items-center">
      {[...Array(fullStars)].map((_, i) => (
        <svg key={`full-${i}`} viewBox="0 0 24 24" fill="#f5a623" style={starStyle}>
          <path d="M12 .587l3.668 7.431 8.2 1.19-5.934 5.782 1.4 8.168L12 18.896l-7.334 3.862 1.4-8.168L.132 9.208l8.2-1.19z" />
        </svg>
      ))}
      {hasHalf && (
        <svg viewBox="0 0 24 24" style={starStyle}>
          <defs>
            <linearGradient id="halfGradient">
              <stop offset="50%" stopColor="#f5a623" />
              <stop offset="50%" stopColor="#ccc" />
            </linearGradient>
          </defs>
          <path
            fill="url(#halfGradient)"
            d="M12 .587l3.668 7.431 8.2 1.19-5.934 5.782 1.4 8.168L12 18.896l-7.334 3.862 1.4-8.168L.132 9.208l8.2-1.19z"
          />
        </svg>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <svg key={`empty-${i}`} viewBox="0 0 24 24" fill="#ccc" style={starStyle}>
          <path d="M12 .587l3.668 7.431 8.2 1.19-5.934 5.782 1.4 8.168L12 18.896l-7.334 3.862 1.4-8.168L.132 9.208l8.2-1.19z" />
        </svg>
      ))}
    </div>
  );
};
export default StarRating;