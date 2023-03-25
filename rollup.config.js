import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { babel } from '@rollup/plugin-babel';
import eslint from '@rollup/plugin-eslint';

export default [
  {
    input: 'extension/background.js',
    output: {
      file: 'build/extension/background_bundle.js',
      format: 'iife',
      name: 'BackgroundBundle',
    },
    plugins: [
      eslint({
        fix: false,
      }),
      nodeResolve(),
      commonjs(),
      babel(),
    ],
  },
  {
    input: 'extension/browser_action.js',
    output: {
      file: 'build/extension/browser_action_bundle.js',
      format: 'iife',
      name: 'BrowserActionBundle',
    },
    plugins: [
      eslint({
        fix: false,
      }),
      nodeResolve(),
      commonjs(),
      babel(),
    ],
  },
  {
    input: 'extension/content.js',
    output: {
      file: 'build/extension/content_bundle.js',
      format: 'iife',
      name: 'ContentBundle',
    },
    plugins: [
      eslint({
        fix: false,
      }),
      nodeResolve(),
      commonjs(),
      babel(),
    ],
  },
  {
    input: 'extension/options.js',
    output: {
      file: 'build/extension/options_bundle.js',
      format: 'iife',
      name: 'OptionsBundle',
    },
    plugins: [
      eslint({
        fix: false,
      }),
      nodeResolve(),
      commonjs(),
      babel(),
    ],
  },
];
