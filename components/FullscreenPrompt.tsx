'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { usePathname } from 'next/navigation';

export const FullscreenPrompt = () => {
    const [showPrompt, setShowPrompt] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);
    const [neverShowAgain, setNeverShowAgain] = useState(false);
    const [showCheckbox, setShowCheckbox] = useState(false);
    const pathname = usePathname();

    // List of paths where the prompt should not appear
    const excludedPaths = ['/', '/blog', '/preferences', '/intro'];

    useEffect(() => {
        const neverShow = localStorage.getItem('fullscreenPrompt-neverShow');
        if (neverShow === 'true') return;
        if (excludedPaths.includes(pathname)) return;

        // Properly typed fullscreen checks
        const doc = document as Document & {
            webkitFullscreenElement?: Element;
            mozFullScreenElement?: Element;
            msFullscreenElement?: Element;
        };

        const docEl = document.documentElement as HTMLElement & {
            webkitRequestFullscreen?: () => Promise<void>;
            mozRequestFullScreen?: () => Promise<void>;
            msRequestFullscreen?: () => Promise<void>;
        };

        const isSupported = !!(docEl.requestFullscreen || 
            docEl.webkitRequestFullscreen ||
            docEl.mozRequestFullScreen ||
            docEl.msRequestFullscreen);

        if (isSupported) {
            const isFullscreen = doc.fullscreenElement ||
                doc.webkitFullscreenElement ||
                doc.mozFullScreenElement ||
                doc.msFullscreenElement;

            if (!isFullscreen && !isDismissed) {
                setShowPrompt(true);
                window.dispatchEvent(new CustomEvent('fullscreenPromptChange', { 
                  detail: { isVisible: true } 
                }));
            }
        }
    }, [isDismissed, pathname]);

    const enterFullscreen = () => {
        const docEl = document.documentElement as HTMLElement & {
            webkitRequestFullscreen?: () => Promise<void>;
            mozRequestFullScreen?: () => Promise<void>;
            msRequestFullscreen?: () => Promise<void>;
        };

        const requestFullscreen = docEl.requestFullscreen ||
            docEl.webkitRequestFullscreen ||
            docEl.mozRequestFullScreen ||
            docEl.msRequestFullscreen;

        if (requestFullscreen) {
            requestFullscreen.call(docEl)
                .then(() => setShowPrompt(false))
                .catch((err) => console.error('Error attempting to enable fullscreen:', err));
        }
    };

    const handleNoClick = () => {
        if (showCheckbox) {
            dismissPrompt();  // If checkbox is already shown, clicking No again should dismiss
        } else {
            setShowCheckbox(true);  // First click just shows the checkbox
        }
    };

    const dismissPrompt = () => {
        if (neverShowAgain) {
            localStorage.setItem('fullscreenPrompt-neverShow', 'true');
        }
        setShowPrompt(false);
        setIsDismissed(true);
        window.dispatchEvent(new CustomEvent('fullscreenPromptChange', { 
          detail: { isVisible: false } 
        }));
    };

    if (!showPrompt) return null;

    return (
        <div 
            className="fixed inset-0 flex items-center justify-center"
            style={{
                zIndex: 2147483647,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                position: 'fixed',
                isolation: 'isolate',
                pointerEvents: 'auto' // Ensure clicks are received
            }}
        >
            <div 
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-sm mx-4 animate-fade-in relative"
                style={{
                    position: 'relative',
                    zIndex: 2147483647
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={dismissPrompt}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                    <X size={18} />
                </button>
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-4 text-center">
                    {"Our website looks better in full screen."}
                </p>
                <div className="flex flex-col space-y-4">
                    <button
                        onClick={enterFullscreen}
                        className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                        {"Enter Fullscreen"}
                    </button>
                    <div className="flex flex-col items-center space-y-2 w-full">
                        <button
                            onClick={handleNoClick}
                            className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                        >
                            {"No"}
                        </button>
                        {showCheckbox && (
                            <label className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer mt-2">
                                <input
                                    type="checkbox"
                                    checked={neverShowAgain}
                                    onChange={(e) => setNeverShowAgain(e.target.checked)}
                                    className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                                />
                                <span>{"Don't show again"}</span>
                            </label>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FullscreenPrompt; 