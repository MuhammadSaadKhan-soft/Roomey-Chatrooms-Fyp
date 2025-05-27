import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap is available
import "../css/alert.css"; // Only keep this if you're customizing intentionally

function Alert({ alert }) {
  return (
    alert && (
      <div
        className={`alert alert-${alert.type} alert-dismissible fade show mb-3`}
        role="alert"
      >
        {alert.msg}
        {/* Optional dismiss button */}
        <button
          type="button"
          className="btn-close"
          data-bs-dismiss="alert"
          aria-label="Close"
        ></button>
      </div>
    )
  );
}

export default Alert;
