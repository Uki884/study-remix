import { Button, Flex } from "@mantine/core"

export const LoggedInForm = () => {
  return (
    <Flex justify={'space-between'} mb={'md'}>
      <Button type='submit' mt={'lg'} name="action" value="refetch">再取得</Button>
      <Button type='submit' mt={'lg'} color='red' name="action" value="logout">ログアウト</Button>
    </Flex>
  )
}