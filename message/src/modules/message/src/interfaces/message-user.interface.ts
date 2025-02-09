import { PeMessageUserRole, PeMessageUserStatus } from '../enums';


export interface PeMessageUserSession {
  userAgent: string;
  ipAddress: string;
}

export interface PeMessageUserAccount {
  email: string;
  firstName: string;
  lastName: string;
  logo: string;
  phone: string;
  _id: string;
}

export interface PeMessageUser {
  businesses: string[];
  lastSeen?: Date;
  roles: PeMessageUserRole[];
  status: PeMessageUserStatus;
  sessions: PeMessageUserSession[];
  userAccount: PeMessageUserAccount;
  _id: string;
}
