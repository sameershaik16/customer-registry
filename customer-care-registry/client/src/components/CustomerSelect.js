import React, { useEffect, useState } from 'react';
import { getCustomers } from '../services/customerService';

// A simple searchable <select> of customers, since typeahead libs aren't available here.
const CustomerSelect = ({ value, onChange, required }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getCustomers({ limit: 200 });
        setCustomers(data.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <select className="form-control" value={value} onChange={(e) => onChange(e.target.value)} required={required}>
      <option value="">{loading ? 'Loading customers...' : 'Select a customer'}</option>
      {customers.map((c) => (
        <option key={c._id} value={c._id}>
          {c.name} — {c.phone}
        </option>
      ))}
    </select>
  );
};

export default CustomerSelect;
