"use client";
import { FormikValues } from "formik";
import React from "react";
import CustomTextInput from "@/src/components/inputs/basic/CustomTextInput";

export default function ReplaceDirectorForm({
  label,
  form,
}: {
  label: string;
  form: FormikValues;
}) {
  const formKey = "email"; 

  return (
    <div className="flex flex-col space-y-4">
      <CustomTextInput
        form={form}
        formKey={formKey}
        placeholder={"Ingrese el correo electrónico"}
        label={label}
        isRequired={true}
      />
    </div>
  );
}
