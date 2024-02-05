import { Page } from "playwright";

type Payload = {
  page: Page;
};

export const logoutElement = '.logoutBox a';

export const logout = async ({ page }: Payload) => {
  await page.click('.logoutBox a');
  page.once('dialog', async dialog => {
    await dialog.accept();
  });
};