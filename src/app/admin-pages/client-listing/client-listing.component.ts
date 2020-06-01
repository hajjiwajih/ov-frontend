import { NotificationService } from "./../../services/notification.service";
import {
  appendDtActions,
  appendDtAdminBadges,
  appendDtAdminActions,
} from "src/app/helpers/datatable-fonctions";
import { OrderService } from "./../../services/order.service";
import { User } from "./../../models/user";
import { UserService } from "./../../services/user.service";
import { ActivatedRoute, Router } from "@angular/router";
import { Message } from "primeng/api/message";
import { DatePipe } from "@angular/common";
import { Subscription } from "rxjs";
import { Component, OnInit } from "@angular/core";
import Swal from "sweetalert2";
declare var $: any;

@Component({
  selector: "app-client-listing",
  templateUrl: "./client-listing.component.html",
  styleUrls: ["./client-listing.component.css"],
})
export class ClientListingComponent implements OnInit {
  clients: User[];
  modifiedClients: any[] = [];
  selectedUser: User;
  selectedUserForUpdate: User;

  obs$: Subscription;
  mappingObs$: Subscription;
  addedSub$: Subscription;

  pipe = new DatePipe("fr-FR");

  msgs: Message[] = [];

  title = "Non Validées";

  activatedLink: string;

  isValidated: boolean;

  isRejected: boolean;

  displayModal: boolean = false;

  constructor(
    private userService: UserService,
    private orderService: OrderService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.selectedUser = {};
  }

  ngOnInit() {
    // clear new notification
    this.notificationService.clearNotification({ type: "voucher" });

    //   this.activatedLink = params.category;
    this.obs$ = this.userService.getClients().subscribe((list) => {
      this.clients = list;
      console.log(this.clients);

      let ids = this.clients.map((user) => user.id);
      console.log(ids);
      this.mappingObs$ = this.orderService
        .getLastValidatedOrders(ids)
        .subscribe((mapping) => {
          // console.log(mapping);
          this.clients.forEach((client) => {
            let modified = Object.create(client);
            modified = client;
            let lastOrders = mapping.results.find(
              (item) => item.id == client.id
            );
            modified.lastValidatedOrder = lastOrders.order || null;
            console.log(modified);
            this.modifiedClients.push(modified);
          });
          // console.log(this.modifiedClients);
          // hide block loader
          setTimeout(() => {
            $(".block-loader").fadeOut(500);
            $(".sk-circle").fadeOut(500);
          }, 700);
          let _self = this;
          $(document).ready(function () {
            $.fn.dataTable.moment("D/M/YYYY HH:mm");
            var table = $("#clientTables").DataTable({
              responsive: true,
              language: {
                emptyTable: "Aucune donnée disponible dans le tableau",
                info: "Affichage de _START_ à _END_ de _TOTAL_ donneés",
                infoEmpty: "Affichage de 0 à 0 de 0 donneés",
                infoFiltered: "(filtered from _MAX_ total entries)",
                lengthMenu: "Afficher _MENU_ Clients",
                loadingRecords: "Loading...",
                processing: "Processing...",
                search: "Recherche:",
                zeroRecords: "Aucun client correspondant trouvé",
                paginate: {
                  first: "First",
                  last: "Last",
                  next: "Suivant",
                  previous: "Précédent",
                },
              },
              data: _self.modifiedClients,
              columns: [
                { data: "autoID" },
                { data: "username" },
                { data: "cin" },
                { data: "fname" },
                { data: "creationAt" },
                { data: "emailVerified" },
                { data: "lastValidatedOrder" },
                { defaultContent: "" },
              ],
              order: [[0, "desc"]],
              columnDefs: [
                {
                  targets: 3,
                  render: function (data, type, row) {
                    return data + " " + row.lname;
                  },
                },
                {
                  targets: 4,
                  render: function (data, type, row) {
                    return _self.pipe.transform(data, "short");
                  },
                },
                {
                  targets: 6,
                  render: function (data, type, row) {
                    if (data)
                      return _self.pipe.transform(data.validationDate, "short");
                    else return "-------------";
                  },
                },
              ],
              fnCreatedRow: function (nRow, aData, iDataIndex) {
                appendDtAdminActions(aData, nRow, {
                  valid: aData.emailVerified,
                  column: 7,
                });
                appendDtAdminBadges(aData, nRow, { column: 5 });
              },
            });
            // handle button click -> view dialog
            $("#clientTables tbody").on(
              "click",
              "tr .btn-outline-primary",
              function () {
                _self.openProfile(table.row($(this).parent().parent()).data());
              }
            );

            // handle button click -> validate client
            $("#clientTables tbody").on(
              "click",
              "tr .btn-outline-focus",
              function () {
                _self.validateAccount(
                  table.row($(this).parent().parent()).data()
                );
              }
            );

            // handle button click -> reject client
            $("#clientTables tbody").on(
              "click",
              "tr .btn-outline-danger",
              function () {
                _self.rejectAccount(
                  table.row($(this).parent().parent()).data()
                );
              }
            );
          });
        });
    });
    // subscribe to upcoming events
    this.subscribeToNewClients();
  }

  ngOnDestroy() {
    if (this.obs$) this.obs$.unsubscribe();
    if (this.mappingObs$) this.mappingObs$.unsubscribe();
  }

  refreshUsers() {
    this.obs$.unsubscribe();
    window.location.reload();
  }

  openProfile(client) {
    this.router.navigate(["monitor/clients", client.id]);
  }

  validateAccount(client: User) {
    let status = false;
    if (!client.emailVerified)
      Swal.queue([
        {
          title: "Voulez vous confirmer?",
          text: "La demande de votre client sera validée",
          icon: "warning",
          confirmButtonColor: "#3085d6",
          confirmButtonText: "Oui, procéder!",
          showLoaderOnConfirm: true,
          preConfirm: (ok) => {
            return new Promise<any>((resolve, reject) => {
              this.userService.verifyAccount(client.id).subscribe(
                (res) => {
                  console.log(res);
                  resolve(res);
                },
                (err) => {
                  delete err.error.error.stack;
                  reject(
                    new Error(
                      "Compte Client Non validée - Une erreur survenue!" +
                        JSON.stringify(err.error.error)
                    )
                  );
                }
              );
            })
              .then(
                (verif) => {
                  console.log(verif);
                  Swal.insertQueueStep({
                    title: "Terminé",
                    text: "Compte Client Validé avec succès",
                    icon: "success",
                  });
                  status = true;
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
      ]).then((result) => {
        console.log(result);
        if (status) {
          // this.router.navigateByUrl("monitor/validated");
          window.location.reload();
        }
      });
  }

  rejectAccount(client: User) {
    let status = false;
    if (!client.emailVerified)
      Swal.queue([
        {
          title: "Voulez vous confirmer?",
          text:
            "Cette demande d'un compte client sera rejetée, Veuillez commenter votre raison!",
          input: "text",
          inputPlaceholder: "Raison?",
          inputAttributes: {
            autocapitalize: "off",
          },
          inputValidator: (value) => {
            if (!value) {
              return "Vous devez spécifier la raison SVP!";
            }
          },
          showCancelButton: true,
          cancelButtonText: "Annuler",
          cancelButtonColor: "#d33",
          icon: "warning",
          confirmButtonColor: "#3085d6",
          confirmButtonText: "Oui, procéder!",
          showLoaderOnConfirm: true,
          preConfirm: (comment) => {
            return new Promise<any>((resolve, reject) => {
              this.orderService;
              this.userService.rejectAccount(client.id, comment).subscribe(
                (res) => {
                  console.log(res);
                  resolve(res);
                },
                (err) => {
                  reject(
                    new Error(
                      "Compte Client Non validée - Une erreur survenue!"
                    )
                  );
                }
              );
            })
              .then(
                (reject) => {
                  console.log(reject);
                  Swal.insertQueueStep({
                    title: "Terminé",
                    text: "Compte Client rejeté avec succès",
                    icon: "success",
                  });
                  status = true;
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
      ]).then((result) => {
        console.log(result);
        if (status) {
          window.location.reload();
        }
      });
  }

  subscribeToNewClients() {
    this.addedSub$ = this.userService.newClient.subscribe((voucher) => {
      console.log("new voucher", voucher);
      this.addRow(voucher);
    });
  }

  addRow(client: User) {
    // currently displaying validated orders
    const addedRow = $("#clientTables").DataTable().row.add(client).draw(false);
    const addedRowNode = addedRow.node();
    this.modifiedClients.push(client);
    $(addedRowNode).addClass("highlight");
    setTimeout(function () {
      $(addedRowNode).removeClass("highlight");
    }, 2000);
  }
}
