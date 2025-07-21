import { useQuery } from "@tanstack/react-query";
import useAuthStore from "../../stores/auth";
import useAxiosIns from "../../hooks/useAxiosIns";
import { IOrganization, IResponseData } from "../../types";
import LoadingOverlay from "../../components/Loading";
import { useTranslation } from "react-i18next";
import CreateFirstOrganization from "./CreateFirstOrganization";
import OrganizationCard from "./OrganizationCard";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const axios = useAxiosIns();
  const getOrganizationsQuery = useQuery({
    queryKey: ["fetch/organizations", user?.id],
    queryFn: () =>
      axios.get<IResponseData<IOrganization[]>>("/v1/organizations/me/member"),
    refetchOnWindowFocus: false,
  });

  const organizations = getOrganizationsQuery.data?.data?.data || [];

  const navigate = useNavigate();

  useEffect(() => {
    if (
      user?.roles.some((r) =>
        r.permissions.some(
          (p) =>
            p.name ===
            (import.meta.env.VITE_ACCESS_ADMIN_PERMISSION ?? "access:admin")
        )
      )
    ) {
      navigate("/admin");
    }
  }, [user]);
  return (
    <>
      {getOrganizationsQuery.isLoading ? (
        <LoadingOverlay />
      ) : (
        <>
          {organizations.length === 0 ? (
            <CreateFirstOrganization
              title={"create your first organization to get started"}
              showBackButton={false}
              onSuccess={() => {}}
              onBack={() => {}}
            />
          ) : (
            <div className="flex flex-col gap-4 p-4">
              <h1 className="text-2xl font-bold">{t("your organizations")}</h1>
              <div className="grid grid-cols-3 gap-4">
                {organizations.map((org) => (
                  <OrganizationCard
                    organization={org}
                    key={org.id}
                    onClick={() => {
                      navigate(`/organization/${org.id}?orgname=${org.name}`);
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
