import { Observable } from "rxjs";
import { Voucher } from "./../models/voucher";
import { HttpClient } from "@angular/common/http";
import { environment } from "./../../environments/environment";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Socket } from "ngx-socket-io";

@Injectable({
  providedIn: "root",
})
export class VoucherService {
  private apiUrl = environment.api_url_vouchers;
  newVoucher: Observable<Voucher>;
  constructor(private client: HttpClient, private socket: Socket) {
    this.newVoucher = this.socket.fromEvent<Voucher>("voucher/new");
  }

  getVouchers() {
    return this.client.get<Voucher[]>(`${this.apiUrl}`);
  }

  getVoucherById(id) {
    return this.client.get<Voucher>(this.apiUrl + "/" + id);
  }

  deleteVoucher(idVoucher: string) {
    return this.client.delete(this.apiUrl + "/" + idVoucher);
  }

  addVoucher(order: Voucher) {
    const headers = new Headers({ "Content-Type": "application/json" });
    return this.client.post<Voucher>(this.apiUrl, order);
  }
}
