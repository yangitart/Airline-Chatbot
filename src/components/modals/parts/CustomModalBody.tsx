import { ReactNode } from 'react';
import { ModalBody } from "@heroui/react";

export default function CustomModalBody({ children, className }: { children: ReactNode, className?: string }) {
  return (
    <ModalBody
      style={{
        maxHeight: '75vh',
        background: "#F9FAFC"
      }}
      className={className}
    >
      {children}
    </ModalBody>
  );
}
