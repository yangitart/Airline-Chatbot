"use client";
import React, { useEffect } from "react";
import {
  Modal,
  ModalContent,
} from "@heroui/react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { CustomAsyncButton } from "@/src/components/buttons/CustomAsyncButton";
import { cubanEmailUserValidation } from "@/src/core/common/validations/userValidations";
import { EntityManager } from "@/src/features/entities/domain/entities/EntityManager";
import CustomModalHeader from "@/src/components/modals/parts/CustomModalHeader";
import CustomModalBody from "@/src/components/modals/parts/CustomModalBody";
import CustomModalFooter from "@/src/components/modals/parts/CustomModalFooter";
import ReplaceDirectorForm from "@/src/features/users/ui/components/ReplaceDirectorForm";

interface ReplaceDirectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  director: EntityManager;
  onReplace: (directorId: string, newPersonId: string) => void;
}

export default function ReplaceDirectorModal({
  isOpen,
  onClose,
  director,
  onReplace,
}: ReplaceDirectorModalProps) {
  const form = useFormik({
    initialValues: { email: "" },
    validationSchema: Yup.object().shape({
      email: cubanEmailUserValidation,
    }),
    onSubmit: async (values) => {
      onReplace(director.id, values.email);
      onClose();
      form.resetForm();
    },
  });
  useEffect(() => { }, [director]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalContent>
        <CustomModalHeader>
          Sustituir Directivo
        </CustomModalHeader>
        <CustomModalBody>
          <div className="mb-1">
            <p className="text-sm font-rubik">
              Director actual:{" "}
              <span className="font-medium">
                {director.user.fullName
                  ? director.user.fullName
                  : director.email}
              </span>
            </p>
          </div>
          <div className="mb-1">
            <ReplaceDirectorForm form={form} label="Nuevo Director" />
          </div>
        </CustomModalBody>
        <CustomModalFooter className="justify-end">
          <CustomAsyncButton
            title="Sustituir"
            color="primary"
            onClick={form.submitForm}
            isDisabled={!form.isValid}
            isLoading={form.isSubmitting}
          />
        </CustomModalFooter>
      </ModalContent>
    </Modal>
  );
}