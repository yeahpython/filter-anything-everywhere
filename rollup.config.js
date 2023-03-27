import {nodeResolve} from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import {babel} from '@rollup/plugin-babel';
import eslint from '@rollup/plugin-eslint';
import typescript from 'rollup-plugin-typescript2';

export default [
  {
    input: 'extension/background.ts',
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
      babel({
        babelHelpers: 'bundled',
      }),
      typescript(),
    ],
  },
  {
    input: 'extension/browser_action.ts',
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
      babel({
        babelHelpers: 'bundled',
      }),
      typescript(),
    ],
  },
  {
    input: 'extension/content.ts',
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
      babel({
        babelHelpers: 'bundled',
      }),
      typescript(),
    ],
  },
  {
    input: 'extension/options.ts',
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
      babel({
        babelHelpers: 'bundled',
      }),
      typescript(),
    ],
  },
];
