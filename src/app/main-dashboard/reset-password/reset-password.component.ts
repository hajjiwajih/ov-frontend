import { ActivatedRoute } from "@angular/router";
import { UserService } from "./../../services/user.service";
import { FormControl } from "@angular/forms";
import { FormGroup } from "@angular/forms";
import { Component, OnInit } from "@angular/core";
declare var $: any;

@Component({
  selector: "app-reset-password",
  templateUrl: "./reset-password.component.html",
  styleUrls: ["./reset-password.component.css"],
})
export class ResetPasswordComponent implements OnInit {
  constructor(
    private userService: UserService,
    private route: ActivatedRoute
  ) {}

  resetPasswordForm = new FormGroup({
    password: new FormControl(""),
    confirmPassword: new FormControl(""),
  });

  password: string;
  confirm: string;

  checkedPwd = false;

  isSubmitted = false;
  isComplete = true;

  isLoading = false;

  ngOnInit() {
    this.userService.getUserById("no_one").subscribe();
    let _self = this;
    // indecate password strength
    $(document).ready(function () {
      $("#password").keyup(function () {
        _self.checkPasswordStrength();
        console.log("check");
      });
    });
  }

  resetPassword() {
    if (this.validateForm() && this.checkPasswordStrength()) {
      this.isLoading = true;
      this.userService.resetPassword(this.password, this.confirm).subscribe(
        (res) => {
          console.log(res);
          this.isSubmitted = true;
          setTimeout(() => {
            this.isLoading = false;
          }, 700);
        },
        (err) => {
          console.log(err);
          this.isComplete = false;
          this.isSubmitted = true;
          setTimeout(() => {
            this.isLoading = false;
          }, 700);
        }
      );
    }
  }

  validateForm() {
    $("#resetForm").addClass("was-validated");
    // required fields
    if (
      this.resetPasswordForm.get("confirmPassword").value !=
      this.resetPasswordForm.get("password").value
    ) {
      $("#confirmation")[0].setCustomValidity("Passwords must match");
      $("#confirmation").keyup(function () {
        if ($(this).val() == $("#password").val()) {
          this.setCustomValidity("");
        } else {
          this.setCustomValidity("Passwords must match");
        }
      });
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
