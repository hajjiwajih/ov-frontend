import { Message } from "primeng/api";
import { Router } from "@angular/router";
import { User } from "../../models/user";
import { UserService } from "../../services/user.service";
import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl } from "@angular/forms";
import { catchError } from "rxjs/operators";
declare var $: any;

@Component({
  selector: "app-login-admin",
  templateUrl: "./login-admin.component.html",
  styleUrls: ["./login-admin.component.css"],
})
export class LoginAdminComponent implements OnInit {
  loginForm = new FormGroup({
    login: new FormControl(""),
    password: new FormControl(""),
  });
  user: User;
  _this;

  msgs: Message[] = [];

  constructor(private loginService: UserService, private router: Router) {
    this.user = {
      username: "",
      password: "",
    };
  }

  ngOnInit() {
    if (localStorage.getItem("currentUserId"))
      this.router.navigateByUrl("monitor");
  }
  onSubmit() {
    console.log("Login submited ", this.loginForm.value);
    console.log($("button:submit"));
    $(".progress-line").addClass("flex-display");
    $("button:submit").attr("disabled", true);
    this.msgs.pop();
    this._this = this;
    console.log(this.user);
    this.loginService.login(this.user).subscribe(
      (_loginToken) => {
        localStorage.setItem("token", _loginToken.id);
        this.loginService.getUserById(_loginToken.userId).subscribe((user) => {
          // authorization required !!
          if (user.role != "admin") {
            console.log(
              "Unrecognized user, You can check your email first or contact our support"
            );
            setTimeout(function () {
              $(".progress-line").removeClass("flex-display");
              $("button:submit").attr("disabled", false);
            }, 1000);
            this.msgs.push({
              severity: "warn",
              summary: "Error Message",
              detail:
                "Utilisateur non autorisé, vous pouvez d'abord vérifier vos données ou contacter votre administrateur.",
            });
            return;
          }

          localStorage.setItem("role", user.role);
          localStorage.setItem("login", user.username);
          localStorage.setItem("email", user.email);
          localStorage.setItem("currentUserId", _loginToken.userId); // we need to store the id so that we can get it directly from localStorage to use getUserById
          sessionStorage.setItem("password", this.loginForm.value.password); // we need the password since we can't update a user later without a pwd in case he didn't change it
          const token = localStorage.getItem("token");
          if (token === "") {
            console.log("You cannot connect now! server unavailable");
            setTimeout(function () {
              $(".progress-line").removeClass("flex-display");
              $("button:submit").attr("disabled", false);
            }, 1000);
            this.msgs.push({
              severity: "warn",
              summary: "Error Message",
              detail:
                "Vous ne pouvez pas vous connecter maintenant ! serveur indisponible",
            });
          }
          // this.router.navigateByUrl("admin");
          window.location.assign("monitor");
        });
      },
      (error) => {
        catchError(error);
        if (error.status === 401) {
          console.log(
            "Unrecognized user, You can check your email first or contact our support"
          );
          setTimeout(function () {
            $(".progress-line").removeClass("flex-display");
            $("button:submit").attr("disabled", false);
          }, 1000);
          this.msgs.push({
            severity: "error",
            summary: "Message",
            detail:
              "Utilisateur non reconnu, vous pouvez d'abord vérifier vos données ou contacter notre support.",
          });
        } else {
          console.log("A problem occurred, try again later");
          setTimeout(function () {
            $(".progress-line").removeClass("flex-display");
            $("button:submit").attr("disabled", false);
          }, 1000);
          this.msgs.push({
            severity: "info",
            summary: "Error Message",
            detail: "Login et Mot de passe obligatoires",
          });
        }
      }
    );
  }
}
