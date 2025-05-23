import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Image,
  Input,
  Select,
  SelectItem,
  useDisclosure,
} from "@heroui/react";
import ReactQuill, { Range } from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { getI18n, useTranslation } from "react-i18next";
import { MdOutlineClose, MdOutlineDriveFolderUpload } from "react-icons/md";
import { useQuery } from "@tanstack/react-query";
import { ICategory, IKeyword, IProvince, IResponseData } from "../../types";
import axios from "axios";
import useAxiosIns from "../../hooks/useAxiosIns";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import ImagePickerEditor, {
  SavedImageData,
} from "../../components/ImagePickerEditor";

const DESC_PLACEHOLDER = `
    <p><strong>Giới thiệu sự kiện:</strong></p><p>[Tóm tắt ngắn gọn về sự kiện: Nội dung chính của sự kiện, điểm đặc sắc nhất và lý do khiến người tham gia không nên bỏ lỡ]</p><p><strong>Chi tiết sự kiện:</strong></p><ul><li><strong>Chương trình chính:</strong> [Liệt kê những hoạt động nổi bật trong sự kiện: các phần trình diễn, khách mời đặc biệt, lịch trình các tiết mục cụ thể nếu có.]</li><li><strong>Khách mời:</strong> [Thông tin về các khách mời đặc biệt, nghệ sĩ, diễn giả sẽ tham gia sự kiện. Có thể bao gồm phần mô tả ngắn gọn về họ và những gì họ sẽ mang lại cho sự kiện.]</li><li><strong>Trải nghiệm đặc biệt:</strong> [Nếu có các hoạt động đặc biệt khác như workshop, khu trải nghiệm, photo booth, khu vực check-in hay các phần quà/ưu đãi dành riêng cho người tham dự.]</li></ul><p><strong>Điều khoản và điều kiện:</strong></p><p>[TnC] sự kiện</p><p>Lưu ý về điều khoản trẻ em</p><p>Lưu ý về điều khoản VAT</p>
`;

export type EventInformationStepInputs = {
  logo_base64: string;
  background_base64: string;
  title: string;
  description: string;
  place: string;
  address: string;
  city: string;
  street: string;
  district: string;
  ward: string;
  categoryIds: string;
  keywords: string;
};

export interface InformationStepHandles {
  submit: () => Promise<EventInformationStepInputs>;
}

export interface InformationStepProps {}

const InformationStep = forwardRef<
  InformationStepHandles,
  InformationStepProps
>((props, ref) => {
  const { handleSubmit, control, watch } =
    useForm<EventInformationStepInputs>();

  const [logoFile, setLogoFile] = useState<SavedImageData | null>(null);
  const [backgroundFile, setBackgroundFile] = useState<SavedImageData | null>(
    null
  );
  const [assetError, setAssetError] = useState<string | null>(null);
  const { t } = useTranslation();
  const i18n = getI18n();
  const toolbar = document.querySelector(".ql-toolbar.ql-snow");
  const toolbarRect = toolbar?.getBoundingClientRect();
  const toolbarHeight = toolbarRect ? toolbarRect.height : 0;

  const axiosIns = useAxiosIns();

  const getEventCategoriesQuery = useQuery({
    queryKey: ["fetch/event/categories"],
    queryFn: () => axiosIns.get<IResponseData<ICategory[]>>("/v1/categories/"),
    refetchOnWindowFocus: false,
  });
  const categories = getEventCategoriesQuery.data?.data?.data || [];

  const getProvincesQuery = useQuery({
    queryKey: ["fetch/external/provinces"],
    queryFn: () => axios.get<IProvince[]>("/public/locations/all-in-one.json"),
    refetchOnWindowFocus: false,
  });

  const provinces = getProvincesQuery.data?.data || [];
  const selectProvince = watch("city");
  const selectDistrict = watch("district");

  const getDistricts = () => {
    if (!selectProvince) return [];
    return provinces.find(
      (province) => province.code.toString() === selectProvince
    )?.districts;
  };

  const getWards = () => {
    if (!selectDistrict) return [];
    return getDistricts()?.find(
      (district) => district.code.toString() === selectDistrict
    )?.wards;
  };

  useImperativeHandle(ref, () => ({
    submit: () => {
      if (!logoFile || !backgroundFile) {
        setAssetError(t("please upload logo and background image"));
        return Promise.reject();
      }
      return new Promise((resolve, reject) => {
        handleSubmit(
          (data) => {
            if (logoFile?.imageBase64) data.logo_base64 = logoFile.imageBase64;
            if (backgroundFile?.imageBase64)
              data.background_base64 = backgroundFile.imageBase64;

            data.description = description;
            data.address = `${data.street}, ${
              getWards()?.find((ward) => ward.code.toString() === data.ward)
                ?.name
            }, ${
              getDistricts()?.find(
                (district) => district.code.toString() === data.district
              )?.name
            }, ${
              provinces?.find((p) => p.code.toString() === data.city)?.name
            }`;
            resolve(data);
          },
          (e) => {
            reject(e);
          }
        )();
      });
    },
  }));

  const quillRef = useRef<ReactQuill>(null);
  const [description, setDescription] = useState<string>(DESC_PLACEHOLDER);
  const [currentRange, setCurrentRange] = useState<Range | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const {
    isOpen: isImagePickerModalOpen,
    onOpen: onImagePickerModalOpen,
    onClose: onImagePickerModalClose,
  } = useDisclosure();

  const handleImagePickerSave = async (data: SavedImageData) => {
    console.log(data);
    onImagePickerModalClose();
    // const quill = quillRef.current;
    // quill?.focus();
    // if (currentRange) quill?.getEditor()?.setSelection(currentRange);
    // if (quill) {
    //   let attachment: Attachment | undefined;
    //   if (data.imageBase64) {
    //     const formData = new FormData();
    //     const file = await base64ToFile(
    //       data.imageBase64,
    //       data.name,
    //       data.mimeType
    //     );
    //     formData.append("file", file);
    //     const uploadRes = await uploadMutation.mutateAsync({ formData });
    //     attachment = uploadRes.data?.data;
    //   }

    //   if (attachment) {
    //     const newAttachments = [...attachments, attachment];
    //     onAttachmentsChange(newAttachments);
    //   }

    //   const range = quill.getEditor()?.getSelection();
    //   if (range) {
    //     quill.getEditor().insertEmbed(range.index, "image", attachment?.url);
    //     quill.getEditor().setSelection({
    //       index: range.index + 1,
    //       length: currentRange?.length || 0,
    //     });
    //   }
    // }
  };

  const imageUploadHandler = useCallback(() => {
    setCurrentFile(null);
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();
    input.onchange = async () => {
      if (input !== null && input.files !== null) {
        const file = input.files[0];
        setCurrentFile(file);
        const quill = quillRef.current;
        if (quill) {
          const range = quill.getEditor()?.getSelection();
          setCurrentRange(range);
        }
        onImagePickerModalOpen();
      }
    };
  }, []);

  const currentFileSource = useMemo(
    () => (currentFile ? URL.createObjectURL(currentFile) : ""),
    [currentFile]
  );
  return (
    <div className="flex flex-col gap-2">
      <Card radius="none" shadow="sm" className="p-4">
        <CardHeader className="py-0">
          <div className="text-lg font-semibold">{t("assets")}</div>
        </CardHeader>
        <CardBody className="flex flex-col gap-2">
          <div className="flex items-center w-full justify-center gap-2 h-96">
            <UploadLogo
              onChange={(file) => {
                setLogoFile(file);
                if (file) setAssetError(null);
              }}
              error={assetError}
            />
            <UploadBackground
              onChange={(file) => {
                setBackgroundFile(file);
                if (file) setAssetError(null);
              }}
              error={assetError}
            />
          </div>
          {assetError && (
            <span className="text-tiny text-danger -mt-1 pl-1">
              {assetError}
            </span>
          )}
          <Controller
            name="title"
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
                radius="none"
                validationBehavior="aria"
                isInvalid={invalid}
                color="primary"
                variant="bordered"
                onBlur={onBlur}
                name={name}
                value={value}
                onChange={onChange}
                label={t("name").toString()}
                placeholder={t("enter {{label}}", {
                  label: t("name").toString().toLowerCase(),
                }).toString()}
              />
            )}
          />
        </CardBody>
      </Card>

      <Card radius="none" shadow="sm" className="p-4">
        <CardHeader className="py-0">
          <div className="text-lg font-semibold">{t("place")}</div>
        </CardHeader>
        <CardBody className="flex flex-col gap-2">
          <Controller
            name="place"
            control={control}
            rules={{
              required: t("{{label}} is required", {
                label: t("place name").toString(),
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
                label={t("place name").toString()}
                placeholder={t("enter {{label}}", {
                  label: t("place name").toString().toLowerCase(),
                }).toString()}
              />
            )}
          />
          <div className="flex items-center gap-2">
            <Controller
              name="city"
              control={control}
              rules={{
                required: t("{{label}} is required", {
                  label: t("city").toString(),
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
                  isLoading={getProvincesQuery.isLoading}
                  validationBehavior="aria"
                  isInvalid={invalid}
                  color="primary"
                  variant="bordered"
                  onBlur={onBlur}
                  name={name}
                  value={value}
                  items={
                    provinces
                      ? provinces?.map((province) => ({
                          ...province,
                          key: province.code,
                        }))
                      : []
                  }
                  onChange={onChange}
                  label={t("city").toString()}
                  placeholder={t("enter {{label}}", {
                    label: t("city").toString().toLowerCase(),
                  }).toString()}
                >
                  {(province) => <SelectItem>{province.name}</SelectItem>}
                </Select>
              )}
            />
            <Controller
              name="district"
              control={control}
              rules={{
                required: t("{{label}} is required", {
                  label: t("district").toString(),
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
                  isLoading={getProvincesQuery.isLoading}
                  color="primary"
                  variant="bordered"
                  items={
                    getDistricts()
                      ? getDistricts()!.map((district) => ({
                          ...district,
                          key: district.code,
                        }))
                      : []
                  }
                  onBlur={onBlur}
                  name={name}
                  value={value}
                  onChange={onChange}
                  label={t("district").toString()}
                  placeholder={t("enter {{label}}", {
                    label: t("district").toString().toLowerCase(),
                  }).toString()}
                >
                  {(district) => <SelectItem>{district.name}</SelectItem>}
                </Select>
              )}
            />
          </div>

          <div className="flex items-center gap-2">
            <Controller
              name="ward"
              control={control}
              rules={{
                required: t("{{ward}} is required", {
                  ward: t("ward").toString(),
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
                  isLoading={getProvincesQuery.isLoading}
                  color="primary"
                  variant="bordered"
                  onBlur={onBlur}
                  items={
                    getWards()
                      ? getWards()!.map((ward) => ({
                          ...ward,
                          key: ward.code,
                        }))
                      : []
                  }
                  name={name}
                  value={value}
                  onChange={onChange}
                  label={t("ward").toString()}
                  placeholder={t("enter {{label}}", {
                    label: t("ward").toString().toLowerCase(),
                  }).toString()}
                >
                  {(ward) => <SelectItem>{ward.name}</SelectItem>}
                </Select>
              )}
            />
            <Controller
              name="street"
              control={control}
              rules={{
                required: t("{{label}} is required", {
                  label: t("street").toString(),
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
                  label={t("street").toString()}
                  placeholder={t("enter {{label}}", {
                    label: t("street").toString().toLowerCase(),
                  }).toString()}
                />
              )}
            />
          </div>
        </CardBody>
      </Card>

      <Card radius="none" shadow="sm" className="p-4">
        <CardHeader className="py-0 flex flex-col items-start">
          <div className="text-lg font-semibold">{t("discovery")}</div>
          <div className="text-xs text-default-500">
            {t("help users find your event")}
          </div>
        </CardHeader>
        <CardBody className="flex flex-col gap-2">
          <Controller
            name="categoryIds"
            control={control}
            rules={{
              required: t("{{label}} is required", {
                label: t("category").toString(),
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
                isLoading={getProvincesQuery.isLoading}
                validationBehavior="aria"
                isInvalid={invalid}
                color="primary"
                variant="bordered"
                isMultiline={true}
                selectionMode="multiple"
                onBlur={onBlur}
                name={name}
                value={value}
                items={categories?.map((category) => ({
                  ...category,
                  key: category.id,
                }))}
                onChange={onChange}
                renderValue={(items) => {
                  return (
                    <div className="flex flex-wrap gap-2">
                      {items.map((item) => (
                        <Chip key={item.key} variant="flat" color="secondary">
                          {i18n.resolvedLanguage === "en"
                            ? item.data?.name_en
                            : item.data?.name_vi}
                        </Chip>
                      ))}
                    </div>
                  );
                }}
                label={t("category").toString()}
                placeholder={t("enter {{label}}", {
                  label: t("category").toString().toLowerCase(),
                }).toString()}
              >
                {(category) => (
                  <SelectItem>
                    {i18n.resolvedLanguage === "en"
                      ? category.name_en
                      : category.name_vi}
                  </SelectItem>
                )}
              </Select>
            )}
          />
          <Controller
            name="keywords"
            control={control}
            render={({
              field: { name, value, onChange, onBlur, ref },
              fieldState: { invalid, error },
            }) => (
              <Input
                ref={ref}
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
                label={t("keyword").toString()}
                placeholder={t("enter {{label}}", {
                  label: t("keyword").toString().toLowerCase(),
                }).toString()}
                description={t("separate by comma")}
              />
            )}
          />
        </CardBody>
      </Card>

      <Card radius="none" shadow="sm" className="p-4">
        <CardHeader className="py-0">
          <div className="text-lg font-semibold">{t("description")}</div>
        </CardHeader>
        <CardBody className="flex flex-col gap-2">
          {currentFileSource && (
            <ImagePickerEditor
              isOpen={isImagePickerModalOpen}
              onClose={onImagePickerModalClose}
              source={currentFileSource}
              onSave={handleImagePickerSave}
            />
          )}
          <div
            className="w-full"
            style={{
              height: `calc(100% - 4rem - ${toolbarHeight}px)`,
            }}
          >
            <ReactQuill
              ref={quillRef}
              placeholder={t("enter {{label}}", {
                label: t("description").toString().toLowerCase(),
              }).toString()}
              theme="snow"
              defaultValue={DESC_PLACEHOLDER}
              value={description}
              onChange={(value) => {
                setDescription(value);
              }}
              modules={{
                toolbar: {
                  container: [
                    ["bold", "italic", "underline", "strike"],
                    ["blockquote", "code-block"],

                    [{ list: "ordered" }, { list: "bullet" }],
                    [{ indent: "-1" }, { indent: "+1" }],

                    [{ header: [1, 2, 3, 4, 5, 6, false] }],

                    ["link", "clean", "image", "video"],
                  ],
                  handlers: {
                    image: imageUploadHandler,
                  },
                },
              }}
              formats={[
                "header",
                "bold",
                "italic",
                "underline",
                "strike",
                "blockquote",
                "code-block",
                "list",
                "bullet",
                "indent",
                "link",
                "image",
                "video",
              ]}
            />
          </div>
        </CardBody>
      </Card>
    </div>
  );
});

export default InformationStep;

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
        className={`relative flex flex-col items-center justify-center h-full w-72 border-2 border-dashed hover:bg-gray-100 ${
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
            <div className="text-sm text-default-500 mt-2">
              {t("add logo image")}
            </div>
          </>
        )}
      </div>
    </>
  );
}

function UploadBackground({
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
        className={`relative h-full flex-1 flex flex-col items-center justify-center border-2 border-dashed hover:bg-gray-100 ${
          error ? "border-danger-300" : "border-gray-300"
        } border-gray-300 rounded-none cursor-pointer transition-all duration-200`}
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
            <div className="text-sm text-default-500 mt-2">
              {t("add background image")}
            </div>
          </>
        )}
      </div>
    </>
  );
}
