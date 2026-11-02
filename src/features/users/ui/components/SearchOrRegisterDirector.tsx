"use client";
import { Autocomplete, AutocompleteItem, Avatar, Tooltip } from "@heroui/react";
import { User } from "@/src/features/users/domain/entities/User";
import { FormikValues, getIn } from "formik";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { SearchIcon, PlusIcon } from "@/src/components/Icons/extra/TableIcons";
import debounce from "lodash/debounce";
import { CustomButton } from "@/src/components/buttons/CustomButton";
import { useUserStore } from "@/src/features/users/ui/store/useUserStore";
import { formatFilters } from "@/src/core/api/services/graphQl.service";
import { EntityManager } from "@/src/features/entities/domain/entities/EntityManager";
import { Input } from "@heroui/react";
import { entityRepository } from "@/src/features/entities/domain/repositories/EntitiesRepository";

export default function SearchOrRegisterDirector({
  label,
  form,
  formKey,
  defaultValue,
  handleSetUser,
}: {
  label: string;
  defaultValue?: User;
  form: FormikValues;
  formKey: string;
  handleSetUser?: (user: User | null) => void;
}) {
  const [inputValue, setInputValue] = useState(defaultValue?.fullName ?? "");
  const [isEmailMode, setIsEmailMode] = useState(false);
  const { data: currentUser } = useUserStore();
  const [managers, setManagers] = useState<EntityManager[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const toggleMode = () => {
    setIsEmailMode(!isEmailMode);
    form.setFieldValue(isEmailMode ? formKey : "email", "");
  };

  const searchManagers = useCallback(
    async (searchTerm: string) => {
      if (!currentUser?.entity?.id || !searchTerm) {
        setManagers([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await entityRepository.getEntitiesManagersByEntityId(
          currentUser.entity.id,
          {
            page: 1,
            limit: 10,
            search: "",
            filters: formatFilters({
              user_full_name: searchTerm,
            }),
          }
        );

        if (response._tag === "Right") {
          setManagers(response.right.data || []);
        } else {
          console.error("Error searching managers:", response.left);
          setManagers([]);
        }
      } catch (error) {
        console.error("Error searching managers:", error);
        setManagers([]);
      } finally {
        setIsLoading(false);
      }
    },
    [currentUser?.entity?.id]
  );

  const debouncedSearchManagers = useMemo(
    () => debounce((value: string) => searchManagers(value), 300),
    [searchManagers]
  );

  useEffect(() => {
    return () => debouncedSearchManagers.cancel();
  }, [debouncedSearchManagers]);

  const onInputChange = (newInputValue: string) => {
    setInputValue(newInputValue);
    debouncedSearchManagers(newInputValue);
  };

  const onChange = (newValue: string | null) => {
    if (newValue) {
      form.setFieldValue(formKey, newValue);
      setInputValue(newValue);
      form.handleBlur(formKey);

      const selectedManager = managers.find((item) => item.id === newValue);

      if (selectedManager?.user && handleSetUser) {
        handleSetUser(selectedManager.user);
        form.setFieldValue(formKey, selectedManager.user.id);
      }
    } else {
      debouncedSearchManagers.cancel();
      form.setFieldValue(formKey, "");
      setInputValue("");
      if (handleSetUser) {
        handleSetUser(null);
      }
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="mb-2">
        <span className="text-small text-foreground opacity-70">{label}</span>
      </div>

      <div className="flex items-start gap-2">
        {isEmailMode ? (
          <div className="flex-grow relative">
            <Input
              type="email"
              variant="bordered"
              size="md"
              radius="sm"
              placeholder="Ingrese el correo electrónico"
              value={form.values.email || ""}
              onChange={(e) => form.setFieldValue("email", e.target.value)}
              onBlur={() => form.setFieldTouched("email")}
              isInvalid={!!(form.touched.email && form.errors.email)}
              errorMessage={
                form.touched.email && form.errors.email
                  ? form.errors.email?.toString()
                  : undefined
              }
              color={
                form.touched.email && form.errors.email ? "danger" : "primary"
              }
              className="w-full"
            />
          </div>
        ) : (
          <div className="flex-grow">
            <Autocomplete
              fullWidth
              inputValue={inputValue}
              isLoading={isLoading}
              items={managers}
              onBlur={form.handleBlur}
              placeholder="Buscar por nombre completo"
              variant="bordered"
              size="md"
              radius="sm"
              onInputChange={onInputChange}
              onSelectionChange={(key) => onChange(key?.toString() ?? null)}
              classNames={{
                listboxWrapper: "max-h-[320px]",
                selectorButton: "text-default-500",
              }}
              listboxProps={{
                emptyContent: "No se encontraron resultados",
                hideSelectedIcon: true,
                itemClasses: {
                  base: [
                    "rounded-medium",
                    "text-default-500",
                    "transition-opacity",
                    "payload-[hover=true]:text-foreground",
                    "dark:payload-[hover=true]:bg-default-50",
                    "payload-[pressed=true]:opacity-70",
                    "payload-[hover=true]:bg-default-200",
                    "payload-[selectable=true]:focus:bg-default-100",
                    "payload-[focus-visible=true]:ring-default-500",
                  ],
                },
              }}
              popoverProps={{
                offset: 10,
                classNames: {
                  content: "p-1 border-small border-default-100 bg-background",
                },
              }}
              color={
                getIn(form.touched, formKey) && getIn(form.errors, formKey)
                  ? "danger"
                  : "primary"
              }
              isInvalid={
                getIn(form.touched, formKey) && getIn(form.errors, formKey)
              }
              errorMessage={
                form.touched[formKey] && form.errors[formKey]
                  ? form.errors[formKey]?.toString()
                  : undefined
              }
              allowsCustomValue={true}
              defaultInputValue={form.values[formKey] ?? ""}
              selectorIcon={<SearchIcon />}
            >
              {(manager: EntityManager) => (
                <AutocompleteItem
                  key={manager.id}
                  textValue={manager.user?.fullName || ""}
                >
                  <div key={manager.id} className="flex items-center space-x-2">
                    <Avatar className="flex-shrink-0" size="sm" src={""} />
                    <div className="flex flex-col">
                      <span className="text-small">
                        {manager.user?.fullName}
                      </span>
                      <span className="text-small">
                        {manager.user?.identityCard}
                      </span>
                      <span className="text-small text-primary">
                        {manager.user?.email}
                      </span>
                    </div>
                  </div>
                </AutocompleteItem>
              )}
            </Autocomplete>
          </div>
        )}

        <Tooltip content={isEmailMode ? "Buscar existente" : "Registrar nuevo"}>
          <CustomButton
            icon={isEmailMode ? <SearchIcon /> : <PlusIcon />}
            isIconOnly={true}
            title=""
            aria-label={isEmailMode ? "Buscar existente" : "Registrar nuevo"}
            color="primary"
            variant="solid"
            onClick={toggleMode}
            size="md"
            className="min-w-0"
          />
        </Tooltip>
      </div>
    </div>
  );
}
