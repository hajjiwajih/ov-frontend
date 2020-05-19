import { Observable } from "rxjs";
import { Ticket } from "./../models/ticket";
import { Order } from "./../models/order";
import { HttpClient } from "@angular/common/http";
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

  getLatestClientOrders(idClient: string) {
    return this.client.get<Order[]>(
      `${this.apiUrl}?filter={"where":{"clientId":"${idClient}"}}`
    );
  }

  getLastValidatedOrders(ids: string[]) {
    return this.client.post<any>(`${this.apiUrl}/lastValidatedOrders`, ids);
  }

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

  getOrderById(id) {
    return this.client.get<Order>(this.apiUrl + "/" + id);
  }

  getOrderTickets(id) {
    return this.client.get<Ticket[]>(this.apiUrl + "/" + id + "/tickets");
  }

  deleteOrder(idOrder: string) {
    return this.client.delete(this.apiUrl + "/" + idOrder);
  }

  addOrder(order: Order) {
    const headers = new Headers({ "Content-Type": "application/json" });

    return this.client.post<Order>(this.apiUrl, order);
  }

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

  getOrderCount(amount?) {
    const headers = new Headers({ "Content-Type": "application/json" });
    if (amount)
      return this.client.get<any>(
        `${this.apiUrl}/count?where={"ticketAmount":${amount}}`
      );
    else return this.client.get<any>(`${this.apiUrl}/count`);
  }

  getSoldTicketsCount(amount?) {
    const headers = new Headers({ "Content-Type": "application/json" });
    if (amount)
      return this.client.get<any>(
        `${this.ticketsUrl}/count?where={"and":[{"orderId":{"exists": true}}, {"orderId":{"neq": null}},{"amount":${amount}} ]}`
      );
    else
      return this.client.get<any>(
        `${this.ticketsUrl}/count?where={"and":[{"orderId":{"exists": true}}, {"orderId":{"neq": null}} ]}`
      );
  }

  countTickets(amount?) {
    const headers = new Headers({ "Content-Type": "application/json" });
    return this.client.get<any>(
      `${this.ticketsUrl}/count?where={"or": [{"orderId":{"exists": false}},{"orderId":null}]}`
    );
  }

  countTicketsByAmount(amount: number) {
    const headers = new Headers({ "Content-Type": "application/json" });

    return this.client.get<any>(
      `${this.ticketsUrl}/count?where={"and":[{"amount":${amount}},{"or": [{"orderId":{"exists": false}},{"orderId":null}]}]}`
    );
  }

  getTickets(count: number) {
    const headers = new Headers({ "Content-Type": "application/json" });

    return this.client.get<Ticket[]>(
      `${this.ticketsUrl}?filter={"where":{"or": [{"orderId":{"exists": false}},{"orderId":null}]},"limit":${count}}`
    );
  }

  updateOrder(order: Order, id: string) {
    const headers = new Headers({ "Content-Type": "application/json" });

    return this.client.patch(this.apiUrl + `/${id}`, order);
  }

  updateTickets(orderId: string, ticketCount: number, amount: number) {
    const headers = new Headers({ "Content-Type": "application/json" });

    return this.client.get(
      `${this.ticketsUrl}/updateTickets?orderId=${orderId}&ticketsCount=${ticketCount}&amount=${amount}`
    );
  }
  // http://localhost:3500/api/tickets/updateTickets?orderId=12&ticketsCount=5&access_token=8eW6gEG01ShKKfMn5Cth4zyDuiZcwotVQklbFMwcnFaXNSV3RbO2tP8P8JhcVNeF
}
