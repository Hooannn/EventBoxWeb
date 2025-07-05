import { Card, CardHeader, CardBody, Alert } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { MdPayment } from "react-icons/md";
import { useParams } from "react-router";
import useAxiosIns from "../../hooks/useAxiosIns";
import { IOrganization, IResponseData } from "../../types";

export default function PaymentInformationStep() {
  const { t } = useTranslation();
  const axios = useAxiosIns();
  const params = useParams();
  const getOrganizationQuery = useQuery({
    queryKey: ["fetch/organization/id", params.id],
    queryFn: () =>
      axios.get<IResponseData<IOrganization>>(`/v1/organizations/${params.id}`),
    refetchOnWindowFocus: false,
  });

  const organization = getOrganizationQuery.data?.data?.data;
  return (
    <div className="flex flex-col gap-2">
      <Card radius="none" shadow="sm" className="p-4 relative">
        <CardHeader className="py-0">
          <div className="flex items-center justify-between w-full">
            <div className="text-lg font-semibold">{t("confirm")}</div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="text-gray-600">
            {t("Please review your event information before submitting")}
            <br />
            {t(
              "After submitting, your event will be under review and will not be visible to the public until approved."
            )}
          </div>
        </CardBody>
        <CardHeader className="py-0 flex flex-col items-start">
          <div className="text-lg font-semibold">
            {t("payment information")}
          </div>
        </CardHeader>
        <CardBody>
          <div className="text-gray-600">
            {t(
              "After your event is done, you will receive your earnings via Organization's PayPal account. Please ensure that your PayPal account is correct or you can update it later in the Organization settings."
            )}
            <br />
            <Alert
              radius="none"
              color={"success"}
              className="mt-2"
              icon={<MdPayment />}
              title={t("current Paypal account")}
              description={
                <div className="text-xl font-semibold">
                  {organization?.paypal_account}
                </div>
              }
            />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
