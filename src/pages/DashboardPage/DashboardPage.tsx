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
import { useAppConfig } from "../../contexts/AppConfigContext";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const axios = useAxiosIns();
  const { accessAdminPermission, accessOrganizerPermission } = useAppConfig();
  const getOrganizationsQuery = useQuery({
    queryKey: ["fetch/organizations", user?.id],
    queryFn: () =>
      axios.get<IResponseData<IOrganization[]>>("/v1/organizations/me/member"),
    refetchOnWindowFocus: false,
  });

  const organizations = getOrganizationsQuery.data?.data?.data || [];

  const navigate = useNavigate();

  useEffect(() => {
    if (!accessAdminPermission || !accessOrganizerPermission) {
      navigate(
        "/error?message=app not configured properly, missing permissions for admin or organizer access",
      );
      return;
    }

    const isAdmin = user?.roles.some((r) =>
      r.permissions.some((p) => p.name === accessAdminPermission),
    );

    const isOrganizer = user?.roles.some((r) =>
      r.permissions.some((p) => p.name === accessOrganizerPermission),
    );

    if (!isAdmin && !isOrganizer) {
      navigate("/contact");
    } else if (isAdmin) {
      navigate("/admin");
    }
  }, [user, accessAdminPermission, accessOrganizerPermission]);
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
                      const isOwner = org.user_organizations.some(
                        (uo) => uo.role === "OWNER" && uo.user.id === user?.id,
                      );
                      navigate(
                        `/organization/${org.id}?orgname=${org.name}&showCreateEventButton=${isOwner}`,
                      );
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
