import { json, type ActionFunctionArgs, type MetaFunction } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { page } from "../../context.server";
import { getCaptchaImage } from "./server/getCaptchaImage.server";
import { getSuicaHistory, sfHistoryElement } from "./server/getSuicaHistory/index.server";
import { InputError } from '@mantine/core';
import styles from './styles.module.css';
import { SuicaTable } from "./components/SuicaTable";
import { login } from "./server/login.server";
import { logout } from "./server/logout.server";
import { LoginForm } from "./components/LoginForm";
import { LoggedInForm } from "./components/LoggedInForm/LoggedInForm";

export const meta: MetaFunction = () => {
  return [
    { title: "Suicaの履歴取得" },
    { name: "description", content: "Suicaの履歴を取得します" },
  ];
};

export const loader = async () => {
  await page.goto('https://www.mobilesuica.com/index.aspx');
  const isLoggedIn = await page.isVisible(sfHistoryElement);
  const captchaImageUrl = await getCaptchaImage();
  return json({ captchaImageUrl, isLoggedIn })
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const action = formData.get("action")

  switch (action) {
    case 'login': {
      const email = formData.get('email');
      const password = formData.get('password');
      const captcha = formData.get('captcha');
      await login({ email, password, captcha });
    
      const { data, error } = await getSuicaHistory();
      return json({ data, error });
    } case 'refetch': {
      const { data, error } = await getSuicaHistory();
      return json({ data, error });
    } case 'logout': {
      await logout();
      return json({ data: [], error: null });
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
