import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import "../css/alert.css"; 

function Alert({ alert }) {
  return (
    alert && (
      <div
        className={`alert alert-${alert.type} alert-dismissible fade show mb-3`}
        role="alert"
      >
        {alert.msg}
       
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
