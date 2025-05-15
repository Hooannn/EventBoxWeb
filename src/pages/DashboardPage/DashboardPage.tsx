import { useQuery } from "@tanstack/react-query";
import useAuthStore from "../../stores/auth";
import useAxiosIns from "../../hooks/useAxiosIns";
import { IOrganization, IResponseData } from "../../types";
import LoadingOverlay from "../../components/Loading";
import { useTranslation } from "react-i18next";
import CreateFirstOrganization from "./CreateFirstOrganization";
import OrganizationCard from "./OrganizationCard";
import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const axios = useAxiosIns();
  const getOrganizations = useQuery({
    queryKey: ["fetch/organizations", user?.id],
    queryFn: () =>
      axios.get<IResponseData<IOrganization[]>>("/v1/organizations/me"),
    refetchOnWindowFocus: false,
  });

  const organizations = getOrganizations.data?.data?.data || [];

  const navigate = useNavigate();
  return (
    <>
      {getOrganizations.isLoading ? (
        <LoadingOverlay />
      ) : (
        <>
          {organizations.length === 0 ? (
            <CreateFirstOrganization />
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
