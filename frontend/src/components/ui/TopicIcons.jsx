
import React from 'react';

export const BusinessIcon = ({ className }) => (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect x="6" y="8" width="28" height="24" rx="4" fill="#EFF6FF" />
        <path d="M14 8V6C14 4.89543 14.8954 4 16 4H24C25.1046 4 26 4.89543 26 6V8" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
        <path d="M6 14H34M14 14V32M26 14V32" stroke="#93C5FD" strokeWidth="2" />
        <path d="M6 8H34" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

export const ConversationIcon = ({ className }) => (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M8 28V8C8 5.79086 9.79086 4 12 4H26C28.2091 4 30 5.79086 30 8V20C30 22.2091 28.2091 24 26 24H12L8 28Z" fill="#F0FDF4" />
        <path d="M14 14H24M14 10H20" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" />
        <path d="M32 10V28L28 24H20C17.7909 24 16 25.7909 16 28V30C16 32.2091 17.7909 34 20 34H34C36.2091 34 38 32.2091 38 30V16C38 13.7909 36.2091 12 34 12H32Z" stroke="#86EFAC" strokeWidth="2" fill="#F0FDF4" fillOpacity="0.5" />
    </svg>
);

export const TravelIcon = ({ className }) => (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="20" cy="20" r="16" fill="#FEF2F2" />
        <path d="M20 12L23 16H28L24 19L25 24L20 21L15 24L16 19L12 16H17L20 12Z" stroke="#F43F5E" strokeWidth="2" strokeLinejoin="round" />
        <path d="M4 28C8 26 14 26 20 28C26 30 32 30 36 28" stroke="#FECDD3" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

export const RestaurantIcon = ({ className }) => (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="20" cy="20" r="16" fill="#FFFBEB" />
        <path d="M12 24C12 24 13 28 20 28C27 28 28 24 28 24" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
        <path d="M14 14L16 20M20 14L20 20M26 14L24 20" stroke="#FCD34D" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

export const TimeIcon = ({ className }) => (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="20" cy="20" r="14" fill="#F5F3FF" stroke="#8B5CF6" strokeWidth="2" />
        <path d="M20 12V20L26 20" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" />
        <path d="M16 26H24" stroke="#DDD6FE" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

export const FormalIcon = ({ className }) => (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect x="8" y="8" width="24" height="24" rx="2" fill="#FAFAFA" />
        <path d="M12 14H28M12 20H28M12 26H20" stroke="#525252" strokeWidth="2" strokeLinecap="round" />
        <rect x="6" y="6" width="28" height="28" rx="4" stroke="#D4D4D4" strokeWidth="2" />
        <circle cx="30" cy="30" r="4" fill="#EF4444" />
    </svg>
);

export const GeneralIcon = ({ className }) => (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect x="8" y="8" width="24" height="24" rx="6" fill="#F3F4F6" />
        <path d="M14 20L18 24L26 16" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const getTopicIcon = (name = '', className) => {
    const lowerName = name.toLowerCase();

    if (lowerName.includes('business')) return <BusinessIcon className={className} />;
    if (lowerName.includes('daily') || lowerName.includes('conversation')) return <ConversationIcon className={className} />;
    if (lowerName.includes('travel') || lowerName.includes('tourism')) return <TravelIcon className={className} />;
    if (lowerName.includes('restaurant') || lowerName.includes('food')) return <RestaurantIcon className={className} />;
    if (lowerName.includes('number') || lowerName.includes('time')) return <TimeIcon className={className} />;
    if (lowerName.includes('formal') || lowerName.includes('expressions')) return <FormalIcon className={className} />;

    return <GeneralIcon className={className} />;
};
