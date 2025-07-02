import { IOrganization, IUser } from "../types";

const getUserAvatar = (user?: IUser) => {
  if (!user) {
    return undefined;
  }
  if (user.assets && user.assets.length > 0) {
    const avatar = user.assets.find((asset) => asset.usage === "AVATAR");
    if (avatar) {
      return avatar.secure_url;
    }
  }
  return undefined;
};

const getOrganizationLogo = (org?: IOrganization) => {
  if (!org) {
    return undefined;
  }
  if (org.assets && org.assets.length > 0) {
    const logo = org.assets.find((asset) => asset.usage === "AVATAR");
    if (logo) {
      return logo.secure_url;
    }
  }
  return undefined;
};

const organizationRoleColors: Record<
  string,
  | "success"
  | "default"
  | "primary"
  | "secondary"
  | "warning"
  | "danger"
  | undefined
> = {
  OWNER: "warning",
  MANAGER: "primary",
  STAFF: "secondary",
};

export { getUserAvatar, getOrganizationLogo, organizationRoleColors };
