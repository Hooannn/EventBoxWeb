import useAxiosIns from "../../hooks/useAxiosIns";
import { useMutation } from "@tanstack/react-query";
import { IEvent, IResponseData } from "../../types";
import { onError } from "../../utils/error-handlers";
import {
  Accordion,
  AccordionItem,
  addToast,
  Button,
  Card,
  Chip,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/react";
import ReactQuill from "react-quill";
import { getI18n, useTranslation } from "react-i18next";
import {
  stringToDateFormat,
  getEventBackground,
  getEventLogo,
  priceFormat,
} from "../../utils";
import { MdDeleteOutline, MdOutlineCalendarToday } from "react-icons/md";
import { IoTicketOutline } from "react-icons/io5";
import { StaticCanvas } from "fabric";
import { useEffect, useRef } from "react";

export function ArchiveModal(props: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  onSuccess: () => void;
  eventId: number | string;
}) {
  const { t } = useTranslation();
  const axios = useAxiosIns();
  const archiveEventMutation = useMutation({
    mutationFn: () =>
      axios.post<IResponseData<boolean>>(
        `/v1/events/${props.eventId}/admin/archive`
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
      props.onSuccess();
    },
  });
  return (
    <Modal
      radius="none"
      isDismissable={false}
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
              {t("you are about to archive an event v2")}
              <br />
              {t("this action cannot be undone")}
            </ModalBody>
            <ModalFooter>
              <Button
                isLoading={archiveEventMutation.isPending}
                color="default"
                variant="light"
                radius="none"
                onPress={onClose}
              >
                {t("cancel")}
              </Button>
              <Button
                isLoading={archiveEventMutation.isPending}
                radius="none"
                color="danger"
                onPress={() => {
                  archiveEventMutation.mutate();
                }}
              >
                {t("archive")}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

export function ApproveModal(props: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  onSuccess: () => void;
  eventId: number | string;
}) {
  const { t } = useTranslation();

  const axios = useAxiosIns();

  const publishMutation = useMutation({
    mutationFn: () =>
      axios.post<IResponseData<boolean>>(
        `/v1/events/${props.eventId}/admin/publish`
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
      props.onSuccess();
    },
  });

  return (
    <Modal
      radius="none"
      isDismissable={false}
      isOpen={props.isOpen}
      onOpenChange={props.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {t("confirm")}
            </ModalHeader>
            <ModalBody>{t("you are about to approve this event")}</ModalBody>
            <ModalFooter>
              <Button
                isLoading={publishMutation.isPending}
                color="default"
                variant="light"
                radius="none"
                onPress={onClose}
              >
                {t("cancel")}
              </Button>
              <Button
                isLoading={publishMutation.isPending}
                radius="none"
                color="success"
                onPress={() => {
                  publishMutation.mutate();
                }}
              >
                {t("confirm")}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

export default function ReviewModal(props: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  onSuccess: () => void;
  event: IEvent;
}) {
  const { t } = useTranslation();
  const i18n = getI18n();
  const {
    onClose: onApproveModalClose,
    isOpen: isApproveModalOpen,
    onOpen: onApproveModalOpen,
    onOpenChange: onApproveModalOpenChange,
  } = useDisclosure();

  const {
    onClose: onArchiveModalClose,
    isOpen: isArchiveModalOpen,
    onOpen: onArchiveModalOpen,
    onOpenChange: onArchiveModalOpenChange,
  } = useDisclosure();
  return (
    <>
      <ApproveModal
        isOpen={isApproveModalOpen}
        onOpenChange={onApproveModalOpenChange}
        onClose={onApproveModalClose}
        onSuccess={props.onSuccess}
        eventId={props.event.id}
      />

      <ArchiveModal
        isOpen={isArchiveModalOpen}
        onOpenChange={onArchiveModalOpenChange}
        onClose={onArchiveModalClose}
        onSuccess={props.onSuccess}
        eventId={props.event.id}
      />

      <Modal
        radius="none"
        scrollBehavior="inside"
        size="full"
        isOpen={props.isOpen}
        onOpenChange={props.onOpenChange}
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {t("review")}
              </ModalHeader>
              <ModalBody className="px-4">
                {/* @ts-expect-error type error */}
                <Accordion
                  variant="splitted"
                  selectionMode="multiple"
                  defaultExpandedKeys={Array.from(
                    { length: 4 + props.event.shows.length },
                    (_, i) => (i + 1).toString()
                  )}
                  itemClasses={{
                    base: "rounded-none",
                    title: "px-3",
                    content: "px-3 pb-7 pt-0",
                  }}
                >
                  <AccordionItem
                    key="1"
                    title={
                      <div className="text-lg font-semibold">{t("assets")}</div>
                    }
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center w-full justify-center gap-2 h-96">
                        <div
                          className={`relative flex flex-col items-center justify-center h-full w-1/3 border-2 border-dashed hover:bg-gray-100 rounded-none cursor-pointer transition-all duration-200`}
                        >
                          <Image
                            className="object-contain w-full h-full"
                            removeWrapper
                            radius="none"
                            src={getEventLogo(props.event)}
                          />
                        </div>
                        <div
                          className={`relative h-full flex-1 flex flex-col items-center justify-center border-2 border-dashed hover:bg-gray-100 border-gray-300 rounded-none cursor-pointer transition-all duration-200`}
                        >
                          <Image
                            className="object-contain w-full h-full"
                            removeWrapper
                            radius="none"
                            src={getEventBackground(props.event)}
                          />
                        </div>
                      </div>
                      <Input
                        radius="none"
                        validationBehavior="aria"
                        isReadOnly
                        color="primary"
                        variant="bordered"
                        label={t("name").toString()}
                        value={props.event.title}
                      />
                    </div>
                  </AccordionItem>
                  <AccordionItem
                    key="2"
                    title={
                      <div className="text-lg font-semibold">{t("place")}</div>
                    }
                  >
                    <div className="flex flex-col gap-2">
                      <Input
                        radius="none"
                        validationBehavior="aria"
                        color="primary"
                        variant="bordered"
                        value={props.event.place_name}
                        label={t("place name").toString()}
                      />
                      <Input
                        radius="none"
                        validationBehavior="aria"
                        isReadOnly
                        color="primary"
                        variant="bordered"
                        value={props.event.address}
                        label={t("address").toString()}
                      />
                    </div>
                  </AccordionItem>
                  <AccordionItem
                    key="3"
                    title={
                      <div className="py-0 flex flex-col items-start">
                        <div className="text-lg font-semibold">
                          {t("discovery")}
                        </div>
                        <div className="text-xs text-default-500">
                          {t("help users find your event")}
                        </div>
                      </div>
                    }
                  >
                    <div className="flex flex-col gap-2">
                      <div>
                        <div className="text-sm">{t("category")}</div>
                        <div className="flex flex-wrap gap-2">
                          {props.event.categories.map((item) => (
                            <Chip
                              key={"ReviewModalCategory" + item.id}
                              variant="flat"
                              color="secondary"
                            >
                              {i18n.resolvedLanguage === "en"
                                ? item.name_en
                                : item.name_vi}
                            </Chip>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm">{t("keyword")}</div>
                        <div className="flex flex-wrap gap-2">
                          {props.event.keywords.map((item) => (
                            <Chip
                              key={
                                "ReviewModalKeyword" +
                                item.name +
                                props.event.id
                              }
                              variant="flat"
                              color="secondary"
                            >
                              {item.name}
                            </Chip>
                          ))}
                        </div>
                      </div>
                    </div>
                  </AccordionItem>
                  <AccordionItem
                    key="4"
                    title={
                      <div className="text-lg font-semibold">
                        {t("description")}
                      </div>
                    }
                  >
                    <div className="flex flex-col gap-2">
                      <div className="w-full">
                        <ReactQuill
                          theme="snow"
                          readOnly
                          value={props.event.description}
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
                            // "image",
                            "video",
                          ]}
                        />
                      </div>
                    </div>
                  </AccordionItem>

                  {props.event.shows.map((show, index) => (
                    <AccordionItem
                      key={4 + index + 1}
                      title={
                        <div className="text-lg font-semibold">
                          {t("show")} #{index + 1}
                        </div>
                      }
                    >
                      <div className="flex flex-col gap-2">
                        <Input
                          radius="none"
                          validationBehavior="aria"
                          color="primary"
                          variant="bordered"
                          value={show.title}
                          label={t("show title").toString()}
                          placeholder={t("enter {{label}}", {
                            label: t("show title").toString().toLowerCase(),
                          }).toString()}
                        />
                        <div className="flex flex-col">
                          <div className="flex items-center justify-between w-full pb-2">
                            <div className="text-lg font-semibold">
                              {t("date")}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <Input
                                isRequired
                                value={stringToDateFormat(show.start_time)}
                                isReadOnly
                                startContent={
                                  <MdOutlineCalendarToday className="text-xl text-default-400 pointer-events-none flex-shrink-0" />
                                }
                                label={t("start time")}
                                radius="none"
                                variant="bordered"
                              />

                              <Input
                                isRequired
                                value={stringToDateFormat(show.end_time)}
                                isReadOnly
                                startContent={
                                  <MdOutlineCalendarToday className="text-xl text-default-400 pointer-events-none flex-shrink-0" />
                                }
                                label={t("end time")}
                                radius="none"
                                variant="bordered"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <Input
                                isRequired
                                isReadOnly
                                value={stringToDateFormat(show.sale_start_time)}
                                startContent={
                                  <MdOutlineCalendarToday className="text-xl text-default-400 pointer-events-none flex-shrink-0" />
                                }
                                label={t("sale start time")}
                                radius="none"
                                variant="bordered"
                              />

                              <Input
                                isRequired
                                isReadOnly
                                value={stringToDateFormat(show.sale_end_time)}
                                startContent={
                                  <MdOutlineCalendarToday className="text-xl text-default-400 pointer-events-none flex-shrink-0" />
                                }
                                label={t("sale end time")}
                                radius="none"
                                variant="bordered"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col">
                          <div className="flex items-center justify-between w-full pb-2">
                            <div className="text-lg font-semibold">
                              {t("ticket types")}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            {show.tickets.map((ticket) => (
                              <Card
                                key={
                                  "ReviewModalShowTicket" + show.id + ticket.id
                                }
                                radius="none"
                                shadow="sm"
                                className="p-3"
                                classNames={{
                                  base: "bg-secondary-50",
                                }}
                              >
                                <div className="flex flex-row gap-2 items-center gap-2">
                                  <IoTicketOutline size={28} />
                                  <div className="flex flex-col flex-1">
                                    <div className="text-base font-semibold">
                                      {ticket.name}
                                    </div>
                                    <div className="text-xs text-secondary-600">
                                      {t("price")}:{" "}
                                      {priceFormat(
                                        parseFloat(ticket.price.toString())
                                      )}
                                    </div>
                                    <div className="text-xs text-secondary-600">
                                      {t("initial stock")}:{" "}
                                      {ticket.initial_stock}
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        </div>

                        {show.enabled_seatmap && (
                          <div className="flex flex-col">
                            <div className="flex items-center justify-between w-full pb-2">
                              <div className="text-lg font-semibold">
                                {t("seatmap")}
                              </div>
                            </div>
                            <div>
                              <SeatmapReview seatmap={show.seatmap!} />
                            </div>
                          </div>
                        )}
                      </div>
                    </AccordionItem>
                  ))}
                </Accordion>
              </ModalBody>
              {props.event.status === "PENDING" && (
                <ModalFooter>
                  <Button
                    color="danger"
                    className="w-64"
                    variant="flat"
                    size="lg"
                    radius="none"
                    onPress={onArchiveModalOpen}
                  >
                    <MdDeleteOutline size={16} />
                    {t("archive")}
                  </Button>
                  <Button
                    radius="none"
                    className="w-64"
                    size="lg"
                    color="success"
                    onPress={onApproveModalOpen}
                  >
                    {t("approve")}
                  </Button>
                </ModalFooter>
              )}
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

function SeatmapReview(props: { seatmap: string }) {
  const canvasEl = useRef<HTMLCanvasElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<StaticCanvas | null>(null);

  const resizeCanvas = () => {
    if (!wrapperRef.current || !canvasRef.current) return;
    const { width, height } = wrapperRef.current.getBoundingClientRect();
    canvasRef.current.setWidth(width - 2);
    canvasRef.current.setHeight(height - 2);
    canvasRef.current.renderAll();
  };

  useEffect(() => {
    if (!canvasEl.current) return;

    const canvas = new StaticCanvas(canvasEl.current, {
      selection: true,
    });

    canvasRef.current = canvas;

    resizeCanvas();

    window.addEventListener("resize", resizeCanvas);

    canvas.loadFromJSON(JSON.parse(props.seatmap)).then(() => {
      canvas.renderAll();
    });

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      canvas.dispose();
      canvasRef.current = null;
    };
  }, []);
  return (
    <div
      ref={wrapperRef}
      className="w-[800px] h-[500px] flex items-center justify-center border mx-auto"
    >
      <canvas ref={canvasEl} />
    </div>
  );
}
