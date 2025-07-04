import { Button, DateValue, useDisclosure } from "@heroui/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { MdAddCircleOutline } from "react-icons/md";
import CreateTicketTypeModal, {
  CreateTicketTypeInputs,
} from "./CreateTicketTypeModal";
import TicketTypeCard from "./TicketTypeCard";

export default function TicketTypesList(props: {
  showStartTime: DateValue;
  showEndTime: DateValue;
}) {
  const { t } = useTranslation();
  const [ticketTypes, setTicketTypes] = useState<CreateTicketTypeInputs[]>([]);

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
        showStartTime={props.showStartTime}
        showEndTime={props.showEndTime}
        onOpenChange={onAddTicketTypeModalOpenChange}
        onSuccess={(ticketType) => {
          setTicketTypes((prev) => [...prev, ticketType]);
          onAddTicketTypeModalClose();
        }}
      />
      <div className="flex flex-col gap-2">
        {ticketTypes.map((ticketType) => (
          <TicketTypeCard
            key={ticketType.temp_id}
            showStartTime={props.showStartTime}
            showEndTime={props.showEndTime}
            ticketType={ticketType}
            onDelete={() => {
              setTicketTypes((prev) =>
                prev.filter((t) => t.temp_id !== ticketType.temp_id)
              );
            }}
            onUpdate={(updatedTicketType) => {
              setTicketTypes((prev) =>
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
