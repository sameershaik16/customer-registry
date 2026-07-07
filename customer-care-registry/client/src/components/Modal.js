import React from 'react';
import { FiX } from 'react-icons/fi';

const Modal = ({ title, onClose, children, footer, size }) => (
  <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <div className="modal" style={size === 'lg' ? { maxWidth: 760 } : undefined}>
      <div className="modal-header">
        <h3>{title}</h3>
        <button className="icon-btn" onClick={onClose} aria-label="Close">
          <FiX />
        </button>
      </div>
      <div className="modal-body">{children}</div>
      {footer && <div className="modal-footer">{footer}</div>}
    </div>
  </div>
);

export default Modal;
