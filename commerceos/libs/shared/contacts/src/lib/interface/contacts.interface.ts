import { StatusField } from "./data.interface";

export interface ContactsAppStateInterface {
  folders: any[],
  gridItems: any[],
  contacts: any[],
  contactIndustries: any[],
  statues: StatusField[],
  trigger: boolean,
}
