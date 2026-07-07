import React from 'react';
import { FiStar } from 'react-icons/fi';

// interactive=true renders clickable stars for input; otherwise a read-only display
const StarRating = ({ value = 0, onChange, interactive = false, size = 16 }) => (
  <span className="stars" style={{ display: 'inline-flex', gap: 2 }}>
    {[1, 2, 3, 4, 5].map((n) => (
      <FiStar
        key={n}
        size={size}
        style={{ cursor: interactive ? 'pointer' : 'default' }}
        fill={n <= value ? '#e0a83e' : 'none'}
        onClick={() => interactive && onChange && onChange(n)}
      />
    ))}
  </span>
);

export default StarRating;
