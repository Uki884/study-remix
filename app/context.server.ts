import { chromium } from 'playwright';
import { remember } from "@epic-web/remember";

const browser = await chromium.launch({ headless: true });
console.log('Browser launched');

const getPageById = async (id: string) => {
  const context = await remember(`context_${id}`, () => browser.newContext());
  return await remember(`page_${id}`, () => context.newPage());
};

export { getPageById };

