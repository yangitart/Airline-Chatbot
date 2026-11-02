import { Input } from "@heroui/react";
import React from 'react';
import * as Yup from 'yup';
import { FormikValues } from 'formik';
import { PHONE_PLACEHOLDER } from '@/src/components/inputs/const/placeholder'; // Validación del formato específico para el teléfono

// Validación del formato específico para el teléfono
export const phoneValidation = Yup.string()
  .required('Campo requerido')
  .matches(/^\+53 5 \d{3} \d{4}$/, 'Formato incorrecto');

export function formatPhone(value: string | null) {
  if (value) {
    return value.replace(/^(\d{1,4})(\d{3})(\d{4})$/, '+53 $1 $2 $3');
  }
}

// // Función para formatear el valor del teléfono al formato '+53 5 XXX XXXX'
// export endpoints formatPhone = (value: string | undefined): string => {
//   if (!value) return '';
//
//   endpoints cleanedValue = value.replace(/\D/g, ''); // Remueve todos los caracteres que no son dígitos
//
//   let formattedValue = '+53 5 ';
//
//   // Construye el valor formateado
//   if (cleanedValue.length > 1) {
//     formattedValue += cleanedValue.substring(1, 4);
//   }
//   if (cleanedValue.length > 4) {
//     formattedValue += ' ' + cleanedValue.substring(4, 8);
//   }
//
//   return formattedValue.trim(); // Retorna el número de teléfono formateado
// };

/**
 * Componente CustomPhoneInput para renderizar un input de teléfono con formato y validación integrados usando Formik y Yup.
 * @param {CustomPhoneInputProps} props - Props para el componente CustomPhoneInput.
 * @returns {JSX.Element} Componente de input de teléfono con estilo personalizado e integración Formik.
 */
export const CustomPhoneInput = ({
  form,
  formKey,
  label,
  required,
}: {
  form: FormikValues; // Valores del formulario Formik
  formKey: string; // Clave del campo en los valores del formulario
  label?: string; // Etiqueta para el input de teléfono
  required: boolean;
}) => {
  // Función para formatear el valor por defecto si existe
  const formattedDefaultValue = form.values[formKey]
    ? formatPhone(form.values[formKey])
    : '';

  // Función para manejar el cambio en el input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    form.setFieldTouched(formKey);
    const formattedValue = formatPhone(e.target.value); // Formatea el valor del input
    form.handleChange(e);
    form.setFieldValue(formKey, formattedValue); // Actualiza el valor en el formulario
  };

  return (
    <div className="flex w-full flex-col">
      {label && (
        <span className="flex flex-row text-small text-foreground opacity-70">
          {label}
          {required && <div className="text-danger">*</div>}
        </span>
      )}
      <Input
        id={formKey}
        variant="bordered"
        size="md"
        inputMode="numeric"
        maxLength={8}
        onBlur={form.handleBlur}
        color={
          form.touched[formKey] && form.errors[formKey] ? 'danger' : 'primary'
        }
        errorMessage={
          form.touched[formKey] && form.errors[formKey]
            ? form.errors[formKey]?.toString()
            : undefined
        }
        isInvalid={form.touched[formKey] && form.errors[formKey]}
        onChange={handleChange}
        value={formattedDefaultValue}
        placeholder={PHONE_PLACEHOLDER}
      />
    </div>
  );
};

export default CustomPhoneInput;
