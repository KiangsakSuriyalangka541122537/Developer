import React from 'react';

export const PdfIcon = ({ className = "size-5" }: { className?: string }) => {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      {/* Background/Border */}
      <path 
        d="M4 2.5C4 1.67157 4.67157 1 5.5 1H15.5L20 5.5V21.5C20 22.3284 19.3284 23 18.5 23H5.5C4.67157 23 4 22.3284 4 21.5V2.5Z" 
        fill="white" 
        stroke="#FF0000" 
        strokeWidth="1.5"
      />
      {/* Folded Corner */}
      <path 
        d="M15.5 1V5.5H20" 
        stroke="#FF0000" 
        strokeWidth="1.5" 
        strokeLinejoin="round"
      />
      {/* Adobe-style Ribbon Logo */}
      <path 
        d="M12 14.5C14.5 14.5 16.5 13 16.5 11C16.5 9 14.5 7.5 12 7.5C9.5 7.5 7.5 9 7.5 11C7.5 13 9.5 14.5 12 14.5ZM12 14.5C9.5 14.5 7.5 16 7.5 18C7.5 20 9.5 21.5 12 21.5C14.5 21.5 16.5 20 16.5 18C16.5 16 14.5 14.5 12 14.5Z" 
        fill="none"
        stroke="#FF0000"
        strokeWidth="1"
      />
      <path 
        d="M12 14.5L12 14.5" 
        stroke="#FF0000"
        strokeWidth="1"
      />
      {/* PDF Text */}
      <text 
        x="12" 
        y="20" 
        fill="#333" 
        fontSize="5" 
        fontWeight="bold" 
        textAnchor="middle" 
        fontFamily="Arial, sans-serif"
      >
        PDF
      </text>
    </svg>
  );
};
