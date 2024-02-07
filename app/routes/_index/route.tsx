import { Button, Container } from "@mantine/core";
import { Form, useNavigate } from "@remix-run/react";

export default function Index() {
  const navigate = useNavigate();

  return (
    <Container>
      <h1>便利ツールたち</h1>
      <Form method="post">
        <Button onClick={() => navigate('/suica')}>Suicaから出社日確認</Button>
      </Form>
    </Container>
  );
}