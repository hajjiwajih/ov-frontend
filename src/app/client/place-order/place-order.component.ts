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

  secondLabels: any;
  uniqueMonths: any;
  myChart: any;

  allMonths: string[] = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

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

  removeDuplicateObjects(array: any[]) {
    return [
      ...new Map(array.map((obj) => [JSON.stringify(obj), obj])).values(),
    ];
  }

  ngOnInit() {
    let id = localStorage.getItem("currentUserId");
    const that = this;
    var tempMonths = [];
    let currentYear = new Date().getFullYear().toString();

    this.obs$ = this.orderService
      .getLatestClientOrders(id)
      .subscribe((orders) => {
        this.orders = orders;
        this.labels = orders.map((item) => {
          /**
           * Notice that my algorithm will take only the orders from the current year so it won't
           * take the past years orders
           */
          let month = this.converMonthToString(item.issueDate.slice(5, 7));
          if (item.issueDate.slice(0, 4).toString() === currentYear) {
            let obj = {
              [month]: [{ allOrders: 0 }, { validated: 0 }, { rejected: 0 }],
            };
            return obj;
          }
        });

        /**
         * Remove duplicates from array of objects
         */
        this.uniqueMonths = this.removeDuplicateObjects(this.labels);

        /**
         * We iterating over the orders and assign each order for its corresponding month
         */
        this.orders.forEach((order) => {
          let month = this.converMonthToString(order.issueDate.slice(5, 7));
          for (let i = 0; i < this.uniqueMonths.length; i++) {
            if (Object.keys(this.uniqueMonths[i])[0] === month) {
              if (order.validated === true) {
                this.uniqueMonths[i][month][1].validated++;
              } else if (
                order.validated === false &&
                order.isRejected === false
              ) {
                this.uniqueMonths[i][month][0].allOrders++;
              } else {
                this.uniqueMonths[i][month][2].rejected++;
              }
            }
          }
        });

        /**
         * Dummy Data for testing the chart
         */

        // this.uniqueMonths.push({
        //   Aug: [{ allOrders: 4 }, { validated: 6 }, { rejected: 2 }],
        //   year: '2021',
        // });

        // this.uniqueMonths.push({
        //   Jul: [{ allOrders: 2 }, { validated: 3 }, { rejected: 4 }],
        //   year: '2021',
        // });

        // this.uniqueMonths.push({
        //   Jan: [{ allOrders: 2 }, { validated: 3 }, { rejected: 7 }],
        // });

        // this.uniqueMonths.push({
        //   Feb: [{ allOrders: 2 }, { validated: 3 }, { rejected: 7 }],
        // });

        // this.uniqueMonths.push({
        //   Sep: [{ allOrders: 0 }, { validated: 9 }, { rejected: 12 }],
        // });

        /**
         * Function to sort the months in the uniqnessMonths array
         * @param a
         * @param b
         */
        function compare(a, b) {
          return (
            that.allMonths.indexOf(Object.keys(a)[0]) -
            that.allMonths.indexOf(Object.keys(b)[0])
          );
        }
        this.uniqueMonths.sort(compare);

        /**
         *  Somehow i couldn't reach the variable this.secondLabels inside for loop
         * so i had to find a way arround using another variable 'tempMonths'
         */

        for (let i = 0; i < this.uniqueMonths.length; i++) {
          tempMonths.push(Object.keys(this.uniqueMonths[i])[0]);
        }

        /**
         * Since we are only taking the last 3 months and i couldn't use for loop because i don't have access
         * to some variables i had to do it this way
         */
        if (tempMonths.length >= 3) {
          this.secondLabels = tempMonths.slice(
            tempMonths.length - 3,
            tempMonths.length
          );
        } else if (tempMonths.length >= 2) {
          this.secondLabels = tempMonths.slice(
            tempMonths.length - 2,
            tempMonths.length
          );
        } else if (tempMonths.length === 1) {
          this.secondLabels = tempMonths.slice(0, tempMonths.length);
          console.log(this.secondLabels);
        }

        // Creating the Chart
        this.createChart();

        /**
         * Here we are adding the data to the chart based on our data the retrieved from database
         */
        if (this.secondLabels.length >= 3) {
          this.myChart.data.datasets[0].data.push(
            this.uniqueMonths[this.uniqueMonths.length - 3][
              this.secondLabels[0]
            ][0].allOrders
          );
          this.myChart.data.datasets[0].data.push(
            this.uniqueMonths[this.uniqueMonths.length - 2][
              this.secondLabels[1]
            ][0].allOrders
          );
          this.myChart.data.datasets[0].data.push(
            this.uniqueMonths[this.uniqueMonths.length - 1][
              this.secondLabels[2]
            ][0].allOrders
          );

          this.myChart.data.datasets[1].data.push(
            this.uniqueMonths[this.uniqueMonths.length - 3][
              this.secondLabels[0]
            ][1].validated
          );
          this.myChart.data.datasets[1].data.push(
            this.uniqueMonths[this.uniqueMonths.length - 2][
              this.secondLabels[1]
            ][1].validated
          );
          this.myChart.data.datasets[1].data.push(
            this.uniqueMonths[this.uniqueMonths.length - 1][
              this.secondLabels[2]
            ][1].validated
          );

          this.myChart.data.datasets[2].data.push(
            this.uniqueMonths[this.uniqueMonths.length - 3][
              this.secondLabels[0]
            ][2].rejected
          );
          this.myChart.data.datasets[2].data.push(
            this.uniqueMonths[this.uniqueMonths.length - 2][
              this.secondLabels[1]
            ][2].rejected
          );
          this.myChart.data.datasets[2].data.push(
            this.uniqueMonths[this.uniqueMonths.length - 1][
              this.secondLabels[2]
            ][2].rejected
          );

          this.myChart.update();
        } else if (this.secondLabels.length >= 2) {
          console.log(
            this.uniqueMonths[this.uniqueMonths.length - 1][
              this.secondLabels[1]
            ][1]
          );
          this.myChart.data.datasets[0].data.push(
            this.uniqueMonths[this.uniqueMonths.length - 2][
              this.secondLabels[0]
            ][0].allOrders
          );
          this.myChart.data.datasets[0].data.push(
            this.uniqueMonths[this.uniqueMonths.length - 1][
              this.secondLabels[1]
            ][0].allOrders
          );

          this.myChart.data.datasets[1].data.push(
            this.uniqueMonths[this.uniqueMonths.length - 2][
              this.secondLabels[0]
            ][1].validated
          );
          this.myChart.data.datasets[1].data.push(
            this.uniqueMonths[this.uniqueMonths.length - 1][
              this.secondLabels[1]
            ][1].validated
          );

          this.myChart.data.datasets[2].data.push(
            this.uniqueMonths[this.uniqueMonths.length - 2][
              this.secondLabels[0]
            ][2].rejected
          );
          this.myChart.data.datasets[2].data.push(
            this.uniqueMonths[this.uniqueMonths.length - 1][
              this.secondLabels[1]
            ][2].rejected
          );

          this.myChart.update();
        } else if (this.secondLabels.length === 1) {
          console.log(
            this.uniqueMonths[this.uniqueMonths.length - 1][
              this.secondLabels[1]
            ]
          );

          this.myChart.data.datasets[0].data.push(
            this.uniqueMonths[this.uniqueMonths.length - 1][
              this.secondLabels[0]
            ][0].allOrders
          );

          this.myChart.data.datasets[1].data.push(
            this.uniqueMonths[this.uniqueMonths.length - 1][
              this.secondLabels[0]
            ][1].validated
          );

          this.myChart.data.datasets[2].data.push(
            this.uniqueMonths[this.uniqueMonths.length - 1][
              this.secondLabels[0]
            ][2].rejected
          );

          this.myChart.update();
        }
      });

    /** IMPORTANT
     * A lot of my code is hardcoded here i could find another way to do it but since i don't have
     * time and there's a lot of bugs to be fixed i had to do it this way
     */

    this.order.clientId = localStorage.getItem("currentUserId");
    this.order.issueDate = new Date();
  }

  createChart() {
    var ctx = document.getElementById("myChart");
    this.myChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: this.secondLabels,
        datasets: [
          {
            data: [],
            label: "Non Validées",
            borderColor: "#22AEFF",
            backgroundColor: "#22AEFF",
            fill: false,
          },
          {
            data: [],
            label: "Validées",
            borderColor: "#49C887",
            backgroundColor: "#49C887",
            fill: false,
          },
          {
            data: [],
            label: "Rejetées",
            borderColor: "#DB325A",
            backgroundColor: "#DB325A",
            fill: false,
          },
        ],
      },
      options: {
        tooltips: {
          displayColors: true,
          callbacks: {
            mode: "x",
          },
        },
        scales: {
          xAxes: [
            {
              stacked: true,
              gridLines: {
                display: false,
              },
            },
          ],
          yAxes: [
            {
              stacked: true,
              ticks: {
                beginAtZero: true,
              },
              type: "linear",
            },
          ],
        },
        responsive: true,
        maintainAspectRatio: false,
        legend: { position: "bottom" },
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
