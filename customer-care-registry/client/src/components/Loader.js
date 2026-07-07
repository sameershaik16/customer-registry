import React from 'react';

const Loader = ({ inline = false }) => {
  if (inline) return <span className="spinner spinner-inline" role="status" aria-label="Loading" />;
  return (
    <div className="loader-wrap">
      <span className="spinner" role="status" aria-label="Loading" />
    </div>
  );
};

export default Loader;
