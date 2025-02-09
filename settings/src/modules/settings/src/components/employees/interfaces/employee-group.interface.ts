export interface IGroupsInterface {
  count: number;
  data: IGroupItemInterface[];
}

export interface IGroupItemInterface {
  name: string;
  businessId: string;
  employees: [];
  _id: string;
}
