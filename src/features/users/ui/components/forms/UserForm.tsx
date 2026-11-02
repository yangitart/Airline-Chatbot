import { useFormik } from "formik";
import { CustomAsyncButton } from "@/src/components/buttons/CustomAsyncButton";
import * as Yup from "yup";
import { numberValidation } from "@/src/core/common/validations/defaultValidations";
import { nameAndLastNameValidation } from "@/src/core/common/validations/personValidations";
import CustomTextInput from "@/src/components/inputs/basic/CustomTextInput";
import { useUserStore } from "@/src/features/users/ui/store/useUserStore";
import { User as CurrentUser } from "@/src/features/users/domain/entities/User";
import { cubanEmailUserValidation } from "@/src/core/common/validations/userValidations";
import CustomSelect from "@/src/components/inputs/basic/CustomSelect";
import {
  AcademicDegreeNomenclature,
  ScientificDegreeNomenclature,
} from "@/src/features/shared/nomenclatures/domain/entities/PersonNomenclatures";
import { scientificDegrees, academicDegrees } from "@/src/core/constants/userDegrees";
import { useCurrentUser } from "../../store/hooks/useUserData";

export function UserForm({ user }: { user: CurrentUser }) {
  const { updateUserMe } = useUserStore();
  const { refetch } = useCurrentUser();

  const form = useFormik({
    validationSchema: Yup.object().shape({
      email: cubanEmailUserValidation,
      phone: Yup.string()
        .required("Teléfono es requerido")
        .matches(/^\d{8}$/, "El teléfono debe tener exactamente 8 dígitos"),
      identityCard: numberValidation,
      name: nameAndLastNameValidation,
      firstLastName: nameAndLastNameValidation,
      secondLastName: nameAndLastNameValidation,
      username: Yup.string()
        .required("Campo requerido")
        .min(3, "El nombre de usuario debe tener al menos 3 caracteres")
        .max(16, "El nombre de usuario no puede exceder los 16 caracteres")
        .matches(/^\S+$/, "El nombre de usuario no puede contener espacios"),
    }),
    initialValues: {
      identityCard: user?.identityCard ?? "",
      name: user?.name ?? "",
      firstLastName: user?.firstLastName ?? "",
      secondLastName: user?.secondLastName ?? "",
      email: user?.email ?? "",
      username: user?.username ?? "",
      personId: user?.id ?? "",
      phone: user?.phone ?? "",
      scientificDegree: user?.scientificDegree ?? undefined,
      academicDegree: user?.academicDegree ?? undefined,
    },

    onSubmit: async (values) => {
      await updateUserMe({
        profile: {
          identityCard: values.identityCard,
          firstLastName: values.firstLastName,
          secondLastName: values.secondLastName,
          name: values.name,
          phone: values.phone,
          academicDegree:
            values.academicDegree === "NONE"
              ? null
              : (values.academicDegree as AcademicDegreeNomenclature),
          scientificDegree:
            values.scientificDegree === "NONE"
              ? null
              : (values.scientificDegree as ScientificDegreeNomenclature),
        },
        email: values.email,
        username: values.username,
      });

      refetch();
    },
  });

  return (
    <form
      onSubmit={form.handleSubmit}
      className="flex flex-col space-y-4 overflow-y-auto h-full w-full justify-between"
    >
      <div className="grid grid-cols-2 gap-4">
        <CustomTextInput
          form={form}
          dataCy="identityCard"
          formKey="identityCard"
          label="Carnet de identidad"
          placeholder="############"
          isRequired
        />

        <CustomTextInput
          form={form}
          dataCy="email"
          formKey="email"
          placeholder="usuario@dominio.cu"
          label="Correo electrónico"
          isRequired
        />

        <CustomTextInput
          form={form}
          dataCy="username"
          formKey="username"
          placeholder="Nombre de usuario"
          label="Nombre de usuario"
          isRequired
        />

        <CustomTextInput
          form={form}
          dataCy="name"
          formKey="name"
          placeholder="Escribe tu nombre"
          label="Nombre"
          isRequired
        />

        <CustomTextInput
          form={form}
          dataCy="firstLastName"
          formKey="firstLastName"
          placeholder="Primer apellido"
          label="Primer Apellido"
          isRequired
        />

        <CustomTextInput
          form={form}
          dataCy="secondLastName"
          formKey="secondLastName"
          placeholder="Segundo apellido"
          label="Segundo Apellido"
          isRequired
        />

        <CustomTextInput
          form={form}
          dataCy="phone"
          formKey="phone"
          label="Teléfono de contacto"
          placeholder="Teléfono"
          isRequired
          inputType="phone"
        />

        <CustomSelect
          items={academicDegrees}
          dataCy="academicDegree"
          form={form}
          formKey="academicDegree"
          label="Grado académico"
          defaultSelectedValue={form.values.academicDegree as string}
          isRequired={false}
          mapKey={(item) => item.key}
          mapItem={(item) => item.label}
          placeholder="Grado académico"
        />

        <div className="col-span-2">
          <CustomSelect
            items={scientificDegrees}
            dataCy="scientificDegree"
            form={form}
            formKey="scientificDegree"
            label="Grado científico"
            defaultSelectedValue={form.values.scientificDegree as string}
            isRequired={false}
            mapKey={(item) => item.key}
            mapItem={(item) => item.label}
            placeholder="Grado científico"
          />
        </div>
      </div>

      <div className="bottom-0 flex flex-row justify-end items-center space-x-2">
        <CustomAsyncButton
          dataCy="save-button"
          title="Guardar"
          color="primary"
          variant="solid"
          isDisabled={!form.isValid}
          onClick={form.submitForm}
          isLoading={form.isSubmitting}
        />
      </div>
    </form>
  );
}
