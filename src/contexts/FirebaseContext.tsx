import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import * as firebase from "firebase/app";
import {
  getMessaging,
  getToken,
  onMessage,
  deleteToken,
} from "firebase/messaging";
import { useMutation } from "@tanstack/react-query";
import useAxiosIns from "../hooks/useAxiosIns";
import { IResponseData } from "../types";
import { onError } from "../utils/error-handlers";
import useAuthStore from "../stores/auth";
import useAppStore from "../stores/app";
import { addToast } from "@heroui/react";
const FirebaseContext = createContext<{
  instance: firebase.FirebaseApp | null;
  disabledPushNotifications?: (toastOnFinishing: boolean) => Promise<void>;
  enabledPushNotifications?: (toastOnFinishing: boolean) => Promise<void>;
}>({
  instance: null,
});

export const useFirebase = () => {
  return useContext(FirebaseContext);
};

export const FirebaseProvider = ({
  children,
  config,
}: PropsWithChildren<{ config: firebase.FirebaseOptions }>) => {
  const [firebaseApp, setFirebaseApp] = useState<firebase.FirebaseApp | null>(
    null
  );

  const { isLoggedIn: isLogged } = useAuthStore();
  const {
    enabledPushNotifications: isEnabledPushNotifications,
    setEnabledPushNotifications,
    setSavedFcmToken,
  } = useAppStore();
  const axios = useAxiosIns();

  const registerFcmTokenMutation = useMutation({
    mutationFn: (token: string) =>
      axios.post<IResponseData<unknown>>(
        "/api/v1/push_notifications/register",
        {
          token,
          platform: "WEB",
        }
      ),
    onError: onError,
  });

  const disabledPushNotifications = async (toastOnFinishing: boolean) => {
    if (firebaseApp) {
      await deleteToken(getMessaging(firebaseApp));
      setEnabledPushNotifications(false);
      if (toastOnFinishing)
        addToast({
          title: "Disabled push notifications",
          color: "success",
          timeout: 4000,
          radius: "none",
        });
    }
  };

  const enabledPushNotifications = async (toastOnFinishing: boolean) => {
    if (firebaseApp) {
      const res = new Promise<void>((resolve, reject) => {
        getToken(getMessaging(firebaseApp), {
          vapidKey:
            "BF1dEqXgdqn8eX6hEtofxnc9-kt-mutn69YY5I8Ra8bd2tFXnLc_gQQ_nkoXwfdz0bvs-DERcYwprJKoKs2q8Yg",
        })
          .then((token) => {
            resolve();
            setEnabledPushNotifications(true);
            registerFcmTokenMutation.mutateAsync(token).then(() => {
              setSavedFcmToken(token);
            });
            if (toastOnFinishing)
              addToast({
                title: "Enabled push notifications",
                color: "success",
                timeout: 4000,
                radius: "none",
              });
          })
          .catch((err) => {
            reject(err.message);
            setEnabledPushNotifications(false);
            addToast({
              title: "Error enabling push notifications",
              description: err.message,
              color: "danger",
              timeout: 4000,
              radius: "none",
            });
          });
      });

      onMessage(getMessaging(firebaseApp), (payload) => {
        console.log("Message received. ", payload);
        // ...
      });

      return res;
    }
  };

  useEffect(() => {
    if (!isLogged || !firebaseApp) return;
    if (isEnabledPushNotifications) enabledPushNotifications(false);
  }, [firebaseApp, isLogged]);

  useEffect(() => {
    if (!firebaseApp) {
      const app = firebase.initializeApp(config);
      setFirebaseApp(app);
    }

    return () => {};
  }, [config, firebaseApp]);

  return (
    <FirebaseContext.Provider
      value={{
        instance: firebaseApp,
        disabledPushNotifications,
        enabledPushNotifications,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};
