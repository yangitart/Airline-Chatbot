import { Avatar, Listbox, ListboxItem } from "@heroui/react";
import React from "react";
import { RiLogoutCircleLine } from "react-icons/ri";
import { LuUserRoundPen } from "react-icons/lu";
import { User } from "@/src/features/users/domain/entities/User";


export default function ListProfileActions(
  { user, handleOpenModal, handelOpenLogoutModal } : {
	user : User,
	handleOpenModal : () => void,
	handelOpenLogoutModal? : () => void
  }
) {
  const iconClasses = "text-xl pointer-events-none flex-shrink-0";
  
  return (
	<Listbox aria-label="Listbox menu with descriptions" variant="flat" className={ 'space-y-2' }>
	  <ListboxItem
		key="avatar"
		showDivider>
		<div className="flex gap-2 items-center">
		  <Avatar
			alt={ user.username }
			className="flex-shrink-0"
			size="sm"
			src={ '' }
			fallback={ user?.username?.charAt( 0 ).toUpperCase() }
		  />
		  <div className="flex flex-col">
			<span className="text-small">{ user.username }</span>
			<span className="text-tiny text-default-400">{ user.email }</span>
		  </div>
		</div>
	  </ListboxItem>
	  <ListboxItem
		key="edit"
		showDivider
		onPress={ handleOpenModal }
		startContent={ <LuUserRoundPen className={ iconClasses }/> }>
		Editar perfil
	  </ListboxItem>
	  <ListboxItem
	  	id={"logout-button"}
		key="delete"
		className="text-danger items-center"
		color="danger"
		startContent={ <RiLogoutCircleLine size={ 18 }/> }
		onPress={ handelOpenLogoutModal }
	  >
		Cerrar Sesión
	  </ListboxItem>
	</Listbox>
  );
}


