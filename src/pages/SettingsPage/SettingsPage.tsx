import { Tab, Tabs } from "@heroui/react";
import InformationTab from "./InformationTab";
import ChangePasswordTab from "./ChangePasswordTab";

export default function SettingsPage() {
  return (
    <div className="w-full h-full">
      <Tabs color="primary" variant="underlined">
        <Tab key="information" title="Thông tin cá nhân">
          <InformationTab />
        </Tab>
        <Tab key="changePassword" title="Đổi mật khẩu">
          <ChangePasswordTab />
        </Tab>
      </Tabs>
    </div>
  );
}
