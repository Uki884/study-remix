import { json, type ActionFunctionArgs, type MetaFunction } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { page } from "../../context.server";
import { useState } from "react";
import { formatTableData } from "./functions/formatTableData.server";
import { login } from "./functions/login.server";
import { validateAvailableSuica } from "./functions/isUnavailable.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Suicaの履歴取得" },
    { name: "description", content: "Suicaの履歴を取得します" },
  ];
};

export const loader = async () => {
  await page.goto('https://www.mobilesuica.com/index.aspx');

  const visibleImage = await page.isVisible(".igc_TrendyCaptchaImage");
  const visibleLogout = await page.isVisible('.logoutBox a');

  if (visibleLogout) {
    await page.click('.logoutBox a');
    page.once('dialog', async dialog => {
      await dialog.accept();
    });
  }

  if (!visibleImage) {
    return json({ captchaImageUrl: null })
  }

  const captcha = page.locator('.igc_TrendyCaptchaImage')

  try {
    const buffer = await captcha.screenshot();
    return json({ captchaImageUrl: buffer.toString('base64') })
  } catch (e) {
    console.error(e);
    await page.screenshot({ path: 'error.png', fullPage: false });
    return json({ captchaImageUrl: null })
  }
};

// await page.screenshot({ path: 'screenshot2.png', fullPage: false });でデバッグ用のスクリーンショットを取得できる
export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const email = formData.get('email');
  const password = formData.get('password');
  const captcha = formData.get('captcha');

  await login({ page, email, password, captcha });

  const validateResult = await validateAvailableSuica({ page });

  if (!validateResult.isAvailable) {
    return json({ tableData: [], error: validateResult.message });
  }
  const result = await formatTableData({ page })

  return json({ tableData: result, error: null });
};

export default function Index() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [isVisiblePassword, setIsVisiblePassword] = useState(false);

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1>Suica !!!!!!</h1>
      <Form method="post">
        <div>
          <input type='email' placeholder='email' name='email' />
        </div>
        <div>
          <input type={isVisiblePassword ? 'text' : 'password'} placeholder='password' name='password' />
          <button type='button' onClick={() => setIsVisiblePassword(!isVisiblePassword)}>{ isVisiblePassword ?  '非表示': '表示'}</button>
        </div>
        <div>
          下の画像に表示されている文字を半角で入力してください。画像に表示されている文字が読みにくい場合は、画像右側のボタンを押して再取得ができます。
        </div>
        { data.captchaImageUrl && <img src={`data:image/png;base64,${data.captchaImageUrl}`} title="" alt="" height="60" width="175" className="igc_TrendyCaptchaImage" />}
        <div>
          <input type='text' name='captcha' placeholder='captcha' />
        </div>
        <button type='submit'>ログイン</button>

        {actionData?.error && <div>{actionData.error}</div>}
        { JSON.stringify(actionData?.tableData) }
      </Form>
    </div>
  );
}
