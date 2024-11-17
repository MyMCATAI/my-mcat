const AuthLayout = ({
    children
}: {
    children: React.ReactNode;
}) => {
    return (
        <div className="relative flex items-center justify-center min-h-screen">
            <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80"
                style={{ backgroundImage: 'url(/Wallpaperwire.jpg)' }}
            />
            <div className="absolute inset-0 bg-black/50" />
            <div className="relative z-10">
                {children}
            </div>
        </div>
    )
}

export default AuthLayout;