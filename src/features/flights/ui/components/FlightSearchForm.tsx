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

type FlightSearchValues = {
  tripType: "round-trip" | "one-way";
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  passengers: string;
  cabinClass: string;
};

function localDate(daysFromToday = 0) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function FlightSearchForm({
  onSearch,
}: {
  onSearch: (query: FlightSearchQuery) => Promise<void>;
}) {
  const { t } = useTranslation();
  const validationSchema = useMemo(() => Yup.object({
    tripType: Yup.string().oneOf(["round-trip", "one-way"]).required(),
    origin: Yup.string().required(t("flightSearch.validation.originRequired")),
    destination: Yup.string().required(t("flightSearch.validation.destinationRequired")).test(
      "different-airport",
      t("flightSearch.validation.differentAirport"),
      function (value) { return !value || value !== this.parent.origin; },
    ),
    departureDate: Yup.string().required(t("flightSearch.validation.departureRequired")),
    returnDate: Yup.string().when("tripType", {
      is: "round-trip",
      then: (schema) => schema.required(t("flightSearch.validation.returnRequired")).test(
        "after-departure",
        t("flightSearch.validation.returnAfterDeparture"),
        function (value) { return !value || !this.parent.departureDate || value >= this.parent.departureDate; },
      ),
      otherwise: (schema) => schema,
    }),
    passengers: Yup.string().required(),
    cabinClass: Yup.string().required(),
  }), [t]);

  const airports = ["DEL", "BOM", "BLR", "MAA", "HYD"].map((code) => ({
    value: code,
    label: `${t(`flightSearch.airports.${code}`)} (${code})`,
  }));

  const initialValues: FlightSearchValues = {
    tripType: "round-trip",
    origin: "DEL",
    destination: "BOM",
    departureDate: localDate(1),
    returnDate: localDate(4),
    passengers: "1",
    cabinClass: "economy",
  };

  return (
    <Formik<FlightSearchValues>
      initialValues={initialValues}
      validationSchema={validationSchema}
      validateOnMount
      onSubmit={(values) => onSearch({
        origin: values.origin,
        destination: values.destination,
        departureDate: values.departureDate,
        returnDate: values.tripType === "round-trip" ? values.returnDate : undefined,
        passengers: Number(values.passengers),
        cabinClass: values.cabinClass,
      })}
    >
      {(form) => (
        <Form>
          <div className="py-[21px] max-[650px]:py-4">
            <FormikRadioGroup
              name="tripType"
              label={t("flightSearch.trip.label")}
              options={[
                { value: "round-trip", label: t("flightSearch.trip.roundTrip") },
                { value: "one-way", label: t("flightSearch.trip.oneWay") },
              ]}
            />
          </div>
          <div className="grid min-h-[77px] grid-cols-[repeat(14,minmax(0,1fr))] items-stretch gap-y-3 max-[1050px]:grid-cols-6 max-[650px]:grid-cols-2">
            <div className="col-span-4 grid min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-stretch max-[1050px]:col-span-6 max-[650px]:col-span-2 max-[650px]:gap-2">
              <FormikSelect name="origin" label={t("flightSearch.fields.origin")} options={airports} className="min-h-[66px] min-w-0 border-l-0 pl-1 max-[650px]:px-1" inputClassName="truncate text-xl font-semibold max-[650px]:text-sm" />
              <button
                className="my-auto grid h-[34px] w-[34px] cursor-pointer place-items-center rounded-full border border-[#ddd2c1] bg-[#fffefa] text-[#86233d]"
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
              <FormikSelect name="destination" label={t("flightSearch.fields.destination")} options={airports} className="min-h-[66px] min-w-0 max-[650px]:px-1" inputClassName="truncate text-xl font-semibold max-[650px]:text-sm" />
            </div>
            <FormikDateInput name="departureDate" label={t("flightSearch.fields.depart")} min={localDate()} required className="col-span-2 min-w-0 max-[1050px]:col-span-3 max-[650px]:col-span-1 max-[650px]:px-2" />
            {form.values.tripType === "round-trip" && (
              <FormikDateInput name="returnDate" label={t("flightSearch.fields.return")} min={form.values.departureDate} required className="col-span-2 min-w-0 max-[1050px]:col-span-3 max-[650px]:col-span-1 max-[650px]:px-2" />
            )}
            <FormikSelect
              name="passengers"
              label={t("flightSearch.fields.passengers")}
              className="col-span-2 min-w-0 max-[1050px]:col-span-3 max-[650px]:col-span-1 max-[650px]:px-2"
              options={[1, 2, 3, 4, 5, 6, 7, 8, 9].map((count) => ({ value: String(count), label: `${count} ${t(count === 1 ? "flightSearch.fields.adult" : "flightSearch.fields.adults")}` }))}
            />
            <FormikSelect
              name="cabinClass"
              label={t("flightSearch.fields.class")}
              className="col-span-2 min-w-0 max-[1050px]:col-span-3 max-[650px]:col-span-1 max-[650px]:px-2"
              options={[
                { value: "economy", label: t("flightSearch.fields.economy") },
                { value: "premium-economy", label: t("flightSearch.fields.premiumEconomy") },
                { value: "business", label: t("flightSearch.fields.business") },
                { value: "first", label: t("flightSearch.fields.first") },
              ]}
            />
            <FormikSubmitButton label={t("flightSearch.actions.search")} busyLabel={t("flightSearch.actions.searching")} />
          </div>
          <p className="mb-0 mt-[15px] text-right text-xs text-[#737b84] max-[650px]:text-left max-[650px]:leading-6">{t("flightSearch.booking.publicSearchNote")}</p>
        </Form>
      )}
    </Formik>
  );
}
