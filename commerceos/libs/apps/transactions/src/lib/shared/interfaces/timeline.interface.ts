import { OrderHistoryStatusEnum } from "./detail.interface";

export interface TimelineInterface {
  date: string;
  text: string;
  status?: OrderHistoryStatusEnum;
}
