import { Outlet } from "@remix-run/react";

const Suica = () => {
  /* homeの共通処理 */
  console.log('suica')
  return (
    <Outlet />
  );
};

export default Suica;
