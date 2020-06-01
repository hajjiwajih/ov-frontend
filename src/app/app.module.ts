import { environment } from "./../environments/environment";
import { ServerErrorComponent } from "./server-error/server-error.component";
import { PageNotFoundComponent } from "./page-not-found/page-not-found.component";
import { AuthInterceptor } from "./services/auth-interceptor";
import { UserService } from "./services/user.service";
import { AuthGuard } from "./services/auth-guard";
import { BrowserModule } from "@angular/platform-browser";
import { NgModule, LOCALE_ID } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { AppComponent } from "./app.component";
import { LoginComponent } from "./main-dashboard/login/login.component";
import { AppRoutingModule } from "./app-routing.module";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { LogoutGuard } from "./services/logout-guard";
import { FormsModule } from "@angular/forms";

import { MessagesModule } from "primeng/messages";
import { MessageModule } from "primeng/message";
import { ToastModule } from "primeng/toast";

import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { LoginAdminComponent } from "./admin-pages/login-admin/login-admin.component";
import { ForgotPasswordComponent } from "./main-dashboard/forgot-password/forgot-password.component";
import { DashboardComponent } from "./main-dashboard/dashboard/dashboard.component";
import { AdminComponent } from "./admin-pages/admin/admin.component";

import { registerLocaleData } from "@angular/common";
import localeFr from "@angular/common/locales/fr";
import localeFrExtra from "@angular/common/locales/extra/fr";
import { SignupComponent } from "./main-dashboard/signup/signup.component";
import { PlaceOrderComponent } from "./client/place-order/place-order.component";
import { ClientOrdersComponent } from "./client/client-orders/client-orders.component";
import { ConfirmationComponent } from "./client/confirmation/confirmation.component";
import { OrdersComponent } from "./orders/orders.component";
import { VerifyComponent } from "./main-dashboard/verify/verify.component";
import { AddAdminComponent } from "./admin-pages/add-admin/add-admin.component";
import { ResetPasswordComponent } from "./main-dashboard/reset-password/reset-password.component";
import { DialogModule } from "primeng/dialog";
import { ClientListingComponent } from "./admin-pages/client-listing/client-listing.component";
import { ClientDetailsComponent } from "./admin-pages/client-details/client-details.component";
import { ProfileComponent } from "./common/profile/profile.component";
import { StockComponent } from "./admin-pages/stock/stock.component";
import { ChangePasswordComponent } from "./main-dashboard/change-password/change-password.component";
import { SocketIoModule, SocketIoConfig } from "ngx-socket-io";
import { LatestOrdersComponent } from './client/latest-orders/latest-orders.component';
import { PasswordExpiryComponent } from './main-dashboard/password-expiry/password-expiry.component';

// fr local binding
registerLocaleData(localeFr, "fr-FR", localeFrExtra);

// socket server binding
const config: SocketIoConfig = {
  url: environment.socketIO_endpoint,
  options: {},
};

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    LoginAdminComponent,
    ForgotPasswordComponent,
    DashboardComponent,
    AdminComponent,
    PageNotFoundComponent,
    ServerErrorComponent,
    SignupComponent,
    PlaceOrderComponent,
    ClientOrdersComponent,
    ConfirmationComponent,
    OrdersComponent,
    VerifyComponent,
    AddAdminComponent,
    ResetPasswordComponent,
    ClientListingComponent,
    ClientDetailsComponent,
    ProfileComponent,
    StockComponent,
    ChangePasswordComponent,
    LatestOrdersComponent,
    PasswordExpiryComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
    MessagesModule,
    ToastModule,
    MessageModule,
    DialogModule,
    BrowserAnimationsModule,
    SocketIoModule.forRoot(config),
  ],
  providers: [
    { provide: LOCALE_ID, useValue: "fr-FR" },
    AuthGuard,
    LogoutGuard,
    UserService,
    AuthInterceptor,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
