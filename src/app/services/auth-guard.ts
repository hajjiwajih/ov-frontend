import { UserService } from "./user.service";
import { Injectable } from "@angular/core";
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from "@angular/router";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private userService: UserService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (localStorage.getItem("currentUserId")) {
      // if commercial -> distroy session
      if (localStorage.getItem("role") == "commercial")
        this.userService.clearSession();
      // logged in so return true
      let roles = route.data["roles"] as Array<string>;
      if (roles) {
        var match = this.userService.roleMatch(roles);
        if (match) return true;
        else {
          this.router.navigate(["/forbidden"]);
          return false;
        }
      } else return true;
    }

    // temp access token to reset password
    if (route.queryParams["access_token"]) {
      localStorage.setItem("token", route.queryParams["access_token"]);
      return true;
    }

    // not logged in so redirect to login page with the return url
    let roles = route.data["roles"] as Array<string>;
    if (roles.includes("admin"))
      // admin login portal
      this.router.navigate(["/login-admin"], {
        queryParams: { returnUrl: state.url },
      });
    // agent login portal
    else
      this.router.navigate(["/login"], {
        queryParams: { returnUrl: state.url },
      });
    return false;
  }
}
