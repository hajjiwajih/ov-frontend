import { Component, Inject, OnInit, SecurityContext } from "@angular/core";
import { DomSanitizer, SafeValue} from '@angular/platform-browser';
import { environment } from "./../../../environments/environment";
import { User } from "./../../models/user";
import { Order } from "./../../models/order";
import { UserService } from "./../../services/user.service";
import { OrderService } from "./../../services/order.service";
import { Subscription } from "rxjs";
import Swal from "sweetalert2";
import { Router } from "@angular/router";

@Component({
  selector: "client-profile",
  templateUrl: "./client-profile.component.html",
  styleUrls: ["./client-profile.component.css"],
})
export class ClientProfileComponent implements OnInit {
  validOrders: Order[];
  rejectedOrders: Order[];
  nonValidOrders: Order[];
  obs$: Subscription;

  mClient: User;
  clientId: string;
  currentAgentEmail: string;
  companyName: string;
  constructor(
    @Inject(DomSanitizer) private readonly sanitizer: DomSanitizer, 
    private userService: UserService,
    private router: Router,
    private orderService: OrderService
  ) {}

  ngOnInit() {
    this.clientId = localStorage.getItem("currentUserId");
    this.currentAgentEmail = localStorage.getItem("email");
    this.companyName = environment.companyName;

    // get client info
    this.getClientInfo();

    // intialialize order history tables
    this.initClientOrders(true, false); // validated
    this.initClientOrders(false, false); // non validated
    this.initClientOrders(false, true); // rejected
  }

  initClientOrders(valid, rejected) {
    this.obs$ = this.orderService
      .getClientOrders(this.clientId, valid, rejected)
      .subscribe((orders) => {
        if (valid) this.validOrders = orders;
        if (rejected) this.rejectedOrders = orders;
        if (!valid && !rejected) this.nonValidOrders = orders;
      });
  }

  editInfo(attr) {
    switch (attr) {
      case "email":
        this.editMail();
        break;
      case "Téléphone":
        this.editPhone();
        break;
    }
  }

  getClientInfo() {
    this.userService.getUserById(this.clientId).subscribe((clientInfo) => {
      this.mClient = clientInfo;
      console.log(this.mClient);
    });
  }

  navigate(route) {
    this.router.navigateByUrl(route);
  }

  sanitizeInputData(input) {
    return this.sanitizer.sanitize(SecurityContext.HTML, input) || '';
  }


  editMail() {
    console.log(this.mClient);
    let status = false;
    Swal.queue([
      {
        title: `Tapez votre nouveau Email ?`,
        text: "Aprés modification vous devez verifier votre mail",
        input: "email",
        inputPlaceholder: "Nouvelle valeur",
        inputValue: this.mClient.email,
        inputAttributes: {
          autocapitalize: "off",
        },
        showCancelButton: true,
        cancelButtonText: "Annuler",
        cancelButtonColor: "#d33",
        icon: "warning",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Oui, procéder!",
        showLoaderOnConfirm: true,
        preConfirm: (change) => {
          if (change && change != this.mClient.email)
            return new Promise<any>((resolve, reject) => {
              // sanitize input data
              let newEmail = this.sanitizeInputData(change)
              // submit safe data
              this.userService
                .requestEmailChange(this.mClient.email, newEmail)
                .subscribe(
                  (updatedUser) => {
                    console.log(updatedUser);
                    resolve(updatedUser);
                  },
                  (err) => {
                    if (err.error.error.code == 422)
                      reject(
                        new Error(
                          "Modification non enregistrée - Email existe déja!"
                        )
                      );
                    else
                      reject(
                        new Error(
                          "Modification non enregistrée - Service non disponible"
                        )
                      );
                  }
                );
            })
              .then(
                (updated) => {
                  console.log(updated);
                  if (!updated) {
                    throw new Error(
                      "Operation non terminée - Rollback Operation"
                    );
                  } else {
                    Swal.insertQueueStep({
                      title: "Terminé",
                      text: "Modification enregistrée avec succès",
                      icon: "success",
                    });
                    status = true;
                  }
                },
                (error) => {
                  console.log(error);
                  Swal.insertQueueStep({
                    title: "Echec",
                    text: error,
                    icon: "error",
                  });
                }
              )
              .catch((error) => {
                Swal.insertQueueStep({
                  title: "Echec",
                  text: error,
                  icon: "error",
                });
              });
          else return false;
        },
        allowOutsideClick: () => !Swal.isLoading(),
      },
    ]).then((result) => {
      if (status) {
        this.userService.logout().subscribe((res) => {
          window.location.reload();
        });
      }
    });
  }

  editPhone() {
    Swal.queue([
      {
        title: `Tapez votre nouveau Téléphone ?`,
        input: "number",
        inputPlaceholder: "Nouvelle valeur",
        inputValue: this.mClient.phone + "",
        inputAttributes: {
          autocapitalize: "off",
        },
        showCancelButton: true,
        cancelButtonText: "Annuler",
        cancelButtonColor: "#d33",
        icon: "warning",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Oui, procéder!",
        showLoaderOnConfirm: true,
        inputValidator: (value) => {
          if (!value) {
            return "Vous devez spécifier la raison SVP!";
          } else if (value.length != 8) {
            return "Vous devez spécifier le téléphone correctement!";
          }
        },
        preConfirm: (change) => {
          if (change)
            return new Promise<any>((resolve, reject) => {
              this.mClient.phone = change;
              this.userService
                .updateUser(this.mClient, this.mClient.id)
                .subscribe(
                  (updatedUser) => {
                    console.log(updatedUser);
                    resolve(updatedUser);
                  },
                  (err) => {
                    reject(
                      new Error(
                        "Modification non enregistrée - Service non-disponible"
                      )
                    );
                  }
                );
            })
              .then(
                (updated) => {
                  console.log(updated);
                  if (!updated) {
                    throw new Error(
                      "Operation non terminée - Rollback Operation"
                    );
                  } else {
                    Swal.insertQueueStep({
                      title: "Terminé",
                      text: "Modification enregistrée avec succès",
                      icon: "success",
                    });
                  }
                },
                (error) => {
                  console.log(error);
                  Swal.insertQueueStep({
                    title: "Echec",
                    text: error,
                    icon: "error",
                  });
                }
              )
              .catch((error) => {
                Swal.insertQueueStep({
                  title: "Echec",
                  text: error,
                  icon: "error",
                });
              });
        },
        allowOutsideClick: () => !Swal.isLoading(),
      },
    ]).then((result) => {});
  }
}
