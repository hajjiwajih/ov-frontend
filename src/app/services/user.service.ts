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

  triggerEvent(event: string, client?: User) {
    switch (event) {
      case "newClient":
        this.socket.emit("newClient", client);
        break;
    }
  }

  getUsers() {
    return this.client.get<User[]>(this.apiUrl);
  }

  getClients() {
    return this.client.get<User[]>(
      `${this.apiUrl}?filter={"where":{"role":"client"}}`
    );
  }

  getUserById(id) {
    const httpOptions = {
      headers: new HttpHeaders({
        "No-Auth": "True",
      }),
    };
    return this.client.get<User>(this.apiUrl + "/" + id);
  }

  deleteUser(idUser: string) {
    return this.client.delete(this.apiUrl + "/" + idUser);
  }

  addUser(user: User) {
    const headers = new Headers({ "Content-Type": "application/json" });

    return this.client.post<User>(this.apiUrl, user);
  }

  verifyAccount(clientId: string) {
    const headers = new Headers({ "Content-Type": "application/json" });

    return this.client.post<string>(this.apiUrl + "/verify-account", {
      uid: clientId,
    });
  }

  rejectAccount(clientId: string, msg: string) {
    const headers = new Headers({ "Content-Type": "application/json" });

    return this.client.post<string>(this.apiUrl + "/reject-account", {
      uid: clientId,
      desc: msg,
    });
  }

  updateUser(user: User, id: string) {
    const headers = new Headers({ "Content-Type": "application/json" });

    return this.client.patch(this.apiUrl + `/${id}`, user);
  }

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

  requestEmailChange(email: string, change: string) {
    return this.client.post<any>(this.apiUrl + "/request-email-change", {
      userId: localStorage.getItem("currentUserId"),
      oldEmail: email,
      newEmail: change,
    });
  }

  resetPassword(password: string, passwordConfirm: string) {
    let headers: HttpHeaders = new HttpHeaders();

    return this.client.post<any>(this.apiUrl + "/reset-password", {
      newPassword: password,
      confirmation: passwordConfirm,
    });
  }

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

  unvalidateTokens(id: string) {
    // const headers = new Headers({ "Content-Type": "application/json" });
    this.clearSession();
    return this.client
      .delete(this.apiUrl + "/" + id + "/accessTokens")
      .subscribe();
  }

  //
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

  getLocation(): LatLng {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        return { lat: latitude, lng: longitude };
      });
    } else {
      console.log("No support for geolocation");
      return null;
    }
  }

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
