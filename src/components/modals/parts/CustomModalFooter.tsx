import { ModalFooter } from "@heroui/react";
import { ReactNode } from 'react';

export default function CustomModalFooter({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <ModalFooter
      style={{
        maxHeight: '15vh',
      }}
      className={className ?? 'flex flex-row justify-between'}
    >
      {children}
    </ModalFooter>
  );
}
