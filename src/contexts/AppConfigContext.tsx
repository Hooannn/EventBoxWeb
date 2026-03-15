import { useQuery } from "@tanstack/react-query";
import { createContext, PropsWithChildren, useContext } from "react";
import { rawPublicAxios } from "../hooks/useAxiosIns";
import { IResponseData } from "../types";
import LoadingOverlay from "../components/Loading";

type AppConfigContextType = {
  accessAdminPermission: string;
  accessOrganizerPermission: string;
};

const AppConfigContext = createContext<AppConfigContextType | undefined>(
  undefined,
);

export function useAppConfig() {
  const context = useContext(AppConfigContext);
  if (!context) {
    throw new Error("useAppConfig must be used within a AppConfigProvider");
  }
  return context;
}

export function AppConfigProvider({ children }: PropsWithChildren) {
  const getAppConfigQuery = useQuery({
    queryKey: ["fetch/app/config"],
    queryFn: () =>
      rawPublicAxios.get<
        IResponseData<{
          access_admin_permission: string;
          access_organizer_permission: string;
        }>
      >("/v1/configs/client-config"),
    refetchOnWindowFocus: false,
  });

  const {
    access_admin_permission: accessAdminPermission = "",
    access_organizer_permission: accessOrganizerPermission = "",
  } = getAppConfigQuery.data?.data?.data || {};

  return (
    <AppConfigContext.Provider
      value={{ accessAdminPermission, accessOrganizerPermission }}
    >
      {getAppConfigQuery.isLoading ? <LoadingOverlay /> : children}
    </AppConfigContext.Provider>
  );
}
