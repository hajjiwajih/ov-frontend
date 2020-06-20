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

  labels: any;
  setLabels: any;
  data: any;

  secondLabels: any
  uniqueMonths: any

  months: any = {
    "01": "Jan",
    "02": "Feb",
    "03": "Mar",
    "04": "Apr",
    "05": "May",
    "06": "Jun",
    "07": "Jul",
    "08": "Aug",
    "09": "Sep",
    "10": "Oct",
    "11": "Nov",
    "12": "Dec",
  };

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

  converMonthToString(month) {
    return this.months[month];
  }

  removeDuplicates(myArr) {
    var props = Object.keys(myArr[0]);
    return myArr.filter(
      (item, index, self) =>
        index ===
        self.findIndex((t) =>
          props.every((prop) => {
            return t[prop] === item[prop];
          })
        )
    );
  }

  ngOnInit() {
    let id = localStorage.getItem("currentUserId");

    this.obs$ = this.orderService
      .getLatestClientOrders(id)
      .subscribe((orders) => {
        this.orders = orders;
        this.labels = orders.map((item) => {
          let month = this.converMonthToString(item.issueDate.slice(5, 7));
          let obj = {
            [month]: [{allOrders: 0}, {validated: 0}, {rejected: 0}],
          };
          return obj;
        });

        
        this.uniqueMonths = Array.from(
          new Set(this.labels.map((a) => a.id))
        ).map((id) => {
          return this.labels.find((a) => a.id === id);
        });
        

        console.log(this.uniqueMonths);

        this.orders.forEach((order) => {
          let month = this.converMonthToString(order.issueDate.slice(5, 7));
          for (let i = 0; i < this.uniqueMonths.length; i++) {
            if ( order.validated === true ) {
              this.uniqueMonths[i][month][1].validated++
            } else if ( order.validated === false && order.isRejected === false ) {
              this.uniqueMonths[i][month][0].allOrders++
            } else {
              this.uniqueMonths[i][month][2].rejected++
            }
          }
        });
        
        this.secondLabels = Object.keys(this.uniqueMonths[0])
        console.log(this.secondLabels)
        // let nonValidatedOrders = this.orders.filter(
        //   (order) => order.validated == false && order.isRejected == false
        // );
        // let rejectedOrders = this.orders.filter(
        //   (order) => order.isRejected == true
        // );

        console.log(this.orders.length);

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
        labels: this.secondLabels,
        datasets: [
          {
            data: [this.uniqueMonths[0][this.secondLabels][0].allOrders],
            label: "All Orders",
            borderColor: "#16AAFF",
            backgroundColor: "#16AAFF",
            fill: false,
          },
          {
            data: [this.uniqueMonths[0][this.secondLabels][1].validated],
            label: "Validated",
            borderColor: "#3AC47D",
            backgroundColor: "#3AC47D",
            fill: false,
          },
          {
            data: [this.uniqueMonths[0][this.secondLabels][2].rejected],
            label: "Rejected",
            borderColor: "red",
            backgroundColor: "red",
            fill: false,
          },
        ],
      },
      options: {
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
              },
            },
          ],
        },
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
