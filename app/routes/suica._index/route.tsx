import { json, type ActionFunctionArgs, type MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { Suica } from "./server/suica.server";
import { InputError } from '@mantine/core';
import styles from './styles.module.css';
import { SuicaTable } from "./components/SuicaTable";
import { LoginForm } from "./components/LoginForm";
import { LoggedInForm } from "./components/LoggedInForm/LoggedInForm";
import { getSession, commitSession, destroySession } from "../../session.server";
import { destroySingleton } from "@/singleton.server";
import { FilterForm } from "./components/FilterForm";

export const meta: MetaFunction = () => {
  return [
    { title: "今月の通勤経費" },
    { name: "description", content: "Suicaの履歴から今月の通勤経費を表示します" },
  ];
};
const browserId = new Date().getTime().toString(); // 例えばタイムスタンプをIDとして使用
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await getSession(
    request.headers.get("Cookie")
  );
  const sessionBrowserId = session.get('browserId') as string;
  const suica = new Suica({ browserId: sessionBrowserId || browserId });
  if (!await suica.isLoggedIn()) {
    await suica.gotoSuicaTop();
  }
  const isLoggedIn = await suica.isLoggedIn();

  if (!sessionBrowserId) {
    session.set('browserId', browserId);
  }

  return json({ isLoggedIn },{
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

  if (!sessionBrowserId) {
    return json({ data: [], error: null }, {
      headers: {
        "Set-Cookie": await destroySession(session),
      },
    });
  }

  const formData = await request.formData()
  const action = formData.get("action")
  const startStation = formData.get('startStation') as string;
  const endStation = formData.get('endStation') as string;
  const suica = new Suica({ browserId: sessionBrowserId, startStation, endStation});
  
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
      <h1>今月の通勤経費を計算</h1>
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
