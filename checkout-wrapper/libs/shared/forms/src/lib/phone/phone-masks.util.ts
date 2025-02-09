export const phoneMask = (phone: string): string => phone ? phone?.replace(/([^\d+]+)|(\b\++)/g, '') : phone;
