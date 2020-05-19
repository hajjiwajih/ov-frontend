import { Message } from "primeng/api";
import { Router } from "@angular/router";
import { User } from "../../models/user";
import { UserService } from "../../services/user.service";
import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl, AbstractControl } from "@angular/forms";
import { catchError } from "rxjs/operators";
declare var $: any;

@Component({
  selector: "app-signup",
  templateUrl: "./signup.component.html",
  styleUrls: ["./signup.component.css"],
})
export class SignupComponent implements OnInit {
  signupForm = new FormGroup({
    login: new FormControl(""),
    cin: new FormControl(""),
    fname: new FormControl(""),
    lname: new FormControl(""),
    email: new FormControl(""),
    password: new FormControl(""),
    confirmPassword: new FormControl(""),
  });

  user: User;
  isSubmitted: boolean;
  checkedPwd = false;

  msgs: Message[] = [];

  constructor(private loginService: UserService, private router: Router) {
    this.user = {
      _id: "",
      username: "",
      cin: "",
      fname: "",
      lname: "",
      email: "",
      password: "",
      role: "client",
      emailVerified: false,
    };
  }

  ngOnInit() {
    if (localStorage.getItem("currentUserId"))
      if (localStorage.getItem("role") == "agent")
        this.router.navigateByUrl("portal");
      else this.router.navigateByUrl("monitor");

    let _self = this;
    // indecate password strength
    $(document).ready(function () {
      $("#password").keyup(function () {
        _self.checkPasswordStrength();
      });
    });
  }

  onSubmit() {
    this.msgs.pop();
    // check special fields
    this.user._id = this.user.username;
    if (this.user.username.length == 0)
      this.user.username = this.user._id = this.user.cin;

    // submit form
    $("#signupForm").submit(function (event) {
      event.preventDefault();
    });
    // decorate form
    console.log(this.user);
    // add user
    if (
      this.signupForm.valid &&
      this.validateForm() &&
      this.checkPasswordStrength()
    ) {
      $(".progress-line").addClass("flex-display");
      $("button:submit").attr("disabled", true);
      this.loginService.addUser(this.user).subscribe(
        (createdUser) => {
          this.isSubmitted = true;
          setTimeout(function () {
            $(".progress-line").removeClass("flex-display");
            $("button:submit").attr("disabled", false);
          }, 1000);
        },
        (error) => {
          catchError(error);
          if (error.status === 422) {
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
                "Le courrier électronique / patente / CIN existe déjà. Veuillez le changer",
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
              detail: "Aucune réponse de serveur, Probléme survenu!",
            });
          }
        }
      );
    }
  }

  validateForm() {
    $("#signupForm").addClass("was-validated");
    // required fields
    if (
      !this.signupForm.get("login").value &&
      !this.signupForm.get("cin").value
    ) {
      $("#cin")[0].setCustomValidity("cin empty");
      $("#patente")[0].setCustomValidity("login empty");

      $("#patente").keyup(function () {
        if ($(this).val()) {
          this.setCustomValidity("");
        } else {
          this.setCustomValidity("Passwords must match");
        }
      });
      return false;
    }

    // password mismatch
    if (
      this.signupForm.get("confirmPassword").value !=
      this.signupForm.get("password").value
    ) {
      $("#confirm_password")[0].setCustomValidity("Passwords must match");
      $("#confirm_password").keyup(function () {
        if ($(this).val() == $("#password").val()) {
          this.setCustomValidity("");
        } else {
          this.setCustomValidity("Passwords must match");
        }
      });
      console.log(this.signupForm.get("password").value);
      $("#confirm_password").removeClass("ng-valid");
      $("#confirm_password").addClass("ng-invalid is-invalid");

      return false;
    }

    return true;
  }

  checkPasswordStrength() {
    this.checkedPwd = true;
    var number = /([0-9])/;
    var alphabets = /([a-zA-Z])/;
    var special_characters = /([~,!,@,#,$,%,^,&,*,-,_,+,=,?,>,<])/;
    if ($("#password").val().length < 7) {
      $("#password-strength-container").removeClass(
        "alert-warning alert-success"
      );
      $("#password-strength-container").addClass("alert-danger");
      $("#password-strength-status").html(
        "Weak (should be atleast 7 characters.)"
      );
      return false;
    } else {
      if (
        $("#password").val().match(number) &&
        $("#password").val().match(alphabets) &&
        $("#password").val().match(special_characters)
      ) {
        $("#password-strength-container").removeClass(
          "alert-warning alert-danger"
        );
        $("#password-strength-container").addClass("alert-success");
        $("#password-strength-status").html("Strong Password");
        return true;
      } else {
        $("#password-strength-container").removeClass(
          "alert-danger alert-success"
        );
        $("#password-strength-container").addClass("alert-warning");
        $("#password-strength-status").html(
          "Medium (should include alphabets, numbers and special characters.)"
        );
        return false;
      }
    }
  }
}
