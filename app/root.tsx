import '@mantine/core/styles.css';
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useNavigate,
} from "@remix-run/react";
import { Button, Container, MantineProvider } from '@mantine/core';

export default function App() {
  const navigation = useNavigate();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <MantineProvider>
          <Container>
            <Button mt='lg' onClick={() => navigation('/')} variant='outline'>TOPへ</Button>
            <Outlet />
          </Container>
          <ScrollRestoration />
          <Scripts />
        </MantineProvider>
      </body>
    </html>
  );
}
