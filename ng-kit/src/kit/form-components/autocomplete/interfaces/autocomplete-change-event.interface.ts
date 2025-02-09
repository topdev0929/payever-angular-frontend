import { AutocompleteChipsEventType } from '../enums';

export interface AutocompleteChangeEvent {
  value: any;
  eventType?: AutocompleteChipsEventType;
}
