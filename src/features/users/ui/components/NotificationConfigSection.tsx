import React, { ReactNode, useState } from "react";
import { CustomButton } from "@/src/components/buttons/CustomButton";
import { ChangePasswordForm } from "@/src/features/users/ui/components/forms/ChangePasswordForm";

interface SecurityConfigItem {
  key : string,
  name : string;
  description : string,
  action : ReactNode
}

export function NotificationConfigSection() {
  
  const [state, setState] = useState<'changePassword' | undefined>(
  )
  
  const securityConfigItems : SecurityConfigItem[] = [
	{
	  key : 'change-password',
	  name : 'Cambiar contraseña',
	  description : 'Configura tu contraseña única para proteger tu cuenta ',
	  action : <CustomButton size={ "sm" } onClick={ () => {
		setState( 'changePassword' )
	  } } title={ 'Cambiar' }/>
	}
  ]
  
  
  function RenderActionSection() {
	switch (state) {
	  case 'changePassword' :
		return ChangePasswordForm()
	  default :
		return <></>
	}
  }
  
  
  function SecurityConfigElement( props :
								  SecurityConfigItem ) {
	return (
	  <div className={ 'flex flex-col w-full space-y-5' }>
		<div className={ 'flex flex-row justify-between items-center' }>
		  <div className={ 'flex flex-col' }>
			<span className={ 'text-md font-semibold' }>{ props.name }</span>
			<span className={ 'text-tiny' }> { props.description }</span>
		  </div>
		  { props.action }
		</div>
		<RenderActionSection/>
	  </div>
	)
  }
  
  
  return (
	<div className={ 'flex flex-col w-full h-full space-y-4 ' }>
	  <span className={ 'text-2xl font-semibold' }>Ajustes de notificaciones</span>
	  
	  {/*<div className={ 'border-1 border-default p-4 rounded-md overflow-y-auto ' }>*/ }
	  {/*{ securityConfigItems.map( ( { key, action, name, description }, i ) =>*/ }
	  {/*  <SecurityConfigElement key={ key } action={ action } name={ name } description={ description }/>*/ }
	  {/*) }*/ }
	  {/*</div>*/ }
	
	</div>
  )
}