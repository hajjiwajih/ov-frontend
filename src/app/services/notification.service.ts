import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
/**
 * @service NotificationService capture socketIo events
 * update UI correspondingly
 */

@Injectable({
  providedIn: "root",
})
export class NotificationService {
  private notif: Subject<any> = new Subject<any>();
  private resetReq: Subject<any> = new Subject<any>();

  constructor() {}

  notifObs$ = this.notif.asObservable();
  resetObs$ = this.resetReq.asObservable();

  pushNotification(data: any) {
    this.notif.next(data);
  }

  clearNotification(data: any) {
    this.resetReq.next(data);
  }
}
