import { Message } from "primeng/api";
import { Router } from "@angular/router";
import { User } from "../../models/user";
import { UserService } from "../../services/user.service";
import { Component, Inject, OnInit, SecurityContext } from "@angular/core";
import { FormGroup, FormControl, AbstractControl } from "@angular/forms";
import { catchError } from "rxjs/operators";
import { DomSanitizer, SafeValue} from '@angular/platform-browser';

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

  constructor(
    @Inject(DomSanitizer) private readonly sanitizer: DomSanitizer, 
    private userService: UserService, 
    private router: Router) {
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

    // form validation
    $(document).ready(function () {
      /**
       *  I commented those lines because they will show user the error once he opens the page
       *  so now the error will only pop once he touch field or submit the form
       */

      // $("#cin")[0].setCustomValidity("cin empty");
      // $("#patente")[0].setCustomValidity("login empty");
      // $("#signupForm").addClass("was-validated");

      var loginPattern = /^(([0-9]{8})|([0-9]{7}[A-Z]))$/; // 7 digits then 1 uppercase letter
      var cinPattern = /^([0-9]{8})$/; // 8 digits

      // input validation
      $("#patente").keyup(function () {
        if ($(this).val().match(loginPattern)) {
          this.setCustomValidity("");
        } else {
          this.setCustomValidity("Login field pattern didn't match");
        }
      });

      // input validation
      $("#cin").keyup(function () {
        if ($(this).val().match(cinPattern)) {
          this.setCustomValidity("");
        } else {
          this.setCustomValidity("CIN field pattern didn't match");
        }
      });

      // input validation
      $("#password").keyup(function () {
        _self.checkPasswordStrength();
      });

      // input validation
      $("#confirm_password").keyup(function () {
        if ($(this).val() == $("#password").val()) {
          this.setCustomValidity("");
        } else {
          this.setCustomValidity("Passwords must match");
        }
      });

      _self.togglePassword();
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
    if (this.validateForm() && this.checkPasswordStrength()) {
      $(".progress-line").addClass("flex-display");
      $("button:submit").attr("disabled", true);

      // Sanitize DOM-input & prevent XSS attack 
      this.sanitizeInputData()
       
      // submit safe data
      this.userService.addUser(this.user).subscribe(
        (createdUser) => {
          this.isSubmitted = true;
          this.userService.triggerEvent("newClient", createdUser);
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
              summary: "",
              // summary: "Message",
              detail:
                "Le courrier ??lectronique / patente / CIN existe d??j??. Veuillez le changer",
            });
          } else {
            console.log("A problem occurred, try again later");
            setTimeout(function () {
              $(".progress-line").removeClass("flex-display");
              $("button:submit").attr("disabled", false);
            }, 1000);
            this.msgs.push({
              severity: "info",
              summary: "",
              // summary: "Error Message",
              detail: "Aucune r??ponse de serveur, Probl??me survenu!",
            });
          }
        }
      );
    }
  }

  validateForm() {
    $("#signupForm").addClass("was-validated");
    console.log($("#signupForm"));

    // required fields
    console.log(
      this.signupForm.get("login").value && this.signupForm.get("cin").value
    );
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
          this.setCustomValidity("Login field empty");
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

  sanitizeInputData() {
    this.user._id = this.sanitizer.sanitize(SecurityContext.HTML, this.user._id) || '';
    this.user.username = this.sanitizer.sanitize(SecurityContext.HTML, this.user.username) || '';
    this.user.cin = this.sanitizer.sanitize(SecurityContext.HTML, this.user.cin) || '';
    this.user.fname = this.sanitizer.sanitize(SecurityContext.HTML, this.user.fname) || '';
    this.user.lname = this.sanitizer.sanitize(SecurityContext.HTML, this.user.lname) || '';
    this.user.email = this.sanitizer.sanitize(SecurityContext.HTML, this.user.email) || '';
    // this.user.password = this.sanitizer.sanitize(SecurityContext.HTML, this.user.password) || '';
    this.user.role = this.sanitizer.sanitize(SecurityContext.HTML, this.user.role) || '';
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
      $("#password")[0].setCustomValidity("Passwords weak");
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
        $("#password")[0].setCustomValidity("");
        return true;
      } else {
        $("#password-strength-container").removeClass(
          "alert-danger alert-success"
        );
        $("#password-strength-container").addClass("alert-warning");
        $("#password-strength-status").html(
          "Medium (should include alphabets, numbers and special characters.)"
        );
        $("#password")[0].setCustomValidity("Passwords meduim");
        return false;
      }
    }
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
    $("#eye_confirm").click(function () {
      if ($(this).hasClass("fa-eye-slash")) {
        $(this).removeClass("fa-eye-slash");

        $(this).addClass("fa-eye");

        $("#confirm_password").attr("type", "text");
      } else {
        $(this).removeClass("fa-eye");

        $(this).addClass("fa-eye-slash");

        $("#confirm_password").attr("type", "password");
      }
    });
  }
}
