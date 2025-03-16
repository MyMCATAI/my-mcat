import { DefaultToastOptions } from 'react-hot-toast';

export const toastConfig: DefaultToastOptions = {
    style: {
        zIndex: 100000, // Much higher than dialog's z-index of 50
        background: 'var(--background)',
        color: 'var(--foreground)',
    },
    position: 'top-center',
}; 