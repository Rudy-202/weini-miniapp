import { defineConfig } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';

export default defineConfig({
  plugins: [uni()],
  build: {
    sourcemap: false,
    minify: 'terser'
  }
}); 