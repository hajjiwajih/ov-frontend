import { ActivatedRoute, Router } from "@angular/router";
import { UserService } from "./../../services/user.service";
import { Component, Inject, OnInit, SecurityContext } from "@angular/core";
import { FormGroup, FormControl } from "@angular/forms";
import { catchError } from "rxjs/operators";
import { DomSanitizer, SafeValue} from '@angular/platform-browser';
declare var $: any;

@Component({
  selector: "app-change-password",
  templateUrl: "./change-password.component.html",
  styleUrls: ["./change-password.component.css"],
})
export class ChangePasswordComponent implements OnInit {
  constructor(
    @Inject(DomSanitizer) private readonly sanitizer: DomSanitizer, 
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  resetPasswordForm = new FormGroup({
    oldPassword: new FormControl(""),
    newPassword: new FormControl(""),
    confirmPassword: new FormControl(""),
  });

  old: string;
  password: string;
  confirm: string;

  isSubmitted = false;
  isComplete = true;

  isLoading = false;

  checkedPwd = false;

  ngOnInit() {
    let _self = this;
    // indecate password strength
    $(document).ready(function () {
      $("#password").keyup(function () {
        _self.checkPasswordStrength();
      });
      _self.togglePassword();
    });
  }

  /**
   * Submit password change form
   */
  changePassword() {
    this.isComplete = true;
    // validate password
    if (this.validateForm() && this.checkPasswordStrength()) {
      this.isLoading = true;
      // sanitize input data
      // this.sanitizeInputData()
      // submit safe data
      this.userService.changePassword(this.old, this.password).subscribe(
        (res) => {
          console.log(res);
          this.isSubmitted = true;
          let idUser = localStorage.getItem("currentUserId");
          let role = localStorage.getItem("role");
          this.userService.logout().subscribe((res) => console.log(res));
          setTimeout(() => {
            this.isLoading = false;
            if (role == "admin") this.router.navigateByUrl("/login-admin");
            else this.router.navigateByUrl("/login");
          }, 2000);
        },
        (err) => {
          console.log(err);
          this.isComplete = false;
          setTimeout(() => {
            this.isLoading = false;
          }, 700);
        }
      );
    }
  }

  sanitizeInputData() {
    this.old = this.sanitizer.sanitize(SecurityContext.HTML, this.old) || '';
    this.password = this.sanitizer.sanitize(SecurityContext.HTML, this.password) || '';
  }

  validateForm() {
    $("#resetForm").addClass("was-validated");
    // required fields

    // password mismatch
    if (
      this.resetPasswordForm.get("confirmPassword").value !=
      this.resetPasswordForm.get("newPassword").value
    ) {
      $("#confirmation")[0].setCustomValidity("Passwords must match");
      $("#confirmation").keyup(function () {
        if ($(this).val() == $("#password").val()) {
          this.setCustomValidity("");
        } else {
          this.setCustomValidity("Passwords must match");
        }
      });
      // console.log(this.resetPasswordForm.get("password").value);
      $("#confirmation").removeClass("ng-valid");
      $("#confirmation").addClass("ng-invalid is-invalid");

      return false;
    }

    return true;
  }

  checkPasswordStrength() {
    this.checkedPwd = true;
    var number = /([0-9])/;
    var alphabets = /([a-zA-Z])/;
    var special_characters = /([~,!,@,#,$,%,^,&,*,-,_,+,=,?,>,<])/;
    if ($("#password").val() == $("#old").val()) {
      $("#password-strength-container").removeClass(
        "alert-warning alert-success"
      );
      $("#password-strength-container").addClass("alert-danger");
      $("#password-strength-status").html("Duplicate (consider new Password)");
      return false;
    } else if ($("#password").val().length < 7) {
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

  /**
   * Toggle password visibility
   */
  togglePassword() {
    $("#eye_old").click(function () {
      if ($(this).hasClass("fa-eye-slash")) {
        $(this).removeClass("fa-eye-slash");

        $(this).addClass("fa-eye");

        $("#old").attr("type", "text");
      } else {
        $(this).removeClass("fa-eye");

        $(this).addClass("fa-eye-slash");

        $("#old").attr("type", "password");
      }
    });
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

        $("#confirmation").attr("type", "text");
      } else {
        $(this).removeClass("fa-eye");

        $(this).addClass("fa-eye-slash");

        $("#confirmation").attr("type", "password");
      }
    });
  }
}
