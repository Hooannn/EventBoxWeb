import {
  Button,
  Card,
  DatePicker,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
  useDisclosure,
} from "@heroui/react";
import { CreateTicketTypeInputs } from "./CreateTicketTypeModal";
import {
  MdOutlineCalendarToday,
  MdOutlineClose,
  MdOutlineDelete,
  MdOutlineDriveFolderUpload,
  MdOutlineEdit,
} from "react-icons/md";
import { IoTicketOutline } from "react-icons/io5";
import { useTranslation } from "react-i18next";
import { dateFormat, priceFormat } from "../../utils";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { now, getLocalTimeZone } from "@internationalized/date";
import { useState, useMemo, useEffect } from "react";
import ImagePickerEditor, {
  SavedImageData,
} from "../../components/ImagePickerEditor";

export default function TicketTypeCard(props: {
  ticketType: CreateTicketTypeInputs;
  onDelete: () => void;
  onUpdate: (ticketType: CreateTicketTypeInputs) => void;
  showStartTime: DateValue;
  showEndTime: DateValue;
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
        showStartTime={props.showStartTime}
        showEndTime={props.showEndTime}
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
              {t("price")}: {priceFormat(props.ticketType.price)}
            </div>
            <div className="text-xs text-secondary-600">
              {t("initial stock")}: {props.ticketType.init_stock}
            </div>
          </div>
          <div className="flex flex-row items-center gap-2">
            <div className="text-xs text-secondary-600">
              ({t("sale start time")}{" "}
              <span className="font-semibold text-secondary-500">
                {dateFormat(props.ticketType.sale_start_time)}
              </span>{" "}
              {t("to").toLowerCase()}{" "}
              <span className="font-semibold text-secondary-500">
                {dateFormat(props.ticketType.sale_end_time)}
              </span>
              )
            </div>
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
  showStartTime: DateValue;
  showEndTime: DateValue;
}) {
  const { t } = useTranslation();

  const [logoFile, setLogoFile] = useState<SavedImageData | null>(
    props.ticketType.logo_file ?? null
  );

  const { handleSubmit, control, reset, watch } =
    useForm<CreateTicketTypeInputs>({
      defaultValues: {
        ...props.ticketType,
      },
    });

  const watchSaleStartTime = watch("sale_start_time");
  const watchSaleEndTime = watch("sale_end_time");

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
                        if (value > props.showEndTime) {
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
                        if (value > props.showEndTime) {
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

                <div className="flex items-center gap-2">
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
                  <div className="h-[102px] flex flex-col gap-1">
                    <div className="text-xs">{t("ticket image")}</div>
                    <div className="flex-1">
                      <UploadLogo
                        file={logoFile}
                        onChange={(logoBase64) => {
                          console.log("Logo base64:", logoBase64);
                        }}
                        error={undefined}
                      />
                    </div>
                  </div>
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

function UploadLogo({
  file,
  onChange,
  error,
}: {
  file: SavedImageData | null;
  onChange?: (data: SavedImageData | null) => void;
  error?: string | null;
}) {
  const { t } = useTranslation();
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [finalFile, setFinalFile] = useState<SavedImageData | null>(null);

  useEffect(() => {
    if (file) {
      setFinalFile(file);
    }
  }, [file]);

  const {
    isOpen: isImagePickerModalOpen,
    onOpen: onImagePickerModalOpen,
    onClose: onImagePickerModalClose,
  } = useDisclosure();

  const handleImagePickerSave = async (data: SavedImageData) => {
    onImagePickerModalClose();
    setCurrentFile(null);
    setFinalFile(data);
  };

  const currentFileSource = useMemo(
    () => (currentFile ? URL.createObjectURL(currentFile) : ""),
    [currentFile]
  );

  const imageUploadHandler = () => {
    setCurrentFile(null);
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();
    input.onchange = async () => {
      if (input !== null && input.files !== null) {
        const file = input.files[0];
        setCurrentFile(file);
        onImagePickerModalOpen();
      }
    };
  };

  useEffect(() => {
    onChange?.(finalFile);
  }, [finalFile]);
  return (
    <>
      {currentFileSource && (
        <ImagePickerEditor
          isOpen={isImagePickerModalOpen}
          onClose={onImagePickerModalClose}
          source={currentFileSource}
          onSave={handleImagePickerSave}
        />
      )}
      <div
        onClick={imageUploadHandler}
        className={`relative flex flex-col items-center justify-center h-full w-48 border-2 border-dashed hover:bg-gray-100 ${
          error ? "border-danger-300" : "border-gray-300"
        }  rounded-none cursor-pointer transition-all duration-200`}
      >
        {finalFile ? (
          <>
            <Image
              className="object-contain w-full h-full"
              removeWrapper
              radius="none"
              src={finalFile.imageBase64}
            />
            <Button
              size="sm"
              radius="none"
              color="danger"
              variant="flat"
              onPress={() => {
                setCurrentFile(null);
                setFinalFile(null);
              }}
              isIconOnly
              className="absolute top-0 right-0 z-10"
            >
              <MdOutlineClose />
            </Button>
          </>
        ) : (
          <>
            <MdOutlineDriveFolderUpload className="text-4xl text-secondary-200 mt-2" />
            <div className="text-xs text-default-500 mt-2">
              {t("add ticket image")}
            </div>
          </>
        )}
      </div>
    </>
  );
}
