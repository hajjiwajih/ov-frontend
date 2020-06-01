import { Message } from "primeng/api";
import { Router } from "@angular/router";
import { User } from "../../models/user";
import { UserService } from "../../services/user.service";
import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl } from "@angular/forms";
import { catchError } from "rxjs/operators";
declare var $: any;

const PWD_EXPIRED_CODE = 402;

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent implements OnInit {
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
      if (localStorage.getItem("role") == "client")
        this.router.navigateByUrl("portal");
      else this.router.navigateByUrl("monitor");

    let _self = this;
    // indecate password strength
    $(document).ready(function () {
      _self.togglePassword();
      window.scrollTo(0, 0);
    });
  }
  onSubmit() {
    // console.log("Login submited ", this.loginForm.value);
    $(".progress-line").addClass("flex-display");
    $("button:submit").attr("disabled", true);
    this.msgs.pop();
    this._this = this;
    this.loginService.login(this.user).subscribe(
      (_loginToken) => {
        localStorage.setItem("token", _loginToken.id);
        this.loginService.getUserById(_loginToken.userId).subscribe((user) => {
          // authorization required !!
          if (user.role == "admin") {
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
          localStorage.setItem("currentUserRef", user.autoID); // we need to store the ref so that we can get it directly from localStorage to use getUserByRef
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
          // this.router.navigateByUrl("portal");
          window.location.assign("portal");
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
              "Utilisateur non reconnu, vous pouvez d'abord vérifier vos données ou contacter votre administrateur.",
          });
        } else if (error.error.error.code == PWD_EXPIRED_CODE) {
          console.log("Pasword has expired");
          setTimeout(function () {
            $(".progress-line").removeClass("flex-display");
            $("button:submit").attr("disabled", false);
          }, 1000);
          this.msgs.push({
            severity: "info",
            summary: "PASSWORD HAS EXPIRED",
            detail:
              " Veuillez changer votre mot de passe au moins une fois tous les 90 jours ",
          });
          setTimeout(() => {
            this.router.navigate(["/expiry-password"], {
              queryParams: {
                access_token: error.error.error.name,
                returnUrl: "/login",
              },
            });
          }, 1000);
        } else {
          console.log("A problem occurred, try again later");
          setTimeout(function () {
            $(".progress-line").removeClass("flex-display");
            $("button:submit").attr("disabled", false);
          }, 1000);
          this.msgs.push({
            severity: "info",
            summary: "Error Message",
            detail: "Service non disponible, essayez de nouveau plus tard",
          });
        }
      }
    );
  }

  togglePassword() {
    $("#eye").click(function () {
      if ($(this).hasClass("fa-eye-slash")) {
        $(this).removeClass("fa-eye-slash");

        $(this).addClass("fa-eye");

        $("#password").attr("type", "text");
      } else {
        $(this).removeClass("fa-eye");

        $(this).addClass("fa-eye-slash");

        $("#password").attr("type", "password");
      }
    });
  }
}
