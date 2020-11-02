import { Observable } from "rxjs";
import { Ticket } from "./../models/ticket";
import { Order } from "./../models/order";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "./../../environments/environment";
import { Socket } from "ngx-socket-io";

@Injectable({
  providedIn: "root",
})
export class OrderService {
  private apiUrl = environment.api_url_orders;
  private ticketsUrl = environment.api_url_tickets;

  // socket config
  clientRef: string;
  validatedOrder: Observable<Order>;
  newOrder: Observable<Order>;
  rejectedOrder: Observable<Order>;

  constructor(private client: HttpClient, private socket: Socket) {
    this.clientRef = localStorage.getItem("currentUserId");
    console.log(this.clientRef);
    this.newOrder = this.socket.fromEvent<Order>("order/new");
    this.validatedOrder = this.socket.fromEvent<Order>(
      `client/${this.clientRef}/order/valid`
    );
    this.rejectedOrder = this.socket.fromEvent<Order>(
      `client/${this.clientRef}/order/reject`
    );
  }

  /**
   * Fetch all customer related orders
   * @param idClient
   * @param valid
   * @param rejected
   */
  getClientOrders(idClient: string, valid: boolean, rejected: boolean) {
    if (valid)
      return this.client.get<Order[]>(
        `${this.apiUrl}?filter={"where":{"validated":${valid}, "clientId":"${idClient}"}}`
      );
    else
      return this.client.get<Order[]>(
        `${this.apiUrl}?filter={"where":{ "and":[{"validated":${valid}}, {"isRejected": ${rejected}},{"clientId":"${idClient}"}]}}`
      );
  }

  /**
   * Fetch all customer related orders | ordered by datetime
   * @param idClient
   */
  getLatestClientOrders(idClient: string) {
    return this.client.get<Order[]>(
      `${this.apiUrl}?filter={"where":{"clientId":"${idClient}"}}`
    );
  }

  /**
   * Fetch last order for each customer ID passed
   * @param ids
   */
  getLastValidatedOrders(ids: string[]) {
    return this.client.post<any>(`${this.apiUrl}/lastValidatedOrders`, ids);
  }

  /**
   * Fetch all orders with @flag {validated} @flag {isRejected}
   * @param valid
   * @param rejected
   */
  getOrders(valid: boolean, rejected: boolean) {
    if (valid)
      return this.client.get<Order[]>(
        `${this.apiUrl}?filter={"where":{"validated":${valid} }}`
      );
    else
      return this.client.get<Order[]>(
        `${this.apiUrl}?filter={"where":{"and":[{"validated":${valid}}, {"isRejected": ${rejected}}] }}`
      );
  }

  /**
   * Fetch order by ID
   * @param id
   */
  getOrderById(id) {
    return this.client.get<Order>(this.apiUrl + "/" + id);
  }

  /**
   * Fetch all related order tickets
   * @param id
   */
  getOrderTickets(id) {
    return this.client.get<Ticket[]>(this.ticketsUrl + "/orderTickets/" + id);
  }

  /**
   * Fetch all related order tickets in PDF format
   * @param id
   */
  getOrderTicketsPDF(id, formatCode: number) {
    let headers = new HttpHeaders();
    // headers = headers.set("Accept", "application/pdf");
    return this.client.get<string>(
      `${this.ticketsUrl}/orderTicketsPDF/${id}/${formatCode}`,
      {
        headers: headers,
        responseType: "blob" as "json",
      }
    );
  }
  /**
   * Remove persisted order
   * @param idOrder
   */
  deleteOrder(idOrder: string) {
    return this.client.delete(this.apiUrl + "/" + idOrder);
  }

  /**
   * Persist one order
   * @param order
   */
  addOrder(order: Order) {
    const headers = new Headers({ "Content-Type": "application/json" });

    return this.client.post<Order>(this.apiUrl, order);
  }

  /**
   * Emit socket.io event on new action
   * @param event
   * @param order
   */
  triggerEvent(event: string, order?: Order) {
    switch (event) {
      case "newOrder":
        this.socket.emit("newOrder", order);
        break;
      case "validated":
        this.socket.emit("validated", order);
        break;
      case "rejected":
        this.socket.emit("rejected", order);
        break;
    }
  }

  /**
   * Count all tickets by amount / price type
   * @param amount
   */
  getOrderCount(amount?) {
    const headers = new Headers({ "Content-Type": "application/json" });
    if (amount) {
      let amountStr = this.numberLengthChecker(amount);
      return this.client.get<any>(
        `${this.apiUrl}/count?where={"ticketAmount":"${amountStr}"}`
      );
    } else return this.client.get<any>(`${this.apiUrl}/count`);
  }

  /**
   * Count sold tickets by amount / price type
   * @param amount
   */
  getSoldTicketsCount(amount?) {
    const headers = new Headers({ "Content-Type": "application/json" });
    if (amount) {
      let amountStr = this.numberLengthChecker(amount);
      return this.client.get<any>(
        `${this.ticketsUrl}/count?where={"and":[{"orderId":{"exists": true}}, {"orderId":{"neq": null}},{"amount":"${amountStr}"} ]}`
      );
    } else
      return this.client.get<any>(
        `${this.ticketsUrl}/count?where={"and":[{"orderId":{"exists": true}}, {"orderId":{"neq": null}} ]}`
      );
  }

  /**
   * Count stock tickets by amount / price type
   * @param amount
   */
  countTickets(amount?) {
    const headers = new Headers({ "Content-Type": "application/json" });
    let amountStr = this.numberLengthChecker(amount);

    return this.client.get<any>(
      `${this.ticketsUrl}/count?where={"or": [{"orderId":{"exists": false}},{"orderId":null}]}`
    );
  }

  /**
   * Count stock tickets by amount / price type
   * @param amount
   */
  countTicketsByAmount(amount: number) {
    const headers = new Headers({ "Content-Type": "application/json" });
    let amountStr = this.numberLengthChecker(amount);

    return this.client.get<any>(
      `${this.ticketsUrl}/count?where={"and":[{"amount":"${amountStr}"},{"or": [{"orderId":{"exists": false}},{"orderId":null}]}]}`
    );
  }

  /**
   * Fetch stock tickets by amount / price type on limit @count
   * @param count
   */

  getTickets(count: number) {
    const headers = new Headers({ "Content-Type": "application/json" });

    return this.client.get<Ticket[]>(
      `${this.ticketsUrl}?filter={"where":{"or": [{"orderId":{"exists": false}},{"orderId":null}]},"limit":${count}}`
    );
  }

  /**
   * Update order by ID
   * @param order
   * @param id
   */
  updateOrder(order: Order, id: string) {
    const headers = new Headers({ "Content-Type": "application/json" });

    return this.client.patch(this.apiUrl + `/${id}`, order);
  }

  /**
   * Update tickets and make them relate to one order
   * @param orderId
   * @param ticketCount
   * @param amount
   */
  updateTickets(orderId: string, ticketCount: number, amount: number) {
    const headers = new Headers({ "Content-Type": "application/json" });
    let amountStr = this.numberLengthChecker(amount);
    return this.client.get(
      `${this.ticketsUrl}/updateTickets?orderId=${orderId}&ticketsCount=${ticketCount}&amount=${amountStr}`
    );
  }

  /**
   * Fetch ticket infos by serial @serial
   * @param serial
   */
  fetchTicket(serial: string) {
    const headers = new Headers({ "Content-Type": "application/json" });

    return this.client.get<Ticket[]>(
      `${this.ticketsUrl}/fetchTicket/${serial}`
    );
  }


  // utility function => test wether amount[number] < 1000 => return amount [string] with 4 digits length
  numberLengthChecker(n: number) {
    return String(n).padStart(4, "0");
  }
  // http://localhost:3500/api/tickets/updateTickets?orderId=12&ticketsCount=5&access_token=8eW6gEG01ShKKfMn5Cth4zyDuiZcwotVQklbFMwcnFaXNSV3RbO2tP8P8JhcVNeF
}
