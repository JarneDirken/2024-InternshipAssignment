import React, { ReactNode } from 'react';

type ButtonProps = {
    text: string;
    icon?: ReactNode; 
    onClick?: () => void;
    textColor?: string;
    borderColor?: string;
    fillColor?: string;
    paddingX?: string;
    paddingY?: string;
    font?: string;
    buttonClassName?: string;
    textClassName?: string;
    disabled?: boolean;
}

export default function Button({ 
    text, 
    icon, 
    onClick, 
    textColor = 'black', 
    borderColor = 'gray-300', 
    fillColor = 'white',
    paddingX = 'px-4',
    paddingY = 'py-1', 
    font = "normal",
    buttonClassName = "",
    textClassName = "",
    disabled = false
}: ButtonProps) {
    const buttonClasses = `group border rounded-lg items-center justify-center ${paddingY} ${paddingX} flex gap-1 border-${borderColor} bg-${fillColor} ${buttonClassName} ${disabled ? 'bg-gray-200 border-gray-400 cursor-not-allowed' : ''}`;
    const textClasses = `font-${font} text-${textColor} text-sm sm:text-lg ${textClassName} ${disabled ? 'text-gray-400' : ''}`;

    return (
        <button onClick={disabled ? undefined : onClick} className={buttonClasses}
            disabled={disabled}
        >
            {icon && <span className={textClasses}>{icon}</span>}
            <span className={`text-lg ${textClasses}`}>{text}</span>
        </button>
    );
}
