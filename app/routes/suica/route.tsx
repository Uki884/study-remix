import { json, type ActionFunctionArgs, type MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { Suica } from "./server/suica.server";
import { InputError, TextInput } from '@mantine/core';
import styles from './styles.module.css';
import { SuicaTable } from "./components/SuicaTable";
import { LoginForm } from "./components/LoginForm";
import { LoggedInForm } from "./components/LoggedInForm/LoggedInForm";
import { getSession, commitSession, destroySession } from "../../session.server";
import { destroySingleton } from "@/singleton.server";
import { FilterForm } from "./components/FilterForm";

export const meta: MetaFunction = () => {
  return [
    { title: "今月の出社経費" },
    { name: "description", content: "Suicaの履歴から今月の出社経費を表示します" },
  ];
};
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await getSession(
    request.headers.get("Cookie")
  );
  const browserId = new Date().getTime().toString(); // 例えばタイムスタンプをIDとして使用
  const sessionBrowserId = session.get('browserId');
  console.log('sessionBrowserId', sessionBrowserId)

  const suica = new Suica(sessionBrowserId || browserId);
  await suica.gotoSuicaTop();

  const isLoggedIn = await suica.isLoggedIn();
  const captchaImageUrl = await suica.getCaptchaImage();

  if (!sessionBrowserId) {
    session.set('browserId', browserId);
  }

  return json({ captchaImageUrl, isLoggedIn }, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  })
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const session = await getSession(
    request.headers.get("Cookie")
  );
  const sessionBrowserId = session.get('browserId');
  const suica = new Suica(sessionBrowserId);

  if (!sessionBrowserId) {
    return json({ data: [], error: null }, {
      headers: {
        "Set-Cookie": await destroySession(session),
      },
    });
  }

  const formData = await request.formData()
  const action = formData.get("action")

  switch (action) {
    case 'login': {
      const email = formData.get('email');
      const password = formData.get('password');
      const captcha = formData.get('captcha');
      await suica.login({ email, password, captcha });
    
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
    throw new Response("Oh no! Something went wrong!", {
      status: 500,
    });
  }
};

export default function Index() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div className={styles.index}>
      <h1>今月の出社経費</h1>
      <Form method="post">
        { loaderData.isLoggedIn ? <LoggedInForm /> : <LoginForm />}  
        { actionData?.error && <InputError mt={'md'}>{ actionData?.error }</InputError> }
        { loaderData.isLoggedIn && (
            <>
            <FilterForm />
            <SuicaTable />
            </>
        )}
      </Form>
    </div>
  );
}
