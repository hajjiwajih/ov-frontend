import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';
import { OrderService } from 'src/app/services/order.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: "admin-profile",
  templateUrl: "./admin-profile.component.html",
  styleUrls: ["./admin-profile.component.css"],
})

export class AdminProfileComponent implements OnInit {
  currentAdminEmail: string;
  companyName: string;
  currentAdminId: string;
  mAdmin: User;
  constructor(private userService: UserService,  private router: Router, private orderService: OrderService) {}

  ngOnInit() {
    this.currentAdminEmail = localStorage.getItem("email");
    this.currentAdminId = localStorage.getItem("currentUserId");
    this.companyName = environment.companyName;

    // get admin info
    this.getAdminInfo();

    this.orderService.getLatestClientOrders(this.currentAdminId).subscribe(data => {
      console.log(data)
    })
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

  navigate(route) {
    this.router.navigateByUrl(route);
  }
}