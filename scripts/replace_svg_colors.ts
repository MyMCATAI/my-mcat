import * as fs from 'fs';
import * as path from 'path';

function cleanupSVGs(directory: string): void {
    const files: string[] = fs.readdirSync(directory);

    files.forEach((file: string) => {
        if (path.extname(file).toLowerCase() === '.svg') {
            const filepath: string = path.join(directory, file);
            let content: string = fs.readFileSync(filepath, 'utf8');

            // Remove <defs> section
            content = content.replace(/<defs>[\s\S]*?<\/defs>/gi, '');

            // Remove <style> section
            content = content.replace(/<style>[\s\S]*?<\/style>/gi, '');

            // Optional: Remove empty lines and trim
            content = content.replace(/^\s*[\r\n]/gm, '').trim();

            fs.writeFileSync(filepath, content);
            console.log(`Processed: ${file}`);
        }
    });

    console.log(`Finished processing SVG files in ${directory}`);
}

// Use command line argument for directory path, or default to current directory
const iconsDirectory: string = process.argv[2] || '.';
cleanupSVGs(iconsDirectory);