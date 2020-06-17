import { PasswordExpiryComponent } from "./main-dashboard/password-expiry/password-expiry.component";
import { LatestOrdersComponent } from "./client/latest-orders/latest-orders.component";
import { ChangePasswordComponent } from "./main-dashboard/change-password/change-password.component";
import { StockComponent } from "./admin-pages/stock/stock.component";
import { ClientDetailsComponent } from "./admin-pages/client-details/client-details.component";
import { VerifyComponent } from "./main-dashboard/verify/verify.component";
import { OrdersComponent } from "./orders/orders.component";
import { ClientOrdersComponent } from "./client/client-orders/client-orders.component";
import { ConfirmationComponent } from "./client/confirmation/confirmation.component";
import { PlaceOrderComponent } from "./client/place-order/place-order.component";
import { SignupComponent } from "./main-dashboard/signup/signup.component";
import { AdminComponent } from "./admin-pages/admin/admin.component";
import { DashboardComponent } from "./main-dashboard/dashboard/dashboard.component";
import { ForgotPasswordComponent } from "./main-dashboard/forgot-password/forgot-password.component";
import { LoginAdminComponent } from "./admin-pages/login-admin/login-admin.component";
import { ServerErrorComponent } from "./server-error/server-error.component";
import { PageNotFoundComponent } from "./page-not-found/page-not-found.component";
import { AuthGuard } from "./services/auth-guard";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { LoginComponent } from "./main-dashboard/login/login.component";
import { LogoutGuard } from "./services/logout-guard";
import { ResetPasswordComponent } from "./main-dashboard/reset-password/reset-password.component";
import { ClientListingComponent } from "./admin-pages/client-listing/client-listing.component";

const routes: Routes = [
  { path: "", component: LoginComponent },
  { path: "login", component: LoginComponent },
  { path: "signup", component: SignupComponent },
  {
    path: "login-admin",
    component: LoginAdminComponent,
  },
  {
    path: "forgot-password",
    component: ForgotPasswordComponent,
  },
  {
    path: "reset-password",
    component: ResetPasswordComponent,
    canActivate: [AuthGuard],
    data: { roles: ["any"] },
  },
  {
    path: "expiry-password",
    component: PasswordExpiryComponent,
    canActivate: [AuthGuard],
    data: { roles: ["any"] },
  },
  {
    path: "verify-client",
    component: VerifyComponent,
  },
  {
    path: "portal",
    component: DashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: ["client"] },
    children: [
      {
        path: "",
        component: PlaceOrderComponent,
      },
      {
        path: "place-order",
        component: PlaceOrderComponent,
      },
      {
        path: "history",
        component: LatestOrdersComponent,
      },
      {
        path: "change-password",
        component: ChangePasswordComponent,
      },
      {
        path: "confirm",
        component: ConfirmationComponent,
      },
      {
        path: "validated-orders",
        component: ClientOrdersComponent,
        data: { valid: true, rejected: false },
      },
      {
        path: "non-validated-orders",
        component: ClientOrdersComponent,
        data: { valid: false, rejected: false },
      },
      {
        path: "rejected-orders",
        component: ClientOrdersComponent,
        data: { valid: false, rejected: true },
      },
    ],
  },
  {
    path: "monitor",
    component: AdminComponent,
    canActivate: [AuthGuard],
    data: { roles: ["admin"] },
    children: [
      {
        path: "",
        component: OrdersComponent,
        data: { valid: false, rejected: false },
      },
      {
        path: "change-password",
        component: ChangePasswordComponent,
      },
      {
        path: "active",
        component: OrdersComponent,
        data: { valid: false, rejected: false },
      },
      {
        path: "validated",
        component: OrdersComponent,
        data: { valid: true, rejected: false },
      },
      {
        path: "rejected",
        component: OrdersComponent,
        data: { valid: false, rejected: true },
      },
      {
        path: "clients",
        component: ClientListingComponent,
      },
      {
        path: "clients/:id",
        component: ClientDetailsComponent,
      },
      {
        path: "stocks",
        component: StockComponent,
      },
    ],
  },

  // otherwise redirect to 404 page
  // { path: '404', component: NotFoundComponent },
  { path: "500", component: ServerErrorComponent },
  { path: "**", component: LoginComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
