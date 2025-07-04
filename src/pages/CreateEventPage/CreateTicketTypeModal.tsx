import { useTranslation } from "react-i18next";
import {
  Button,
  DatePicker,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  DateValue,
  Textarea,
  Image,
  useDisclosure,
} from "@heroui/react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import {
  MdOutlineCalendarToday,
  MdOutlineClose,
  MdOutlineDriveFolderUpload,
} from "react-icons/md";
import { getLocalTimeZone, now } from "@internationalized/date";
import { useEffect, useMemo, useState } from "react";
import ImagePickerEditor, {
  SavedImageData,
} from "../../components/ImagePickerEditor";

export type CreateTicketTypeInputs = {
  temp_id: string;
  name: string;
  price: number;
  init_stock: number;
  sale_start_time: DateValue;
  sale_end_time: DateValue;
  description?: string;
  logo_file?: SavedImageData;
};
export default function CreateTicketTypeModal(props: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  onSuccess: (params: CreateTicketTypeInputs) => void;
  showStartTime: DateValue;
  showEndTime: DateValue;
}) {
  const { t } = useTranslation();

  const [logoFile, setLogoFile] = useState<SavedImageData | null>(null);

  const { handleSubmit, control, reset, watch } =
    useForm<CreateTicketTypeInputs>();

  const watchSaleStartTime = watch("sale_start_time");
  const watchSaleEndTime = watch("sale_end_time");

  const onSubmit: SubmitHandler<CreateTicketTypeInputs> = async (data) => {
    data.temp_id = crypto.randomUUID();
    data.logo_file = logoFile ?? undefined;
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
                    <div className="h-[82px]">
                      <UploadLogo
                        onChange={(image) => {
                          setLogoFile(image);
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
  onChange,
  error,
}: {
  onChange?: (data: SavedImageData | null) => void;
  error?: string | null;
}) {
  const { t } = useTranslation();
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [finalFile, setFinalFile] = useState<SavedImageData | null>(null);
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
