import { OrderService } from "./../../services/order.service";
import { User } from "./../../models/user";
import { UserService } from "./../../services/user.service";
import { ActivatedRoute, Router } from "@angular/router";
import { Message } from "primeng/api/message";
import { DatePipe } from "@angular/common";
import { Subscription } from "rxjs";
import { Component, OnInit } from "@angular/core";
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
    private router: Router
  ) {
    this.selectedUser = {};
  }
  ngOnInit() {
    //   this.activatedLink = params.category;

    this.obs$ = this.userService.getClients().subscribe((list) => {
      this.clients = list;
      console.log(this.clients);

      let ids = this.clients.map((user) => user.id);
      console.log(ids);
      this.mappingObs$ = this.orderService
        .getLastValidatedOrders(ids)
        .subscribe((mapping) => {
          console.log(mapping);
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
          console.log(this.modifiedClients);
          // hide block loader
          setTimeout(() => {
            $(".block-loader").fadeOut(500);
            $(".sk-circle").fadeOut(500);
          }, 700);

          $(document).ready(function () {
            $("#clientTables").DataTable({
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
            });
          });
        });
    });
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
}
