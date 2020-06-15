import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpErrorResponse,
  HttpEvent,
  HttpHeaders,
} from "@angular/common/http";
import { Observable } from "rxjs";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { retry, catchError } from "rxjs/operators";
import { tap } from "rxjs/internal/operators";
import { throwError } from "rxjs";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    req.headers.set("Access-Control-Allow-Headers", "Content-Type");
    req.headers.set("Access-Control-Allow-Methods", "GET");
    req.headers.set("Access-Control-Allow-Origin", "*");
    console.log(req);
    // no auth required for these routes
    if (
      req.url.includes("/login") ||
      req.url.includes("/request-password-reset") ||
      req.url.includes("/logout") ||
      (req.url.endsWith("/users") && req.method == "POST")
    ) {
      let clonedReq = req.clone({
        headers: new HttpHeaders({
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Origin": "*",
        }),
      });
      console.log(clonedReq);
      return next.handle(clonedReq);
    } else if (localStorage.getItem("token") != null) {
      // auth required for these routes
      const clonedreq = req.clone({
        headers: new HttpHeaders({
          Authorization: localStorage.getItem("token"),
          "Access-Control-Allow-Origin": "*",
        }),
      });

      return next
        .handle(clonedreq)
        .pipe(
          retry(1),
          catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
              // refresh token
              if (localStorage.getItem("role") == "admin")
                this.router.navigateByUrl("/login-admin");
              else this.router.navigateByUrl("/login");
              // remove authentication storage
              localStorage.removeItem("token");
              localStorage.removeItem("currentUserId");
              localStorage.removeItem("currentUserRef");
            } else {
              return throwError(error);
            }
          })
        )
        .pipe(
          tap(
            (succ) => {},
            (err) => {
              if (err.status === 401) {
                if (localStorage.getItem("role") == "admin")
                  this.router.navigateByUrl("/login-admin");
                else this.router.navigateByUrl("/login");
                // remove authentication storage
                localStorage.removeItem("token");
                localStorage.removeItem("currentUserId");
                localStorage.removeItem("currentUseRef");
              }
            }
          )
        );
    } else {
      this.router.navigateByUrl("/login");
    }
  }
}
