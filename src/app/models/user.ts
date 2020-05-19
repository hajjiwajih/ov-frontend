export interface User {
  _id?: string;
  id?: string;
  autoID?: string;
  realm?: string;
  username?: string;
  email?: string;
  emailVerified?: boolean;
  password?: string;
  cin?: string;
  phone?: number;
  role?: string;
  fname?: string;
  lname?: string;
  creationAt?: Date;
  confirm?: string;
}
