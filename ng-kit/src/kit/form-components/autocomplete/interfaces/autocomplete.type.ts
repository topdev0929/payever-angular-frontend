import { AutocompleteType } from '../../../address';

export { AutocompleteType };

export type AutocompleteOption = any;
export type AutocompleteOptions = AutocompleteOption[];
export type AutocompleteDisplayWithCallback = ((value: any) => string | null) | null;
export type AutocompleteFilterCallback = ((options: AutocompleteOptions, value: any) => AutocompleteOptions) | null;
export type AutocompleteValidateCallback = ((value: string) => boolean) | null;
