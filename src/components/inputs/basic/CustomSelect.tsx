'use client';
import React, { useEffect, useState, useRef } from 'react';
import { Select, SelectItem, Tooltip } from "@heroui/react";
import { BaseItemNomenclature } from '@/src/features/shared/nomenclatures/domain/entities/BaseItemNomenclature';
import { FormikValues, getIn } from 'formik';
import InfoIcon from '@/src/components/Icons/legacy/InfoIcon';

const CustomSelect = ({
  items,
  defaultSelectedValue,
  form,
  formKey,
  label,
  isRequired,
  width,
  isDisable = false,
  multiple,
  textInfo,
  mapItem,
  mapKey,
  onChange,
  placeholder,
  showComplete,
  className,
  dataCy,
}: {
  placeholder?: string;
  items: BaseItemNomenclature[]; // Lista de elementos para el select
  form: FormikValues; // Valores del formulario Formik
  defaultSelectedValue?: string | number; // Valor predeterminado seleccionado
  formKey: string; // Clave del campo en los valores del formulario
  label?: string; // Etiqueta para el select
  width?: string | number; // Ancho del select
  isRequired: boolean; // Indica si el select es obligatorio
  isDisable?: boolean; // Indica si el select está deshabilitado
  multiple?: boolean; // Indica si se permite selección múltiple en el select
  textInfo?: string; // Texto a mostrar si es necesario mostrar una informacion al usuario
  mapItem?: (value: BaseItemNomenclature) => string | number | undefined | null;
  mapKey?: (key: BaseItemNomenclature) => string | number | undefined;
  onChange?: (key: string) => void;
  showComplete?: boolean;
  className?: string;
  dataCy?: string;
}) => {
  const [value, setValue] = useState(defaultSelectedValue);
  const selectItemRefs = useRef<{[key: string]: HTMLDivElement | null}>({});
  const touched = getIn(form.touched, formKey);
  const error = getIn(form.errors, formKey);

  const handleSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    form.setFieldValue(formKey, value);
    setValue(value);
  };

  useEffect(() => {
    const formValue = getIn(form.values, formKey);
    const hasFormValue =
      formValue !== undefined &&
      formValue !== null &&
      (Array.isArray(formValue) ? formValue.length > 0 : `${formValue}` !== "");

    if (hasFormValue) {
      setValue(formValue);
      return;
    }

    setValue(defaultSelectedValue);
  }, [form.values, defaultSelectedValue, formKey]);

  return (
    <div className={`flex w-full flex-col ${className ?? ""}`}>
      <div className="flex flex-row items-center text-small text-foreground opacity-70">
        <span>{label}</span>
        {isRequired && <span className="text-danger">*</span>}
        {textInfo && (
          <Tooltip
            classNames={{
              content: 'w-[300px] p-2 text-justify',
            }}
            content={textInfo}
            placement={'right'}
          >
            <div>
              <InfoIcon />
            </div>
          </Tooltip>
        )}
      </div>
      <Select
        data-cy={dataCy}
        classNames={{ trigger: 'rounded-[5px] border' }}
        isDisabled={isDisable}
        style={{ width: width }}
        id={formKey}
        name={formKey}
        size="md"
        radius={'sm'}
        multiple={multiple}
        items={items}
        variant="bordered"
        placeholder={placeholder ?? 'Seleccionar'}
        onBlur={(event) => {
          form.handleBlur(event);
          void form.setFieldTouched(formKey, true);
        }}
        fullWidth
        color={touched && error ? 'danger' : 'primary'}
        errorMessage={
          touched && error
            ? error.toString() !== 'Otro' && error.toString()
            : undefined
        }
        isInvalid={Boolean(touched && error)}
        onChange={(e) => {
          setValue(e.target.value);
          if (onChange) {
            onChange(e.target.value);
          } else {
            form.handleChange(e);
            form.setFieldValue(formKey, e.target.value);
          }
        }}
        selectedKeys={value ? [value.toString()] : []}
      >
        {items.map((item) => (
          <SelectItem
            key={mapKey ? mapKey(item) : item.key!}
            title={mapItem ? mapItem(item) : item.label} 
          >
            {mapItem ? mapItem(item) : item.label}
          </SelectItem>
        ))}
      </Select>
    </div>
  );
};

export default CustomSelect;

