import { User } from 'src/app/models/user';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';
import { OrderService } from 'src/app/services/order.service';
import { environment } from 'src/environments/environment';
import Swal from "sweetalert2";
import { Component, Inject, OnInit, SecurityContext } from "@angular/core";
import { DomSanitizer, SafeValue} from '@angular/platform-browser';

@Component({
  selector: "admin-profile",
  templateUrl: "./admin-profile.component.html",
  styleUrls: ["./admin-profile.component.css"],
})

export class AdminProfileComponent implements OnInit {
  currentAdminEmail: string;
  companyName: string;
  currentAdminId: string;
  mAdmin: User;
  constructor(
    @Inject(DomSanitizer) private readonly sanitizer: DomSanitizer, 
    private userService: UserService, 
    private router: Router, 
    private orderService: OrderService) {}

  ngOnInit() {
    this.currentAdminEmail = localStorage.getItem("email");
    this.currentAdminId = localStorage.getItem("currentUserId");
    this.companyName = environment.companyName;

    // get admin info
    this.getAdminInfo();

    this.orderService.getLatestClientOrders(this.currentAdminId).subscribe(data => {
      console.log(data)
    })
  }

  /**
   * Fetch admin infos
   */
  getAdminInfo() {
    this.userService
      .getUserById(this.currentAdminId)
      .subscribe((clientInfo) => {
        this.mAdmin = clientInfo;
      });
  }

  navigate(route) {
    this.router.navigateByUrl(route);
  }


  sanitizeInputData(input) {
    return this.sanitizer.sanitize(SecurityContext.HTML, input) || '';
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

  editMail() {
    console.log(this.mAdmin);
    let status = false;
    Swal.queue([
      {
        title: `Tapez votre nouveau Email ?`,
        text: "Aprés modification vous devez verifier votre mail",
        input: "email",
        inputPlaceholder: "Nouvelle valeur",
        inputValue: this.mAdmin.email,
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
          if (change && change != this.mAdmin.email)  
          return new Promise<any>((resolve, reject) => {
              // sanitize input data
              let newEmail = this.sanitizeInputData(change)
              // submit safe data
              this.userService
                .requestEmailChange(this.mAdmin.email, newEmail)
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
        inputValue: this.mAdmin.phone + "",
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
              this.mAdmin.phone = change;
              this.userService
                .updateUser(this.mAdmin, this.mAdmin.id)
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