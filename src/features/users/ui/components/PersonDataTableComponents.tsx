"use client";
import React from "react";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import { VerticalDotsIcon } from "@/src/components/Icons/extra/TableIcons";
import { DeleteIcon } from "@heroui/shared-icons";
import { EntityManager } from "@/src/features/entities/domain/entities/EntityManager";
import { ArrowsRightLeftIcon } from "@heroicons/react/24/solid";

export function PersonsTableActions(props: {
  person: EntityManager;
  handleAction: (personId: string, actionType: string) => void;
}) {
  const isDirector = props.person.position === "GENERAL_MANAGER";
  const isManager = props.person.position === "MANAGER";

  return (
    <Dropdown className="border-1 border-default-200 bg-background">
      <DropdownTrigger>
        <Button isIconOnly radius={"full"} size="sm" variant="solid">
          <VerticalDotsIcon />
        </Button>
      </DropdownTrigger>
      <DropdownMenu>
        {isDirector ? (
          <DropdownItem
            key="replace"
            onPress={() => props.handleAction(props.person.id, "replace")}
            className="text-default-500"
            startContent={<ArrowsRightLeftIcon className="h-4 w-4" />}
          >
            Sustituir Directivo
          </DropdownItem>
        ) : null}
        {isManager ? (
          <DropdownItem
            key="delete"
            onPress={() => props.handleAction(props.person.id, "delete")}
            className="text-danger"
            startContent={<DeleteIcon color="danger" className="h-4 w-4" />}
          >
            Eliminar Gestor
          </DropdownItem>
        ) : null}
      </DropdownMenu>
    </Dropdown>
  );
}