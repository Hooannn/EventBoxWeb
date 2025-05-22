import { Avatar, Textarea } from "@heroui/react";
import { MdOutlineCorporateFare } from "react-icons/md";
import { getOrganizationLogo } from "../../utils";
import { IOrganization } from "../../types";

export default function OrganizationCard({
  organization,
  onClick,
}: {
  organization: IOrganization;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="p-4 border cursor-pointer rounded-none shadow-md hover:shadow-lg transition-shadow duration-200 bg-white"
    >
      <div className="flex items-center justify-center gap-2">
        <Avatar
          size="lg"
          src={getOrganizationLogo(organization)}
          showFallback
          color="secondary"
          fallback={<MdOutlineCorporateFare size={32} />}
        />
        <div className="flex-1 flex-col">
          <h2 className="text-xl font-semibold px-1">{organization.name}</h2>
          <Textarea
            isDisabled
            className="text-default-900"
            variant="underlined"
            isReadOnly
            value={organization.description}
          />
        </div>
      </div>
    </div>
  );
}
