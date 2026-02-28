import { Link } from '@inertiajs/react';
import React from 'react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
        {...props}
        className={
            'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none ' +
            (active
                ? 'border-indigo-400 text-gray-100 focus:border-indigo-700'
                : 'border-transparent text-gray-100 hover:border-gray-300 hover:text-gray-700 focus:border-gray-300 focus:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600 focus:dark:border-gray-600') +
            className
        }
    >
        {children}
    </Link>
    
    );
}
