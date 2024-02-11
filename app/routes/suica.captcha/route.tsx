import { getSession } from "@/session.server";
import { LoaderFunction, json } from "@remix-run/node";
import { Suica } from "../suica._index/server/suica.server";

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const browserId = new Date().getTime().toString();
  const sessionBrowserId = session.get('browserId') as string;

  const suica = new Suica({ browserId: sessionBrowserId || browserId });
  await suica.gotoSuicaTop();

  const image = await suica.getCaptchaImage();

  return json({ captchaImageUrl: image });
};