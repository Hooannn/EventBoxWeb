import { useTranslation } from "react-i18next";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
} from "@heroui/react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { CreateTicketTypeInputs } from "./shared.type";

export default function CreateTicketTypeModal(props: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  onSuccess: (params: CreateTicketTypeInputs) => void;
}) {
  const { t } = useTranslation();

  const { handleSubmit, control, reset } = useForm<CreateTicketTypeInputs>();

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
              {t("add ticket type")}
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
                        value={value}
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
                        value={value}
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
