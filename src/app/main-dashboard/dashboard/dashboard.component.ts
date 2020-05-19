import { OrderService } from "./../../services/order.service";
import { Subscription } from "rxjs";
import { NotificationService } from "./../../services/notification.service";
import { User } from "./../../models/user";
import { environment } from "./../../../environments/environment";
import { UserService } from "./../../services/user.service";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { saveAs } from "file-saver";
// sweet alert
import Swal from "sweetalert2";
declare var $: any;

@Component({
  selector: "app-dashboard",
  providers: [NotificationService],
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.css"],
})
export class DashboardComponent implements OnInit {
  selectedActivationIndex: number;
  // blob ref
  objectURL: any = null;
  downloadQuery: boolean;

  mClient: User;
  clientId: string;

  validationSub$: Subscription;
  rejectionSub$: Subscription;

  activatedLink: string = "portal";
  currentAgentEmail: string;
  companyName: string;

  displayProfile: boolean = false;

  unreadValidations: number = 0;
  unreadRejections: number = 0;

  constructor(
    private notificationService: NotificationService,
    private userService: UserService,
    private orderService: OrderService,
    private router: Router
  ) {
    // subscribe to notifications
    notificationService.notifObs$.subscribe((notif) => {
      if (notif.valid) this.unreadValidations++;
      if (notif.reject) this.unreadRejections++;
    });

    // subscribe to reset request
    notificationService.resetObs$.subscribe((req) => {
      if (req.valid) {
        setTimeout(() => {
          this.unreadValidations = 0;
        }, 3000);
      }
      if (req.reject) {
        setTimeout(() => {
          this.unreadRejections = 0;
        }, 3000);
      }
    });
  }

  ngOnInit() {
    this.clientId = localStorage.getItem("currentUserId");
    this.currentAgentEmail = localStorage.getItem("email");
    this.companyName = environment.companyName;

    // get client info
    this.getClientInfo();

    // subscribe to incoming events
    this.subscribeToValidatedOrders();
    this.subscribeToRejectedOrders();
  }

  getClientInfo() {
    this.userService.getUserById(this.clientId).subscribe((clientInfo) => {
      this.mClient = clientInfo;
    });
  }

  logout() {
    this.userService.logout().subscribe((res) => {
      this.router.navigateByUrl("login");
    });
  }

  navigate(route) {
    this.activatedLink = route;
    this.router.navigateByUrl(route);
  }

  toggleProfile() {
    this.displayProfile = !this.displayProfile;
  }

  subscribeToValidatedOrders() {
    this.validationSub$ = this.orderService.validatedOrder.subscribe(
      (order) => {
        this.notificationService.pushNotification({
          valid: true,
          reject: false,
        });
        console.log("validated", order);
      }
    );
  }

  subscribeToRejectedOrders() {
    this.rejectionSub$ = this.orderService.rejectedOrder.subscribe((order) => {
      this.notificationService.pushNotification({
        valid: false,
        reject: true,
      });
      console.log("rejected", order);
    });
  }

  ngOnDestroy() {
    if (this.validationSub$) this.validationSub$.unsubscribe();
    if (this.rejectionSub$) this.rejectionSub$.unsubscribe();
  }
}
