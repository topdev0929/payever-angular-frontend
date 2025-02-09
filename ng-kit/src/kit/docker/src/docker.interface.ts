export interface DockerItemInterface {
  icon: string;
  title: string;
  code?: string;
  count?: number;
  active?: boolean;
  onSelect?(active: boolean): void;
}
