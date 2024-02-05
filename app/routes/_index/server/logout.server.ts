import { page } from "@/context.server";
import { Page } from "playwright";

export const logoutElement = '.logoutBox a';

export const logout = async () => {
  await page.click('.logoutBox a');
  page.once('dialog', async dialog => {
    await dialog.accept();
  });
};