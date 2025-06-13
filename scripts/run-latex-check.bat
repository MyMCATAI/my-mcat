@echo off
echo Compiling TypeScript...
npx tsc checkLatexContent.ts --esModuleInterop --resolveJsonModule --target ES2018 --moduleResolution node

echo Running LaTeX content check...
node checkLatexContent.js

echo Done! 