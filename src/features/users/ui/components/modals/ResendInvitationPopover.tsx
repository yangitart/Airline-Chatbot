import EmailIcon from "@/src/components/Icons/legacy/EmailIcon";
import {
  Popover,
  PopoverTrigger,
  Button,
  PopoverContent,
  Card,
  CardHeader,
  CardFooter,
} from "@heroui/react";
import { LuInfo } from "react-icons/lu";

interface ResendInvitationPopoverProps {
  onResend: () => void;
}

export default function ResendInvitationPopover({
  onResend,
}: ResendInvitationPopoverProps) {
  return (
    <Popover showArrow placement="bottom">
      <PopoverTrigger>
        <Button
          size="sm"
          isIconOnly
          startContent={<EmailIcon />}
          variant="solid"
          radius="full"
          aria-label="Reenviar invitación"
        />
      </PopoverTrigger>
      <PopoverContent className="p-3 w-auto">
        <Card
          shadow="none"
          className="max-w-[300px] border-none bg-transparent"
        >
          <CardHeader className="pb-2 pt-1 px-1 flex-col items-start">
            <div className="flex items-center gap-2 mb-1">
              <LuInfo className="text-xl text-blue-500" />
              <p className="text-md font-semibold">Reenviar Invitación</p>
            </div>
            <small className="text-default-600">
              El directivo aún no ha completado su registro. Puedes reenviar el
              correo de invitación.
            </small>
          </CardHeader>
          <CardFooter className="px-1 pb-1">
            <Button
              color="primary"
              fullWidth
              size="sm"
              variant="solid"
              onPress={onResend}
            >
              Reenviar Invitación
            </Button>
          </CardFooter>
        </Card>
      </PopoverContent>
    </Popover>
  );
}

