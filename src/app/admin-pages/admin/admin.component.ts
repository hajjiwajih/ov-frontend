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
  addedSubClient$: Subscription;

  newOrders: number = 0;

  newVouchers: number = 0;

  newClients: number = 0;

  displayProfile: boolean = false;

  constructor(
    private userService: UserService,
    private orderService: OrderService,
    private voucherService: VoucherService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    // subscribe to notifications
    notificationService.notifObs$.subscribe((notif) => {
      if (notif.type == "order" && !notif.valid && !notif.reject)
        this.newOrders++;
      if (notif.type == "voucher") this.newVouchers++;
      if (notif.type == "client") this.newClients++;
    });

    notificationService.resetObs$.subscribe((req) => {
      setTimeout(() => {
        if (req.type == "order") this.newOrders = 0;
        if (req.type == "voucher") this.newVouchers = 0;
        if (req.type == "client") this.newClients = 0;
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
    this.subscribeToNewClients();
  }

  closeSidebar() {
    document.getElementById('close__bar').classList.remove('sidebar-mobile-open')
    document.getElementById('close__bar2').classList.add('d-none')
    document.getElementById('close__bar3').classList.remove('is-active')
  }

  /**
   * Logout action
   */
  logout() {
    this.userService.logout().subscribe((res) => {
      this.router.navigateByUrl("login-admin");
      console.log("log");
    });
  }

  /**
   * Navigate pages with sidebar links
   * @param route
   */
  navigate(route) {
    this.activatedLink = route;
    this.router.navigateByUrl(route);
  }

  /**
   * Toggle profile section
   */
  toggleProfile() {
    this.displayProfile = !this.displayProfile;
  }

  /**
   * Fetch admin infos
   */
  getAdminInfo() {
    this.userService
      .getUserById(this.currentAdminId)
      .subscribe((clientInfo) => {
        this.mAdmin = clientInfo;
      });
  }

  /**
   * lifecycle method to clean memory
   */
  ngOnDestroy() {
    if (this.addedSub$) this.addedSub$.unsubscribe();
    if (this.addedSubVoucher$) this.addedSubVoucher$.unsubscribe();
    if (this.addedSubClient$) this.addedSubClient$.unsubscribe();
  }

  /**
   * subscribe to incoming orders
   */
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

  /**
   * Subscribe to incoming vouchers
   */
  subscribeToNewVoucher() {
    this.addedSubVoucher$ = this.voucherService.newVoucher.subscribe(
      (voucher) => {
        console.log("new order", voucher);
        // currently displaying validated orders
        this.notificationService.pushNotification({
          type: "voucher",
        });
      }
    );
  }

  /**
   * Subscribe to incoming customers
   */
  subscribeToNewClients() {
    this.addedSubClient$ = this.userService.newClient.subscribe((client) => {
      console.log("new client", client);
      // currently displaying validated orders
      this.notificationService.pushNotification({
        type: "client",
      });
    });
  }
}
