import React from 'react';
import "../css/alert.css";
function Alert({ alert }) {
  console.log('Alert props:', alert); // Add this line for debugging
  return (
    alert && (
      <div className={`alert alert-${alert.type} alert-dismissible fade show`} role="alert">
        {alert.msg}
      </div>
    )
  );
}

export default Alert;
