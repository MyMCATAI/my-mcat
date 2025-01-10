'use client';

import { usePathname } from 'next/navigation';

const AuthLayout = ({
    children
}: {
    children: React.ReactNode;
}) => {
    const pathname = usePathname();
    const isOnboardingOrExamCalendar = pathname?.includes('onboarding') || pathname?.includes('examcalendar');
    
    return (
        <div className="relative flex items-center justify-center min-h-screen">
            {!isOnboardingOrExamCalendar && (
                <>
                    <div 
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80"
                        style={{ backgroundImage: 'url(/landingpage/Wallpaperwire.jpg)' }}
                    />
                    <div className="absolute inset-0 bg-black/40" />
                </>
            )}
            <div className={`relative z-10 ${isOnboardingOrExamCalendar ? 'w-full' : ''}`}>
                {children}
            </div>
        </div>
    )
}

export default AuthLayout;