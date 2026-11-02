import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { defaultValidation } from "@/src/core/common/validations/defaultValidations";
import { Spacer } from "@heroui/react";
import CustomTextInput from "@/src/components/inputs/basic/CustomTextInput";
import { ValidatePass } from "@/src/features/authentication/ui/components/PassUtils";
import { CustomAsyncButton } from "@/src/components/buttons/CustomAsyncButton";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useUserStore } from "@/src/features/users/ui/store/useUserStore";

export function ChangePasswordForm() {
  const { changePasswordUserMe } = useUserStore();

  const [passVisible, setPassVisible] = React.useState(false);
  const [confirmVisible, setConfirmVisible] = React.useState(false);
  const [oldVisible, setOldVisible] = React.useState(false);
  const toggleVisibilityPass = () => setPassVisible(!passVisible);
  const toggleVisibilityConfirm = () => setConfirmVisible(!confirmVisible);
  const toggleVisibilityOld = () => setOldVisible(!oldVisible);

  const formik = useFormik({
    initialValues: {
      current: "",
      new: "",
      confirm: "",
      submit: null,
    },
    validationSchema: Yup.object().shape({
      current: defaultValidation,
      new: Yup.string()
        .required("La contraseña es requerida")
        .min(8, "Mínimo 8 caracteres")
        .matches(/[0-9]/, "Requiere un número")
        .matches(/[a-z]/, "Requiere una letra en minúscula")
        .matches(/[A-Z]/, "Requiere una letra en mayúscula")
        .matches(/[^\w]/, "Requiere un símbolo"),
      confirm: Yup.string().oneOf(
        [Yup.ref("new")],
        "Las contraseñas no coinciden"
      ),
    }),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setSubmitting(true);
      const response = await changePasswordUserMe({
        current: values.current,
        new: values.new,
        confirm: values.confirm,
      });
      setSubmitting(false);
      if (response) {
        resetForm();
        onCloseModal();
      }
    },
  });

  async function onCloseModal() {
    setConfirmVisible(false);
    setOldVisible(false);
    setPassVisible(false);
  }

  return (
    <form
      onSubmit={formik.handleSubmit}
      className={
        "flex flex-col  space-y-2 overflow-y-auto h-full w-full justify-between"
      }
    >
      <div
        className={"flex flex-col  space-y-2 overflow-y-auto h-full w-full "}
      >
        <CustomTextInput
          form={formik}
          dontCopy
          formKey={"current"}
          label={"Contraseña actual"}
          placeholder={"******"}
          type={oldVisible ? "text" : "password"}
          isRequired={true}
          endContent={
            <button
              className="focus:outline-none"
              type="button"
              onClick={toggleVisibilityOld}
            >
              {oldVisible ? <FiEye /> : <FiEyeOff />}
            </button>
          }
        />
        <CustomTextInput
          form={formik}
          dontCopy
          formKey={"new"}
          label={"Contraseña nueva"}
          placeholder={"******"}
          type={passVisible ? "text" : "password"}
          isRequired={true}
          endContent={
            <button
              className="focus:outline-none"
              type="button"
              onClick={toggleVisibilityPass}
            >
              {passVisible ? <FiEye /> : <FiEyeOff />}
            </button>
          }
        />

        {formik.errors.new && formik.values.new && (
          <div className="pl-4 pr-4">
            <ValidatePass password={formik.values.new} />
          </div>
        )}
        <Spacer />
        <CustomTextInput
          dontCopy
          form={formik}
          formKey={"confirm"}
          label={"Confirmar contraseña nueva"}
          placeholder={"******"}
          type={confirmVisible ? "text" : "password"}
          isRequired={true}
          endContent={
            <button
              className="focus:outline-none"
              type="button"
              onClick={toggleVisibilityConfirm}
            >
              {confirmVisible ? <FiEye /> : <FiEyeOff />}
            </button>
          }
        />
      </div>
      <div
        className={"bottom-0 flex flex-row justify-end items-center space-x-2 "}
      >
        <CustomAsyncButton
          title={"Guardar cambios"}
          color={"primary"}
          variant={"solid"}
          isDisabled={!formik.isValid}
          onClick={formik.submitForm}
          isLoading={formik.isSubmitting}
        />
      </div>
    </form>
  );
}
