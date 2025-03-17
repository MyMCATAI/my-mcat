import { DefaultToastOptions } from 'react-hot-toast';

export const toastConfig: DefaultToastOptions = {
    style: {
        zIndex: 1000, // Higher than dialog's z-index of 901
        background: 'white',
        color: 'var(--theme-text-color)',
    },
    position: 'top-center',
}; 