import { defineConfig } from 'astro/config';
import { site } from './src/data/site.mjs';
export default defineConfig({ site: site.environment === 'production' ? site.productionUrl : site.demoUrl, output: 'static', trailingSlash: 'always' });
