export interface IDockerPosItem {
  title: string;
  iconId: string;
  isCurrent?: boolean;
  isDisabled?: boolean;
  isHidden?: boolean;
  onSelect?: () => void;
}
