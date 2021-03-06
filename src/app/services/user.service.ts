import { environment } from "./../../environments/environment";
import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { LoginToken } from "./../models/loginToken";
import { User } from "./../models/user";
import { Observable } from "rxjs";
import { Router } from "@angular/router";
import { LatLng } from "@agm/core";
import { Socket } from "ngx-socket-io";

@Injectable({
  providedIn: "root",
})
export class UserService {
  private apiUrl = environment.api_url_users;
  private serverUrl = environment.api_url;

  newClient: Observable<User>;
  constructor(private client: HttpClient, private socket: Socket) {
    this.newClient = this.socket.fromEvent<User>("client/new");
  }

  /**
   * Emit socket.io event on new action
   * @param event
   * @param client
   */
  triggerEvent(event: string, client?: User) {
    switch (event) {
      case "newClient":
        this.socket.emit("newClient", client);
        break;
    }
  }

  /**
   * Fetch all users
   */
  getUsers() {
    return this.client.get<User[]>(this.apiUrl);
  }

  /**
   * Fetch all customers
   */
  getClients() {
    return this.client.get<User[]>(
      `${this.apiUrl}?filter={"where":{"role":"client"}}`
    );
  }

  /**
   * Fetch user by ID
   * @param id
   */
  getUserById(id) {
    const httpOptions = {
      headers: new HttpHeaders({
        "No-Auth": "True",
      }),
    };
    return this.client.get<User>(this.apiUrl + "/" + id);
  }

  /**
   * Delete user by ID
   * @param idUser
   */
  deleteUser(idUser: string) {
    return this.client.delete(this.apiUrl + "/" + idUser);
  }

  /**
   * Add new user
   * @param user
   */
  addUser(user: User) {
    const headers = new Headers({ "Content-Type": "application/json" });

    return this.client.post<User>(this.apiUrl, user);
  }

  /**
   * Verify new customer account
   * @param clientId
   */
  verifyAccount(clientId: string) {
    const headers = new Headers({ "Content-Type": "application/json" });

    return this.client.post<string>(this.apiUrl + "/verify-account", {
      uid: clientId,
    });
  }

  /**
   * Reject new customer subscription
   * @param clientId
   * @param msg
   */
  rejectAccount(clientId: string, msg: string) {
    const headers = new Headers({ "Content-Type": "application/json" });

    return this.client.post<string>(this.apiUrl + "/reject-account", {
      uid: clientId,
      desc: msg,
    });
  }

  /**
   * Update user by ID
   * @param user
   * @param id
   */
  updateUser(user: User, id: string) {
    const headers = new Headers({ "Content-Type": "application/json" });

    return this.client.patch(this.apiUrl + `/${id}`, user);
  }

  /**
   * Request user reqet password mail
   * @param email
   */
  requestResetPassword(email: string) {
    let headers: HttpHeaders = new HttpHeaders();
    headers.append("No-Auth", "True");
    this.clearSession();
    return this.client.post<any>(
      this.apiUrl + "/request-password-reset",
      {
        email: email,
      },
      {
        headers,
      }
    );
  }

  /**
   * Request user mail change
   * @param email
   * @param change
   */
  requestEmailChange(email: string, change: string) {
    return this.client.post<any>(this.apiUrl + "/request-email-change", {
      userId: localStorage.getItem("currentUserId"),
      oldEmail: email,
      newEmail: change,
    });
  }

  /**
   * Reset user password
   * @param password
   * @param passwordConfirm
   */
  resetPassword(password: string, passwordConfirm: string) {
    let headers: HttpHeaders = new HttpHeaders();

    return this.client.post<any>(this.apiUrl + "/reset-password", {
      newPassword: password,
      confirmation: passwordConfirm,
    });
  }

  /**
   * Change user password
   * @param oldPwd
   * @param newPwd
   */
  changePassword(oldPwd: string, newPwd: string) {
    // const headers = new Headers({ "Content-Type": "application/json" });
    let token = localStorage.getItem("token");

    return this.client.post(
      this.apiUrl + "/change-password?access_token=" + token,
      {
        oldPassword: oldPwd,
        newPassword: newPwd,
      }
    );
  }

  /**
   * Login only customer
   * @param user
   */
  login(user: User) {
    let headers: HttpHeaders = new HttpHeaders();
    // const headers = new Headers({ 'Content-Type': 'application/json' });
    // head.append('Access-Control-Allow-Headers', 'Content-Type');
    // head.append('Access-Control-Allow-Methods', 'POST');
    // head.append('Access-Control-Allow-Origin', '*');

    headers.append("No-Auth", "True");

    // change life time sessionToken
    let creds = {
      username: user.username,
      password: user.password,
    };
    return this.client.post<LoginToken>(this.apiUrl + "/login", creds, {
      headers,
    });
  }

  /**
   * login only Admin
   * @param user
   */
  loginAdmin(user: User) {
    let headers: HttpHeaders = new HttpHeaders();
    // const headers = new Headers({ 'Content-Type': 'application/json' });
    // head.append('Access-Control-Allow-Headers', 'Content-Type');
    // head.append('Access-Control-Allow-Methods', 'POST');
    // head.append('Access-Control-Allow-Origin', '*');

    headers.append("No-Auth", "True");

    // change life time sessionToken
    let creds = {
      email: user.email,
      password: user.password,
    };
    return this.client.post<LoginToken>(this.apiUrl + "/login", creds, {
      headers,
    });
  }

  /**
   * Logout action
   */
  logout() {
    // const headers = new Headers({ "Content-Type": "application/json" });
    let token = localStorage.getItem("token");
    this.clearSession();
    // const link = ["login"];
    // this.router.navigate(link);

    return this.client.post(
      this.apiUrl + "/logout?access_token=" + token,
      null
    );
  }

  /**
   * delete all tokens related to one user
   * @param id
   */
  unvalidateTokens(id: string) {
    // const headers = new Headers({ "Content-Type": "application/json" });
    this.clearSession();
    return this.client
      .delete(this.apiUrl + "/" + id + "/accessTokens")
      .subscribe();
  }

  /**
   * Signup new customer
   * @param user
   */
  signup(user: User): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers.append("No-Auth", "True");

    return this.client.post<User>(this.apiUrl, user, {
      headers,
    });
  }

  isLogged() {
    if (localStorage.getItem("token")) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Match only allowed roles to access pages
   * @param allowedRoles
   */
  roleMatch(allowedRoles): boolean {
    var isMatch = false;
    var userRoles: string = localStorage.getItem("role");
    allowedRoles.forEach((element) => {
      if (userRoles === element) {
        isMatch = true;
        return false;
      }
    });
    return isMatch;
  }

  clearSession() {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUserId");
    localStorage.removeItem("currentUserRef");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    localStorage.removeItem("login");
    localStorage.removeItem("uid");
  }
}
