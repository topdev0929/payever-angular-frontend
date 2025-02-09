export const getNormalizedKey = (title: string): string => {
  return title?.toLowerCase().replace(/[ !@#$%^&*()~?><]/g, '');
};

export const getShortRandomKey = (len: number = 6): string => {
  return (Math.random() + 1).toString(36).substring(2, 2 + len);
};

