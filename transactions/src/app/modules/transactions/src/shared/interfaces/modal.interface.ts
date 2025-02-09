export interface ActionModalButtonInterface {
  title: string;
  isClose?: boolean;
  disabled?: boolean;
  class?: string;
  onClick?(): void;
}
