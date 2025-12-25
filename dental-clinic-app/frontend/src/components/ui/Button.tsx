import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'destructive';
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    children,
    className = '',
    style,
    ...props
}) => {
    const baseStyles = 'px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variantStyles = {
        primary: 'text-white hover:opacity-90',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
        destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    };

    // Use inline style for primary to ensure the mint color works
    const variantInlineStyles: Record<string, React.CSSProperties> = {
        primary: { backgroundColor: '#3DBEA3' },
        secondary: {},
        destructive: {},
    };

    return (
        <button
            className={`${baseStyles} ${variantStyles[variant]} ${className}`}
            style={{ ...variantInlineStyles[variant], ...style }}
            {...props}
        >
            {children}
        </button>
    );
};
