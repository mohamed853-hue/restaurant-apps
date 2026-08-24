import React from 'react';
import { useToast } from '../context/ToastContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 9999, marginTop: '75px' }}>
      {toasts.map((toast) => {
        const bgClass =
          toast.type === 'success'
            ? 'bg-success text-white'
            : toast.type === 'error'
            ? 'bg-danger text-white'
            : toast.type === 'warning'
            ? 'bg-warning text-dark'
            : 'bg-dark text-white';

        const iconClass =
          toast.type === 'success'
            ? 'bi-check-circle-fill'
            : toast.type === 'error'
            ? 'bi-exclamation-octagon-fill'
            : toast.type === 'warning'
            ? 'bi-exclamation-triangle-fill'
            : 'bi-info-circle-fill';

        return (
          <div
            key={toast.id}
            className={`toast show align-items-center ${bgClass} border-0 mb-2 shadow-lg`}
            role="alert"
            style={{ borderRadius: '14px', minWidth: '320px' }}
          >
            <div className="d-flex p-3">
              <i className={`bi ${iconClass} fs-5 me-2`}></i>
              <div className="toast-body p-0 flex-grow-1 font-weight-bold" style={{ fontSize: '13px' }}>
                {toast.message}
              </div>
              <button
                type="button"
                className={`btn-close ms-auto ${toast.type === 'warning' ? '' : 'btn-close-white'}`}
                onClick={() => removeToast(toast.id)}
              ></button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
