import React from 'react';

function Logo({ size = 70, className = 'logo' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      width={size}
      height={size}
    >
      <circle cx="30" cy="40" r="15" fill="#1f2937" opacity="0.9" />
      <circle cx="50" cy="25" r="15" fill="#1f2937" opacity="0.9" />
      <circle cx="70" cy="40" r="15" fill="#1f2937" opacity="0.9" />
      <line
        x1="30"
        y1="40"
        x2="50"
        y2="25"
        stroke="#1f2937"
        strokeWidth="2"
        opacity="0.6"
      />
      <line
        x1="50"
        y1="25"
        x2="70"
        y2="40"
        stroke="#1f2937"
        strokeWidth="2"
        opacity="0.6"
      />
      <line
        x1="30"
        y1="40"
        x2="70"
        y2="40"
        stroke="#1f2937"
        strokeWidth="2"
        opacity="0.6"
      />
    </svg>
  );
}

export default Logo;
