export interface Order {
  idOrder?: string;
  orderAuto?: string;
  nbCodes?: number;
  clientId?: string;
  clientRef?: string;
  issueDate?: any;
  validationDate?: any;
  ticketAmount?: number;
  validated?: boolean;
  comment?: string;
  isRejected?: boolean;
}
