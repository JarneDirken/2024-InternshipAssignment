import React, { ReactNode } from 'react';

type ButtonProps = {
    text: string;
    icon?: ReactNode; 
    onClick?: () => void;
}

export default function Button({ text, icon, onClick }: ButtonProps) {
    return(
        <button onClick={onClick} className="border border-gray-300 rounded-lg items-center justify-center py-1 px-4 flex gap-1">
            {icon}
            <span className='text-lg'>{text}</span>
        </button>
    );
}