export const changeTheme = (theme: string) => {
    console.log(`changeTheme called with theme: ${theme}`);
    
    const currentTheme = localStorage.getItem('theme');
    if (theme !== currentTheme) {
        if (theme === "cyberSpace") {
            document.body.classList.remove('theme-sakuraTrees');
        } else if (theme === "sakuraTrees") {
            document.body.classList.add('theme-sakuraTrees');
        }
        localStorage.setItem('theme', theme);
        return true; // Theme was changed
    }
    return false; // Theme was not changed
};
