import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Input,
  Select,
  SelectItem,
} from "@heroui/react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { getI18n, useTranslation } from "react-i18next";
import { MdOutlineDriveFolderUpload } from "react-icons/md";
import { useQuery } from "@tanstack/react-query";
import { ICategory, IKeyword, IProvince, IResponseData } from "../../types";
import axios from "axios";
import useAxiosIns from "../../hooks/useAxiosIns";
import { useRef } from "react";

type EventInformationStepInputs = {
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

export default function InformationStep() {
  const { handleSubmit, control, watch } =
    useForm<EventInformationStepInputs>();

  const { t } = useTranslation();
  const i18n = getI18n();
  const quillRef = useRef<ReactQuill>(null);
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

  const onSubmit: SubmitHandler<EventInformationStepInputs> = async (data) => {
    console.log(data);
  };

  return (
    <div className="flex flex-col gap-2">
      <Card radius="none" shadow="sm" className="p-4">
        <CardHeader className="py-0">
          <div className="text-lg font-semibold">{t("assets")}</div>
        </CardHeader>
        <CardBody className="flex flex-col gap-2">
          <div className="flex items-center w-full justify-center gap-2 h-96">
            <div className="flex flex-col items-center justify-center h-full w-72 border-2 border-dashed hover:bg-gray-100 border-gray-300 rounded-none cursor-pointer transition-all duration-200">
              <MdOutlineDriveFolderUpload className="text-4xl text-secondary-200 mt-2" />
              <div className="text-sm text-default-500 mt-2">
                {t("add logo image")}
              </div>
            </div>
            <div className="h-full flex-1 flex flex-col items-center justify-center border-2 border-dashed hover:bg-gray-100 border-gray-300 rounded-none cursor-pointer transition-all duration-200">
              <MdOutlineDriveFolderUpload className="text-4xl text-secondary-200 mt-2" />
              <div className="text-sm text-default-500 mt-2">
                {t("add background image")}
              </div>
            </div>
          </div>
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
        <CardHeader className="py-0">
          <div className="text-lg font-semibold">{t("discovery")}</div>
        </CardHeader>
        <CardBody className="flex flex-col gap-2">
          <Controller
            name="categoryIds"
            control={control}
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
              <Select
                ref={ref}
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
                items={[] as IKeyword[]}
                onChange={onChange}
                label={t("keyword").toString()}
                placeholder={t("enter {{label}}", {
                  label: t("keyword").toString().toLowerCase(),
                }).toString()}
              >
                {(keyword) => (
                  <SelectItem>
                    {i18n.resolvedLanguage === "en"
                      ? keyword.name_en
                      : keyword.name_vi}
                  </SelectItem>
                )}
              </Select>
            )}
          />
        </CardBody>
      </Card>

      <Card radius="none" shadow="sm" className="p-4">
        <CardHeader className="py-0">
          <div className="text-lg font-semibold">{t("description")}</div>
        </CardHeader>
        <CardBody className="flex flex-col gap-2 min-h-[20rem]">
          {/* {currentFileSource && (
              <ImagePickerEditor
                isOpen={isImagePickerModalOpen}
                onClose={onImagePickerModalClose}
                source={currentFileSource}
                onSave={handleImagePickerSave}
              />
            )} */}
          <ReactQuill
            ref={quillRef}
            placeholder={t("enter {{label}}", {
              label: t("description").toString().toLowerCase(),
            }).toString()}
            theme="snow"
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
                //   handlers: {
                //     image: imageUploadHandler,
                //   },
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
        </CardBody>
      </Card>
    </div>
  );
}
