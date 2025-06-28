// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  /**  <<<–– NAJWAŻNIEJSZE  ––►
   *  Dzięki temu wszystkie odwołania w dist/ będą
   *  miały prefiks /glock19-viewer/ i 404 zniknie.  */
  base: '/glock19-viewer/',
});
