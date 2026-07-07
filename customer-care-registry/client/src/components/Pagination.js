import React from 'react';

const Pagination = ({ page, pages, onChange }) => {
  if (pages <= 1) return null;

  const pageNumbers = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(pages, start + 4);
  for (let i = start; i <= end; i += 1) pageNumbers.push(i);

  return (
    <div className="pagination">
      <button disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Prev
      </button>
      {start > 1 && (
        <>
          <button onClick={() => onChange(1)}>1</button>
          {start > 2 && <span>…</span>}
        </>
      )}
      {pageNumbers.map((n) => (
        <button key={n} className={n === page ? 'active' : ''} onClick={() => onChange(n)}>
          {n}
        </button>
      ))}
      {end < pages && (
        <>
          {end < pages - 1 && <span>…</span>}
          <button onClick={() => onChange(pages)}>{pages}</button>
        </>
      )}
      <button disabled={page >= pages} onClick={() => onChange(page + 1)}>
        Next
      </button>
    </div>
  );
};

export default Pagination;
