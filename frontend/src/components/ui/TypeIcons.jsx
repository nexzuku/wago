
import React from 'react';

export const PDFIcon = ({ className }) => (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect x="8" y="4" width="24" height="32" rx="4" fill="#FFE4E6" />
        <path d="M14 4H26V12L20 16L14 12V4Z" fill="#F43F5E" />
        <path d="M14 24H26M14 28H22" stroke="#F43F5E" strokeWidth="2" strokeLinecap="round" />
        <path d="M25 28L28 31L25 34" stroke="#F43F5E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const VideoIcon = ({ className }) => (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect x="4" y="8" width="32" height="24" rx="6" fill="#E0F2FE" />
        <path d="M15 14L27 20L15 26V14Z" fill="#0EA5E9" />
        <rect x="8" y="12" width="2" height="2" rx="1" fill="#7DD3FC" />
        <rect x="30" y="12" width="2" height="2" rx="1" fill="#7DD3FC" />
        <rect x="8" y="26" width="2" height="2" rx="1" fill="#7DD3FC" />
        <rect x="30" y="26" width="2" height="2" rx="1" fill="#7DD3FC" />
    </svg>
);

export const AudioIcon = ({ className }) => (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="20" cy="20" r="16" fill="#F0F9FF" />
        <path d="M20 10V30" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" />
        <path d="M14 16V24" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" />
        <path d="M26 16V24" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" />
        <path d="M8 19V21" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" />
        <path d="M32 19V21" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

export const ImageIcon = ({ className }) => (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect x="6" y="6" width="28" height="28" rx="4" fill="#F0FDF4" />
        <circle cx="14" cy="14" r="3" fill="#4ADE80" />
        <path d="M6 26L14 18L22 26L26 22L34 30V30C34 32.2091 32.2091 34 30 34H10C7.79086 34 6 32.2091 6 30V26Z" fill="#22C55E" />
    </svg>
);

export const DocIcon = ({ className }) => (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect x="8" y="4" width="24" height="32" rx="3" fill="#F3F4F6" />
        <path d="M14 12H26M14 18H26M14 24H20" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
        <path d="M24 4V10C24 11.1046 24.8954 12 26 12H32" stroke="#D1D5DB" strokeWidth="2" />
    </svg>
);

export const getTypeIcon = (type, className) => {
    switch (type) {
        case 'pdf': return <PDFIcon className={className} />;
        case 'video': return <VideoIcon className={className} />;
        case 'audio': return <AudioIcon className={className} />;
        case 'image': return <ImageIcon className={className} />;
        default: return <DocIcon className={className} />;
    }
};
