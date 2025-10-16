import React from "react";
import { ITicketItem } from "../../types";
import { Card, CardBody, Chip, User } from "@heroui/react";
import { useTranslation } from "react-i18next";
import { getUserAvatar } from "../../utils";
import { MdOutlineCalendarToday } from "react-icons/md";
import dayjs from "../../libs/dayjs";

export default function FeedbackCard(props: { item: ITicketItem }) {
  const { t } = useTranslation();
  return (
    <Card radius="none" shadow="sm">
      <CardBody>
        <div className="flex flex-col gap-2 p-2">
          <div className="font-semibold flex items-center gap-2">
            <Chip
              radius="none"
              size="sm"
              variant="flat"
              color={
                props.item.feedback_type
                  ? props.item.feedback_type === "POSITIVE"
                    ? "success"
                    : "danger"
                  : "secondary"
              }
            >
              {props.item.feedback_type
                ? t(props.item.feedback_type.toLowerCase())
                : t("not updated yet")}
            </Chip>
            {props.item.ticket?.event_show.title} - {t("ticket")}{" "}
            {props.item.ticket.name}
          </div>
          <p style={{ whiteSpace: "pre-line" }} className="my-1">
            {props.item.feedback}
          </p>
          <div className="flex items-center gap-4">
            <User
              avatarProps={{
                isBordered: true,
                showFallback: true,
                size: "sm",
                color: "secondary",
                name: props.item.order?.user?.first_name,
                className: "transition-transform mr-1",
                src: getUserAvatar(props.item.order?.user),
              }}
              description={props.item.order?.user.email}
              name={
                props.item.order?.user.first_name +
                " " +
                props.item.order?.user.last_name
              }
            >
              {props.item.order?.user.email}
            </User>

            <div className="flex items-center gap-1">
              <MdOutlineCalendarToday className="text-default-500 -mt-1" />
              <div className="text-default-500 text-sm">
                {dayjs(props.item.feedback_at).fromNow()}
              </div>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
