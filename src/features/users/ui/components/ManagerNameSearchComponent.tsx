import { ReactNode, useEffect, useMemo, useState } from "react";
import { Input, Spinner } from "@heroui/react";
import { AiOutlineClose, AiOutlineSearch } from "react-icons/ai";
import { CustomButton } from "@/src/components/buttons/CustomButton";
import debounce from "lodash/debounce";
import { UserFilters } from "@/src/features/users/data/models/userTypes";

interface ManagerNameSearchProps {
  updateFilters: (filters: Partial<UserFilters>) => void;
  isLoading: boolean;
  topContent?: ReactNode;
}

export default function ManagerNameSearchComponent({
  updateFilters,
  isLoading,
  topContent,
}: ManagerNameSearchProps) {
  const [inputValue, setInputValue] = useState<string>("");

  const debouncedUpdateFilters = useMemo(
    () => debounce((value: string) => updateFilters({ user_full_name: value }), 300),
    [updateFilters]
  );

  useEffect(() => {
    return () => debouncedUpdateFilters.cancel();
  }, [debouncedUpdateFilters]);

  const onInputChange = (newInputValue: string) => {
    setInputValue(newInputValue);
    debouncedUpdateFilters(newInputValue);
  };

  return (
    <section className="flex flex-row w-full">
      <div className={"flex w-[25rem] flex-row"}>
        <Input
          startContent={<AiOutlineSearch />}
          size={"md"}
          variant={"bordered"}
          endContent={
            <div className="flex flex-row">
              {inputValue && (
                <CustomButton
                  className='border-0'
                  isIconOnly
                  size={"sm"}
                  variant="light"
                  color={"default"}
                  radius="full"
                  icon={<AiOutlineClose />}
                  onClick={() => {
                    debouncedUpdateFilters.cancel();
                    updateFilters({ user_full_name: "" });
                    setInputValue("");
                  }}
                />
              )}
            </div>
          }
          value={inputValue}
          placeholder={"Buscar por nombre"}
          onChange={(e) => onInputChange(e.target.value)}
          color={"default"}
        />
      </div>
      <div className={"flex flex-1"}></div>
      <div className={"flex flex-1 flex-row justify-end"}>
        {<div>{topContent}</div>}
      </div>
    </section>
  );
}
