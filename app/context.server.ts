import { chromium } from 'playwright';
import { singleton } from './singleton.server'

const browser = await chromium.launch({ headless: true });
console.log('Browser launched');
const browserContext = await singleton('context', async () => await browser.newContext())
const page = await singleton('page', async () => await browserContext.newPage())

export { browserContext, page };

