import type { StorybookConfig } from '@storybook/react-vite';
import { fileURLToPath, URL } from 'node:url';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-a11y'],
  framework: { name: '@storybook/react-vite', options: {} },
  docs: { autodocs: 'tag' },
  viteFinal: async (config) => ({
    ...config,
    resolve: { ...config.resolve, alias: { ...config.resolve?.alias, '@': fileURLToPath(new URL('../src', import.meta.url)) } },
  }),
};

export default config;
