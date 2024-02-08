import { Button, Flex } from "@mantine/core"
import { useNavigation } from "@remix-run/react";

export const LoggedInForm = () => {
  const navigation = useNavigation();
  const isCreating = Boolean(
    navigation.state === "submitting"
  );

  return (
    <Flex justify={'space-between'} mb={'md'}>
      <Button type='submit' mt={'lg'} name="action" value="refetch" disabled={isCreating}>再取得</Button>
      <Button type='submit' mt={'lg'} color='red' name="action" value="logout">ログアウト</Button>
    </Flex>
  )
}