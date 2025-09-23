import {
  Card,
  CardHeader,
  CardBody,
  DatePicker,
  Button,
  DateValue,
  Tooltip,
  Switch,
  Input,
} from "@heroui/react";
import { useTranslation } from "react-i18next";
import { Show } from "./ShowsAndTicketTypeStep";
import { now, getLocalTimeZone } from "@internationalized/date";
import { Controller, useForm } from "react-hook-form";
import {
  MdOutlineCalendarToday,
  MdOutlineContentCopy,
  MdOutlineDelete,
} from "react-icons/md";
import TicketTypesList from "./TicketTypesList";
import { CreateTicketTypeInputs } from "./shared.type";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import Seatmap from "./Seatmap";
import { Canvas } from "fabric";

export interface ShowCardHandles {
  submit: () => Promise<ShowInputs>;
  setInitData: (data: ShowInputs) => void;
}

export interface ShowCardProps {
  show: Show;
  index: number;
  onDelete: () => void;
  onDublicate: () => void;
}

export type ShowInputs = {
  title: string;
  start_time: DateValue;
  end_time: DateValue;
  sale_start_time: DateValue;
  sale_end_time: DateValue;
  ticket_types: CreateTicketTypeInputs[];
  enabled_seatmap: boolean;
  seatmap?: string;
  seatmap_svg?: string;
};

const ShowCard = forwardRef<ShowCardHandles, ShowCardProps>((props, ref) => {
  const { t } = useTranslation();
  const [enabledSeatmap, setEnabledSeatmap] = useState(false);
  const [showSeatmapPlaceholder, setShowSeatmapPlaceholder] = useState(true);
  const [ticketTypes, setTicketTypes] = useState<CreateTicketTypeInputs[]>([]);
  const [ticketTypeError, setTicketTypeError] = useState<string | null>(null);
  const [seatmapError, setSeatmapError] = useState<string | null>(null);
  const { handleSubmit, control, watch, setValue } = useForm<ShowInputs>();
  const seatmapCanvasRef = useRef<Canvas | null>(null);

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

      if (enabledSeatmap) {
        let valid = true;
        const objects = seatmapCanvasRef.current?.getObjects() || [];
        ticketTypes.forEach((tt) => {
          const found = objects.find((obj) => {
            return (
              obj.get("areaType") === "ticket" &&
              obj.get("ticketTypeId") === tt.temp_id
            );
          });
          if (!found) {
            setSeatmapError(
              t("all ticket types must be add to the seatmap").toString()
            );
            valid = false;
          }
        });

        if (!valid) {
          return Promise.reject();
        }
      }

      setSeatmapError(null);

      return new Promise<ShowInputs>((resolve, reject) => {
        handleSubmit(
          (data) => {
            const dataToSubmit: ShowInputs = {
              start_time: data.start_time,
              end_time: data.end_time,
              sale_start_time: data.sale_start_time,
              sale_end_time: data.sale_end_time,
              ticket_types: ticketTypes,
              enabled_seatmap: enabledSeatmap,
              title: data.title,
            };
            if (enabledSeatmap) {
              dataToSubmit.seatmap = JSON.stringify(
                seatmapCanvasRef.current?.toJSON()
              );
              dataToSubmit.seatmap_svg = seatmapCanvasRef.current?.toSVG();
            }
            resolve(dataToSubmit);
          },
          (e) => {
            reject(e);
          }
        )();
      });
    },
    setInitData: (data: ShowInputs) => {
      setValue("start_time", data.start_time);
      setValue("end_time", data.end_time);
      setValue("sale_start_time", data.sale_start_time);
      setValue("sale_end_time", data.sale_end_time);
      setValue("title", data.title);
      setEnabledSeatmap(data.enabled_seatmap);
      setTicketTypes(data.ticket_types);

      if (data.enabled_seatmap && data.seatmap) {
        setTimeout(() => {
          seatmapCanvasRef.current
            ?.loadFromJSON(JSON.parse(data.seatmap))
            .then(() => {
              seatmapCanvasRef.current?.renderAll();
              setShowSeatmapPlaceholder(false);
            });
        }, 0);
      }
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
          <div className="text-lg font-semibold">
            {t("show")} #{props.index + 1}
          </div>
          <div className="flex gap-2 flex-row items-center">
            <Tooltip content={t("dublicate").toString()} radius="none">
              <Button
                isIconOnly
                color="secondary"
                size="sm"
                radius="none"
                variant="flat"
                onPress={props.onDublicate}
              >
                <MdOutlineContentCopy />
              </Button>
            </Tooltip>
            <Tooltip content={t("delete").toString()} radius="none">
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
            </Tooltip>
          </div>
        </div>
      </CardHeader>
      <CardBody className="flex flex-col gap-2">
        <Controller
          name="title"
          control={control}
          rules={{
            required: t("{{label}} is required", {
              label: t("show title").toString(),
            }).toString(),
          }}
          render={({
            field: { name, value, onChange, onBlur, ref },
            fieldState: { invalid, error },
          }) => (
            <Input
              ref={ref}
              isRequired
              errorMessage={error?.message}
              radius="none"
              validationBehavior="aria"
              isInvalid={invalid}
              color="primary"
              variant="bordered"
              onBlur={onBlur}
              name={name}
              value={value}
              onChange={onChange}
              label={t("show title").toString()}
              placeholder={t("enter {{label}}", {
                label: t("show title").toString().toLowerCase(),
              }).toString()}
            />
          )}
        />
      </CardBody>
      <CardHeader className="py-0">
        <div className="flex items-center justify-between w-full">
          <div className="text-lg font-semibold">{t("date")}</div>
        </div>
      </CardHeader>
      <CardBody className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Controller
            name="start_time"
            defaultValue={now(getLocalTimeZone()) as unknown as DateValue}
            control={control}
            rules={{
              required: t("{{label}} is required", {
                label: t("start time").toString(),
              }).toString(),
              validate: (value) => {
                const valueWithoutSeconds = value.set({
                  second: 0,
                  millisecond: 0,
                });
                const showEndTimeWithoutSeconds = watchShowEndTime?.set({
                  second: 0,
                  millisecond: 0,
                });
                const nowWithoutSeconds = now(getLocalTimeZone()).set({
                  second: 0,
                  millisecond: 0,
                }) as unknown as DateValue;

                if (valueWithoutSeconds.compare(nowWithoutSeconds) <= 0) {
                  return t("start time must be in the future").toString();
                }

                if (
                  watchShowEndTime &&
                  valueWithoutSeconds.compare(showEndTimeWithoutSeconds) >= 0
                ) {
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
            defaultValue={now(getLocalTimeZone()) as unknown as DateValue}
            control={control}
            rules={{
              required: t("{{label}} is required", {
                label: t("end time").toString(),
              }).toString(),
              validate: (value) => {
                const valueWithoutSeconds = value.set({
                  second: 0,
                  millisecond: 0,
                });
                const showStartTimeWithoutSeconds = watchShowStartTime?.set({
                  second: 0,
                  millisecond: 0,
                });
                if (
                  watchShowStartTime &&
                  valueWithoutSeconds.compare(showStartTimeWithoutSeconds) <= 0
                ) {
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
            defaultValue={now(getLocalTimeZone()) as unknown as DateValue}
            rules={{
              required: t("{{label}} is required", {
                label: t("sale start time").toString(),
              }).toString(),
              validate: (value) => {
                const valueWithoutSeconds = value.set({
                  second: 0,
                  millisecond: 0,
                });
                const showEndTimeWithoutSeconds = watchShowEndTime?.set({
                  second: 0,
                  millisecond: 0,
                });
                const saleEndTimeWithoutSeconds = watchSaleEndTime?.set({
                  second: 0,
                  millisecond: 0,
                });
                if (
                  valueWithoutSeconds.compare(showEndTimeWithoutSeconds) >= 0
                ) {
                  return t(
                    "sale start time must be before show end time"
                  ).toString();
                }

                if (
                  watchSaleEndTime &&
                  valueWithoutSeconds.compare(saleEndTimeWithoutSeconds) >= 0
                ) {
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
            defaultValue={now(getLocalTimeZone()) as unknown as DateValue}
            control={control}
            rules={{
              required: t("{{label}} is required", {
                label: t("sale end time").toString(),
              }).toString(),
              validate: (value) => {
                const valueWithoutSeconds = value.set({
                  second: 0,
                  millisecond: 0,
                });
                const showEndTimeWithoutSeconds = watchShowEndTime?.set({
                  second: 0,
                  millisecond: 0,
                });
                const saleStartTimeWithoutSeconds = watchSaleStartTime?.set({
                  second: 0,
                  millisecond: 0,
                });
                if (
                  valueWithoutSeconds.compare(showEndTimeWithoutSeconds) >= 0
                ) {
                  return t(
                    "sale end time must be before show end time"
                  ).toString();
                }

                if (
                  watchSaleStartTime &&
                  valueWithoutSeconds.compare(saleStartTimeWithoutSeconds) <= 0
                ) {
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
      <CardHeader className="py-0 flex flex-col items-start">
        <div className="flex items-center justify-between w-full">
          <div className="text-lg font-semibold">{t("seatmap")}</div>
          <Switch
            isSelected={enabledSeatmap}
            onValueChange={(selected) => {
              setEnabledSeatmap(selected);
              setSeatmapError(null);
            }}
            color="success"
          />
        </div>
        {seatmapError && (
          <span className="text-tiny text-danger -mt-1">{seatmapError}</span>
        )}
      </CardHeader>
      <CardBody>
        {enabledSeatmap ? (
          <Seatmap
            showPlaceholder={showSeatmapPlaceholder}
            setShowPlaceholder={setShowSeatmapPlaceholder}
            ticketTypes={ticketTypes}
            canvasRef={seatmapCanvasRef}
          />
        ) : (
          <div className="text-sm text-muted-foreground">
            {t("seatmap is disabled")}
          </div>
        )}
      </CardBody>
    </Card>
  );
});

export default ShowCard;
