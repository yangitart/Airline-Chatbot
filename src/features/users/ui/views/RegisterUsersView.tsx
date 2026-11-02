"use client";

import { FormikValues, useFormik } from "formik";
import * as Yup from "yup";
import { CustomAsyncButton } from "@/src/components/buttons/CustomAsyncButton";
import CustomBreadcrumb from "@/src/components/navigation/CustomBreadcrumbs";
import CustomTextInput from "@/src/components/inputs/basic/CustomTextInput";
import { useInvitationStore } from "@/src/features/shared/invitations/ui/store/InvitationStore";
import { PositionNomenclature } from "@/src/features/shared/nomenclatures/domain/entities/SystemRoleNomenclatures";
import { InvitationPayload } from "@/src/features/shared/invitations/data/request/InvitationPayload";
import CustomSelect from "@/src/components/inputs/basic/CustomSelect";
import { emailRegex } from "@/src/core/common/validations/regexs";
import { useCurrentUser } from "../store/hooks/useUserData";
import { Spacer } from "@heroui/react";

export default function RegisterUsersView({
  onBack,
  onInvitate,
  onlyDirective,
}: {
  onBack: () => void;
  onInvitate: () => void;
  onlyDirective: boolean;
}) {
  const { sendInvitation } = useInvitationStore();
  const { currentUser } = useCurrentUser();

  const form = useFormik({
    enableReinitialize: true,
    validationSchema: Yup.object().shape({
      email: Yup.string()
        .required("Campo requerido")
        .trim()
        .test(
          "validateEmailOrUsername",
          "Formato incorrecto",
          function (value) {
            return Yup.string()
              .matches(emailRegex, "Formato incorrecto")
              .isValidSync(value);
          },
        ),
    }),
    validateOnChange: true,
    initialValues: {
      email: "",
      rol: "GENERAL_MANAGER",
    },
    onSubmit: async (values, { resetForm }) => {
      const position = values.rol as PositionNomenclature;

      const invitationData: InvitationPayload = {
        position: position,
        email: values.email,
        entity: currentUser?.entity?.url as string,
      };

      await sendInvitation(invitationData);
      onInvitate();
      resetForm();
    },
  });

  return (
    <div className="flex h-full min-h-0 w-full flex-col px-4 py-6">
      <div className="mb-4">
        <CustomBreadcrumb
          links={[
            {
              label: "Listar de directivos",
              onClick: onBack,
            },
            { label: "Registrar directivo", onClick: () => {} },
          ]}
        />
      </div>

      <div className="flex flex-1 min-h-0 flex-col overflow-hidden rounded-xl border border-default-200 bg-white">
        <form
          className="flex h-full min-h-0 flex-1 flex-col"
          onSubmit={form.handleSubmit}
        >
          <div className="shrink-0 px-6 pt-4 pb-1">
            <h2 className="text-lg font-semibold text-foreground">
              Registrar directivo
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            <div className="w-full max-w-5xl">
              <BasicChiefInfo formik={form} onlyDirective={onlyDirective} />
            </div>
          </div>
        </form>
      </div>
      <div className="flex shrink-0 justify-end px-2 py-4">
        <CustomAsyncButton
          isDisabled={!form.isValid}
          variant="solid"
          isLoading={form.isSubmitting}
          color="primary"
          title={"Invitar"}
          onClick={form.submitForm}
        />
      </div>
    </div>
  );
}

const BasicChiefInfo = ({
  formik,
  onlyDirective,
}: {
  formik: FormikValues;
  onlyDirective: boolean;
}) => {
  const roles = [
    {
      key: "MANAGER",
      label: "Gestor",
    },
  ];
  return (
    <>
      <CustomTextInput
        label="Correo electrónico"
        formKey="email"
        form={formik}
        isRequired={true}
        placeholder="ejemplo@ejemplo.cu"
        type="email"
      />
      <Spacer />
      {!onlyDirective && (
        <CustomSelect
          form={formik}
          formKey={"rol"}
          label={"Responsabilidad"}
          placeholder={"Seleccione"}
          isRequired={true}
          items={roles}
        />
      )}
    </>
  );
};
