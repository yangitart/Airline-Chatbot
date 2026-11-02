import { Spinner } from "@heroui/react";
import TextField from '@mui/material/TextField';
import React from 'react';
import { FormikValues } from 'formik';
import { CheckIcon } from '@heroicons/react/16/solid';

export const componentsProps = {
  popper: {
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [0, 5],
        },
      },
    ],
  },
};

export function AutocompleteEndContent(
  isLoading: boolean,
  clearText: () => void,
  inputValue?: string,
) {
  return (
    <div className="flex flex-row items-center justify-end">
      {isLoading && <Spinner size="sm" />}
      {/*{inputValue && (*/}
      {/*  <CustomIconButton*/}
      {/*    color="default"*/}
      {/*    variant="light"*/}
      {/*    icon={<MdClose />}*/}
      {/*    onClick={clearText}*/}
      {/*  />*/}
      {/*)}*/}
    </div>
  );
}

export function RenderAutoCompleteInput({
  params,
  clearText,
  form,
  formKey,
  inputValue,
  placeholder,
  textInfo,
  isLoading,
  isRequired,
}: {
  params: any;
  inputValue: string;
  form: FormikValues;
  formKey: string;
  clearText: () => void;
  placeholder: string;
  isLoading: boolean;
  isRequired: boolean;
  textInfo?: string;
}) {
  return (
    <TextField
      {...params}
      variant="outlined"
      InputProps={{
        ...params.InputProps,
        style: {
          borderRadius: 8,
          borderWidth: 1,
          fontSize: 13,
        },
        endAdornment: AutocompleteEndContent(isLoading, clearText, inputValue),
      }}
      placeholder={placeholder ?? 'Buscar'}
      color={
        form.touched[formKey] && form.errors[formKey] ? 'error' : 'primary'
      }
      error={
        form.touched[formKey] && form.errors[formKey]
          ? form.errors[formKey]
          : undefined
      }
    />
  );
}

export function RenderAutocompleteItem(
  props: any,
  selected: boolean,
  mapItem: any,
) {
  return (
    <li
      {...props}
      className={`mx-2 my-1 flex cursor-pointer flex-row items-center justify-between rounded-lg p-2 text-black hover:bg-default
              ${selected ? 'bg-default' : ''}
            `}
    >
      {mapItem}
      {selected && <CheckIcon height={16} width={16} />}
    </li>
  );
}
