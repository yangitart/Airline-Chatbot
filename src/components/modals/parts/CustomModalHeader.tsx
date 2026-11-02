import { ModalHeader } from "@heroui/react";
import { ReactNode } from "react";

export default function CustomModalHeader({
  children,
  maxHeight,
  className,
}: {
  children: ReactNode;
  maxHeight?: string;
  className?: string;
}) {
  return (
    <ModalHeader
      className={`flex flex-col gap-1 ${className ?? ""}`}
      style={{
        maxHeight: maxHeight ?? "10vh",
      }}
    >
      {children}
    </ModalHeader>
  );
}
