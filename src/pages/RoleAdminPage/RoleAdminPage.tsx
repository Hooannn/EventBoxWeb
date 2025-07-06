import {
  Button,
  Chip,
  Input,
  Pagination,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from "@heroui/react";
import { t } from "i18next";
import { useCallback, useState } from "react";
import { MdOutlineSearch } from "react-icons/md";
import { IResponseData, IRole } from "../../types";
import useAxiosIns from "../../hooks/useAxiosIns";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "../../libs/dayjs";
import RoleCellActions from "./RoleCellActions";
import AddRoleModal from "./AddRoleModal";

export default function RoleAdminPage() {
  const axios = useAxiosIns();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const queryClient = useQueryClient();

  const getRolesQuery = useQuery({
    queryKey: ["fetch/users/roles"],
    queryFn: () => axios.get<IResponseData<IRole[]>>(`/v1/users/roles`),
    refetchOnWindowFocus: false,
  });

  const roles = getRolesQuery.data?.data?.data ?? [];

  const filterRoles = () => {
    const filteredBySearchTerm = roles.filter((role) => {
      return (
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.id.toString().includes(searchTerm)
      );
    });

    return filteredBySearchTerm;
  };

  const tableItems = filterRoles().slice((page - 1) * 10, page * 10);

  const renderCell = useCallback((role: IRole, columnKey: unknown) => {
    const cellValue = (role as never)[columnKey as never];

    switch (columnKey) {
      case "created_at":
        return dayjs(cellValue).format("DD/MM/YYYY HH:mm:ss");
      case "permissions":
        return (
          <>
            {role.permissions.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {role.permissions.map((p) => (
                  <Chip key={p.id} variant="flat" color="secondary" size="sm">
                    {p.name}
                  </Chip>
                ))}
              </div>
            ) : (
              <span className="text-xs">{t("no data")}</span>
            )}
          </>
        );
      case "actions":
        return (
          <RoleCellActions
            role={role}
            onActionDone={() => {
              queryClient.invalidateQueries({
                queryKey: ["fetch/users/roles"],
              });
            }}
          />
        );
      default:
        return cellValue ?? <span className="text-xs">{t("no data")}</span>;
    }
  }, []);

  const {
    onClose: onCreateModalClose,
    isOpen: isCreateModalOpen,
    onOpen: onCreateModalOpen,
    onOpenChange: onCreateModalOpenChange,
  } = useDisclosure();

  return (
    <>
      <AddRoleModal
        isOpen={isCreateModalOpen}
        onSuccess={() => {
          queryClient.invalidateQueries({
            queryKey: ["fetch/users/roles"],
          });
        }}
        onOpenChange={onCreateModalOpenChange}
        onClose={onCreateModalClose}
      />
      <div className="flex h-full w-full flex-col space-y-4 p-4">
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
              <Button
                radius="none"
                color="secondary"
                variant="solid"
                className="w-36"
                onPress={onCreateModalOpen}
              >
                {t("add")}
              </Button>
            </div>
          </div>
          <Table
            removeWrapper
            cellPadding={20}
            radius="none"
            bottomContent={
              filterRoles().length > 10 ? (
                <div className="flex w-full justify-center">
                  <Pagination
                    isCompact
                    showShadow
                    color="primary"
                    page={page}
                    total={
                      filterRoles().length % 10 === 0
                        ? filterRoles().length / 10
                        : filterRoles().length / 10 + 1
                    }
                    onChange={(page) => setPage(page)}
                  />
                </div>
              ) : null
            }
          >
            <TableHeader>
              <TableColumn key="id">{t("id")}</TableColumn>
              <TableColumn key="name">{t("name")}</TableColumn>
              <TableColumn key="description">{t("description")}</TableColumn>
              <TableColumn key="permissions">{t("permissions")}</TableColumn>
              <TableColumn key="actions">{t("actions")}</TableColumn>
            </TableHeader>
            <TableBody
              items={tableItems}
              emptyContent={
                getRolesQuery.isLoading ? undefined : (
                  <div>
                    <div>
                      <small>{t("no data")}</small>
                    </div>
                  </div>
                )
              }
              loadingContent={<Spinner />}
              loadingState={getRolesQuery.isLoading ? "loading" : "idle"}
            >
              {(item) => (
                <TableRow key={item.id}>
                  {(columnKey) => (
                    <TableCell>{renderCell(item, columnKey)}</TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
