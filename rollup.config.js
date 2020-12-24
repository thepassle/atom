import resolve from 'rollup-plugin-node-resolve';
import html from '@open-wc/rollup-plugin-html';

export default {
  input: './devtools/panel.html',
  output: {
    dir: 'devtools/dist',
    format: 'esm',
  },
  plugins: [
    resolve(),
    html(),
    // copy({
    //   files: ['./src/**/*.png', './src/**/*.svg'],
    //   dest: 'dist/icons',
    // })
  ],
}
// content script
// {
//   input: './src/scripts/content_script.js',
//   output: {
//     dir: 'dist',
//     format: 'iife',
//   },
//   plugins: [
//     resolve()
//   ]
// },
;
