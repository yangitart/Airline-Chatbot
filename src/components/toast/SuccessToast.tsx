import toast from 'react-hot-toast';

export const SuccessToast = () =>
  toast.success(() => <span> Operación exitosa </span>, { duration: 3000 });
