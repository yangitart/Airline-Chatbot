"use client";
import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import { CustomButton } from "@/src/components/buttons/CustomButton";
import { CustomAsyncButton } from "@/src/components/buttons/CustomAsyncButton";
import { EntityManager } from "@/src/features/entities/domain/entities/EntityManager";

interface DeleteManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  manager: EntityManager;
  onDelete: (managerId: string) => void;
}

export default function DeleteManagerModal({
  isOpen,
  onClose,
  manager,
  onDelete,
}: DeleteManagerModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      onDelete(manager.id);
      onClose();
    } catch (error) {
      console.error("Error al eliminar gestor:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalContent>
        <ModalHeader>Eliminar Gestor</ModalHeader>
        <ModalBody>
          <div className="mb-4">
            <p className="text-sm text-gray-500">
              ¿Está seguro que desea eliminar al gestor{" "}
              <span className="font-medium">{manager.user.fullName}</span>?
            </p>
            <p className="text-sm text-danger mt-2">
              Esta acción no se puede deshacer.
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <CustomButton
            title="Cancelar"
            color="default"
            variant="light"
            onClick={onClose}
          />
          <CustomAsyncButton
            title="Eliminar"
            color="danger"
            onClick={handleDelete}
            isLoading={isLoading}
          />
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
