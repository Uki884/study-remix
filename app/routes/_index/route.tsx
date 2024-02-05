import { json, type ActionFunctionArgs, type MetaFunction } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { page } from "../../context.server";
import { useState } from "react";
import { getCaptchaImage } from "./server/getCaptchaImage.server";
import { getSuicaHistory } from "./server/getSuicaHistory/index.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Suicaの履歴取得" },
    { name: "description", content: "Suicaの履歴を取得します" },
  ];
};

export const loader = async () => {
  await page.goto('https://www.mobilesuica.com/index.aspx');
  const captchaImageUrl = await getCaptchaImage();
  return json({ captchaImageUrl })
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const email = formData.get('email');
  const password = formData.get('password');
  const captcha = formData.get('captcha');
  const { data, error } = await getSuicaHistory({ email, password, captcha });

  return json({ data, error });
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
        { JSON.stringify(actionData?.data) }
      </Form>
    </div>
  );
}
