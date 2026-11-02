import toast from 'react-hot-toast';

export const ErrorToast = (errorMessage: string) =>
  toast.error(() => <span> {errorMessage} </span>, { duration: 3000 });
