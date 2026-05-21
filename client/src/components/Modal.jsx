import React, { useEffect } from 'react';

const Modal = ({ isOpen, onClose, title, children }) => {
  // Close on Escape keypress
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title-text">{title}</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close Modal">
            &times;
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
      
      <style>{`
        .modal-title-text {
          font-size: 1.25rem;
          font-weight: 700;
          color: #ffffff;
          font-family: var(--font-heading);
          background: linear-gradient(135deg, #ffffff, var(--text-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .modal-close-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 1.75rem;
          cursor: pointer;
          line-height: 1;
          transition: color 0.2s;
        }

        .modal-close-btn:hover {
          color: var(--color-rose);
        }
      `}</style>
    </div>
  );
};

export default Modal;
