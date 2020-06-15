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

  /**
   * Get all vouchers
   */
  getVouchers() {
    return this.client.get<Voucher[]>(`${this.apiUrl}`);
  }

  /**
   * Get voucher by ID
   * @param id
   */
  getVoucherById(id) {
    return this.client.get<Voucher>(this.apiUrl + "/" + id);
  }

  /**
   * Delete persisted voucher
   * @param idVoucher
   */
  deleteVoucher(idVoucher: string) {
    return this.client.delete(this.apiUrl + "/" + idVoucher);
  }

  /**
   * Persist new voucher
   * @param order
   */
  addVoucher(order: Voucher) {
    const headers = new Headers({ "Content-Type": "application/json" });
    return this.client.post<Voucher>(this.apiUrl, order);
  }
}
