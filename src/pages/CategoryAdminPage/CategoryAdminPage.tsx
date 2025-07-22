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
import { ICategory, IResponseData } from "../../types";
import useAxiosIns from "../../hooks/useAxiosIns";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "../../libs/dayjs";
import CategoryCellActions from "./CategoryCellActions";
import AddCategoryModal from "./AddCategoryModal";

export const CheckIcon = ({ size }: { size: number }) => {
  return (
    <svg
      fill="none"
      height={size || 24}
      viewBox="0 0 24 24"
      width={size || 24}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2C6.49 2 2 6.49 2 12C2 17.51 6.49 22 12 22C17.51 22 22 17.51 22 12C22 6.49 17.51 2 12 2ZM16.78 9.7L11.11 15.37C10.97 15.51 10.78 15.59 10.58 15.59C10.38 15.59 10.19 15.51 10.05 15.37L7.22 12.54C6.93 12.25 6.93 11.77 7.22 11.48C7.51 11.19 7.99 11.19 8.28 11.48L10.58 13.78L15.72 8.64C16.01 8.35 16.49 8.35 16.78 8.64C17.07 8.93 17.07 9.4 16.78 9.7Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default function CategoryAdminPage() {
  const axios = useAxiosIns();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const queryClient = useQueryClient();

  const getCategoriesQuery = useQuery({
    queryKey: ["fetch/categories"],
    queryFn: () => axios.get<IResponseData<ICategory[]>>(`/v1/categories`),
    refetchOnWindowFocus: false,
  });

  const categories = getCategoriesQuery.data?.data?.data ?? [];

  const filterCategories = () => {
    const filteredBySearchTerm = categories.filter((p) => {
      return (
        p.name_vi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.name_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toString().includes(searchTerm)
      );
    });

    return filteredBySearchTerm;
  };

  const tableItems = filterCategories().slice((page - 1) * 10, page * 10);

  const renderCell = useCallback((category: ICategory, columnKey: unknown) => {
    const cellValue = (category as never)[columnKey as never];

    switch (columnKey) {
      case "created_at":
        return dayjs(cellValue).format("DD/MM/YYYY HH:mm:ss");
      case "featured":
        return (
          <Chip
            size="sm"
            classNames={{
              base: "text-center",
              content: "w-10",
            }}
            startContent={cellValue ? <CheckIcon size={18} /> : undefined}
            variant="flat"
            color={cellValue ? "warning" : "default"}
            radius="none"
          >
            {cellValue ? t("yes") : t("no")}
          </Chip>
        );
      case "actions":
        return (
          <CategoryCellActions
            category={category}
            onActionDone={() => {
              queryClient.invalidateQueries({
                queryKey: ["fetch/categories"],
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
      <AddCategoryModal
        isOpen={isCreateModalOpen}
        onSuccess={() => {
          queryClient.invalidateQueries({
            queryKey: ["fetch/categories"],
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
              filterCategories().length > 10 ? (
                <div className="flex w-full justify-center">
                  <Pagination
                    isCompact
                    showShadow
                    color="primary"
                    page={page}
                    total={
                      filterCategories().length % 10 === 0
                        ? filterCategories().length / 10
                        : filterCategories().length / 10 + 1
                    }
                    onChange={(page) => setPage(page)}
                  />
                </div>
              ) : null
            }
          >
            <TableHeader>
              <TableColumn key="id">{t("id")}</TableColumn>
              <TableColumn key="name_vi">{t("name vi")}</TableColumn>
              <TableColumn key="name_en">{t("name en")}</TableColumn>
              <TableColumn key="featured">{t("featured")}</TableColumn>
              <TableColumn key="actions">{t("actions")}</TableColumn>
            </TableHeader>
            <TableBody
              items={tableItems}
              emptyContent={
                getCategoriesQuery.isLoading ? undefined : (
                  <div>
                    <div>
                      <small>{t("no data")}</small>
                    </div>
                  </div>
                )
              }
              loadingContent={<Spinner />}
              loadingState={getCategoriesQuery.isLoading ? "loading" : "idle"}
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
