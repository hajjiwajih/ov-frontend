import { User } from "./../../models/user";
import { VoucherService } from "./../../services/voucher.service";
import { Subscription } from "rxjs";
import { OrderService } from "./../../services/order.service";
import { NotificationService } from "./../../services/notification.service";
import { Router } from "@angular/router";
import { environment } from "./../../../environments/environment";
import { UserService } from "./../../services/user.service";
import { Component, OnInit } from "@angular/core";

declare var $: any;

@Component({
  selector: "app-admin",
  providers: [NotificationService],
  templateUrl: "./admin.component.html",
  styleUrls: ["./admin.component.css"],
})
export class AdminComponent implements OnInit {
  currentAdminEmail: string;
  companyName: string;
  currentAdminId: string;
  activatedLink: string = "monitor/active";
  title = "";

  mAdmin: User;

  addedSub$: Subscription;
  addedSubVoucher$: Subscription;

  newOrders: number = 0;

  newVouchers: number = 0;

  displayProfile: boolean = false;

  constructor(
    private userService: UserService,
    private orderService: OrderService,
    private vouchzeService: VoucherService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    // subscribe to notifications
    notificationService.notifObs$.subscribe((notif) => {
      if (notif.type == "order" && !notif.valid && !notif.reject)
        this.newOrders++;
      if (notif.type == "voucher") this.newVouchers++;
    });
    notificationService.resetObs$.subscribe((req) => {
      setTimeout(() => {
        if (req.type == "order") this.newOrders = 0;
        if (req.type == "voucher") this.newVouchers = 0;
      }, 3000);
    });
  }

  ngOnInit() {
    this.currentAdminEmail = localStorage.getItem("email");
    this.currentAdminId = localStorage.getItem("currentUserId");
    this.companyName = environment.companyName;

    this.getAdminInfo();

    // subscribe to incoming events
    this.subscribeToNewOrders();
    this.subscribeToNewVoucher();
  }

  logout() {
    this.userService.logout().subscribe((res) => {
      this.router.navigateByUrl("login-admin");
      console.log("log");
    });
  }

  navigate(route) {
    this.activatedLink = route;
    this.router.navigateByUrl(route);
  }

  toggleProfile() {
    this.displayProfile = !this.displayProfile;
  }

  getAdminInfo() {
    this.userService
      .getUserById(this.currentAdminId)
      .subscribe((clientInfo) => {
        this.mAdmin = clientInfo;
      });
  }

  ngOnDestroy() {
    if (this.addedSub$) this.addedSub$.unsubscribe();
    if (this.addedSubVoucher$) this.addedSubVoucher$.unsubscribe();
  }

  subscribeToNewOrders() {
    this.addedSub$ = this.orderService.newOrder.subscribe((order) => {
      console.log("new order", order);
      // currently displaying validated orders
      this.notificationService.pushNotification({
        valid: false,
        reject: false,
        type: "order",
      });
    });
  }
  subscribeToNewVoucher() {
    this.addedSubVoucher$ = this.vouchzeService.newVoucher.subscribe(
      (voucher) => {
        console.log("new order", voucher);
        // currently displaying validated orders
        this.notificationService.pushNotification({
          type: "voucher",
        });
      }
    );
  }
}
