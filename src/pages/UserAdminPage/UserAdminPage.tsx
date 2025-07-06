import {
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
  User,
} from "@heroui/react";
import { t } from "i18next";
import { useCallback, useState } from "react";
import { MdOutlineSearch } from "react-icons/md";
import { IResponseData, IUser } from "../../types";
import useAxiosIns from "../../hooks/useAxiosIns";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserAvatar } from "../../utils";
import dayjs from "../../libs/dayjs";
import UserCellActions from "./UserCellActions";

export default function UserAdminPage() {
  const axios = useAxiosIns();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const queryClient = useQueryClient();

  const getUsersQuery = useQuery({
    queryKey: ["fetch/users"],
    queryFn: () => axios.get<IResponseData<IUser[]>>(`/v1/users`),
    refetchOnWindowFocus: false,
  });

  const users = getUsersQuery.data?.data?.data ?? [];

  const filterUsers = () => {
    const filteredBySearchTerm = users.filter((user) => {
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

  const tableItems = filterUsers().slice((page - 1) * 10, page * 10);

  const renderCell = useCallback((user: IUser, columnKey: unknown) => {
    const cellValue = (user as never)[columnKey as never];

    switch (columnKey) {
      case "user":
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
            name={user.first_name + " " + user.last_name}
          >
            {user.email}
          </User>
        );
      case "created_at":
        return dayjs(cellValue).format("DD/MM/YYYY HH:mm:ss");
      case "role":
        return (
          <div className="flex flex-wrap gap-1">
            {user.roles.map((role) => (
              <Chip key={role.id} variant="flat" color="secondary" size="sm">
                {role.name}
              </Chip>
            ))}
          </div>
        );
      case "actions":
        return (
          <UserCellActions
            user={user}
            onActionDone={() => {
              queryClient.invalidateQueries({
                queryKey: ["fetch/users"],
              });
            }}
          />
        );
      default:
        return cellValue ?? <span className="text-xs">{t("no data")}</span>;
    }
  }, []);
  return (
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
            {/* <Button
              radius="none"
              color="secondary"
              variant="solid"
              className="w-36"
            >
              {t("add member")}
            </Button> */}
          </div>
        </div>
        <Table
          removeWrapper
          cellPadding={20}
          radius="none"
          bottomContent={
            filterUsers().length > 10 ? (
              <div className="flex w-full justify-center">
                <Pagination
                  isCompact
                  showShadow
                  color="primary"
                  page={page}
                  total={
                    filterUsers().length % 10 === 0
                      ? filterUsers().length / 10
                      : filterUsers().length / 10 + 1
                  }
                  onChange={(page) => setPage(page)}
                />
              </div>
            ) : null
          }
        >
          <TableHeader>
            <TableColumn key="id">{t("id")}</TableColumn>
            <TableColumn key="user">{t("user")}</TableColumn>
            <TableColumn key="role">{t("role")}</TableColumn>
            <TableColumn key="phone">{t("phone number")}</TableColumn>
            <TableColumn key="created_at">{t("created at")}</TableColumn>
            <TableColumn key="actions">{t("actions")}</TableColumn>
          </TableHeader>
          <TableBody
            items={tableItems}
            emptyContent={
              getUsersQuery.isLoading ? undefined : (
                <div>
                  <div>
                    <small>{t("no data")}</small>
                  </div>
                </div>
              )
            }
            loadingContent={<Spinner />}
            loadingState={getUsersQuery.isLoading ? "loading" : "idle"}
          >
            {(item) => (
              <TableRow key={item.email}>
                {(columnKey) => (
                  <TableCell>{renderCell(item, columnKey)}</TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
