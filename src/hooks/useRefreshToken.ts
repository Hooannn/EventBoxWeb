import { axiosIns } from "./useAxiosIns";
import useAuthStore from "../stores/auth";
import { addToast } from "@heroui/react";
import { useTranslation } from "react-i18next";

const useRefreshToken = () => {
  const { reset } = useAuthStore();
  const { t } = useTranslation();
  const handleError = () => {
    addToast({
      title: t("login session expired, please login again"),
      timeout: 4000,
      radius: "none",
      color: "danger",
    });
    reset();
    // window.location.href = "/auth";
  };

  const refreshToken = async () =>
    new Promise<string | null>((resolve, reject) => {
      axiosIns({
        url: "/v1/auth/refresh",
        method: "POST",
        validateStatus: null,
      })
        .then((res) => {
          const token = res.data?.data?.access_token;
          if (token) {
            resolve(token);
          } else {
            handleError();
            resolve(null);
          }
        })
        .catch((error) => {
          handleError();
          reject(error);
        });
    });

  return refreshToken;
};

export default useRefreshToken;
