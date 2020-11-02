import { Router } from "@angular/router";
import { UserService } from "./../../services/user.service";
import { User } from "./../../models/user";
import { Component, OnInit, Input } from "@angular/core";
import Swal from "sweetalert2";

@Component({
  selector: "app-profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.css"],
})
export class ProfileComponent implements OnInit {
  @Input() user: User;
  constructor(private userService: UserService, private router: Router) {}

  ngOnInit() {}

  /**
   * Edit profile infos (email & phone)
   * @param attr
   */

  logout() {
    this.userService.logout().subscribe((res) => {
      if (this.user.role === 'admin') this.router.navigateByUrl("login-admin");
      else this.router.navigateByUrl('login')
    });
  }

  navigate(route) {
    this.router.navigateByUrl(route);
  }


  /*
    The following functions has been moved to Client-Profile component
  */
 
  // editInfo(attr) {
  // }

  // editMail() {
  // }

  // editPhone() {
  // }
}
