import { useMutation } from "@tanstack/react-query";
import cookies from "../libs/cookies";
import { onError } from "../utils/error-handlers";
import { IResponseData, IUser } from "../types";
import { useNavigate } from "react-router-dom";
import useAxiosIns, { rawAxios } from "../hooks/useAxiosIns";
import useAuthStore from "../stores/auth";
import useAppStore from "../stores/app";
import { useTranslation } from "react-i18next";
import { addToast } from "@heroui/react";
const useAuth = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    setAccessToken,
    setRefreshToken,
    setLoggedIn,
    setUser,
    reset: resetAuthStore,
  } = useAuthStore();
  const axios = useAxiosIns();
  const { reset: resetAppStore, deviceId, setDeviceId } = useAppStore();

  const getDeviceId = () => {
    if (!deviceId) {
      const newDeviceId = `${crypto.randomUUID()}`;
      setDeviceId(newDeviceId);
      return newDeviceId;
    }
    return deviceId;
  };

  const saveCredentialsAndRedirect = (
    user: IUser,
    accessToken: string,
    refreshToken: string
  ) => {
    const redirectPath = cookies.get("redirect_path") || "/";
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
    setLoggedIn(true);
    setUser(user);
    navigate(redirectPath as string);
  };

  const verifyAccountMutation = useMutation({
    mutationFn: (params: { email: string; signature: string }) => {
      return rawAxios.post<
        IResponseData<{
          user: IUser;
          access_token: string;
          refresh_token: string;
        }>
      >(
        `/v1/auth/verify`,
        {
          username: params.email,
          otp: params.signature,
        },
        {
          headers: {
            "X-Device-ID": getDeviceId(),
          },
        }
      );
    },
    onError: onError,
    onSuccess: (res) => {
      addToast({
        title: t("success"),
        description: t(res.data.message),
        timeout: 4000,
        radius: "none",
        color: "success",
      });
      const data = res.data?.data;
      const user = data?.user;
      const accessToken = data?.access_token;
      const refreshToken = data?.refresh_token;
      saveCredentialsAndRedirect(user, accessToken, refreshToken);
    },
  });

  const signOutMutation = useMutation({
    mutationFn: () => {
      return axios.post<IResponseData<unknown>>(
        `/v1/auth/logout`,
        {
          client: "web",
        },
        {
          headers: {
            "X-Device-ID": getDeviceId(),
          },
        }
      );
    },
    onError: onError,
    onSuccess: (res) => {
      addToast({
        title: t("success"),
        description: t(res.data.message),
        timeout: 4000,
        radius: "none",
        color: "success",
      });
      resetAuthStore();
      resetAppStore();
    },
  });

  const signInMutation = useMutation({
    mutationFn: (params: { email: string; password: string }) => {
      return rawAxios.post<
        IResponseData<{
          user: IUser;
          access_token: string;
          refresh_token: string;
        }>
      >(
        "v1/auth/login",
        {
          username: params.email,
          password: params.password,
        },
        {
          headers: {
            "X-Device-ID": getDeviceId(),
          },
        }
      );
    },

    onError: onError,
    onSuccess: (res) => {
      addToast({
        title: t("success"),
        description: t(res.data.message),
        timeout: 4000,
        radius: "none",
        color: "success",
      });
      const data = res.data?.data;
      const user = data?.user;
      const accessToken = data?.access_token;
      const refreshToken = data?.refresh_token;
      saveCredentialsAndRedirect(user, accessToken, refreshToken);
    },
  });

  const signUpMutation = useMutation({
    mutationFn: (params: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    }) =>
      rawAxios.post<IResponseData<boolean>>(
        "/v1/auth/register",
        {
          username: params.email,
          password: params.password,
          first_name: params.firstName,
          last_name: params.lastName,
        },
        {
          headers: {
            "X-Device-ID": getDeviceId(),
          },
        }
      ),
    onError: onError,
    onSuccess: (res) => {
      addToast({
        title: t("success"),
        description: t(res.data.message),
        timeout: 4000,
        radius: "none",
        color: "success",
      });
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: (params: { email: string }) =>
      rawAxios.post<IResponseData<unknown>>("/v1/auth/forgot-password/otp", {
        username: params.email,
      }),
    onError: onError,
    onSuccess: (res) => {
      addToast({
        title: t("success"),
        description: t(res.data.message),
        timeout: 4000,
        radius: "none",
        color: "success",
      });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (params: {
      email: string;
      newPassword: string;
      signature: string;
    }) =>
      rawAxios.post<IResponseData<unknown>>("/api/v1/auth/reset-password/otp", {
        username: params.email,
        password: params.newPassword,
        otp: params.signature,
      }),
    onError: onError,
    onSuccess: (res) => {
      addToast({
        title: t("success"),
        description: t(res.data.message),
        timeout: 4000,
        radius: "none",
        color: "success",
      });
    },
  });

  const resendVerifyAccountMutation = useMutation({
    mutationFn: (params: { email: string }) =>
      rawAxios.post<IResponseData<unknown>>("/v1/auth/verify/resend", {
        username: params.email,
      }),
    onError: onError,
    onSuccess: (res) => {
      addToast({
        title: t("success"),
        description: t(res.data.message),
        timeout: 4000,
        radius: "none",
        color: "success",
      });
    },
  });

  const signInWithGoogleMutation = useMutation({
    mutationFn: (params: { access_token: string }) =>
      rawAxios.post<
        IResponseData<{
          user: IUser;
          access_token: string;
          refresh_token: string;
        }>
      >("/v1/auth/google", {
        access_token: params.access_token,
      }),
    onError: onError,
    onSuccess: (res) => {
      addToast({
        title: t("success"),
        description: t(res.data.message),
        timeout: 4000,
        radius: "none",
        color: "success",
      });
      const data = res.data?.data;
      const user = data?.user;
      const accessToken = data?.access_token;
      const refreshToken = data?.refresh_token;
      saveCredentialsAndRedirect(user, accessToken, refreshToken);
    },
  });

  return {
    signInMutation,
    signUpMutation,
    signOutMutation,
    verifyAccountMutation,
    forgotPasswordMutation,
    resetPasswordMutation,
    resendVerifyAccountMutation,
    signInWithGoogleMutation,
  };
};

export default useAuth;
