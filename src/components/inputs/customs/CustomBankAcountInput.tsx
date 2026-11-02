import React from 'react';
import { Input } from "@heroui/react";
import * as Yup from 'yup';
import { FormikValues } from 'formik';

export const bankAccountValidation = Yup.string()
  .required( 'Campo requerido' )
  .matches( /^\d{4}\s\d{4}\s\d{4}\s\d{4}$/, 'Formato incorrecto' );

export const formatBankAccount = ( value : string ) : string => {
  if ( !value ) return ''; // Retorna cadena vacía si el valor es null, undefined o vacío
  
  // Remueve todos los caracteres que no son dígitos
  const cleanedValue = value.replace( /\D/g, '' );
  
  // Divide la cadena en grupos de cuatro caracteres y los une con un espacio
  return cleanedValue.match( /.{1,4}/g )?.join( ' ' ) || '';
};

/**
 * Componente BankAccountInput para renderizar un campo de entrada de cuenta bancaria con formato y integración Formik.
 * @param {BankAccountInputProps} props - Props para el componente BankAccountInput.
 * @returns {JSX.Element} Componente de campo de entrada de cuenta bancaria con formato y personalización.
 */
const BankAccountInput = ( {
							 form,
							 formKey,
							 label,
							 isDisable = false,
						   } : {
  form : FormikValues; // Valores del formulario Formik
  formKey : string; // Clave del campo en los valores del formulario
  label? : string; // Etiqueta para el campo de entrada
  isDisable? : boolean; // Indica si el campo está deshabilitado
} ) => {
  // Función para formatear el valor por defecto si existe
  const formattedDefaultValue = form.values[ formKey ]
	? formatBankAccount( form.values[ formKey ] )
	: '';
  
  // Función para manejar el cambio en el input
  const handleChange = ( e : React.ChangeEvent<HTMLInputElement> ) => {
	form.setFieldTouched( formKey );
	const formattedValue = formatBankAccount( e.target.value );
	form.handleChange( e );
	form.setFieldValue( formKey, formattedValue );
  };
  
  return (
	<div className="flex w-full flex-col">
	  { label && (
		<span className="flex flex-row text-small text-foreground opacity-70">
          { label }
		  <div className="text-danger">*</div>
        </span>
	  ) }
	  <Input
		id={ formKey }
		isDisabled={ isDisable }
		variant="bordered"
		size="md"
		radius="sm"
		maxLength={ 19 }
		inputMode="numeric"
		onBlur={ form.handleBlur }
		color={
		  form.touched[ formKey ] && form.errors[ formKey ] ? 'danger' : 'primary'
		}
		isInvalid={ form.touched[ formKey ] && form.errors[ formKey ] }
		errorMessage={
		  form.touched[ formKey ] && form.errors[ formKey ]
			? form.errors[ formKey ]?.toString()
			: undefined
		}
		onChange={ handleChange }
		value={ formattedDefaultValue }
		placeholder={ 'XXXX XXXX XXXX XXXX' }
	  />
	</div>
  );
};

export default BankAccountInput;
