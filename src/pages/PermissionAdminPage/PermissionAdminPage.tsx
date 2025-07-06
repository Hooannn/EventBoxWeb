import {
  Button,
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
import { IPermission, IResponseData } from "../../types";
import useAxiosIns from "../../hooks/useAxiosIns";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "../../libs/dayjs";
import PermissionCellActions from "./PermissionCellActions";
import AddPermissionModal from "./AddPermissionModal";

export default function PermissionAdminPage() {
  const axios = useAxiosIns();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const queryClient = useQueryClient();

  const getPermissionsQuery = useQuery({
    queryKey: ["fetch/users/roles/permissions"],
    queryFn: () =>
      axios.get<IResponseData<IPermission[]>>(`/v1/users/roles/permissions`),
    refetchOnWindowFocus: false,
  });

  const permissions = getPermissionsQuery.data?.data?.data ?? [];

  const filterPermissions = () => {
    const filteredBySearchTerm = permissions.filter((p) => {
      return (
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toString().includes(searchTerm)
      );
    });

    return filteredBySearchTerm;
  };

  const tableItems = filterPermissions().slice((page - 1) * 10, page * 10);

  const renderCell = useCallback(
    (permission: IPermission, columnKey: unknown) => {
      const cellValue = (permission as never)[columnKey as never];

      switch (columnKey) {
        case "created_at":
          return dayjs(cellValue).format("DD/MM/YYYY HH:mm:ss");
        case "actions":
          return (
            <PermissionCellActions
              permission={permission}
              onActionDone={() => {
                queryClient.invalidateQueries({
                  queryKey: ["fetch/users/roles/permissions"],
                });
              }}
            />
          );
        default:
          return cellValue ?? <span className="text-xs">{t("no data")}</span>;
      }
    },
    []
  );

  const {
    onClose: onCreateModalClose,
    isOpen: isCreateModalOpen,
    onOpen: onCreateModalOpen,
    onOpenChange: onCreateModalOpenChange,
  } = useDisclosure();

  return (
    <>
      <AddPermissionModal
        isOpen={isCreateModalOpen}
        onSuccess={() => {
          queryClient.invalidateQueries({
            queryKey: ["fetch/users/roles/permissions"],
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
              filterPermissions().length > 10 ? (
                <div className="flex w-full justify-center">
                  <Pagination
                    isCompact
                    showShadow
                    color="primary"
                    page={page}
                    total={
                      filterPermissions().length % 10 === 0
                        ? filterPermissions().length / 10
                        : filterPermissions().length / 10 + 1
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
              <TableColumn key="actions">{t("actions")}</TableColumn>
            </TableHeader>
            <TableBody
              items={tableItems}
              emptyContent={
                getPermissionsQuery.isLoading ? undefined : (
                  <div>
                    <div>
                      <small>{t("no data")}</small>
                    </div>
                  </div>
                )
              }
              loadingContent={<Spinner />}
              loadingState={getPermissionsQuery.isLoading ? "loading" : "idle"}
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
