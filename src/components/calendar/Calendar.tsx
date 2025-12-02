"use client";

import React, { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  DateSelectArg,
  EventClickArg,
  EventContentArg,
} from "@fullcalendar/core";
import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";

import {
  useGetSaleEventsQuery,
  useCreateSaleEventMutation,
  useUpdateSaleEventMutation,
  useDeleteSaleEventsMutation,
  type SaleEvent,
  CreateSaleEventRequest,
} from "@/lib/api";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay?: boolean;
  extendedProps: {
    calendar: "Danger" | "Success" | "Primary" | "Warning";
    percent?: number;    // 0–1
    saleStart?: string;  // ISO đầy đủ để edit
    saleEnd?: string;    // ISO đầy đủ để edit
  };
}

const calendarColorClassMap: Record<
  "Danger" | "Success" | "Primary" | "Warning",
  { container: string; dot: string }
> = {
  Danger: {
    container:
      "border-l-4 border-red-500 bg-white !text-gray-900 " +
      "dark:border-red-400 dark:bg-red-500/10 dark:text-red-100",
    dot: "bg-red-500 dark:bg-red-300",
  },
  Success: {
    container:
      "border-l-4 border-emerald-500 bg-white !text-gray-900 " +
      "dark:border-emerald-400 dark:bg-emerald-500/10 dark:text-emerald-100",
    dot: "bg-emerald-500 dark:bg-emerald-300",
  },
  Primary: {
    container:
      "border-l-4 border-indigo-500 bg-white !text-gray-900 " +
      "dark:border-indigo-400 dark:bg-indigo-500/10 dark:text-indigo-100",
    dot: "bg-indigo-500 dark:bg-indigo-300",
  },
  Warning: {
    container:
      "border-l-4 border-amber-500 bg-white !text-gray-900 " +
      "dark:border-amber-400 dark:bg-amber-500/10 dark:text-amber-100",
    dot: "bg-amber-500 dark:bg-amber-300",
  },
};



const calendarsEvents: Record<string, string> = {
  Danger: "danger",
  Success: "success",
  Primary: "primary",
  Warning: "warning",
};

const Calendar: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen, openModal, closeModal } = useModal();

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const [eventTitle, setEventTitle] = useState("");
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventLevel, setEventLevel] = useState<
    "Danger" | "Success" | "Primary" | "Warning" | ""
  >("");
  const [eventPercent, setEventPercent] = useState<number | "">("");
  const [formError, setFormError] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // RTK Query
  const {
    data: saleEvents,
    isLoading: isSaleLoading,
    isError: isSaleError,
    refetch: refetchSaleEvents,
  } = useGetSaleEventsQuery();

  const [createSaleEvent, { isLoading: isCreating }] =
    useCreateSaleEventMutation();
  const [updateSaleEvent, { isLoading: isUpdating }] =
    useUpdateSaleEventMutation();
  const [deleteSaleEvents, { isLoading: isDeleting }] =
    useDeleteSaleEventsMutation();

  // Map backend -> FullCalendar
  useEffect(() => {
    if (!saleEvents) return;

    const mapped: CalendarEvent[] = saleEvents.map((e: SaleEvent) => {
      // chỉ hiển thị ở ngày bắt đầu: lấy phần YYYY-MM-DD
      const startDay =
        e.startDate?.split("T")[0] ?? new Date().toISOString().split("T")[0];

      return {
        id: e.id,
        title: e.title,
        start: startDay,   // ❗ chỉ ngày bắt đầu, không set end => chỉ hiện 1 ngày
        allDay: true,
        extendedProps: {
          calendar: e.color,
          percent: e.percent,
          saleStart: e.startDate, // ISO full để dùng khi mở modal
          saleEnd: e.endDate,
        },
      };
    });

    setEvents(mapped);
  }, [saleEvents]);

  const resetModalFields = () => {
    setSelectedEvent(null);
    setEventTitle("");
    setEventStartDate("");
    setEventEndDate("");
    setEventLevel("");
    setEventPercent("");
    setFormError(null);
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    resetModalFields();
    const startStr = selectInfo.startStr; // YYYY-MM-DD
    const endStr = selectInfo.endStr || selectInfo.startStr;

    setEventStartDate(startStr);
    setEventEndDate(endStr);
    setEventLevel("Primary");
    openModal();
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    const ext = event.extendedProps as any;

    const calendarColor =
      (ext.calendar as "Danger" | "Success" | "Primary" | "Warning") ||
      "Primary";

    const percentBackend = typeof ext.percent === "number" ? ext.percent : 0;

    // Lấy start/end thật từ extendedProps (saleStart/saleEnd)
    const saleStartIso: string | undefined = ext.saleStart;
    const saleEndIso: string | undefined = ext.saleEnd;

    setSelectedEvent({
      id: event.id,
      title: event.title,
      start: saleStartIso ?? event.start?.toISOString() ?? "",
      end:
        saleEndIso ??
        saleStartIso ??
        event.start?.toISOString() ??
        "",
      allDay: event.allDay,
      extendedProps: {
        calendar: calendarColor,
        percent: percentBackend,
        saleStart: saleStartIso,
        saleEnd: saleEndIso,
      },
    });

    setEventTitle(event.title);
    setEventStartDate(
      saleStartIso
        ? saleStartIso.split("T")[0]
        : event.start
        ? event.start.toISOString().split("T")[0]
        : ""
    );
    setEventEndDate(
      saleEndIso
        ? saleEndIso.split("T")[0]
        : saleStartIso
        ? saleStartIso.split("T")[0]
        : event.start
        ? event.start.toISOString().split("T")[0]
        : ""
    );
    setEventLevel(calendarColor);
    setEventPercent(percentBackend ? Math.round(percentBackend * 100) : "");
    setFormError(null);
    openModal();
  };

  const handleOpenEmptyModal = () => {
    resetModalFields();
    const today = new Date().toISOString().split("T")[0];
    setEventStartDate(today);
    setEventEndDate(today);
    setEventLevel("Primary");
    openModal();
  };

  const handleAddOrUpdateEvent = async () => {
  if (!eventTitle || !eventStartDate || !eventEndDate) {
    setFormError("Please fill in title, start date and end date.");
    return;
  }

  if (!eventLevel) {
    setFormError("Please select an event color.");
    return;
  }

  const percentValue = eventPercent === "" ? 0 : Number(eventPercent);
  if (Number.isNaN(percentValue) || percentValue < 0 || percentValue > 100) {
    setFormError("Discount percent must be between 0 and 100.");
    return;
  }

  const startIso = new Date(eventStartDate).toISOString();
  const endIso = new Date(eventEndDate).toISOString();

  if (new Date(startIso) > new Date(endIso)) {
    setFormError("Start date must be before or equal to end date.");
    return;
  }

  const payload: CreateSaleEventRequest = {
    title: eventTitle.trim(),
    color: eventLevel as "Danger" | "Success" | "Primary" | "Warning",
    startDate: startIso,
    endDate: endIso,
    percent: percentValue / 100,   // backend dùng 0–1, 10% => 0.1
    productIds: [],                // nếu backend BẮT BUỘC phải có, tạm thời nhét 1 id test
    // productIds: ["68366fcc787d0450227ca5a6"],
  };

  try {
    setFormError(null);
    setGlobalError(null);

    if (selectedEvent) {
      await updateSaleEvent({ id: selectedEvent.id, data: payload }).unwrap();
    } else {
      await createSaleEvent(payload).unwrap();
    }

    await refetchSaleEvents();
    closeModal();
    resetModalFields();
  } catch (error: any) {
    console.error("Failed to save sale event", error);
    setFormError(
      error?.data?.message ??
        "Failed to save sale event. Please check data and try again."
    );
  }
};

  const handleDeleteCurrentEvent = async () => {
    if (!selectedEvent) return;
    try {
      setFormError(null);
      setGlobalError(null);

      await deleteSaleEvents([selectedEvent.id]).unwrap();
      await refetchSaleEvents();

      closeModal();
      resetModalFields();
    } catch (error: any) {
      console.error("Failed to delete sale event", error);
      setFormError(
        error?.data?.message ?? "Failed to delete sale event. Please try again."
      );
    }
  };

  const handleCloseModal = () => {
    closeModal();
    resetModalFields();
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="p-4">
        {globalError && (
          <p className="mb-2 text-sm text-red-500">{globalError}</p>
        )}
        {isSaleLoading && (
          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
            Loading sale events...
          </p>
        )}
        {isSaleError && (
          <p className="mb-2 text-sm text-red-500">
            Failed to load sale events.
          </p>
        )}

        <div className="custom-calendar">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next addEventButton",
              center: "title",
              right: "dayGridMonth",
            }}
            events={events}
            selectable={true}
            select={handleDateSelect}
            eventClick={handleEventClick}
            eventContent={renderEventContent}
            customButtons={{
              addEventButton: {
                text: "Add Event +",
                click: handleOpenEmptyModal,
              },
            }}
          />
        </div>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={handleCloseModal}
        className="max-w-[700px] p-6 lg:p-10"
      >
        <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
          <div>
            <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
              {selectedEvent ? "Edit Sale Event" : "Add Sale Event"}
            </h5>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Plan product promotion by scheduling sale events on the calendar.
            </p>
          </div>

          <div className="mt-8">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Event Title
              </label>
              <input
                id="event-title"
                type="text"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              />
            </div>

            <div className="mt-6">
              <label className="block mb-4 text-sm font-medium text-gray-700 dark:text-gray-400">
                Event Color
              </label>
              <div className="flex flex-wrap items-center gap-4 sm:gap-5">
                {Object.entries(calendarsEvents).map(([key, value]) => (
                  <div key={key} className="n-chk">
                    <div
                      className={`form-check form-check-${value} form-check-inline`}
                    >
                      <label
                        className="flex items-center text-sm text-gray-700 form-check-label dark:text-gray-400"
                        htmlFor={`modal${key}`}
                      >
                        <span className="relative">
                          <input
                            className="sr-only form-check-input"
                            type="radio"
                            name="event-level"
                            value={key}
                            id={`modal${key}`}
                            checked={eventLevel === key}
                            onChange={() =>
                              setEventLevel(
                                key as
                                  | "Danger"
                                  | "Success"
                                  | "Primary"
                                  | "Warning"
                              )
                            }
                          />
                          <span className="flex items-center justify-center w-5 h-5 mr-2 border border-gray-300 rounded-full box dark:border-gray-700">
                            <span
                              className={`h-2 w-2 rounded-full bg-white ${
                                eventLevel === key ? "block" : "hidden"
                              }`}
                            ></span>
                          </span>
                        </span>
                        {key}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Discount percent (%)
              </label>
              <input
                type="number"
                value={eventPercent}
                onChange={(e) =>
                  setEventPercent(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                placeholder="e.g. 10, 20, 50"
                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              />
            </div>

            <div className="mt-6">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Enter Start Date
              </label>
              <div className="relative">
                <input
                  id="event-start-date"
                  type="date"
                  value={eventStartDate}
                  onChange={(e) => setEventStartDate(e.target.value)}
                  className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Enter End Date
              </label>
              <div className="relative">
                <input
                  id="event-end-date"
                  type="date"
                  value={eventEndDate}
                  onChange={(e) => setEventEndDate(e.target.value)}
                  className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                />
              </div>
            </div>

            {formError && (
              <p className="mt-4 text-xs text-red-500">{formError}</p>
            )}
          </div>

          <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
            {selectedEvent && (
              <button
                onClick={handleDeleteCurrentEvent}
                type="button"
                disabled={isDeleting}
                className="flex w-full justify-center rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            )}

            <button
              onClick={handleCloseModal}
              type="button"
              className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg:white/[0.03] sm:w-auto"
            >
              Close
            </button>
            <button
              onClick={handleAddOrUpdateEvent}
              type="button"
              disabled={isCreating || isUpdating}
              className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {isCreating || isUpdating
                ? "Saving..."
                : selectedEvent
                ? "Update Changes"
                : "Add Event"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const renderEventContent = (eventInfo: EventContentArg) => {
  const ext = eventInfo.event.extendedProps as any;

  const colorKey: "Danger" | "Success" | "Primary" | "Warning" =
    ext.calendar || "Primary";

  const { container, dot } = calendarColorClassMap[colorKey];

  const saleStartIso: string | undefined = ext.saleStart;
  const saleEndIso: string | undefined = ext.saleEnd;

  const formatIsoDate = (iso?: string) => {
    if (!iso) return "";
    return iso.split("T")[0]; // YYYY-MM-DD
  };

  const startLabel = formatIsoDate(saleStartIso);
  const endLabel = formatIsoDate(saleEndIso);

  const dateRangeText =
    startLabel && endLabel
      ? `${startLabel} → ${endLabel}`
      : startLabel
      ? startLabel
      : "";

  return (
    <div
      className={`event-fc-color fc-event-main flex flex-col rounded-md px-2 py-1 text-xs shadow-sm ${container}`}
    >
      <div className="flex items-center gap-1">
        <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
        <span className="font-medium leading-tight text-amber-500">
          {eventInfo.event.title}
        </span>
      </div>

      {dateRangeText && (
        <div className="mt-0.5 pl-4 text-[10px] opacity-80 text-amber-500">
          {dateRangeText}
        </div>
      )}
    </div>
  );
};



export default Calendar;
