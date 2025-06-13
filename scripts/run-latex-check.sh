#!/bin/bash

# Compile the TypeScript file
echo "Compiling TypeScript..."
npx tsc scripts/checkLatexContent.ts --esModuleInterop --resolveJsonModule

# Run the compiled JavaScript file
echo "Running LaTeX content check..."
node scripts/checkLatexContent.js

echo "Done!"