import React from "react";
import { Button } from "@heroui/react";
import { APP_THEME_COLOR, APP_THEME_VARIANT } from "@/src/core/theme/theme";

type CustomButtonProps = {
  title: string;
  color?: APP_THEME_COLOR;
  variant?: APP_THEME_VARIANT;
  isDisabled?: boolean;
  onClick?: () => void;
  isFullWidth?: boolean;
  isLoading?: boolean;
  icon?: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
  iconPosition?: "left" | "right";
  id?: string;
  dataCy?: string;
  type?: "button" | "submit" | "reset";
};

export const CustomAsyncButton: React.FC<CustomButtonProps> = ({
  title,
  color = "primary",
  variant = "solid",
  onClick,
  isDisabled = false,
  isFullWidth = false,
  iconPosition = "left",
  isLoading = false,
  icon,
  className = "",
  size = "md",
  id,
  dataCy,
  type = "button",
}) => {
  const startContent = iconPosition === "left" && !isLoading ? icon : undefined;
  const endContent = iconPosition === "right" && !isLoading ? icon : undefined;

  return (
    <Button
      data-cy={dataCy}
      id={id}
      startContent={startContent}
      endContent={endContent}
      fullWidth={isFullWidth}
      type={type}
      onPress={onClick}
      isLoading={isLoading}
      isDisabled={isDisabled}
      color={color}
      size={size}
      variant={variant}
      className={`${className} rounded-[5px] border`}
    >
      {title}
    </Button>
  );
};
