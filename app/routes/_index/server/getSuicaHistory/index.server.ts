import { validateAvailableSuica } from "./validateAvailableSuica.server";
import { formatTableData } from "./formatTableData.server";
import { page } from "@/context.server";

export const sfHistoryElement = "#btn_sfHistory";

export const getSuicaHistory = async () => {
  await page.goto('https://www.mobilesuica.com/index.aspx');
  // 「SF(電子マネー)利用履歴」をクリック
  await page.waitForSelector(sfHistoryElement);
  // btn_sfHistoryの中のaタグをクリック
  await page.click(`${sfHistoryElement} a`);

  const validateResult = await validateAvailableSuica();

  page.screenshot({ path: 'error.png', fullPage: false });
  if (!validateResult.isAvailable) {
    return { data: [], error: validateResult.message };
  }

  const result = await formatTableData()
  return { data: result, error: "" }
};