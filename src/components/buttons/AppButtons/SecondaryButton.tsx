import React, { ReactNode } from 'react';
import { Button } from "@heroui/react";

export type CustomButtonProps = {
  icon? : ReactNode;
  title? : string;
  isDisabled? : boolean;
  onClick? : () => void;
  isButtonModal? : boolean;
  isIconOnly? : boolean;
  size? : 'sm' | 'md' | 'lg';
};

export const SecondaryButton : React.FC<CustomButtonProps> = ( {
																 icon,
																 title,
																 onClick,
																 isDisabled = false,
																 isIconOnly = false,
																 size,
																 isButtonModal = false,
															   } ) => {
  const PlusIconModal = isButtonModal ? (
	<svg
	  width="12"
	  height="12"
	  viewBox="0 0 12 12"
	  fill="none"
	  xmlns="http://www.w3.org/2000/svg"
	>
	  <path
		fillRule="evenodd"
		clipRule="evenodd"
		d="M6 0C6.27614 0 6.5 0.223858 6.5 0.5V5.5H11.5C11.7761 5.5 12 5.72386 12 6C12 6.27614 11.7761 6.5 11.5 6.5H6.5V11.5C6.5 11.7761 6.27614 12 6 12C5.72386 12 5.5 11.7761 5.5 11.5V6.5H0.5C0.223858 6.5 0 6.27614 0 6C0 5.72386 0.223858 5.5 0.5 5.5H5.5V0.5C5.5 0.223858 5.72386 0 6 0Z"
		fill="#F9FAFC"
	  />
	</svg>
  ) : null;
  
  return (
	<Button
	  startContent={ icon ? icon : PlusIconModal }
	  size={ size ?? 'md' }
	  type={ 'button' }
	  onClick={ onClick }
	  isDisabled={ isDisabled }
	  variant="flat"
	  color="secondary"
	  isIconOnly={ isIconOnly }
	>
	  { title }
	</Button>
  );
};
