import { json, type ActionFunctionArgs, type MetaFunction, LoaderFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import fs from 'fs';
import { page } from "../context.server";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const loader = async ({ context }: LoaderFunctionArgs) => {
  await page.goto('https://www.mobilesuica.com/index.aspx');
  const buffer = await page.locator('.igc_TrendyCaptchaImage').screenshot();
  const storageState = await page.context().storageState();
  await page.locator('input[name="MailAddress"]').fill('hogehge');

  fs.writeFileSync('state.json', JSON.stringify(storageState));
  
  return json({ captchaImageUrl: buffer.toString('base64') })
};

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const email = formData.get('email');
  const password = formData.get('password');
  const captcha = formData.get('captcha');
  await page.waitForLoadState()
  // console.log('page', await page.content());
  // htmlのname属性がMailAddressのinputにemailを入力
  await page.locator('input[name="MailAddress"]').fill(email as string);
  // // htmlのname属性がPasswordのinputにpasswordを入力
  await page.getByRole('textbox', { name: 'パスワード(半角)' }).fill(password as string);
  // // htmlのname属性がCaptchaのinputにcaptchaを入力
  await page.locator('#WebCaptcha1__editor').fill(captcha as string);
  // // ここで必要な情報を入力してログインボタンをクリック
  await page.click('button[name="LOGIN"]');
  // const buffer = await page.locator('.igc_TrendyCaptchaImage').screenshot();
  await page.screenshot({ path: 'screenshot.png', fullPage: false });
  await page.waitForSelector('#btn_sfHistory');
  // btn_sfHistoryの中のaタグをクリック
  await page.click('#btn_sfHistory a');
  await page.screenshot({ path: 'screenshot2.png', fullPage: false });
    // return json({ captchaImageUrl: buffer.toString('base64') })
  return json({ result: true })
};

export default function Index() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1>Welcome to Remix</h1>
      <Form method="post">
        <div>
          <input type='email' placeholder='email' name='email' />
        </div>
        <div>
          <input type='text' placeholder='password' name='password' />
        </div>
        <div>
          下の画像に表示されている文字を半角で入力してください。画像に表示されている文字が読みにくい場合は、画像右側のボタンを押して再取得ができます。
        </div>
        { data.captchaImageUrl && <img src={`data:image/png;base64,${data.captchaImageUrl}`} title="" alt="" height="60" width="175" className="igc_TrendyCaptchaImage" />}
        <div>
          <input type='text' name='captcha' placeholder='captcha' />
        </div>
        <button type='submit'>ログイン</button>
      </Form>
    </div>
  );
}
