import { json, type ActionFunctionArgs, type MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { page } from "../context.server";
import { useState } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "Suicaの履歴取得" },
    { name: "description", content: "Suicaの履歴を取得します" },
  ];
};

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const currentUrl = page.url();

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
  await page.waitForSelector('#btn_sfHistory');
  // btn_sfHistoryの中のaタグをクリック
  await page.click('#btn_sfHistory a');

  const closeText = '利用履歴表示が可能な時間は5:00～翌日0:50です。時間をお確かめの上、再度実行してください。'
  const pageContent = await page.textContent('body');

  if (pageContent?.includes(closeText)) {
    return json({ tableData: [], error: closeText });
  }

  // 外側のtdタグを基準にテーブルを特定するセレクタ
  const selector = '.historyTable table';

  // テーブル内の全ての行を取得
  const rows = await page.$$(`${selector} > tbody > tr`);

  // 行データを格納するための配列
  let tableData = [];
  rows.shift();

  for (const row of rows) {
    // 各行のセルデータを取得
    const cellsText = await row.$$eval('td', cells => cells.map(cell => {
      // fontタグ内のテキストまたはセルのテキストを取得
      const font = cell.querySelector('font');
      return font ? font.innerText.trim() : cell.innerText.trim();
    }));
    // 1行目はヘッダなのでスキップ
    // [ '', '月日', '種別', '利用場所', '種別', '利用場所', '残高', '入金・利用額' ]

    // [ '', '01/02', '物販', '', '', '', '\\1,612', '-213' ]
    cellsText.shift()
    const data = {
      date: cellsText[0],
      startType: cellsText[1],
      startStation: cellsText[2],
      endType: cellsText[3],
      endStation: cellsText[4],
      balance: cellsText[5],
      fare: cellsText[6],
    }
    // 行データを配列に追加
    tableData.push(data);
  }
  const filtererData = tableData.filter(data => data.startType !== '物販');
  return json({ tableData: filtererData, error: null });
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
