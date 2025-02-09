
export const numberMaskFactory = (min: number, max: number) => (value: string | number) => {
    const digits = value?.toString()?.replace(/\D/g, '');

    return digits
      ? Math.max(Math.min(max, Number(digits)), min).toString()
      : digits;
  };

export const numberUnmask = (value: string) => value ? Number(value) : value;
