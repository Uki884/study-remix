import { page } from "@/context.server";

const captchaElement = '.igc_TrendyCaptchaImage';

export const getCaptchaImage = async () => {

  const visibleImage = await page.isVisible(captchaElement);

  if (!visibleImage) {
    return null;
  }

  const captcha = page.locator(captchaElement)

  try {
    const buffer = await captcha.screenshot();
    return buffer.toString('base64');
  } catch (e) {
    console.error(e);
    await page.screenshot({ path: 'error.png', fullPage: false });
    return null;
  }
};