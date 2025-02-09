import { TemplateRef } from "@angular/core";

export interface DrawerSettingsInterface {
  content: TemplateRef<any>;
  disableClose?: boolean;
  mode?: 'over' | 'push' | 'side';
  opened?: boolean;
  position?: 'start' | 'end';
  onClosedStart?: () => void;
  onPositionChanged?: () => void;
  onOpenedChanged?: () => void;
  onOpenedStart?: () => void;
}
