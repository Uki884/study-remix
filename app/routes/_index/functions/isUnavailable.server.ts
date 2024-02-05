import { Page } from "playwright";

export const validateAvailableSuica = async ({ page }: { page: Page }) => {
  const closeText =
    "利用履歴表示が可能な時間は5:00～翌日0:50です。時間をお確かめの上、再度実行してください。";
  const pageContent = await page.textContent("body");

  if (pageContent?.includes(closeText)) {
    return { isAvailable: false, message: closeText };
  }

  return { isAvailable: true, message: "" };
};