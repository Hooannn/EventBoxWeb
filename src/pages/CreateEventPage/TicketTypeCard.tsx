import {
  Button,
  Card,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
  useDisclosure,
} from "@heroui/react";
import { MdOutlineDelete, MdOutlineEdit } from "react-icons/md";
import { IoTicketOutline } from "react-icons/io5";
import { useTranslation } from "react-i18next";
import { priceFormat } from "../../utils";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { CreateTicketTypeInputs } from "./shared.type";

export default function TicketTypeCard(props: {
  ticketType: CreateTicketTypeInputs;
  onDelete: () => void;
  onUpdate: (ticketType: CreateTicketTypeInputs) => void;
}) {
  const { t } = useTranslation();

  const {
    isOpen: isUpdateTicketTypeModalOpen,
    onOpen: onUpdateTicketTypeModalOpen,
    onClose: onUpdateTicketTypeModalClose,
    onOpenChange: onUpdateTicketTypeModalOpenChange,
  } = useDisclosure();
  return (
    <>
      <UpdateTicketTypeModal
        isOpen={isUpdateTicketTypeModalOpen}
        ticketType={props.ticketType}
        onClose={onUpdateTicketTypeModalClose}
        onOpenChange={onUpdateTicketTypeModalOpenChange}
        onSuccess={(ticketType) => {
          props.onUpdate(ticketType);
          onUpdateTicketTypeModalClose();
        }}
      />
      <Card
        radius="none"
        shadow="sm"
        className="p-3"
        classNames={{
          base: "bg-secondary-50",
        }}
      >
        <div className="flex flex-row gap-2 items-center gap-2">
          <IoTicketOutline size={28} />
          <div className="flex flex-col flex-1">
            <div className="text-base font-semibold">
              {props.ticketType.name}
            </div>
            <div className="text-xs text-secondary-600">
              {t("price")}: {priceFormat(parseFloat(props.ticketType.price))}
            </div>
            <div className="text-xs text-secondary-600">
              {t("initial stock")}: {props.ticketType.init_stock}
            </div>
          </div>
          <div className="flex flex-row items-center gap-2">
            <Button
              isIconOnly
              color="secondary"
              size="sm"
              radius="none"
              onPress={onUpdateTicketTypeModalOpen}
              variant="flat"
            >
              <MdOutlineEdit />
            </Button>
            <Button
              color="danger"
              isIconOnly
              size="sm"
              onPress={props.onDelete}
              radius="none"
              variant="flat"
            >
              <MdOutlineDelete />
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
}

export function UpdateTicketTypeModal(props: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  onSuccess: (params: CreateTicketTypeInputs) => void;
  ticketType: CreateTicketTypeInputs;
}) {
  const { t } = useTranslation();

  const { handleSubmit, control, reset } = useForm<CreateTicketTypeInputs>({
    defaultValues: {
      ...props.ticketType,
    },
  });

  const onSubmit: SubmitHandler<CreateTicketTypeInputs> = async (data) => {
    data.temp_id = crypto.randomUUID();
    props.onSuccess(data);
    reset();
  };

  return (
    <Modal
      radius="none"
      size="3xl"
      isOpen={props.isOpen}
      onOpenChange={props.onOpenChange}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {t("update")}
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-2">
                <Controller
                  name="name"
                  control={control}
                  rules={{
                    required: t("{{label}} is required", {
                      label: t("name").toString(),
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
                      validationBehavior="aria"
                      isInvalid={invalid}
                      color="primary"
                      radius="none"
                      variant="bordered"
                      onBlur={onBlur}
                      name={name}
                      value={value}
                      onChange={onChange}
                      label={t("name").toString()}
                      placeholder={t("enter name").toString()}
                    />
                  )}
                />

                <div className="flex gap-2 items-center">
                  <Controller
                    name="price"
                    control={control}
                    rules={{
                      required: t("{{label}} is required", {
                        label: t("price").toString(),
                      }).toString(),
                      min: {
                        value: 1000,
                        message: t(
                          "{{label}} must be greater than or equal to {{value}}",
                          {
                            label: t("price").toString(),
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
                        value={(value ?? "").toString()}
                        onChange={onChange}
                        label={t("price").toString()}
                        placeholder={t("enter price").toString()}
                      />
                    )}
                  />

                  <Controller
                    name="init_stock"
                    control={control}
                    rules={{
                      required: t("{{label}} is required", {
                        label: t("initial stock").toString(),
                      }).toString(),
                      min: {
                        value: 1,
                        message: t(
                          "{{label}} must be greater than or equal to {{value}}",
                          {
                            label: t("initial stock").toString(),
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
                        value={(value ?? "").toString()}
                        onChange={onChange}
                        label={t("initial stock").toString()}
                        placeholder={t("enter initial stock").toString()}
                      />
                    )}
                  />
                </div>

                <div className="flex items-center">
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
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                radius="none"
                fullWidth
                color="primary"
                className="py-6"
                onClick={handleSubmit(onSubmit)}
              >
                {t("confirm")}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
