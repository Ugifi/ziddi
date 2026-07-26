import React, { useEffect } from 'react';

export default function Toast({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2500);
    return () => clearTimeout(t);
  }, [onClose]);
  return <div className={`toast${type === 'err' ? ' err' : ''}`}>{msg}</div>;
}
