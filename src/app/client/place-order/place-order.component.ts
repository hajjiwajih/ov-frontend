import { NotificationService } from "./../../services/notification.service";
import { Subscription } from "rxjs";
import { Router } from "@angular/router";
import { OrderService } from "./../../services/order.service";
import { FormControl } from "@angular/forms";
import { FormGroup } from "@angular/forms";
import { Order } from "./../../models/order";
import { Component, OnInit } from "@angular/core";
import { DatePipe } from "@angular/common";
import Chart from "chart.js";
declare var $: any;

@Component({
  selector: "app-place-order",
  templateUrl: "./place-order.component.html",
  styleUrls: ["./place-order.component.css"],
})
export class PlaceOrderComponent implements OnInit {
  orders: Order[];
  obs$: Subscription;
  // order should be confirmed
  order: Order;
  pipe = new DatePipe("fr-FR"); // Use your own locale

  validationSub$: Subscription;
  rejectionSub$: Subscription;

  orderForm = new FormGroup({
    nbCodes: new FormControl(""),
    comment: new FormControl(""),
    amountCodes: new FormControl(""),
  });

  labels: string[];
  data: any;

  amountOptions = [1, 5, 10];

  constructor(
    private orderService: OrderService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.order = {
      nbCodes: 0,
      clientId: "",
      issueDate: null,
      comment: "",
      validated: false,
    };
  }

  ngOnInit() {
    let id = localStorage.getItem("currentUserId");
    var data;
    var labels;
    // Our labels along the x-axis
    var months = [];
    // For drawing the lines
    var africa = [86, 114, 106, 106, 107, 111, 133, 221, 783, 2478];

    this.obs$ = this.orderService
      .getLatestClientOrders(id)
      .subscribe((orders) => {
        this.orders = orders;
        this.labels = orders.map((item) => {
          return item.issueDate.slice(0, 10);
        });
        this.labels = [...new Set(this.labels)]
        this.data = orders.filter((item) => {
          return item.validated === true;
        });

        console.log(this.orders.length)
        this.createChart();
      });


    this.order.clientId = localStorage.getItem("currentUserId");
    this.order.issueDate = new Date();
  }

  createChart() {
    var ctx = document.getElementById("myChart");
    var myChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: this.labels,
        datasets: [
          {
            data: this.orders.length.toString(),
            label: "All Orders",
            borderColor: "#16AAFF",
            fill: false,
          },
          {
            data: this.data.length.toString(),
            label: "Validated",
            borderColor: "#3AC47D",
            fill: false,
          },
        ],
      },
    });
  }

  /**
   * Add order details
   * @param comments
   */
  placeOrder(comments) {
    if (this.validateForm()) {
      this.order.comment = comments;
      this.router.navigate(["portal/confirm"], {
        queryParams: { order: JSON.stringify(this.order) },
      });
    }
  }

  /**
   * Amount / price change handler
   * @param event
   */
  changeAmount(event) {
    $("#amount")[0].setCustomValidity("");
    this.order.ticketAmount =
      this.amountOptions[event.target.options.selectedIndex - 1] * 1000;
  }

  /**
   * Form validation
   */
  validateForm() {
    let isValid = true;
    $("#orderForm").addClass("was-validated");
    // required fields
    if (this.orderForm.get("nbCodes").value <= 0) {
      $("#codes")[0].setCustomValidity("codes not zero");

      $("#codes").keyup(function () {
        if ($(this).val() > 0) {
          this.setCustomValidity("");
        } else {
          this.setCustomValidity("codes not zero");
        }
      });
      isValid = false;
    }
    // validate amount
    $("#amount")[0].setCustomValidity("amount should be set");

    $("#amount")[0].setCustomValidity("");
    // console.log(this.order.ticketAmount);
    if (!this.order.ticketAmount) {
      $("#amount")[0].setCustomValidity("amount should be set");
      isValid = false;
    }
    return isValid;
  }

  ngOnDestroy() {
    if (this.validationSub$) this.validationSub$.unsubscribe();
    if (this.rejectionSub$) this.rejectionSub$.unsubscribe();
  }
}
