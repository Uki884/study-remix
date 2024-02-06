import { json, type ActionFunctionArgs, type MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { getPageById } from "../../context.server";
import { Suica, sfHistoryElement } from "./server/suica.server";
import { InputError } from '@mantine/core';
import styles from './styles.module.css';
import { SuicaTable } from "./components/SuicaTable";
import { LoginForm } from "./components/LoginForm";
import { LoggedInForm } from "./components/LoggedInForm/LoggedInForm";
import { getSession, commitSession, destroySession } from "../../session.server";
import { destroySingleton } from "@/singleton.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Suicaの履歴取得" },
    { name: "description", content: "Suicaの履歴を取得します" },
  ];
};
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await getSession(
    request.headers.get("Cookie")
  );
  const browserId = new Date().getTime().toString(); // 例えばタイムスタンプをIDとして使用
  const sessionBrowserId = session.get('browserId');

  const page = await getPageById(sessionBrowserId || browserId);
  await page.goto('https://www.mobilesuica.com/index.aspx');
  const suica = new Suica(sessionBrowserId || browserId);

  const isLoggedIn = await page.isVisible(sfHistoryElement);
  const captchaImageUrl = await suica.getCaptchaImage(sessionBrowserId || browserId);

  if (!sessionBrowserId) {
    session.set('browserId', browserId);
  }

  return json({ captchaImageUrl, isLoggedIn }, {
    headers: {
      "Set-Cookie": await commitSession(session, { expires: new Date(Date.now() + 60) }),
    },
  })
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const session = await getSession(
    request.headers.get("Cookie")
  );
  const sessionBrowserId = session.get('browserId');

  if (!sessionBrowserId) {
    throw new Error('Invalid session');
  }

  const formData = await request.formData()
  const action = formData.get("action")

  const suica = new Suica(sessionBrowserId);

  switch (action) {
    case 'login': {
      const email = formData.get('email');
      const password = formData.get('password');
      const captcha = formData.get('captcha');
      await suica.login({ email, password, captcha, browserId: sessionBrowserId });
    
      const { data, error } = await suica.retrieveSuicaHistory();
      return json({ data, error });
    } case 'refetch': {
      const { data, error } = await suica.retrieveSuicaHistory();
      return json({ data, error });
    } case 'logout': {
      await suica.logout();
      destroySingleton(sessionBrowserId);
      return json({ data: [], error: null }, {
        headers: {
          "Set-Cookie": await destroySession(session),
        },
      });
    } default:
      throw new Error(`Invalid action: ${action}`);
  }
};

export default function Index() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div className={styles.index}>
      <h1>Suicaの履歴取得</h1>
      <Form method="post">
        { loaderData.isLoggedIn ? <LoggedInForm /> : <LoginForm />}  
        { actionData?.error && <InputError mt={'md'}>{ actionData?.error }</InputError> }
        <SuicaTable />
      </Form>
    </div>
  );
}
