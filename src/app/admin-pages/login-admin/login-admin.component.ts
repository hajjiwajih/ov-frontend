import { Message } from "primeng/api";
import { Router } from "@angular/router";
import { User } from "../../models/user";
import { UserService } from "../../services/user.service";
import { Component, Inject, OnInit, SecurityContext } from "@angular/core";
import { FormGroup, FormControl } from "@angular/forms";
import { catchError } from "rxjs/operators";
import { DomSanitizer, SafeValue} from '@angular/platform-browser';

declare var $: any;

const PWD_EXPIRED_CODE = 402;

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

  constructor(
    @Inject(DomSanitizer) private readonly sanitizer: DomSanitizer, 
    private loginService: UserService, 
    private router: Router) {
    this.user = {
      email: "",
      password: "",
    };
  }

  ngOnInit() {
    if (localStorage.getItem("currentUserId"))
      this.router.navigateByUrl("monitor");

    let _self = this;
    // indecate password strength
    $(document).ready(function () {
      _self.togglePassword();
      window.scrollTo(0, 0);
    });
  }

  /**
   * Submit login form
   */
  onSubmit() {
    $(".progress-line").addClass("flex-display");
    $("button:submit").attr("disabled", true);
    this.msgs.pop();
    this._this = this;
    // sanitize input data
    this.sanitizeInputData()
    // submit dafe data
    this.loginService.loginAdmin(this.user).subscribe(
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

            /**
             * Error message primefaces
             */
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
          const token = localStorage.getItem("token");
          if (token === "") {
            console.log("You cannot connect now! server unavailable");
            setTimeout(function () {
              $(".progress-line").removeClass("flex-display");
              $("button:submit").attr("disabled", false);
            }, 1000);

            /**
             * Error message primefaces
             */
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

          /**
           * Error message primefaces
           */
          this.msgs.push({
            severity: "error",
            summary: "",
            // summary: "Message",
            detail:
              "Utilisateur non reconnu, vous pouvez d'abord vérifier vos données ou contacter notre support.",
          });
        } else if (error.error.error.code == PWD_EXPIRED_CODE) {
          console.log("Pasword has expired");
          setTimeout(function () {
            $(".progress-line").removeClass("flex-display");
            $("button:submit").attr("disabled", false);
          }, 1000);

          /**
           * Error message primefaces
           */
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
                returnUrl: "/login-admin",
              },
            });
          }, 1000);
        } else {
          console.log("A problem occurred, try again later");
          setTimeout(function () {
            $(".progress-line").removeClass("flex-display");
            $("button:submit").attr("disabled", false);
          }, 1000);

          /**
           * Error message primefaces
           */

          this.msgs.push({
            severity: "info",
            summary: "",
            // summary: "Error Message",
            detail: "Service non disponible, essayez de nouveau plus tard",
          });
        }
      }
    );
  }


  sanitizeInputData() {
    this.user.username = this.sanitizer.sanitize(SecurityContext.HTML, this.user.username) || '';
    // this.user.password = this.sanitizer.sanitize(SecurityContext.HTML, this.user.password) || '';
  }


  /**
   * toggle password visibilty
   */
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
