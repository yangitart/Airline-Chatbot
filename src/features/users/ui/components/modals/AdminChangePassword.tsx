//Forms
import { useFormik } from 'formik';
import * as Yup from 'yup'; //NextUI components
import { Button, Divider, Modal, ModalContent } from "@heroui/react"; //UX
import CustomModalFooter from '@/src/components/modals/parts/CustomModalFooter';
import CustomModalBody from '@/src/components/modals/parts/CustomModalBody';
import CustomModalHeader from '@/src/components/modals/parts/CustomModalHeader';
import CustomTextInput from '@/src/components/inputs/basic/CustomTextInput';
import { useUsersStore } from '@/src/features/users/ui/store/useUsersStore';

const validationSchema = Yup.object({
  password: Yup.string().required('La nueva contraseña es requerida'),
  // .min(8, 'Debe tener al menor 8 caracteres')
  // .matches(/[0-9]/, 'Requiere un número')
  // .matches(/[a-z]/, 'Requiere una letra minúscula')
  // .matches(/[A-Z]/, 'Requiere una letra mayúscula')
  // .matches(/[^\w]/, 'Requiere un símbolo'),
});

export type PasswordChangeModalProps = {
  id: string;
  isOpen: boolean;
  onClose: () => void;
};

export default function AdminPasswordChangeModal({
  id,
  isOpen,
  onClose,
}: PasswordChangeModalProps) {
  const { changeUserPassword } = useUsersStore();

  const formik = useFormik({
    initialValues: {
      password: '',
    },
    validationSchema: validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => changeUserPassword(id, values),
  });

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        placement="top-center"
        size="xl"
        isDismissable={false}
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <CustomModalHeader>Cambiar contraseña</CustomModalHeader>
              <Divider />
              <form onSubmit={formik.handleSubmit}>
                <CustomModalBody>
                  <CustomTextInput
                    formKey="password"
                    form={formik}
                    isRequired={true}
                    label="Nueva contraseña"
                    placeholder="Contraseña"
                    autoFocus={true}
                    type="password"
                  />
                </CustomModalBody>
                <Divider />
                <CustomModalFooter>
                  <div className="flex flex-grow justify-end">
                    <Button
                      color="primary"
                      onPress={onClose}
                      type="submit"
                      disabled={!formik.isValid || !formik.touched}
                      isDisabled={!formik.isValid || !formik.touched}
                    >
                      Actualizar
                    </Button>
                  </div>
                </CustomModalFooter>
              </form>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
