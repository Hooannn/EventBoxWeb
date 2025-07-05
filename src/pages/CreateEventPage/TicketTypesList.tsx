import { Button, useDisclosure } from "@heroui/react";
import { useTranslation } from "react-i18next";
import { MdAddCircleOutline } from "react-icons/md";
import CreateTicketTypeModal from "./CreateTicketTypeModal";
import TicketTypeCard from "./TicketTypeCard";
import type { CreateTicketTypeInputs } from "./shared.type";
import { Dispatch, SetStateAction } from "react";

export default function TicketTypesList(props: {
  ticketTypes: CreateTicketTypeInputs[];
  setTicketTypes: Dispatch<SetStateAction<CreateTicketTypeInputs[]>>;
}) {
  const { t } = useTranslation();

  const {
    isOpen: isAddTicketTypeModalOpen,
    onOpen: onAddTicketTypeModalOpen,
    onClose: onAddTicketTypeModalClose,
    onOpenChange: onAddTicketTypeModalOpenChange,
  } = useDisclosure();
  return (
    <>
      <CreateTicketTypeModal
        isOpen={isAddTicketTypeModalOpen}
        onClose={onAddTicketTypeModalClose}
        onOpenChange={onAddTicketTypeModalOpenChange}
        onSuccess={(ticketType) => {
          props.setTicketTypes((prev) => [...prev, ticketType]);
          onAddTicketTypeModalClose();
        }}
      />
      <div className="flex flex-col gap-2">
        {props.ticketTypes.map((ticketType) => (
          <TicketTypeCard
            key={ticketType.temp_id}
            ticketType={ticketType}
            onDelete={() => {
              props.setTicketTypes((prev) =>
                prev.filter((t) => t.temp_id !== ticketType.temp_id)
              );
            }}
            onUpdate={(updatedTicketType) => {
              props.setTicketTypes((prev) =>
                prev.map((t) =>
                  t.temp_id === ticketType.temp_id ? updatedTicketType : t
                )
              );
            }}
          />
        ))}
        <Button
          variant="light"
          color="primary"
          radius="none"
          className="py-4 px-8 mx-auto flex items-center justify-center gap-2"
          onPress={onAddTicketTypeModalOpen}
        >
          <MdAddCircleOutline size={18} />
          {t("add ticket type")}
        </Button>
      </div>
    </>
  );
}
