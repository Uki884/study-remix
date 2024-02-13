import { useFetcher } from "@remix-run/react";
import { useCallback, useEffect } from "react";
import { loader } from '../../route';

export const useCaptchaFetcher = () => {
  const fetcher = useFetcher<typeof loader>({
    key: "captchaFetcher",
  });

  const getCaptcha = useCallback(() => {
      fetcher.load("/suica/captcha")
    },
    [fetcher],
  )

  useEffect(() => {
    if (fetcher.state === 'idle' && !fetcher.data) {
      getCaptcha();
    }
  }, []);

  return {
    getCaptcha,
    captchaImageUrl: fetcher.data?.captchaImageUrl,
  };
};