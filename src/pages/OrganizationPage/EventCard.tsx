import { Button, Card, Chip, Image, useDisclosure } from "@heroui/react";
import { IEvent } from "../../types";
import { useTranslation } from "react-i18next";
import { getEventLogo, getFirstShowStartTime, isOwner } from "../../utils";
import {
  MdDeleteOutline,
  MdOutlineCalendarToday,
  MdOutlineLocationOn,
  MdOutlineArrowOutward,
  MdOutlineTag,
} from "react-icons/md";
import ArchiveModal from "./ArchiveModal";
import { useLocation, useNavigate } from "react-router-dom";
import DraftModal from "./DraftModal";
import TurnOnModal from "./TurnOnModal";
import ReviewModal from "../EventAdminPage/ReviewModal";
import useAuthStore from "../../stores/auth";
import { CheckIcon } from "../CategoryAdminPage/CategoryAdminPage";
import UpdateTagsModal from "./UpdateTagsModal";

export default function EventCard(props: {
  isAdmin: boolean;
  event: IEvent;
  onRefresh: () => void;
}) {
  const { t } = useTranslation();
  const location = useLocation();
  const {
    onClose: onArchiveModalClose,
    isOpen: isArchiveModalOpen,
    onOpen: onArchiveModalOpen,
    onOpenChange: onArchiveModalOpenChange,
  } = useDisclosure();

  const {
    onClose: onUpdateTagsModalClose,
    isOpen: isUpdateTagsModalOpen,
    onOpen: onUpdateTagsModalOpen,
    onOpenChange: onUpdateTagsModalOpenChange,
  } = useDisclosure();

  const {
    onClose: onDraftModalClose,
    isOpen: isDraftModalOpen,
    onOpen: onDraftModalOpen,
    onOpenChange: onDraftModalOpenChange,
  } = useDisclosure();

  const {
    onClose: onTurnOnModalClose,
    isOpen: isTurnOnModalOpen,
    onOpen: onTurnOnModalOpen,
    onOpenChange: onTurnOnModalOpenChange,
  } = useDisclosure();

  const {
    onClose: onReviewModalClose,
    isOpen: isReviewModalOpen,
    onOpen: onReviewModalOpen,
    onOpenChange: onReviewModalOpenChange,
  } = useDisclosure();

  const navigate = useNavigate();

  const currentUser = useAuthStore((state) => state.user);

  const goDetails = () => {
    const params = new URLSearchParams(location.search);
    params.set("eventname", props.event.title);
    navigate(
      `/organization/${props.event.organization.id}/event/${
        props.event.id
      }/overall?${params.toString()}`
    );
  };

  const shouldShowReportsButton = () => {
    return props.event.organization.user_organizations.some(
      (uo) =>
        ["OWNER", "MANAGER"].includes(uo.role) && uo.user.id === currentUser?.id
    );
  };

  const getActionButtons = () => {
    if (props.isAdmin) {
      return (
        <>
          {props.event.status === "PENDING" ? (
            <Button
              radius="none"
              fullWidth
              color="secondary"
              onPress={onReviewModalOpen}
              size="sm"
              className="py-5"
            >
              {t("review").toString()}
            </Button>
          ) : (
            <>
              <Button
                radius="none"
                color="secondary"
                onPress={onReviewModalOpen}
                size="sm"
                className="py-5 flex-1"
              >
                {t("details").toString()}
              </Button>
              <Button
                radius="none"
                variant="flat"
                startContent={<MdOutlineTag />}
                onPress={onUpdateTagsModalOpen}
                size="sm"
                className="py-5"
              >
                {t("update tags").toString()}
              </Button>
            </>
          )}
        </>
      );
    }
    switch (props.event.status) {
      case "DRAFT":
        return (
          <>
            <Button
              radius="none"
              fullWidth
              color="secondary"
              size="sm"
              onPress={goDetails}
              isDisabled={!shouldShowReportsButton()}
              className="py-5"
            >
              <MdOutlineArrowOutward />
              {t("reports").toString()}
            </Button>
            <Button
              radius="none"
              fullWidth
              size="sm"
              variant="flat"
              onPress={onTurnOnModalOpen}
              isDisabled={!isOwner(currentUser!, props.event.organization)}
              className="py-5"
              color="success"
            >
              {t("turn on").toString()}
            </Button>
          </>
        );
      case "PUBLISHED":
        return (
          <>
            <Button
              radius="none"
              fullWidth
              color="secondary"
              size="sm"
              isDisabled={!shouldShowReportsButton()}
              onPress={goDetails}
              className="py-5"
            >
              <MdOutlineArrowOutward />
              {t("reports").toString()}
            </Button>
            <Button
              radius="none"
              fullWidth
              size="sm"
              isDisabled={!isOwner(currentUser!, props.event.organization)}
              onPress={onDraftModalOpen}
              className="py-5"
              color="danger"
              variant="flat"
            >
              {t("draft").toString()}
            </Button>
          </>
        );
      default:
        return (
          <>
            <Button
              radius="none"
              fullWidth
              size="sm"
              className="py-5"
              color="secondary"
              isDisabled={!isOwner(currentUser!, props.event.organization)}
              variant="flat"
              onPress={() => {
                navigate(`update-event/${props.event.id}${location.search}`);
              }}
            >
              {t("edit").toString()}
            </Button>
            <Button
              radius="none"
              fullWidth
              size="sm"
              className="py-5"
              isDisabled={!isOwner(currentUser!, props.event.organization)}
              color="danger"
              onPress={onArchiveModalOpen}
              variant="flat"
            >
              <MdDeleteOutline />
              {t("archive").toString()}
            </Button>
          </>
        );
    }
  };
  return (
    <>
      <ArchiveModal
        isOpen={isArchiveModalOpen}
        onOpenChange={onArchiveModalOpenChange}
        onClose={onArchiveModalClose}
        onSuccess={props.onRefresh}
        eventId={props.event.id}
      />

      <UpdateTagsModal
        isOpen={isUpdateTagsModalOpen}
        onOpenChange={onUpdateTagsModalOpenChange}
        onClose={onUpdateTagsModalClose}
        onSuccess={props.onRefresh}
        event={props.event}
      />

      <DraftModal
        isOpen={isDraftModalOpen}
        onOpenChange={onDraftModalOpenChange}
        onClose={onDraftModalClose}
        onSuccess={props.onRefresh}
        eventId={props.event.id}
      />

      <TurnOnModal
        isOpen={isTurnOnModalOpen}
        onOpenChange={onTurnOnModalOpenChange}
        onClose={onTurnOnModalClose}
        onSuccess={props.onRefresh}
        eventId={props.event.id}
      />

      <ReviewModal
        isOpen={isReviewModalOpen}
        onOpenChange={onReviewModalOpenChange}
        onClose={onReviewModalClose}
        onSuccess={props.onRefresh}
        event={props.event}
      />
      <Card
        radius="none"
        shadow="sm"
        className="p-4 min-h-[200px] items-center justify-center"
      >
        <div className="flex gap-2 items-center justify-between w-full h-full">
          <div className="flex-shrink-0 w-1/3 h-[185px] flex items-center justify-center overflow-hidden">
            <Image
              src={getEventLogo(props.event)}
              alt={props.event.title}
              removeWrapper
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex-1 flex flex-col justify-between h-full">
            <h2 className="text-lg font-semibold text-center">
              {props.event.title}
            </h2>
            <div className="flex flex-col gap-1 py-3 px-5">
              <div className="flex items-center gap-2">
                <MdOutlineCalendarToday
                  className="text-primary-300"
                  size={20}
                />
                <div className="text-sm text-secondary-600">
                  {t("start from").toString()}{" "}
                  <span className="font-semibold">
                    {getFirstShowStartTime(props.event)}
                  </span>
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <MdOutlineLocationOn className="text-primary-300" size={20} />
                  <div className="text-sm text-secondary-600 font-semibold">
                    {props.event.place_name}
                  </div>
                </div>
                <div className="text-sm text-secondary-600">
                  {props.event.address}
                </div>
              </div>
              {props.isAdmin && (
                <div className="flex gap-1 items-center">
                  {props.event.featured && (
                    <Chip
                      size="sm"
                      classNames={{
                        base: "text-center",
                      }}
                      startContent={<CheckIcon size={18} />}
                      variant="flat"
                      color={"warning"}
                      radius="none"
                    >
                      {t("featured")}
                    </Chip>
                  )}
                  {props.event.trending && (
                    <Chip
                      size="sm"
                      classNames={{
                        base: "text-center",
                      }}
                      startContent={<CheckIcon size={18} />}
                      variant="flat"
                      color={"success"}
                      radius="none"
                    >
                      {t("trending")}
                    </Chip>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-2 px-5">{getActionButtons()}</div>
          </div>
        </div>
      </Card>
    </>
  );
}
