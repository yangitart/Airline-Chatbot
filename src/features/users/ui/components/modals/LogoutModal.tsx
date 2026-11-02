import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/react";
import { APP_ROUTES } from '@/src/core/routes/routes';
import React, { useState } from 'react';
import { useAuthenticationStore } from '@/src/features/authentication/ui/stores/AuthenticationStore';
import { CustomAsyncButton } from '@/src/components/buttons/CustomAsyncButton';
import { useRouter } from 'next/navigation';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LogoutModal({ isOpen, onClose }: LogoutModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { logout } = useAuthenticationStore();

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>Cerrar sesión</ModalHeader>
        <ModalBody className="flex flex-col gap-1">
          <p>¿Está seguro de cerrar la sesión?</p>
        </ModalBody>
        <ModalFooter>
          <Button color="default" onPress={onClose}>
            Cancelar
          </Button>
          <CustomAsyncButton
            id="logout-button-acept"
            isLoading={isLoading}
            title="Cerrar"
            color="danger"
            variant="solid"
            onClick={async () => {
              setIsLoading(true);
              const response = await logout();
              setIsLoading(false);
              if (response) {
                router.replace(APP_ROUTES.LOGIN);
              }
            }}
          />
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
