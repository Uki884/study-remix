import { Page } from "playwright";
import { page } from "@/context.server";

type Payload = {
  email: FormDataEntryValue | null;
  password: FormDataEntryValue | null;
  captcha: FormDataEntryValue | null;
};

export const login = async ({ email, password, captcha }: Payload) => {
  await page.waitForLoadState();
  // htmlのname属性がMailAddressのinputにemailを入力
  await page.locator('input[name="MailAddress"]').fill(email as string);
  // // htmlのname属性がPasswordのinputにpasswordを入力
  await page
    .getByRole("textbox", { name: "パスワード(半角)" })
    .fill(password as string);
  // // htmlのname属性がCaptchaのinputにcaptchaを入力
  await page.locator("#WebCaptcha1__editor").fill(captcha as string);
  // // ここで必要な情報を入力してログインボタンをクリック
  await page.click('button[name="LOGIN"]');
};