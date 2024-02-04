import { json } from "@remix-run/react";
import { ActionFunctionArgs, redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import { Form } from "@remix-run/react";

export const action = async ({ params, request }: ActionFunctionArgs) => {
  // invariantという3rdパーティライブラリを用いると、URL内の動的パラメータをTypeSafeに管理できます。
  console.log(params, request);
  invariant(params.userId, "UserIdがParamsに含まれていません.");
  
  // request.formData()では、Formのバリデーションが煩雑になります。
  // zodと組み合わせたFormバリデーションも後述します。
  const formData = await request.formData()
  const name: File|string|null = formData.get("name");
  if (typeof name === "string" || !name) {
    return json(
      {
        status: "error",
        message: "商品名は必須項目です",
      } as const,
      { status: 400 }
    );
  }

  return redirect("/posts");
};

export default function Index() {
  return (
      <Form method="post">
        <label>
          <span>商品名</span>
	          <input name="name" required placeholder="商品名を入力してください"  />
            <input name="userId" type="hidden" value="1" />
        </label>
        <button type="submit">新規作成</button>
      </Form>
  );
}