import { FormControl } from "@angular/forms";
import { FormGroup } from "@angular/forms";
import { UserService } from "./../../services/user.service";
import { Component, Inject, OnInit, SecurityContext } from "@angular/core";
import { DomSanitizer, SafeValue} from '@angular/platform-browser';

declare var $: any;

@Component({
  selector: "app-forgot-password",
  templateUrl: "./forgot-password.component.html",
  styleUrls: ["./forgot-password.component.css"],
})
export class ForgotPasswordComponent implements OnInit {
  constructor(
    private userService: UserService,
    @Inject(DomSanitizer) private readonly sanitizer: DomSanitizer, 
    ) {}

  resetPasswordForm = new FormGroup({
    email: new FormControl(""),
  });
  email: string;
  isSubmitted = false;
  isComplete = true;
  isLoading = false;
  ngOnInit() {}

  resetPassword() {
    $("#resetForm").addClass("was-validated");
    if (this.email) this.isLoading = true;
    // sanitize input data
    this.sanitizeInputData()
    // submit safe data
    this.userService.requestResetPassword(this.email).subscribe(
      (res) => {
        console.log(res);
        this.isSubmitted = true;
        setTimeout(() => {
          this.isLoading = false;
        }, 700);
      },
      (err) => {
        console.log(err);
        this.isSubmitted = true;
        this.isComplete = false;
        setTimeout(() => {
          this.isLoading = false;
        }, 700);
      }
    );
  }

  sanitizeInputData() {
    this.email = this.sanitizer.sanitize(SecurityContext.HTML, this.email) || '';
  }

}
