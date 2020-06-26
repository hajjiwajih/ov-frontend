import { Component, OnInit } from '@angular/core';
import { OrderService } from "./../../services/order.service";
import { Order } from 'src/app/models/order';
import { numberWithSpaces } from 'src/app/helpers/format-stocks';
import { Subscription } from "rxjs";

@Component({
  selector: 'app-client-stats',
  templateUrl: './client-stats.component.html',
  styleUrls: ['./client-stats.component.css']
})
export class ClientStatsComponent implements OnInit {
  orders: Order[];
  obs$: Subscription;

  currentDate: Date;
  // availbale stock details
  stats = [0, 0, 0];
  countings = [0, 0, 0];
  percents = [0, 0, 0];
  loaders = [false, false, false];

  constructor(private orderService: OrderService,) { }

  ngOnInit() {
    //   this.orderivatedLink = params.category;
    let id = localStorage.getItem("currentUserId");

    this.currentDate = new Date();

    this.loaders = [true, true, true];

    let _self = this;
    this.obs$ = this.orderService
      .getLatestClientOrders(id)
      .subscribe((orders) => {
        this.orders = orders;
        console.log(orders, orders.length);

        this.showStats();

        this.orders.map((item) => {
          item.validationDate = item.validationDate || "";
          return item;
        });
        
      });

  }

  showStats() {
    // filter by status
    let validatedOrders = this.orders.filter(
      (order) => order.validated == true
    );
    let nonValidatedOrders = this.orders.filter(
      (order) => order.validated == false && order.isRejected == false
    );
    let rejectedOrders = this.orders.filter(
      (order) => order.isRejected == true
    );

    this.countings = [
      validatedOrders.length,
      rejectedOrders.length,
      nonValidatedOrders.length,
    ];
    // sum by ticket amount
    validatedOrders.forEach((order) => {
      this.stats[0] += order.nbCodes * order.ticketAmount;
    });
    this.stats[0] /= 1000;
    this.stats[0] = numberWithSpaces(this.stats[0]);
    rejectedOrders.forEach((order) => {
      this.stats[1] += order.nbCodes * order.ticketAmount;
    });
    this.stats[1] /= 1000;
    this.stats[1] = numberWithSpaces(this.stats[1]);
    nonValidatedOrders.forEach((order) => {
      this.stats[2] += order.nbCodes * order.ticketAmount;
    });
    this.stats[2] /= 1000;
    this.stats[2] = numberWithSpaces(this.stats[2]);
    // percents
    this.percents[0] = Math.round(
      (validatedOrders.length / (this.orders.length || 1)) * 100
    );
    this.percents[1] = Math.round(
      (rejectedOrders.length / (this.orders.length || 1)) * 100
    );
    this.percents[2] = Math.round(
      (nonValidatedOrders.length / (this.orders.length || 1)) * 100
    );
    // update loaders -> set back to default
    this.loaders = [false, false, false];
  }

}
