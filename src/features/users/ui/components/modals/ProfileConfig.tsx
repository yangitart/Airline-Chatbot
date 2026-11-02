import { User as CurrentUser } from "@/src/features/users/domain/entities/User";
import { ReactNode, useState } from "react";
import { Divider, useDisclosure, User } from "@heroui/react";
import { LogoutModal } from "@/src/features/users/ui/components/modals/LogoutModal";
import { SecurityConfigSection } from "@/src/features/users/ui/components/SecurityConfigSection";
import PersonalInformationSection from "@/src/features/users/ui/components/PersonalInformationSection";
import { PRIMARY_COLOR } from "@/src/core/theme/app_colors";

interface ItemOption {
  name: string;
  icon: ReactNode;
}

const sections: ItemOption[] = [
  {
    name: "Información personal",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          opacity="0.3"
          d="M22 12C22 17.5 17.5 22 12 22C6.5 22 2 17.5 2 12C2 6.5 6.5 2 12 2C17.5 2 22 6.5 22 12ZM12 7C10.3 7 9 8.3 9 10C9 11.7 10.3 13 12 13C13.7 13 15 11.7 15 10C15 8.3 13.7 7 12 7Z"
          fill={PRIMARY_COLOR}
        />
        <path
          d="M12 22C14.6 22 17 21 18.7 19.4C17.9 16.9 15.2 15 12 15C8.8 15 6.09999 16.9 5.29999 19.4C6.99999 21 9.4 22 12 22Z"
          fill={PRIMARY_COLOR}
        />
      </svg>
    ),
  },
  {
    name: "Ajustes de seguridad",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          opacity="0.3"
          d="M22.0318 8.59998C22.0318 10.4 21.4318 12.2 20.0318 13.5C18.4318 15.1 16.3318 15.7 14.2318 15.4C13.3318 15.3 12.3318 15.6 11.7318 16.3L6.93177 21.1C5.73177 22.3 3.83179 22.2 2.73179 21C1.63179 19.8 1.83177 18 2.93177 16.9L7.53178 12.3C8.23178 11.6 8.53177 10.7 8.43177 9.80005C8.13177 7.80005 8.73176 5.6 10.3318 4C11.7318 2.6 13.5318 2 15.2318 2C16.1318 2 16.6318 3.20005 15.9318 3.80005L13.0318 6.70007C12.5318 7.20007 12.4318 7.9 12.7318 8.5C13.3318 9.7 14.2318 10.6001 15.4318 11.2001C16.0318 11.5001 16.7318 11.3 17.2318 10.9L20.1318 8C20.8318 7.2 22.0318 7.59998 22.0318 8.59998Z"
          fill={PRIMARY_COLOR}
        />
        <path
          d="M4.23179 19.7C3.83179 19.3 3.83179 18.7 4.23179 18.3L9.73179 12.8C10.1318 12.4 10.7318 12.4 11.1318 12.8C11.5318 13.2 11.5318 13.8 11.1318 14.2L5.63179 19.7C5.23179 20.1 4.53179 20.1 4.23179 19.7Z"
          fill={PRIMARY_COLOR}
        />
      </svg>
    ),
  },
];

export function ProfileConfig({
  user,
  onCloseModal,
}: {
  user: CurrentUser;
  onCloseModal: () => void;
}) {
  const [currentSection, setCurrentSection] = useState(0);

  const {
    isOpen: isOpen3,
    onClose: onClose3,
    onOpen: onOpen3,
  } = useDisclosure();

  function Item(props: {
    option: ItemOption;
    index: number;
    action: () => void;
  }) {
    return (
      <div
        className={
          "hover:bg-default rounded-md p-2 flex flex-row items-center justify-between cursor-pointer"
        }
        onClick={props.action}
      >
        <div
          className={`
		space-x-1 flex-row flex ${props.index === currentSection ? "text-primary" : ""} items-center `}
        >
          {props.option.icon}
          <span>{props.option.name}</span>
        </div>
        <svg
          width="7"
          height="14"
          viewBox="0 0 7 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1.06875 13.9688C0.868748 13.9688 0.668742 13.8688 0.468742 13.7688C-0.0312583 13.4688 -0.131246 12.8688 0.168754 12.3688L3.76874 6.96878L0.168754 1.56876C-0.131246 1.06876 -0.0312583 0.468735 0.468742 0.168735C0.968742 -0.131265 1.56875 -0.0312166 1.86875 0.468783L5.86875 6.46878C6.06875 6.76878 6.06875 7.26876 5.86875 7.56876L1.86875 13.5688C1.66875 13.7688 1.36875 13.9688 1.06875 13.9688Z"
            fill="black"
            fillOpacity="0.47"
          />
        </svg>
      </div>
    );
  }

  function RenderSection() {
    switch (currentSection) {
      case 0:
        return <PersonalInformationSection user={user} />;
      case 1:
        return <SecurityConfigSection />;
      default:
        return <></>;
    }
  }

  return (
    <div className={"flex flex-row h-full  w-full "}>
      <div
        className={
          "flex space-y-4 flex-col h-full p-4 w-[270] items-start justify-between"
        }
      >
        <>
          <User
            as="button"
            name={user.username}
            description={user.email}
            avatarProps={{
              size: "md",
              fallback: user?.username?.charAt(0).toUpperCase(),
              showFallback: true,
              isBordered: false,
              src: "" as string,
            }}
            className={"transition-transform"}
          />
          <Divider />
          <div className={"flex flex-1 flex-col space-y-4 w-full"}>
            {sections.map((item, index) => (
              <Item
                key={index}
                option={{
                  name: item.name,
                  icon: item.icon,
                }}
                index={index}
                action={() => setCurrentSection(index)}
              />
            ))}
          </div>
        </>
      </div>
      <div
        className={
          "items-center  flex-1 justify-center  border-l-2 border-l-default flex w-full h-full overflow-y-auto p-4"
        }
      >
        <RenderSection />
      </div>
      <LogoutModal isOpen={isOpen3} onClose={onClose3} />
    </div>
  );
}
