export interface DashboardMenuItem {
  title?: string;
  abbr?: string;
  imagePath?: string;
  iconId?: string;
  iconSizeClass?: string;
  iconNotificationId?: string;
  iconNotificationCount?: number;
  separatorAfter?: string;
  separatorBefore?: string;
  onSelect?: ( event: MouseEvent, item: DashboardMenuItem ) => void;
}
