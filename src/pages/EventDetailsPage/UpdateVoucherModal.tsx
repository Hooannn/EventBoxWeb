import { useTranslation } from "react-i18next";
import { DiscountType, IResponseData, IVoucher } from "../../types";
import useAxiosIns from "../../hooks/useAxiosIns";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { onError } from "../../utils/error-handlers";
import {
  addToast,
  Button,
  DateRangePicker,
  DateValue,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Radio,
  RadioGroup,
  RangeValue,
  Select,
  SelectItem,
  Switch,
  Textarea,
  Tooltip,
} from "@heroui/react";
import { MdOutlineCalendarToday } from "react-icons/md";
import { getLocalTimeZone, parseDate, today } from "@internationalized/date";
import { useEffect, useState } from "react";
import dayjs from "../../libs/dayjs";

export type UpdateInputs = {
  name: string;
  description?: string;
  code: string;
  discount_type: Set<DiscountType>;
  discount_value: string;
  period: RangeValue<DateValue>;
  usage_limit?: string;
  per_user_limit?: string;
  is_active: boolean;
  is_public: boolean;
  min_order_value?: string;
  min_ticket_quantity?: string;
};

export default function UpdateVoucherModal(props: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  onSuccess: () => void;
  voucher: IVoucher;
  eventId: string;
}) {
  const { t } = useTranslation();
  const axios = useAxiosIns();

  const { handleSubmit, control, watch } = useForm<UpdateInputs>({
    defaultValues: {
      name: props.voucher.name,
      description: props.voucher.description,
      code: props.voucher.code,
      discount_value: props.voucher.discount_value.toString(),
      period: {
        start: parseDate(
          props.voucher.valid_from.replace(/T(\d{2}):(\d{2}):(\d{2})(.*)/, "")
        ) as unknown as DateValue,
        end: parseDate(
          props.voucher.valid_to.replace(/T(\d{2}):(\d{2}):(\d{2})(.*)/, "")
        ) as unknown as DateValue,
      },
      usage_limit: props.voucher.usage_limit?.toString(),
      per_user_limit: props.voucher.per_user_limit?.toString(),
      min_order_value: props.voucher.min_order_value?.toString(),
      min_ticket_quantity: props.voucher.min_ticket_quantity?.toString(),
      discount_type: new Set<DiscountType>([props.voucher.discount_type]),
      is_active: props.voucher.is_active,
    },
  });

  const [selectedMode, setSelectedMode] = useState("public");

  const watchDiscountType = watch("discount_type");

  useEffect(() => {
    if (props.voucher.is_public) setSelectedMode("public");
    else setSelectedMode("private");
  }, [props.voucher]);

  const getUsageQuery = useQuery({
    queryKey: [
      "fetch/vouchers/id/event/eventId/usage",
      props.voucher.id,
      props.eventId,
    ],
    queryFn: () => {
      return axios.get<IResponseData<number>>(
        `/v1/vouchers/${props.voucher.id}/event/${props.eventId}/usage`
      );
    },
    refetchOnWindowFocus: false,
    enabled: props.isOpen,
  });

  const usage = getUsageQuery.data?.data.data ?? 0;

  const updateMutation = useMutation({
    mutationFn: (params: unknown) =>
      axios.put<IResponseData<boolean>>(
        `/v1/vouchers/${props.voucher.id}/event/${props.eventId}`,
        params
      ),
    onError,
    onSuccess(data) {
      addToast({
        title: t("success"),
        description: t(data.data.message),
        timeout: 4000,
        radius: "none",
        color: "success",
      });
      props.onClose();
      props.onSuccess();
    },
  });

  const onSubmit: SubmitHandler<UpdateInputs> = async (data) => {
    updateMutation.mutate({
      name: data.name,
      description: data.description,
      code: data.code,
      discount_type: data.discount_type.has("PERCENTAGE")
        ? "PERCENTAGE"
        : "FIXED_AMOUNT",
      discount_value: data.discount_value,
      valid_from: dayjs(data.period.start.toDate("Asia/Saigon")).format(
        "YYYY-MM-DDTHH:mm:00"
      ),
      valid_to: dayjs(data.period.end.toDate("Asia/Saigon")).format(
        "YYYY-MM-DDT23:59:59"
      ),
      usage_limit: data.usage_limit,
      per_user_limit: data.per_user_limit,
      is_active: data.is_active,
      is_public: selectedMode === "public",
      min_order_value: data.min_order_value,
      min_ticket_quantity: data.min_ticket_quantity,
    });
  };

  return (
    <Modal
      radius="none"
      size="4xl"
      scrollBehavior="inside"
      isOpen={props.isOpen}
      onOpenChange={props.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-row gap-1 items-center justify-between mt-4">
              <div className="flex flex-col">
                <span>{t("update voucher")}</span>
                <span className="text-sm font-normal text-default-500">
                  {t("voucher has been used {{usage}} times", {
                    usage: usage,
                  })}
                </span>
              </div>

              <Controller
                name="is_active"
                control={control}
                render={({ field: { name, value, onChange, onBlur, ref } }) => (
                  <Tooltip content={t("active/inactive voucher").toString()}>
                    <Switch
                      color="success"
                      name={name}
                      isSelected={value}
                      onValueChange={onChange}
                      onBlur={onBlur}
                      ref={ref}
                    />
                  </Tooltip>
                )}
              />
            </ModalHeader>
            <ModalBody className="flex flex-col gap-2">
              <div className="font-semibold">{t("voucher information")}</div>
              <Controller
                name="name"
                control={control}
                rules={{
                  required: t("{{label}} is required", {
                    label: t("promotion name").toString(),
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
                    description={t(
                      "promotion name won't be shown to customers"
                    )}
                    validationBehavior="aria"
                    isInvalid={invalid}
                    color="primary"
                    variant="bordered"
                    onBlur={onBlur}
                    name={name}
                    value={value}
                    onChange={onChange}
                    label={t("promotion name").toString()}
                    placeholder={t("enter {{label}}", {
                      label: t("promotion name").toString().toLowerCase(),
                    }).toString()}
                  ></Input>
                )}
              />
              <Controller
                name="code"
                control={control}
                rules={{
                  required: t("{{label}} is required", {
                    label: t("code").toString(),
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
                    label={t("code").toString()}
                    placeholder={t("enter {{label}}", {
                      label: t("code").toString().toLowerCase(),
                    }).toString()}
                  ></Input>
                )}
              />

              <Controller
                name="period"
                control={control}
                rules={{
                  required: t("{{label}} is required", {
                    label: t("period").toString(),
                  }).toString(),
                }}
                render={({
                  field: { value, onChange, onBlur, ref },
                  fieldState: { invalid, error },
                }) => (
                  <DateRangePicker
                    minValue={today(getLocalTimeZone()) as unknown as DateValue}
                    hideTimeZone
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    ref={ref}
                    isInvalid={invalid}
                    isRequired
                    errorMessage={error?.message}
                    showMonthAndYearPickers
                    selectorIcon={<MdOutlineCalendarToday />}
                    hourCycle={24}
                    label={t("period").toString()}
                    radius="none"
                    variant="bordered"
                  />
                )}
              />

              <Controller
                name="description"
                control={control}
                render={({
                  field: { name, value, onChange, onBlur, ref },
                  fieldState: { invalid, error },
                }) => (
                  <Textarea
                    ref={ref}
                    color="primary"
                    variant="bordered"
                    radius="none"
                    isInvalid={invalid}
                    maxRows={3}
                    onChange={onChange}
                    onBlur={onBlur}
                    name={name}
                    errorMessage={error?.message}
                    label={t("description")}
                    placeholder={t("enter {{label}}", {
                      label: t("description").toString().toLowerCase(),
                    }).toString()}
                    value={value}
                  />
                )}
              />

              <RadioGroup
                label={t("mode").toString()}
                value={selectedMode}
                onValueChange={setSelectedMode}
              >
                <Radio
                  description={t(
                    "this voucher will be shown automatically to customers at checkout, customers can easily apply it"
                  ).toString()}
                  value="public"
                >
                  {t("public")}
                </Radio>
                <Radio
                  value="private"
                  description={t(
                    "this voucher will not be shown to customers, you need to provide the code to customers so that they can apply it"
                  ).toString()}
                >
                  {t("private")}
                </Radio>
              </RadioGroup>

              <div className="mt-4 font-semibold">{t("voucher settings")}</div>

              <div className="flex flex-row gap-2 items-center">
                <div className="w-48">
                  <Controller
                    name="discount_type"
                    control={control}
                    rules={{
                      required: t("{{label}} is required", {
                        label: t("discount type").toString(),
                      }).toString(),
                    }}
                    render={({
                      field: { name, value, onChange, onBlur, ref },
                      fieldState: { invalid, error },
                    }) => (
                      <Select
                        ref={ref}
                        isRequired
                        errorMessage={error?.message}
                        radius="none"
                        validationBehavior="aria"
                        isInvalid={invalid}
                        disallowEmptySelection
                        size="sm"
                        color="primary"
                        variant="bordered"
                        isMultiline={true}
                        selectionMode="single"
                        onBlur={onBlur}
                        name={name}
                        items={[
                          {
                            id: "FIXED_AMOUNT",
                            name: t("fixed amount"),
                            key: "FIXED_AMOUNT",
                          },
                          {
                            id: "PERCENTAGE",
                            name: t("percentage"),
                            key: "PERCENTAGE",
                          },
                        ]}
                        selectedKeys={value}
                        onSelectionChange={onChange}
                        label={t("discount type").toString()}
                        placeholder={t("enter {{label}}", {
                          label: t("discount type").toString().toLowerCase(),
                        }).toString()}
                      >
                        {(discountType) => (
                          <SelectItem key={discountType.id}>
                            {discountType.name}
                          </SelectItem>
                        )}
                      </Select>
                    )}
                  />
                </div>
                <div className="flex-grow">
                  <Controller
                    name="discount_value"
                    control={control}
                    rules={{
                      required: t("{{label}} is required", {
                        label: t("discount value").toString(),
                      }).toString(),
                      min: {
                        value: watchDiscountType.has("PERCENTAGE") ? 1 : 1000,
                        message: t(
                          "{{label}} must be greater than or equal to {{value}}",
                          {
                            label: t("discount value").toString(),
                            value: watchDiscountType.has("PERCENTAGE")
                              ? "1"
                              : "1000",
                          }
                        ).toString(),
                      },
                    }}
                    render={({
                      field: { name, value, onChange, onBlur, ref },
                      fieldState: { invalid, error },
                    }) => (
                      <Input
                        ref={ref}
                        isRequired
                        errorMessage={error?.message}
                        validationBehavior="aria"
                        isInvalid={invalid}
                        type="number"
                        endContent={
                          <div className="pointer-events-none flex items-center">
                            <span className="text-small text-default-600">
                              {watchDiscountType.has("PERCENTAGE") ? "%" : "đ"}
                            </span>
                          </div>
                        }
                        color="primary"
                        radius="none"
                        variant="bordered"
                        onBlur={onBlur}
                        name={name}
                        value={value}
                        onChange={onChange}
                        label={t("discount value").toString()}
                        placeholder={t("enter {{label}}", {
                          label: t("discount value").toString().toLowerCase(),
                        }).toString()}
                      />
                    )}
                  />
                </div>
              </div>

              <div className="flex flex-row gap-2 items-center">
                <div className="w-1/2">
                  <Controller
                    name="usage_limit"
                    control={control}
                    rules={{
                      required: t("{{label}} is required", {
                        label: t("usage limit").toString(),
                      }).toString(),
                      min: {
                        value: 1,
                        message: t(
                          "{{label}} must be greater than or equal to {{value}}",
                          {
                            label: t("usage limit").toString(),
                            value: "1",
                          }
                        ).toString(),
                      },
                    }}
                    render={({
                      field: { name, value, onChange, onBlur, ref },
                      fieldState: { invalid, error },
                    }) => (
                      <Input
                        ref={ref}
                        type="number"
                        isRequired
                        errorMessage={error?.message}
                        validationBehavior="aria"
                        isInvalid={invalid}
                        color="primary"
                        radius="none"
                        variant="bordered"
                        onBlur={onBlur}
                        name={name}
                        value={value}
                        onChange={onChange}
                        label={t("usage limit").toString()}
                        placeholder={t("enter {{label}}", {
                          label: t("usage limit").toString().toLowerCase(),
                        }).toString()}
                      />
                    )}
                  />
                </div>
                <div className="w-1/2">
                  <Controller
                    name="per_user_limit"
                    control={control}
                    rules={{
                      required: t("{{label}} is required", {
                        label: t("per user limit").toString(),
                      }).toString(),
                      min: {
                        value: 1,
                        message: t(
                          "{{label}} must be greater than or equal to {{value}}",
                          {
                            label: t("per user limit").toString(),
                            value: "1",
                          }
                        ).toString(),
                      },
                    }}
                    render={({
                      field: { name, value, onChange, onBlur, ref },
                      fieldState: { invalid, error },
                    }) => (
                      <Input
                        ref={ref}
                        type="number"
                        isRequired
                        errorMessage={error?.message}
                        validationBehavior="aria"
                        isInvalid={invalid}
                        color="primary"
                        radius="none"
                        variant="bordered"
                        onBlur={onBlur}
                        name={name}
                        value={value}
                        onChange={onChange}
                        label={t("per user limit").toString()}
                        placeholder={t("enter {{label}}", {
                          label: t("per user limit").toString().toLowerCase(),
                        }).toString()}
                      />
                    )}
                  />
                </div>
              </div>

              <div className="mt-4 font-semibold">{t("voucher condition")}</div>
              <div className="flex flex-row gap-2 items-center">
                <div className="w-1/2">
                  <Controller
                    name="min_order_value"
                    control={control}
                    rules={{
                      required: t("{{label}} is required", {
                        label: t("min order value").toString(),
                      }).toString(),
                      min: {
                        value: 1000,
                        message: t(
                          "{{label}} must be greater than or equal to {{value}}",
                          {
                            label: t("min order value").toString(),
                            value: "1000",
                          }
                        ).toString(),
                      },
                    }}
                    render={({
                      field: { name, value, onChange, onBlur, ref },
                      fieldState: { invalid, error },
                    }) => (
                      <Input
                        ref={ref}
                        isRequired
                        errorMessage={error?.message}
                        validationBehavior="aria"
                        isInvalid={invalid}
                        type="number"
                        color="primary"
                        radius="none"
                        variant="bordered"
                        onBlur={onBlur}
                        name={name}
                        endContent={
                          <div className="pointer-events-none flex items-center">
                            <span className="text-small text-default-600">
                              đ
                            </span>
                          </div>
                        }
                        value={value}
                        onChange={onChange}
                        label={t("min order value").toString()}
                        placeholder={t("enter {{label}}", {
                          label: t("min order value").toString().toLowerCase(),
                        }).toString()}
                      />
                    )}
                  />
                </div>
                <div className="w-1/2">
                  <Controller
                    name="min_ticket_quantity"
                    control={control}
                    rules={{
                      required: t("{{label}} is required", {
                        label: t("min ticket quantity").toString(),
                      }).toString(),
                      min: {
                        value: 1,
                        message: t(
                          "{{label}} must be greater than or equal to {{value}}",
                          {
                            label: t("min ticket quantity").toString(),
                            value: "1",
                          }
                        ).toString(),
                      },
                    }}
                    render={({
                      field: { name, value, onChange, onBlur, ref },
                      fieldState: { invalid, error },
                    }) => (
                      <Input
                        ref={ref}
                        type="number"
                        isRequired
                        errorMessage={error?.message}
                        validationBehavior="aria"
                        isInvalid={invalid}
                        color="primary"
                        radius="none"
                        variant="bordered"
                        onBlur={onBlur}
                        name={name}
                        value={value}
                        onChange={onChange}
                        label={t("min ticket quantity").toString()}
                        placeholder={t("enter {{label}}", {
                          label: t("min ticket quantity")
                            .toString()
                            .toLowerCase(),
                        }).toString()}
                      />
                    )}
                  />
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                isLoading={updateMutation.isPending}
                color="default"
                variant="light"
                radius="none"
                onPress={onClose}
              >
                {t("cancel")}
              </Button>
              <Button
                isLoading={updateMutation.isPending}
                radius="none"
                color="primary"
                onClick={handleSubmit(onSubmit)}
              >
                {t("submit")}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
