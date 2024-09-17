import { chromium } from 'playwright';
import { singleton } from './singleton.server'

const browser = await chromium.launch({ headless: true });

const getPageById = async (id: string) => {
  const context = await singleton('context', () => browser.newContext(), id);
  return await singleton('page', () => context.newPage(), id);
};

export { getPageById };

