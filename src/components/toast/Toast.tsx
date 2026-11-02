import toast from 'react-hot-toast';

export const showToast = (
  text: string,
  variant: 'error' | 'success' | 'loading' | 'custom',
  duration?: number,
) => {
  const notify = () => {
    switch (variant) {
      case 'custom':
        return toast.error(() => <span> {text} </span>, {
          duration: duration ?? 5000,
        });
      case 'loading':
        return toast.loading(() => <span> {text} </span>, {
          duration: duration ?? 5000,
        });
      case 'success':
        return toast.success(() => <span> {text} </span>, {
          duration: duration ?? 5000,
        });
      case 'error':
        return toast.error(() => <span> {text} </span>, {
          duration: duration ?? 5000,
        });
    }
  };

  return notify();
};

export function ShowSuccessToast() {
  return showToast('Operación exitosa', 'success');
}

export function ShowErrorToast(error: string) {
  return showToast(error, 'error');
}
