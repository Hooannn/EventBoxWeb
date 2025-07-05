import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosIns from "../../hooks/useAxiosIns";
import {
  IOrganization,
  IOrganizationRole,
  IResponseData,
  IUser,
} from "../../types";
import { useNavigate, useParams } from "react-router";
import {
  addToast,
  Avatar,
  Button,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pagination,
  Spinner,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tabs,
  Textarea,
  useDisclosure,
  User,
} from "@heroui/react";
import { Key, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { onError } from "../../utils/error-handlers";
import {
  MdAttachFile,
  MdDeleteOutline,
  MdKeyboardArrowDown,
  MdOutlineClose,
  MdOutlineCorporateFare,
  MdOutlineMail,
  MdOutlinePhone,
  MdOutlineSearch,
} from "react-icons/md";
import {
  getOrganizationLogo,
  getUserAvatar,
  isOwner,
  organizationRoleColors,
} from "../../utils";
import AddMemberModal from "./AddMemberModal";
import MemberCellActions from "./MemberCellActions";
import useAuthStore from "../../stores/auth";
type UpdateOrganizationInputs = {
  name: string;
  description: string;
  paypal_account: string;
  phone?: string;
  website?: string;
  email?: string;
  logo_base64?: string;
  remove_logo: boolean;
};

export function DeleteOrganizationModal(props: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  organizationId: string;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const axios = useAxiosIns();
  const deleteOrgMutation = useMutation({
    mutationFn: () =>
      axios.delete<IResponseData<boolean>>(
        `/v1/organizations/${props.organizationId}`
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
      navigate("/");
    },
  });
  return (
    <Modal
      radius="none"
      isOpen={props.isOpen}
      onOpenChange={props.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {t("confirm")}
            </ModalHeader>
            <ModalBody>
              {t("you are about to delete an organization")}
              <br />
              {t("this action cannot be undone")}
            </ModalBody>
            <ModalFooter>
              <Button
                isLoading={deleteOrgMutation.isPending}
                color="default"
                variant="light"
                radius="none"
                onPress={onClose}
              >
                {t("cancel")}
              </Button>
              <Button
                isLoading={deleteOrgMutation.isPending}
                radius="none"
                color="danger"
                onPress={() => {
                  deleteOrgMutation.mutate();
                }}
              >
                {t("delete")}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

export default function OrganizationSettingsPage() {
  const params = useParams();
  const getOrganizationQuery = useQuery({
    queryKey: ["fetch/organization/id", params.id],
    queryFn: () =>
      axios.get<IResponseData<IOrganization>>(`/v1/organizations/${params.id}`),
    refetchOnWindowFocus: false,
  });

  const { user: currentUser } = useAuthStore();

  const [activeTab, setActiveTab] = useState<Key>("information");

  const organization = getOrganizationQuery.data?.data?.data;

  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { handleSubmit, control } = useForm<UpdateOrganizationInputs>();
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const axios = useAxiosIns();

  const roleOptions = () => [
    { name: t("owner"), uid: "OWNER" },
    { name: t("manager"), uid: "MANAGER" },
    { name: t("staff"), uid: "STAFF" },
  ];

  const updateOrgMutation = useMutation({
    mutationFn: (body: UpdateOrganizationInputs) =>
      axios.put<IResponseData<boolean>>(`/v1/organizations/${params.id}`, body),
    onError,
    onSuccess(data) {
      addToast({
        title: t("success"),
        description: t(data.data.message),
        timeout: 4000,
        radius: "none",
        color: "success",
      });
      queryClient.invalidateQueries({
        queryKey: ["fetch/organization/id", params.id],
      });
    },
  });

  const onSubmit: SubmitHandler<UpdateOrganizationInputs> = async (data) => {
    data.remove_logo = false;
    if (logoBase64) {
      if (logoBase64 !== getOrganizationLogo(organization)) {
        data.logo_base64 = logoBase64;
      } else {
        delete data.logo_base64;
      }
    } else {
      if (getOrganizationLogo(organization)) {
        data.remove_logo = true;
      }
      delete data.logo_base64;
    }

    updateOrgMutation.mutate(data);
  };

  useEffect(() => {
    setLogoBase64(getOrganizationLogo(organization) ?? null);
  }, [organization]);

  const {
    onClose: onDeleteOrganizationModalClose,
    isOpen: isDeleteOrganizationModalOpen,
    onOpen: onDeleteOrganizationModalOpen,
    onOpenChange: onDeleteOrganizationModalOpenChange,
  } = useDisclosure();

  const {
    onClose: onAddMemberModalClose,
    isOpen: isAddMemberModalOpen,
    onOpen: onAddMemberModalOpen,
    onOpenChange: onAddMemberModalOpenChange,
  } = useDisclosure();

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState(
    new Set<string>(["OWNER", "MANAGER", "STAFF"])
  );

  const filterMembers = () => {
    const data = organization?.user_organizations ?? [];

    const filteredByRole = data.filter((item) => roleFilter.has(item.role));

    const filteredBySearchTerm = filteredByRole.filter((item) => {
      const user = item.user;
      return (
        user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${user.first_name} ${user.last_name}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

    return filteredBySearchTerm;
  };

  const showDeleteButton = (
    user: IUser,
    organization?: IOrganization
  ): boolean => {
    if (!currentUser || !organization) return false;

    return isOwner(currentUser, organization) && !isOwner(user, organization);
  };

  const tableItems = filterMembers().slice((page - 1) * 10, page * 10);

  const renderCell = useCallback(
    (
      user: IUser,
      item: unknown,
      columnKey: unknown,
      organization?: IOrganization
    ) => {
      const cellValue = (item as never)[columnKey as never];

      switch (columnKey) {
        case "name":
          return (
            <User
              avatarProps={{
                isBordered: true,
                showFallback: true,
                color: "secondary",
                name: user?.first_name,
                className: "transition-transform mr-1",
                src: getUserAvatar(user),
              }}
              description={user.email}
              name={cellValue}
            >
              {user.email}
            </User>
          );
        case "role":
          return (
            <Chip
              size="sm"
              radius="none"
              color={organizationRoleColors[cellValue]}
            >
              {t((cellValue as string).toLowerCase())}
            </Chip>
          );
        case "actions":
          return (
            <MemberCellActions
              organizationId={params.id ?? ""}
              user={user}
              role={(item as { role: IOrganizationRole }).role}
              showDeleteButton={showDeleteButton(user, organization)}
              onActionDone={() => {
                queryClient.invalidateQueries({
                  queryKey: ["fetch/organization/id", params.id],
                });
              }}
            />
          );
        default:
          return cellValue;
      }
    },
    []
  );
  return (
    <div className="flex h-full w-full flex-col space-y-4 p-4">
      <DeleteOrganizationModal
        isOpen={isDeleteOrganizationModalOpen}
        onOpenChange={onDeleteOrganizationModalOpenChange}
        organizationId={params.id ?? ""}
        onClose={onDeleteOrganizationModalClose}
      />
      {getOrganizationQuery.isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          <div>
            <Tabs
              size="md"
              color="primary"
              variant="underlined"
              radius="none"
              selectedKey={activeTab as never}
              onSelectionChange={setActiveTab as (key: Key) => void}
            >
              <Tab
                className="min-w-[150px]"
                key="information"
                title={
                  <div className="flex items-center space-x-2">
                    <span>{t("information")}</span>
                  </div>
                }
              >
                <div className="flex items-center pt-8">
                  <div className="w-1/3 flex justify-center items-center">
                    <div className="flex flex-col gap-4 items-center">
                      <div className="relative">
                        {logoBase64 && (
                          <div className="absolute right-2 top-2 z-10">
                            <Button
                              onPress={() => {
                                setLogoBase64("");
                                const file = document.getElementById(
                                  "organization-logo"
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
                          className="w-48 h-48 text-large"
                          isBordered
                          src={logoBase64 ?? undefined}
                          color="secondary"
                          fallback={<MdOutlineCorporateFare size={100} />}
                        />
                      </div>

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
                                setLogoBase64(e.target.result as string);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        id="organization-logo"
                      />
                      <Button
                        radius="none"
                        color="secondary"
                        variant="bordered"
                        onPress={() =>
                          document.getElementById("organization-logo")?.click()
                        }
                      >
                        <MdAttachFile />
                        {t("upload logo")}
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 w-2/3">
                    <Controller
                      name="name"
                      defaultValue={organization?.name}
                      control={control}
                      rules={{
                        required: t("name is required").toString(),
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
                          placeholder={t("enter org's name").toString()}
                        />
                      )}
                    />

                    <Controller
                      name="description"
                      defaultValue={organization?.description}
                      control={control}
                      rules={{
                        required: t("description is required").toString(),
                      }}
                      render={({
                        field: { name, value, onChange, onBlur, ref },
                        fieldState: { invalid, error },
                      }) => (
                        <Textarea
                          ref={ref}
                          isRequired
                          color="primary"
                          variant="bordered"
                          radius="none"
                          isInvalid={invalid}
                          onChange={onChange}
                          onBlur={onBlur}
                          name={name}
                          errorMessage={error?.message}
                          label={t("description")}
                          placeholder={t("enter org's description").toString()}
                          value={value}
                        />
                      )}
                    />

                    <Controller
                      name="paypal_account"
                      control={control}
                      defaultValue={organization?.paypal_account}
                      rules={{
                        required: t("paypal account is required").toString(),
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                          message: t("invalid email address").toString(),
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
                          color="primary"
                          radius="none"
                          variant="bordered"
                          description={t(
                            "note: this is the paypal account you will use to receive payments"
                          )}
                          onBlur={onBlur}
                          name={name}
                          value={value}
                          onChange={onChange}
                          label={t("paypal account email").toString()}
                          placeholder={t(
                            "enter org's paypal account email"
                          ).toString()}
                        />
                      )}
                    />

                    <Controller
                      name="phone"
                      control={control}
                      defaultValue={organization?.phone ?? undefined}
                      render={({
                        field: { name, value, onChange, onBlur, ref },
                        fieldState: { invalid, error },
                      }) => (
                        <Input
                          ref={ref}
                          errorMessage={error?.message}
                          validationBehavior="aria"
                          startContent={
                            <MdOutlinePhone className="text-xl text-default-400 pointer-events-none flex-shrink-0" />
                          }
                          isInvalid={invalid}
                          radius="none"
                          color="primary"
                          label={t("phone number")}
                          variant="bordered"
                          placeholder={t("enter org's phone number").toString()}
                          onBlur={onBlur}
                          name={name}
                          value={value}
                          onChange={onChange}
                        />
                      )}
                      rules={{
                        minLength: {
                          value: 8,
                          message: t("invalid phone number").toString(),
                        },
                        maxLength: {
                          value: 10,
                          message: t("invalid phone number").toString(),
                        },
                        pattern: {
                          value: /^[0-9]*$/,
                          message: t("invalid phone number").toString(),
                        },
                      }}
                    />
                    <Controller
                      name="email"
                      control={control}
                      defaultValue={organization?.email ?? undefined}
                      render={({
                        field: { name, value, onChange, onBlur, ref },
                        fieldState: { invalid, error },
                      }) => (
                        <Input
                          ref={ref}
                          startContent={
                            <MdOutlineMail className="text-xl text-default-400 pointer-events-none flex-shrink-0" />
                          }
                          errorMessage={error?.message}
                          validationBehavior="aria"
                          isInvalid={invalid}
                          radius="none"
                          color="primary"
                          label={"Email"}
                          variant="bordered"
                          placeholder={t("enter org's email").toString()}
                          onBlur={onBlur}
                          name={name}
                          value={value}
                          onChange={onChange}
                        />
                      )}
                      rules={{
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                          message: t("invalid email address").toString(),
                        },
                      }}
                    />

                    <Controller
                      name="website"
                      control={control}
                      defaultValue={organization?.website ?? undefined}
                      render={({
                        field: { name, value, onChange, onBlur, ref },
                        fieldState: { invalid, error },
                      }) => (
                        <Input
                          ref={ref}
                          errorMessage={error?.message}
                          validationBehavior="aria"
                          isInvalid={invalid}
                          startContent={
                            <div className="pointer-events-none flex items-center">
                              <span className="text-default-400 text-small">
                                https://
                              </span>
                            </div>
                          }
                          radius="none"
                          color="primary"
                          label={"Website"}
                          variant="bordered"
                          placeholder={t("enter org's website").toString()}
                          onBlur={onBlur}
                          name={name}
                          value={value}
                          onChange={onChange}
                        />
                      )}
                    />
                    <div className="flex gap-2 mt-4">
                      <Button
                        radius="none"
                        variant="bordered"
                        onPress={onDeleteOrganizationModalOpen}
                        color="danger"
                        className="w-40"
                        isLoading={updateOrgMutation.isPending}
                        size="lg"
                      >
                        <MdDeleteOutline />
                        {t("delete")}
                      </Button>
                      <Button
                        isLoading={updateOrgMutation.isPending}
                        onClick={handleSubmit(onSubmit)}
                        radius="none"
                        color="primary"
                        className="flex-1"
                        size="lg"
                      >
                        {t("update")}
                      </Button>
                    </div>
                  </div>
                </div>
              </Tab>

              <Tab
                className="min-w-[150px]"
                key="members"
                title={
                  <div className="flex items-center space-x-2">
                    <span>{t("members")}</span>
                  </div>
                }
              >
                <AddMemberModal
                  isOpen={isAddMemberModalOpen}
                  onOpenChange={onAddMemberModalOpenChange}
                  onClose={onAddMemberModalClose}
                  organizationId={params.id ?? ""}
                  onSuccess={() => {
                    queryClient.invalidateQueries({
                      queryKey: ["fetch/organization/id", params.id],
                    });
                  }}
                />
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="w-full max-w-[400px]">
                      <Input
                        radius="none"
                        color="primary"
                        variant="bordered"
                        value={searchTerm}
                        onValueChange={setSearchTerm}
                        startContent={
                          <MdOutlineSearch className="text-xl text-default-400 pointer-events-none flex-shrink-0" />
                        }
                        placeholder={t("search...").toString()}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Dropdown>
                        <DropdownTrigger>
                          <Button
                            endContent={
                              <MdKeyboardArrowDown className="text-small" />
                            }
                            variant="flat"
                            radius="none"
                            className="w-36"
                          >
                            {t("role")}
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                          disallowEmptySelection
                          closeOnSelect={false}
                          selectedKeys={roleFilter}
                          selectionMode="multiple"
                          onSelectionChange={setRoleFilter as never}
                        >
                          {roleOptions().map((role) => (
                            <DropdownItem key={role.uid} className="capitalize">
                              {role.name}
                            </DropdownItem>
                          ))}
                        </DropdownMenu>
                      </Dropdown>
                      <Button
                        radius="none"
                        color="secondary"
                        variant="solid"
                        onPress={onAddMemberModalOpen}
                        className="w-36"
                      >
                        {t("add member")}
                      </Button>
                    </div>
                  </div>
                  <Table
                    removeWrapper
                    cellPadding={20}
                    radius="none"
                    bottomContent={
                      filterMembers().length > 10 ? (
                        <div className="flex w-full justify-center">
                          <Pagination
                            isCompact
                            showShadow
                            color="primary"
                            page={page}
                            total={
                              filterMembers().length % 10 === 0
                                ? filterMembers().length / 10
                                : filterMembers().length / 10 + 1
                            }
                            onChange={(page) => setPage(page)}
                          />
                        </div>
                      ) : null
                    }
                  >
                    <TableHeader>
                      <TableColumn key="name">{t("member")}</TableColumn>
                      <TableColumn key="role">{t("role")}</TableColumn>
                      <TableColumn key="actions">{t("actions")}</TableColumn>
                    </TableHeader>
                    <TableBody
                      items={tableItems.map((item) => ({
                        ...item,
                        name: item.user.first_name + " " + item.user.last_name,
                        role: item.role,
                        email: item.user.email,
                      }))}
                      emptyContent={
                        getOrganizationQuery.isLoading ? undefined : (
                          <div>
                            <div>
                              <small>Hiện tại không có thành viên nào.</small>
                            </div>
                          </div>
                        )
                      }
                      loadingContent={<Spinner />}
                      loadingState={
                        getOrganizationQuery.isLoading ? "loading" : "idle"
                      }
                    >
                      {(item) => (
                        <TableRow key={item.email}>
                          {(columnKey) => (
                            <TableCell>
                              {renderCell(
                                item.user,
                                item,
                                columnKey,
                                organization
                              )}
                            </TableCell>
                          )}
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Tab>
            </Tabs>
          </div>
        </>
      )}
    </div>
  );
}
