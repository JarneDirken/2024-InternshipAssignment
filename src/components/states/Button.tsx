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
    textClassName = ""
}: ButtonProps) {
    const buttonClasses = `border rounded-lg items-center justify-center ${paddingY} ${paddingX} flex gap-1 border-${borderColor} bg-${fillColor} ${buttonClassName}`;
    const textClasses = `font-${font} text-${textColor} text-sm sm:text-lg ${textClassName}`;

    return (
        <button onClick={onClick} className={buttonClasses}>
            {icon && <span className={textClasses}>{icon}</span>}
            <span className={`text-lg ${textClasses}`}>{text}</span>
        </button>
    );
}
