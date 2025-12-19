import React, { useEffect, useState } from 'react';

const ScrollLiquidGlass = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const offset = window.scrollY;
            if (offset > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div
            className={`fixed top-0 left-0 right-0 h-20 pointer-events-none transition-all duration-500 z-40 ${scrolled ? 'opacity-100' : 'opacity-0'
                }`}
            style={{
                background: scrolled
                    ? 'linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 50%, rgba(255, 255, 255, 0) 100%)'
                    : 'transparent',
                backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
                WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
                boxShadow: scrolled ? '0 8px 32px rgba(102, 126, 234, 0.1)' : 'none',
            }}
        >
            {/* Liquid glass wave effect */}
            {scrolled && (
                <div className="absolute inset-0 overflow-hidden">
                    <div
                        className="absolute inset-0 animate-wave"
                        style={{
                            background: 'radial-gradient(circle at 20% 50%, rgba(102, 126, 234, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(118, 75, 162, 0.1) 0%, transparent 50%)',
                            animation: 'wave 8s ease-in-out infinite',
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default ScrollLiquidGlass;
