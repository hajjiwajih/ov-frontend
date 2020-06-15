import { NotificationService } from "./../../services/notification.service";
import { Subscription } from "rxjs";
import { Router } from "@angular/router";
import { OrderService } from "./../../services/order.service";
import { FormControl } from "@angular/forms";
import { FormGroup } from "@angular/forms";
import { Order } from "./../../models/order";
import { Component, OnInit } from "@angular/core";
import { DatePipe } from "@angular/common";
declare var $: any;

@Component({
  selector: "app-place-order",
  templateUrl: "./place-order.component.html",
  styleUrls: ["./place-order.component.css"],
})
export class PlaceOrderComponent implements OnInit {
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
    this.order.clientId = localStorage.getItem("currentUserId");
    this.order.issueDate = new Date();
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
