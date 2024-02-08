import { TextInput, PasswordInput, Button, Text } from "@mantine/core";
import { useLoaderData, useNavigation } from "@remix-run/react";
import { loader } from "../../route";

export const LoginForm = () => {
  const loaderData = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isCreating = Boolean(
    navigation.state === "submitting"
  );

  return (
    <>
      <TextInput label={'メールアドレス'} type='email' placeholder='email' name='email' />
      <PasswordInput label='パスワード' placeholder='password' name='password' />
      <Text my={'md'}>
        下の画像に表示されている文字を半角で入力してください。画像に表示されている文字が読みにくい場合は、画像右側のボタンを押して再取得ができます。
      </Text>
      { loaderData.captchaImageUrl && <img src={`data:image/png;base64,${loaderData.captchaImageUrl}`} title="" alt="" height="60" width="175" className="igc_TrendyCaptchaImage" />}
      <TextInput label={'captcha認証'} type='text' name='captcha' placeholder='画像に表示されている文字を入力' />
      <Button type='submit' mt={'lg'} name="action" value="login" disabled={isCreating}>ログイン</Button>
    </>
  )
};