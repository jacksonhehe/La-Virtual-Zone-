import React from 'react';

export function Toaster(_: any) {
  return null;
}

type ToastFn = (msg: string) => void;

const toast = {
  success: ((msg: string) => {
    if (typeof console !== 'undefined') console.log(msg);
  }) as ToastFn,
  error: ((msg: string) => {
    if (typeof console !== 'undefined') console.error(msg);
  }) as ToastFn,
};

export default toast;
