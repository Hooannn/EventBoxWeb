import { Controller, SubmitHandler, useForm } from "react-hook-form";
import useAuthStore from "../../stores/auth";
import useAxiosIns from "../../hooks/useAxiosIns";
import { onError } from "../../utils/error-handlers";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { IResponseData, IUser } from "../../types";
import { addToast, Avatar, Button, Input } from "@heroui/react";
import { useState } from "react";
import { MdOutlineClose } from "react-icons/md";
import { getUserAvatar } from "../../utils";
type UpdateInformationInputs = {
  first_name: string;
  last_name: string;
  avatar_base64?: string;
  remove_avatar: boolean;
};
export default function InformationTab() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const { handleSubmit, control } = useForm<UpdateInformationInputs>({
    defaultValues: {
      first_name: user!.first_name,
      last_name: user!.last_name,
      avatar_base64: "",
      remove_avatar: false,
    },
  });
  const axios = useAxiosIns();

  const onSubmit: SubmitHandler<UpdateInformationInputs> = async (data) => {
    data.remove_avatar = false;
    if (avatarBase64) {
      if (avatarBase64 !== getUserAvatar(user)) {
        data.avatar_base64 = avatarBase64;
      } else {
        delete data.avatar_base64;
      }
    } else {
      if (getUserAvatar(user)) {
        data.remove_avatar = true;
      }
      delete data.avatar_base64;
    }
    await updateMutation.mutateAsync(data);
  };

  const updateMutation = useMutation({
    mutationFn: (params: UpdateInformationInputs) =>
      axios.put<IResponseData<unknown>>("/v1/users/me/update", params),
    onError,
    onSuccess: async (res) => {
      addToast({
        title: t("success"),
        description: t(res.data.message),
        timeout: 4000,
        radius: "none",
        color: "success",
      });
      const userRes = await getUserInfoMutation.mutateAsync();
      useAuthStore.setState({ user: userRes.data.data });
    },
  });

  const getUserInfoMutation = useMutation({
    mutationFn: () => axios.get<IResponseData<IUser>>("/v1/users/me"),
    onError,
  });

  const [avatarBase64, setAvatarBase64] = useState<string | null>(
    getUserAvatar(user) ?? null
  );
  return (
    <div>
      <div className="w-1/2 h-full flex gap-4 mx-auto">
        <div className="flex flex-col gap-2 w-full">
          <div className="relative mx-auto">
            {avatarBase64 && (
              <div className="absolute -right-1 -top-1 z-10">
                <Button
                  onPress={() => {
                    setAvatarBase64("");
                    const file = document.getElementById(
                      "user-avatar"
                    ) as HTMLInputElement;
                    file.value = "";
                  }}
                  size="sm"
                  color="danger"
                  radius="full"
                  isIconOnly
                >
                  <MdOutlineClose />
                </Button>
              </div>
            )}
            <Avatar
              className="w-20 h-20 cursor-pointer"
              isBordered
              src={avatarBase64 ?? undefined}
              color="secondary"
              name={user?.first_name}
              showFallback
              onClick={() => document.getElementById("user-avatar")?.click()}
            />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    if (e.target?.result) {
                      setAvatarBase64(e.target.result as string);
                    }
                  };
                  reader.readAsDataURL(file);
                }
              }}
              id="user-avatar"
            />
          </div>
          <Controller
            name="last_name"
            control={control}
            rules={{
              required: t("last name is required").toString(),
            }}
            render={({
              field: { name, value, onChange, onBlur, ref },
              fieldState: { invalid, error },
            }) => (
              <Input
                ref={ref}
                isRequired
                errorMessage={error?.message}
                isInvalid={invalid}
                color="primary"
                label={t("last name")}
                radius="none"
                variant="bordered"
                placeholder={t("enter your last name").toString()}
                onBlur={onBlur}
                name={name}
                value={value}
                onChange={onChange}
              />
            )}
          />

          <Controller
            name="first_name"
            control={control}
            rules={{
              required: t("first name is required").toString(),
            }}
            render={({
              field: { name, value, onChange, onBlur, ref },
              fieldState: { invalid, error },
            }) => (
              <Input
                ref={ref}
                isRequired
                errorMessage={error?.message}
                isInvalid={invalid}
                color="primary"
                label={t("first name")}
                radius="none"
                variant="bordered"
                placeholder={t("enter your first name").toString()}
                onBlur={onBlur}
                name={name}
                value={value}
                onChange={onChange}
              />
            )}
          />

          <Button
            isLoading={
              updateMutation.isPending || getUserInfoMutation.isPending
            }
            color="primary"
            radius="none"
            onClick={handleSubmit(onSubmit)}
            className="py-6"
          >
            Cập nhật
          </Button>
        </div>
      </div>
    </div>
  );
}
