// scripts/generateIconList.ts
import fs from 'fs/promises';
import path from 'path';

const iconDirectory = path.join(__dirname, '..', 'public', 'icons');
const outputFile = path.join(__dirname, '..','components', 'ui', 'Icons.tsx');

function toCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

async function generateIconList() {
  try {
    // Read the icon directory
    const files = await fs.readdir(iconDirectory);

    // Filter for SVG files
    const svgFiles = files.filter(file => path.extname(file).toLowerCase() === '.svg');

    // Create import statements
    const iconImports = svgFiles.map(file => {
      const iconName = path.basename(file, '.svg');
      const camelCaseName = toCamelCase(iconName);
      return `import { default as ${camelCaseName}Icon } from '@/public/icons/${file}';`;
    });

    // Create the Icons object
    const iconsObject = svgFiles.map(file => {
      const iconName = path.basename(file, '.svg');
      const camelCaseName = toCamelCase(iconName);
      return `  '${iconName}': ${camelCaseName}Icon,`;
    });

    // Create the IconName type
    const iconNameType = svgFiles
      .map(file => `'${path.basename(file, '.svg')}'`)
      .join(' | ');

    // Compose the full content of the Icons.tsx file
    const fileContent = `
import { SVGProps, FC } from 'react';

${iconImports.join('\n')}

export type IconName = ${iconNameType};

export const Icons: Record<IconName, FC<SVGProps<SVGSVGElement>>> = {
${iconsObject.join('\n')}
};
    `.trim();

    // Write the content to Icons.tsx
    await fs.writeFile(outputFile, fileContent);
    console.log('Icons.tsx has been generated successfully!');
  } catch (err) {
    console.error('Error:', err);
  }
}

generateIconList();