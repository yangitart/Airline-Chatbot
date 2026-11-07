"use client";

import { Form, Formik } from "formik";
import * as Yup from "yup";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeftRight } from "lucide-react";
import { FormikDateInput } from "@/src/components/forms/FormikDateInput";
import { FormikRadioGroup } from "@/src/components/forms/FormikRadioGroup";
import { FormikSelect } from "@/src/components/forms/FormikSelect";
import { FormikSubmitButton } from "@/src/components/forms/FormikSubmitButton";
import { FlightSearchQuery } from "../../domain/models/FlightSearch";
import {
  DEMO_AIRPORT_CODES,
  type DemoAirportCode,
} from "../../domain/models/DemoRoutes";

type FlightSearchValues = {
  tripType: "round-trip" | "one-way";
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  passengers: string;
  cabinClass: string;
};

export function localDate(daysFromToday = 0) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function FlightSearchForm({
  onSearch,
  initialOrigin,
  initialDestination,
  featuredDate,
}: {
  onSearch: (query: FlightSearchQuery) => Promise<void>;
  initialOrigin?: DemoAirportCode;
  initialDestination?: DemoAirportCode;
  featuredDate?: string;
}) {
  const { t } = useTranslation();
  const validationSchema = useMemo(
    () =>
      Yup.object({
        tripType: Yup.string().oneOf(["round-trip", "one-way"]).required(),
        origin: Yup.string().required(
          t("flightSearch.validation.originRequired"),
        ),
        destination: Yup.string()
          .required(t("flightSearch.validation.destinationRequired"))
          .test(
            "different-airport",
            t("flightSearch.validation.differentAirport"),
            function (value) {
              return !value || value !== this.parent.origin;
            },
          ),
        departureDate: Yup.string().required(
          t("flightSearch.validation.departureRequired"),
        ),
        returnDate: Yup.string().when("tripType", {
          is: "round-trip",
          then: (schema) =>
            schema
              .required(t("flightSearch.validation.returnRequired"))
              .test(
                "after-departure",
                t("flightSearch.validation.returnAfterDeparture"),
                function (value) {
                  return (
                    !value ||
                    !this.parent.departureDate ||
                    value >= this.parent.departureDate
                  );
                },
              ),
          otherwise: (schema) => schema,
        }),
        passengers: Yup.string().required(),
        cabinClass: Yup.string().required(),
      }),
    [t],
  );

  const airports = DEMO_AIRPORT_CODES.map((code) => ({
    value: code,
    label: `${t(`flightSearch.airports.${code}`)} (${code})`,
  }));

  const initialValues: FlightSearchValues = {
    tripType: featuredDate ? "one-way" : "round-trip",
    origin: initialOrigin ?? "DEL",
    destination: initialDestination ?? "BOM",
    departureDate: featuredDate ?? localDate(1),
    returnDate: localDate(4),
    passengers: "1",
    cabinClass: "economy",
  };

  return (
    <Formik<FlightSearchValues>
      initialValues={initialValues}
      validationSchema={validationSchema}
      validateOnMount
      onSubmit={(values) =>
        onSearch({
          origin: values.origin,
          destination: values.destination,
          departureDate: values.departureDate,
          returnDate:
            values.tripType === "round-trip" ? values.returnDate : undefined,
          passengers: Number(values.passengers),
          cabinClass: values.cabinClass,
        })
      }
    >
      {(form) => (
        <Form className="animate-soft-rise motion-reduce:animate-none">
          <div className="mb-4 mt-5 flex items-center justify-between gap-4">
            <FormikRadioGroup
              name="tripType"
              label={t("flightSearch.trip.label")}
              options={[
                {
                  value: "round-trip",
                  label: t("flightSearch.trip.roundTrip"),
                },
                { value: "one-way", label: t("flightSearch.trip.oneWay") },
              ]}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="grid min-w-0 grid-cols-1 items-center gap-2 sm:col-span-2 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
              <FormikSelect
                name="origin"
                label={t("flightSearch.fields.origin")}
                options={airports}
                inputClassName="truncate"
              />
              <button
                className="mx-auto grid h-9 w-9 rotate-90 place-items-center rounded-full border border-airline-line bg-airline-paper text-airline-forest shadow-sm transition-all duration-500 hover:rotate-[180deg] hover:border-airline-gold hover:bg-airline-forest-soft hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-airline-garnet motion-reduce:transform-none motion-reduce:transition-none sm:rotate-0"
                type="button"
                aria-label={t("flightSearch.actions.swapAirports")}
                onClick={() => {
                  const origin = form.values.origin;
                  void form.setFieldValue("origin", form.values.destination);
                  void form.setFieldValue("destination", origin);
                }}
              >
                <ArrowLeftRight size={19} />
              </button>
              <FormikSelect
                name="destination"
                label={t("flightSearch.fields.destination")}
                options={airports}
                inputClassName="truncate"
              />
            </div>
            <FormikDateInput
              name="departureDate"
              label={t("flightSearch.fields.depart")}
              min={localDate()}
              required
            />
            {form.values.tripType === "round-trip" && (
              <FormikDateInput
                name="returnDate"
                label={t("flightSearch.fields.return")}
                min={form.values.departureDate}
                required
              />
            )}
            <FormikSelect
              name="passengers"
              label={t("flightSearch.fields.passengers")}
              options={[1, 2, 3, 4, 5, 6, 7, 8, 9].map((count) => ({
                value: String(count),
                label: `${count} ${t(count === 1 ? "flightSearch.fields.adult" : "flightSearch.fields.adults")}`,
              }))}
            />
            <FormikSelect
              name="cabinClass"
              label={t("flightSearch.fields.class")}
              options={[
                { value: "economy", label: t("flightSearch.fields.economy") },
                {
                  value: "premium-economy",
                  label: t("flightSearch.fields.premiumEconomy"),
                },
                { value: "business", label: t("flightSearch.fields.business") },
                { value: "first", label: t("flightSearch.fields.first") },
              ]}
            />
          </div>
          <div className="mt-4 grid gap-3">
            <p className="max-w-xl text-xs leading-5 text-[#72817c]">
              {t("flightSearch.booking.publicSearchNote")}
            </p>
            <div className="flex justify-center">
              <FormikSubmitButton
                label={t("flightSearch.actions.search")}
                busyLabel={t("flightSearch.actions.searching")}
              />
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
}
