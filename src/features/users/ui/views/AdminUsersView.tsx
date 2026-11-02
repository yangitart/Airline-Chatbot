"use client";
import CustomTable, {
  CustomTableState,
} from "@/src/components/tables/CustomTable";
import { useEffect, useMemo, useState } from "react";
import { Selection, useDisclosure, User } from "@heroui/react";
import { PersonsTableActions } from "@/src/features/users/ui/components/PersonDataTableComponents";
import { useManagersInEntityStore } from "@/src/features/entities/ui/stores/managersInEntityStore";
import { EntityManager } from "@/src/features/entities/domain/entities/EntityManager";
// import RegisterChiefModal from "@/src/features/entities/ui/components/modal/RegisterChiefModal";
import { UserFilters } from "@/src/features/users/data/models/userTypes";
import { formatFilters } from "@/src/core/api/services/graphQl.service";
import ManagerNameSearchComponent from "@/src/features/users/ui/components/ManagerNameSearchComponent";
import { mapRol } from "@/src/features/entities/domain/entities/types";
import { DeleteModal } from "@/src/components/modals/Types/DeleteModal";
import ReplaceDirectorModal from "@/src/features/users/ui/components/modals/ReplaceDirectorModal";
import { CustomButton } from "@/src/components/buttons/CustomButton";
import RegisterUsersView from "./RegisterUsersView";

const INITIAL_VISIBLE_COLUMNS = [
  "fullName",
  "username",
  "email",
  "phone",
  "isAdmin",
  "actions",
];

const columns = [
  { name: "NOMBRE Y APELLIDOS", uid: "fullName", sortable: false },
  { name: "CORREO ELECTRÓNICO", uid: "email", sortable: false },
  { name: "TELÉFONO", uid: "phone", sortable: false },
  { name: "ACCIONES", uid: "actions", sortable: false },
];

export default function AdminUsersView({ id }: { id: string }) {
  const {
    isLoading,
    data: managers,
    getEntitiesManagersByEntityId,
    deleteManager,
    replaceEntityManager,
  } = useManagersInEntityStore();
  const [selectedUser, setSelectedUser] = useState<EntityManager | null>(null);
  const [isVisibleRegisterUser, setIsVisibleRegisterUser] = useState(false);

  const {
    onOpen: onOpenReplace,
    isOpen: isOpenReplace,
    onClose: onCloseReplace,
  } = useDisclosure();

  const {
    onOpen: onOpenDelete,
    isOpen: isOpenDelete,
    onClose: onCloseDelete,
  } = useDisclosure();

  const [tableState, setTableState] = useState<CustomTableState>({
    rowsPerPage: 10,
    page: 1,
    order: "asc",
  });

  const INITIAL_FILTERS: UserFilters = {
    user_full_name: "",
    user_identity_card: "",
  };

  const [filters, setFilters] = useState<UserFilters>(INITIAL_FILTERS);

  function fetchData() {
    getEntitiesManagersByEntityId(Number(id), {
      page: tableState.page,
      limit: tableState.rowsPerPage,
      search: "",
      filters: formatFilters(filters),
    });
  }

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [tableState, filters, id]);

  const handleAction = (id: string, action: string) => {
    const user = managers?.data?.find((u) => u.id === id);
    if (!user) return;
    setSelectedUser(user);
    if (action === "replace") {
      onOpenReplace();
    } else if (action === "delete") {
      onOpenDelete();
    }
  };

  const handleReplaceDirector = (directorId: string, email: string) => {
    replaceEntityManager(directorId, email);
  };

  const handleDeleteManager = async (id: string) => {
    await deleteManager(id);
    onCloseDelete();
    fetchData();
  };

  const updateFilters = (newFilters: Partial<UserFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const [visibleColumns] = useState<Selection>(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;
    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const LOADING_STATE = isLoading ? "loading" : "idle";

  const RENDER_CELLS = {
    fullName: (manager: EntityManager) => (
      <User
        name={<span>{manager.user?.fullName || "No especificado"}</span>}
        description={
          <div className="flex items-center ml-0.5">
            <span>{mapRol(manager.position) || "No especificado"}</span>
          </div>
        }
        avatarProps={{
          showFallback: true,
          fallback: <span>{manager.user?.fullName?.charAt(0)}</span>,
          isBordered: true,
        }}
      />
    ),
    username: (manager: EntityManager) => (
      <span key={`username-${manager.id}`}>{manager.user?.username}</span>
    ),
    email: (manager: EntityManager) => (
      <span key={`email-${manager.id}`}>
        {manager.email || "No especificado"}
      </span>
    ),
    phone: (manager: EntityManager) => (
      <span key={`phone-${manager.id}`}>
        {manager.user?.phone || "No especificado"}
      </span>
    ),

    actions: (manager: EntityManager) => {
      return (
        <div className="flex items-center justify-center gap-2">
          <PersonsTableActions
            key={`actions-${manager.id}`}
            handleAction={handleAction}
            person={manager}
          />
        </div>
      );
    },
  };

  const topContent = (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between gap-3 items-end">
        <ManagerNameSearchComponent
          updateFilters={updateFilters}
          isLoading={isLoading}
          topContent={
            <div className="flex gap-2">
              {/* {(currentUser?.roles ? currentUser?.roles![0] : "") == SystemRoleNomenclatureData.ENTITY_MANAGER && */}
              {/* <RegisterChiefModal
                onInvitate={() => {
                  fetchData();
                }}
                onlyDirective={false}
              /> */}
              <CustomButton
                title="Registrar"
                onClick={() => setIsVisibleRegisterUser(true)}
              />
            </div>
          }
        />
      </div>
    </div>
  );

  if (!isVisibleRegisterUser)
    return (
      <>
        <CustomTable
          HEADER_COLUMNS={headerColumns}
          ITEMS={managers?.data || []}
          LOADING_STATE={LOADING_STATE}
          CELL_RENDERERS={RENDER_CELLS}
          PAGINATION={managers?.meta}
          TABLE_STATE={tableState}
          UPDATE_TABLE_STATE={setTableState}
          TOP_CONTENT={topContent}
        />

        {selectedUser && (
          <DeleteModal
            text="Eliminar gestor"
            subtext={`¿Está seguro que desea eliminar a ${selectedUser.user?.fullName || "este gestor"}?`}
            id={selectedUser.id}
            deleteFunction={handleDeleteManager}
            isOpenDelete={isOpenDelete}
            onCloseDelete={onCloseDelete}
          />
        )}

        {selectedUser && (
          <ReplaceDirectorModal
            director={selectedUser}
            isOpen={isOpenReplace}
            onClose={onCloseReplace}
            onReplace={handleReplaceDirector}
          />
        )}
      </>
    );
  else
    return (
      <RegisterUsersView
        onBack={() => setIsVisibleRegisterUser(false)}
        onInvitate={() => {
          fetchData();
        }}
        onlyDirective={false}
      />
    );
}
