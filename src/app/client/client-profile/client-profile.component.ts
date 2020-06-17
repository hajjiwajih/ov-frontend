import { Component, OnInit } from "@angular/core";
import { environment } from "./../../../environments/environment";
import { User } from "./../../models/user";
import { UserService } from "./../../services/user.service";

@Component({
  selector: "client-profile",
  templateUrl: "./client-profile.component.html",
  styleUrls: ["./client-profile.component.css"],
})
export class ClientProfileComponent implements OnInit {
  mClient: User;
  clientId: string;
  currentAgentEmail: string;
  companyName: string;
  constructor(private userService: UserService) {}

  ngOnInit() {
    this.clientId = localStorage.getItem("currentUserId");
    this.currentAgentEmail = localStorage.getItem("email");
    this.companyName = environment.companyName;

    // get client info
    this.getClientInfo();
  }

  getClientInfo() {
    this.userService.getUserById(this.clientId).subscribe((clientInfo) => {
      this.mClient = clientInfo;
      console.log(this.mClient)
    });
  }
}
