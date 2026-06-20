const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const frontendDir = path.resolve(__dirname, '..');
const distDir = path.join(frontendDir, 'dist');

console.log('Building frontend production assets...');

// 1. Clean dist directory
if (fs.existsSync(distDir)) {
  console.log('Cleaning existing dist directory...');
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

// 2. Compile Tailwind CSS
console.log('Compiling Tailwind CSS...');
try {
  execSync('npx tailwindcss -i ./src/css/tailwind.css -o ./dist/css/style.css --minify', {
    cwd: frontendDir,
    stdio: 'inherit'
  });
  console.log('Tailwind CSS compiled successfully.');
} catch (error) {
  console.error('Failed to compile Tailwind CSS:', error);
  process.exit(1);
}

// 3. Append custom CSS from css/style.css to dist/css/style.css
const customCssPath = path.join(frontendDir, 'css', 'style.css');
const distCssPath = path.join(distDir, 'css', 'style.css');

if (fs.existsSync(customCssPath)) {
  console.log('Appending custom styles from css/style.css to dist/css/style.css...');
  const customCss = fs.readFileSync(customCssPath, 'utf8');
  fs.appendFileSync(distCssPath, '\n' + customCss);
}

// 4. Copy HTML files
console.log('Copying HTML files...');
const files = fs.readdirSync(frontendDir);
files.forEach(file => {
  if (file.endsWith('.html')) {
    const srcPath = path.join(frontendDir, file);
    const destPath = path.join(distDir, file);
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${file}`);
  }
});

// 5. Copy js/ directory
const jsSrcDir = path.join(frontendDir, 'js');
const jsDestDir = path.join(distDir, 'js');
if (fs.existsSync(jsSrcDir)) {
  console.log('Copying js/ directory...');
  fs.cpSync(jsSrcDir, jsDestDir, { recursive: true });
}

// 6. Copy fixtures/ directory
const fixturesSrcDir = path.join(frontendDir, 'fixtures');
const fixturesDestDir = path.join(distDir, 'fixtures');
if (fs.existsSync(fixturesSrcDir)) {
  console.log('Copying fixtures/ directory...');
  fs.cpSync(fixturesSrcDir, fixturesDestDir, { recursive: true });
}

console.log('Build completed successfully! Production assets are in `./dist`');
