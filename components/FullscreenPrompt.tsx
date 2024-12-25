'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface CustomDocument extends Document {
    webkitFullscreenElement?: Element | null;
    mozFullScreenElement?: Element | null;
    msFullscreenElement?: Element | null;
}

export const FullscreenPrompt = () => {
    const [showPrompt, setShowPrompt] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);
    const [neverShowAgain, setNeverShowAgain] = useState(false);
    const pathname = usePathname();

    // List of paths where the prompt should not appear
    const excludedPaths = ['/', '/preferences', '/intro', '/sign-in', '/sign-up', '/onboarding'];
    
    // Function to check if path should be excluded
    const shouldExcludePath = (path: string) => {
        return excludedPaths.includes(path) || path.startsWith('/blog');
    };

    useEffect(() => {
        // Check localStorage first
        const neverShow = localStorage.getItem('fullscreenPrompt-neverShow');
        const sessionDismissed = sessionStorage.getItem('fullscreenPrompt-dismissed');
        if (neverShow === 'true' || sessionDismissed === 'true') return;
        if (shouldExcludePath(pathname)) return;

        // Move isFullscreen check into a function so we can reuse it
        const checkFullscreen = () => {
            const doc = document as CustomDocument;
            return !!(doc.fullscreenElement ||
                doc.webkitFullscreenElement ||
                doc.mozFullScreenElement ||
                doc.msFullscreenElement);
        };

        // If already in fullscreen, mark it as dismissed for this session
        if (checkFullscreen()) {
            sessionStorage.setItem('fullscreenPrompt-dismissed', 'true');
            setShowPrompt(false);
            return;
        }

        // Add fullscreen change event listener
        const handleFullscreenChange = () => {
            if (checkFullscreen()) {
                setShowPrompt(false);
                sessionStorage.setItem('fullscreenPrompt-dismissed', 'true');
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);

        // Only show prompt if NOT in fullscreen
        if (!checkFullscreen() && !isDismissed) {
            setShowPrompt(true);
            window.dispatchEvent(new CustomEvent('fullscreenPromptChange', { 
                detail: { isVisible: true } 
            }));
        }

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
        };
    }, [isDismissed, pathname]);

    const enterFullscreen = () => {
        const doc = document as CustomDocument;
        if (doc.fullscreenElement) {
            // Already in fullscreen, just dismiss the prompt
            setShowPrompt(false);
            return;
        }

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

    const dismissPrompt = () => {
        if (neverShowAgain) {
            localStorage.setItem('fullscreenPrompt-neverShow', 'true');
        } else {
            sessionStorage.setItem('fullscreenPrompt-dismissed', 'true');
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
                            onClick={dismissPrompt}
                            className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                        >
                            {"No"}
                        </button>
                        <label className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer mt-2">
                            <input
                                type="checkbox"
                                checked={neverShowAgain}
                                onChange={(e) => setNeverShowAgain(e.target.checked)}
                                className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                            />
                            <span>{"Don't show again"}</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FullscreenPrompt; 