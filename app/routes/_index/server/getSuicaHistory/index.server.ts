import { login } from "../login.server";
import { validateAvailableSuica } from "./validateAvailableSuica.server";
import { formatTableData } from "./formatTableData.server";

type Payload = {
  email: FormDataEntryValue | null;
  password: FormDataEntryValue | null;
  captcha: FormDataEntryValue | null;
};

export const getSuicaHistory = async ({ email, password, captcha }: Payload) => {
  await login({ email, password, captcha });

  const validateResult = await validateAvailableSuica();

  if (!validateResult.isAvailable) {
    return { data: [], error: validateResult.message };
  }

  const result = await formatTableData()

  return { data: result, error: "" }
};