export interface IDockerItem {
  title: string;
  type: string;
  iconId: string;
  subItems?: IDockerItem[];
  onSelect?: () => void;
}
