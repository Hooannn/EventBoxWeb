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
import { CreateTicketTypeInputs } from "./shared.type";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";

export interface ShowCardHandles {
  submit: () => Promise<ShowInputs>;
}

export interface ShowCardProps {
  show: Show;
  onDelete: () => void;
}

export type ShowInputs = {
  start_time: DateValue;
  end_time: DateValue;
  sale_start_time: DateValue;
  sale_end_time: DateValue;
  ticket_types: CreateTicketTypeInputs[];
};

const ShowCard = forwardRef<ShowCardHandles, ShowCardProps>((props, ref) => {
  const { t } = useTranslation();
  const [ticketTypes, setTicketTypes] = useState<CreateTicketTypeInputs[]>([]);
  const [ticketTypeError, setTicketTypeError] = useState<string | null>(null);
  const { handleSubmit, control, watch } = useForm<ShowInputs>();

  useImperativeHandle(ref, () => ({
    submit: () => {
      if (ticketTypes.length === 0) {
        setTicketTypeError(
          t("{{label}} is required", {
            label: t("ticket types").toString(),
          }).toString()
        );
        return Promise.reject();
      }
      return new Promise<ShowInputs>((resolve, reject) => {
        handleSubmit(
          (data) => {
            resolve({
              start_time: data.start_time,
              end_time: data.end_time,
              sale_start_time: data.sale_start_time,
              sale_end_time: data.sale_end_time,
              ticket_types: ticketTypes,
            });
          },
          (e) => {
            reject(e);
          }
        )();
      });
    },
  }));

  useEffect(() => {
    setTicketTypeError(null);
  }, [ticketTypes]);

  const watchShowStartTime = watch("start_time");
  const watchShowEndTime = watch("end_time");
  const watchSaleStartTime = watch("sale_start_time");
  const watchSaleEndTime = watch("sale_end_time");
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
      <CardBody className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Controller
            name="start_time"
            defaultValue={now(getLocalTimeZone())}
            control={control}
            rules={{
              required: t("{{label}} is required", {
                label: t("start time").toString(),
              }).toString(),
              validate: (value) => {
                if (watchShowEndTime && value > watchShowEndTime) {
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
                if (watchShowStartTime && value < watchShowStartTime) {
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
        </div>
        <div className="flex items-center gap-2">
          <Controller
            name="sale_start_time"
            control={control}
            defaultValue={now(getLocalTimeZone())}
            rules={{
              required: t("{{label}} is required", {
                label: t("sale start time").toString(),
              }).toString(),
              validate: (value) => {
                if (value > watchShowEndTime) {
                  return t(
                    "sale start time must be before show end time"
                  ).toString();
                }

                if (watchSaleEndTime && value > watchSaleEndTime) {
                  return t(
                    "sale start time must be before sale end time"
                  ).toString();
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
                isRequired
                name={name}
                onChange={onChange}
                onBlur={onBlur}
                ref={ref}
                isInvalid={invalid}
                errorMessage={error?.message}
                showMonthAndYearPickers
                selectorIcon={<MdOutlineCalendarToday />}
                hourCycle={24}
                label={t("sale start time")}
                radius="none"
                variant="bordered"
              />
            )}
          />

          <Controller
            name="sale_end_time"
            defaultValue={now(getLocalTimeZone())}
            control={control}
            rules={{
              required: t("{{label}} is required", {
                label: t("sale end time").toString(),
              }).toString(),
              validate: (value) => {
                if (value > watchShowEndTime) {
                  return t(
                    "sale end time must be before show end time"
                  ).toString();
                }

                if (watchSaleStartTime && value < watchSaleStartTime) {
                  return t(
                    "sale end time must be after sale start time"
                  ).toString();
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
                isRequired
                name={name}
                onChange={onChange}
                onBlur={onBlur}
                ref={ref}
                isInvalid={invalid}
                errorMessage={error?.message}
                showMonthAndYearPickers
                selectorIcon={<MdOutlineCalendarToday />}
                hourCycle={24}
                label={t("sale end time")}
                radius="none"
                variant="bordered"
              />
            )}
          />
        </div>
      </CardBody>
      <CardHeader className="py-0 flex flex-col items-start">
        <div className="text-lg font-semibold">{t("ticket types")}</div>
        {ticketTypeError && (
          <span className="text-tiny text-danger -mt-1">{ticketTypeError}</span>
        )}
      </CardHeader>
      <CardBody>
        <TicketTypesList
          ticketTypes={ticketTypes}
          setTicketTypes={setTicketTypes}
        />
      </CardBody>
    </Card>
  );
});

export default ShowCard;
