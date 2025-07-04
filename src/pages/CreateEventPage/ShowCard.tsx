import {
  Card,
  CardHeader,
  CardBody,
  DatePicker,
  Button,
  DateValue,
} from "@heroui/react";
import { useTranslation } from "react-i18next";
import { Show } from "./ShowsAndTicketTypeStep";
import { now, getLocalTimeZone } from "@internationalized/date";
import { Controller, useForm } from "react-hook-form";
import { MdOutlineCalendarToday, MdOutlineDelete } from "react-icons/md";
import TicketTypesList from "./TicketTypesList";
import { CreateTicketTypeInputs } from "./CreateTicketTypeModal";

export type ShowInputs = {
  start_time: DateValue;
  end_time: DateValue;
  ticket_types: CreateTicketTypeInputs[];
};

export default function ShowCard(props: { show: Show; onDelete: () => void }) {
  const { t } = useTranslation();
  const { handleSubmit, control, watch } = useForm<ShowInputs>();

  const watchStartTime = watch("start_time");
  const watchEndTime = watch("end_time");
  return (
    <Card radius="none" shadow="sm" className="p-4 relative">
      <CardHeader className="py-0">
        <div className="flex items-center justify-between w-full">
          <div className="text-lg font-semibold">{t("date")}</div>
          <div className="flex gap-2 flex-row items-center">
            <Button
              radius="none"
              onPress={props.onDelete}
              size="sm"
              color="danger"
              isIconOnly
              className="flex items-center justify-center gap-2"
            >
              <MdOutlineDelete />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardBody className="flex flex-row items-center gap-2">
        <Controller
          name="start_time"
          defaultValue={now(getLocalTimeZone())}
          control={control}
          rules={{
            required: t("{{label}} is required", {
              label: t("start time").toString(),
            }).toString(),
            validate: (value) => {
              if (watchEndTime && value > watchEndTime) {
                return t("start time must be before end time").toString();
              }
              return true;
            },
          }}
          render={({
            field: { name, value, onChange, onBlur, ref },
            fieldState: { invalid, error },
          }) => (
            <DatePicker
              hideTimeZone
              value={value}
              name={name}
              onChange={onChange}
              onBlur={onBlur}
              ref={ref}
              isInvalid={invalid}
              isRequired
              errorMessage={error?.message}
              showMonthAndYearPickers
              selectorIcon={<MdOutlineCalendarToday />}
              hourCycle={24}
              label={t("start time")}
              radius="none"
              variant="bordered"
            />
          )}
        />

        <Controller
          name="end_time"
          defaultValue={now(getLocalTimeZone())}
          control={control}
          rules={{
            required: t("{{label}} is required", {
              label: t("end time").toString(),
            }).toString(),
            validate: (value) => {
              if (watchStartTime && value < watchStartTime) {
                return t("end time must be after start time").toString();
              }
              return true;
            },
          }}
          render={({
            field: { name, value, onChange, onBlur, ref },
            fieldState: { invalid, error },
          }) => (
            <DatePicker
              hideTimeZone
              value={value}
              name={name}
              onChange={onChange}
              isRequired
              onBlur={onBlur}
              ref={ref}
              isInvalid={invalid}
              errorMessage={error?.message}
              showMonthAndYearPickers
              selectorIcon={<MdOutlineCalendarToday />}
              hourCycle={24}
              label={t("end time")}
              radius="none"
              variant="bordered"
            />
          )}
        />
      </CardBody>
      <CardHeader className="py-0">
        <div className="text-lg font-semibold">{t("ticket types")}</div>
      </CardHeader>
      <CardBody>
        <TicketTypesList
          showStartTime={watchStartTime}
          showEndTime={watchEndTime}
        />
      </CardBody>
    </Card>
  );
}
