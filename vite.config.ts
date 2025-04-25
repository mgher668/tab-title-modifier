import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { copyFileSync, existsSync, mkdirSync } from 'fs'

// Copy content and background scripts to dist folder after build
const copyExtensionFiles = () => {
  return {
    name: 'copy-extension-files',
    closeBundle: () => {
      // Ensure the dist directory exists
      if (!existsSync('dist')) {
        mkdirSync('dist');
      }
      
      // Copy each file if it exists
      const filesToCopy = [
        'public/content.js',
        'public/background.js',
        'public/manifest.json',
        'public/icons/icon.svg',
        'public/icons/icon16.png',
        'public/icons/icon48.png',
        'public/icons/icon128.png'
      ];
      
      filesToCopy.forEach(file => {
        if (existsSync(file)) {
          const destFile = `dist/${file.replace('public/', '')}`;
          
          // Ensure destination directory exists
          const destDir = path.dirname(destFile);
          if (!existsSync(destDir)) {
            mkdirSync(destDir, { recursive: true });
          }
          
          copyFileSync(file, destFile);
          console.log(`Copied: ${file} -> ${destFile}`);
        } else {
          console.warn(`Warning: File not found: ${file}`);
        }
      });
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), copyExtensionFiles()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  }
})
