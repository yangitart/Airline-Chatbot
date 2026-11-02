import React, { useState } from "react";
import { Divider, Spacer } from "@heroui/react";
import CustomModalHeader from "@/src/components/modals/parts/CustomModalHeader";
import CustomModalBody from "@/src/components/modals/parts/CustomModalBody";
import CustomModalFooter from "@/src/components/modals/parts/CustomModalFooter";
import { SecondaryButton } from "@/src/components/buttons/AppButtons/SecondaryButton";
import { CustomAsyncButton } from "@/src/components/buttons/CustomAsyncButton";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ShowSuccessToast, ShowErrorToast } from "@/src/components/toast/Toast";
import { nameAndLastNameValidation } from "@/src/core/common/validations/personValidations";
import CustomTextInput from "@/src/components/inputs/basic/CustomTextInput";
import { EMAIL_PLACEHOLDER } from "@/src/components/inputs/const/placeholder";
import { EMAIL_LABEL } from "@/src/components/inputs/const/labels";
import { MdEmail } from "react-icons/md";
import CustomSelect from "@/src/components/inputs/basic/CustomSelect";

interface PersonInvitationFormProps {
  onCloseModal: () => void;
  onSave?: () => void;
}

export const PersonInvitationForm = ({
  onCloseModal,
  onSave,
}: PersonInvitationFormProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const formik = useFormik({
    enableReinitialize: true,
    validationSchema: Yup.object().shape({
      name: nameAndLastNameValidation,
      lastName: nameAndLastNameValidation,
      identityNumber: Yup.string()
        .required("El número de documento es requerido")
        .length(11, "El número de documento debe tener 11 caracteres"),
      email: Yup.string()
        .email("Formato de email inválido")
        .required("El correo electrónico es requerido"),
      responsibility: Yup.string().required("La responsabilidad es requerida"),
    }),
    validateOnChange: true,
    initialValues: {
      name: "",
      lastName: "",
      identityNumber: "",
      email: "",
      responsibility: "",
      submit: null,
    },
    onSubmit: async (values, helpers) => {
      try {
        if (isLoading) return;

        setIsLoading(true);

        await new Promise((resolve) => setTimeout(resolve, 6800));

        ShowSuccessToast();
        helpers.resetForm();

        if (onSave) {
          onSave();
        }

        onCloseModal();
      } catch (err) {
        const error = err as Error;
        helpers.setStatus({ success: false });
        helpers.setErrors({ submit: error.message });
        ShowErrorToast("Error al enviar la invitación");
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <CustomModalHeader>Invitar persona</CustomModalHeader>
      <Divider />
      <CustomModalBody>
        <div className="space-y-4">
          {/* Carnet de Identidad */}
          <CustomTextInput
            form={formik}
            formKey="identityNumber"
            placeholder="CI"
            label="Carnet de Identidad"
            isRequired={true}
          />

          {/* Nombre y Apellidos */}
          <div className="flex flex-row">
            <CustomTextInput
              form={formik}
              formKey="name"
              placeholder="Nombre"
              label="Nombre"
              isRequired={true}
            />
            <Spacer />
            <CustomTextInput
              form={formik}
              formKey="lastName"
              placeholder="Apellidos"
              label="Apellidos"
              isRequired={true}
            />
          </div>

          {/* Correo electrónico */}
          <CustomTextInput
            form={formik}
            formKey="email"
            placeholder={EMAIL_PLACEHOLDER}
            label={EMAIL_LABEL}
            isRequired={true}
            startContent={<MdEmail className="text-gray-400" />}
          />

          {/* Responsabilidad */}
          <CustomSelect
            items={[
              { key: "DIRECTOR", label: "Directivo", value: "DIRECTOR" },
              { key: "GESTOR", label: "Gestor", value: "GESTOR" },
            ]}
            form={formik}
            formKey="responsibility"
            label="Responsabilidad"
            isRequired={true}
            placeholder="Seleccione"
          />
        </div>
      </CustomModalBody>
      <Divider />
      <CustomModalFooter>
        <SecondaryButton onClick={onCloseModal} title="Cancelar" />
        <CustomAsyncButton
          isLoading={isLoading}
          isDisabled={!formik.isValid || formik.isSubmitting}
          color="primary"
          variant="solid"
          onClick={formik.submitForm}
          title="Invitar"
        />
      </CustomModalFooter>
    </form>
  );
};

export default PersonInvitationForm;
