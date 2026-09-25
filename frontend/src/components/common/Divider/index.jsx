import React from 'react';
import "../components.css";
export default function Divider({ className = "", ...props }) {
  return <hr className={`cc-divider ${className}`.trim()} {...props} />;
}
