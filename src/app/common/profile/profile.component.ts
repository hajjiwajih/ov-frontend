import { Router } from "@angular/router";
import { UserService } from "./../../services/user.service";
import { User } from "./../../models/user";
import { Component, OnInit, Input } from "@angular/core";
import Swal from "sweetalert2";

@Component({
  selector: "app-profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.css"],
})
export class ProfileComponent implements OnInit {
  @Input() user: User;
  constructor(private userService: UserService, private router: Router) {}

  ngOnInit() {}

  /**
   * Edit profile infos (email & phone)
   * @param attr
   */
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
    let status = false;
    Swal.queue([
      {
        title: `Tapez votre nouveau Email ?`,
        text: "Aprés modification vous devez verifier votre mail",
        input: "email",
        inputPlaceholder: "Nouvelle valeur",
        inputValue: this.user.email,
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
          if (change && change != this.user.email)
            return new Promise<any>((resolve, reject) => {
              this.userService
                .requestEmailChange(this.user.email, change)
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

  logout() {
    this.userService.logout().subscribe((res) => {
      this.router.navigateByUrl("login");
    });
  }

  navigate(route) {
    this.router.navigateByUrl(route);
  }

  editPhone() {
    Swal.queue([
      {
        title: `Tapez votre nouveau Téléphone ?`,
        input: "number",
        inputPlaceholder: "Nouvelle valeur",
        inputValue: this.user.phone + "",
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
              this.user.phone = change;
              this.userService.updateUser(this.user, this.user.id).subscribe(
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
