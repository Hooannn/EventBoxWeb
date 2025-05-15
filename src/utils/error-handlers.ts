import type { IResponseData } from "../types";
import type { AxiosError } from "axios";
import { addToast } from "@heroui/react";
import { t } from "i18next";
export const onError = (error: Error) => {
  addToast({
    title: t("error"),
    description: t(
      (
        error as AxiosError<IResponseData<unknown>>
      ).response?.data?.message?.toString() || error.message
    ),
    timeout: 4000,
    radius: "none",
    color: "danger",
  });
};
