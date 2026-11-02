import { Popover, PopoverContent, PopoverTrigger, User } from "@heroui/react";
import React, { useState } from "react";
import { User as UserEntity } from '@/src/features/users/domain/entities/User';
import ListProfileActions from "@/src/features/users/ui/components/modals/ListProfileActions";


export default function UserPopover( { user, handleOpenModal, handelOpenLogoutModal } : {
  user : UserEntity,
  handleOpenModal : () => void,
  handelOpenLogoutModal? : () => void
} ) {
  
  const [isOpen, setIsOpen] = useState( false )
  
  return (
	<Popover isOpen={ isOpen } onOpenChange={ ( open ) => setIsOpen( open ) }>
	  <PopoverTrigger>
		<User
		  id={"user-button"}
		  as={ 'button' }
		  name={ '' }
		  description={ '' }
		  avatarProps={ {
			fallback : user?.username?.charAt( 0 ).toUpperCase(),
			showFallback : true,
			isBordered : false,
			src : '' as string,
		  } }
		  className="border-0 !outline-none !shadow-none transition-transform hover:!transform-none hover:!bg-transparent focus:!transform-none focus:!bg-transparent active:!transform-none active:!bg-transparent"
		/>
	  </PopoverTrigger>
	  <PopoverContent className="p-2">
		<ListProfileActions user={ user } handleOpenModal={ () => {
		  handleOpenModal();
		  setIsOpen( false );
		} } handelOpenLogoutModal={ handelOpenLogoutModal }
		/>
	  </PopoverContent>
	</Popover>
  );
}

