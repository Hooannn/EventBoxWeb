import { Chip, Input, Tab, Tabs } from "@heroui/react";
import { Key, useState } from "react";
import { useTranslation } from "react-i18next";
import { MdOutlineSearch } from "react-icons/md";
import { IEventStatus } from "../../types";
import EventList from "./EventList";

export default function OrganizationPage() {
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<IEventStatus>("published");
  return (
    <div className="flex h-full w-full flex-col space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div className="w-full max-w-[400px]">
          <Input
            radius="none"
            color="primary"
            variant="bordered"
            startContent={
              <MdOutlineSearch className="text-xl text-default-400 pointer-events-none flex-shrink-0" />
            }
            label={t("search").toString()}
            placeholder={t("search...").toString()}
          />
        </div>
        <div>
          <Tabs
            size="md"
            color="primary"
            variant="underlined"
            radius="none"
            selectedKey={activeTab}
            onSelectionChange={setActiveTab as (key: Key) => void}
          >
            <Tab
              className="min-w-[150px]"
              key="published"
              title={
                <div className="flex items-center space-x-2">
                  <span>{t("published")}</span>
                  <Chip size="sm" color="success" radius="none" variant="flat">
                    0
                  </Chip>
                </div>
              }
            />

            <Tab
              className="min-w-[150px]"
              key="pending"
              title={
                <div className="flex items-center space-x-2">
                  <span>{t("pending")}</span>
                  <Chip size="sm" color="success" radius="none" variant="flat">
                    0
                  </Chip>
                </div>
              }
            />
            <Tab
              className="min-w-[150px]"
              key="draft"
              title={
                <div className="flex items-center space-x-2">
                  <span>{t("draft")}</span>
                  <Chip size="sm" color="success" radius="none" variant="flat">
                    0
                  </Chip>
                </div>
              }
            />
            <Tab
              className="min-w-[150px]"
              key="archived"
              title={
                <div className="flex items-center space-x-2">
                  <span>{t("archived")}</span>
                  <Chip size="sm" color="success" radius="none" variant="flat">
                    0
                  </Chip>
                </div>
              }
            />
          </Tabs>
        </div>
      </div>
      <div className="flex-1">
        <EventList status={activeTab} events={[]} />
      </div>
    </div>
  );
}
