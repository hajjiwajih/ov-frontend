import { UserService } from "./../../services/user.service";
import { User } from "./../../models/user";
import { ActivatedRoute } from "@angular/router";
import { OrderService } from "./../../services/order.service";
import { DatePipe } from "@angular/common";
import { Subscription } from "rxjs";
import { Order } from "./../../models/order";
import { Component, OnInit } from "@angular/core";
declare var $: any;

@Component({
  selector: "app-client-details",
  templateUrl: "./client-details.component.html",
  styleUrls: ["./client-details.component.css"],
})
export class ClientDetailsComponent implements OnInit {
  validOrders: Order[];
  rejectedOrders: Order[];
  nonValidOrders: Order[];
  selectedOrder: Order;
  selectedUserForUpdate: Order;
  obs$: Subscription;

  mClient: User;

  isOrdersReady: boolean = false

  pipe = new DatePipe("fr-FR");

  clientId: string;

  title = "Non Validées";

  activatedLink: string;

  isValidated: boolean = false;

  isRejected: boolean = false;

  displayModal: boolean = false;

  constructor(
    private orderService: OrderService,
    private route: ActivatedRoute,
    private userService: UserService
  ) {
    this.selectedOrder = {
      orderAuto: "",
      nbCodes: 0,
      ticketAmount: 0,
      issueDate: "",
      comment: "",
    };
  }

  ngOnInit() {
    // scroll top of the screen
    window.scrollTo(0, 0);

    //   this.activatedLink = params.category;
    this.route.params.subscribe((params) => {
      this.clientId = params["id"];
      this.getClientInfo();

      // intialialize order history tables
      this.initClientOrders(true, false); // validated
      this.initClientOrders(false, false); // non validated
      this.initClientOrders(false, true); // rejected

    });
  }

  /**
   * Get customer info
   */
  getClientInfo() {
    this.userService.getUserById(this.clientId).subscribe((clientInfo) => {
      this.mClient = clientInfo;
    });
  }

  /**
   * Initialize order history component for the customer
   * @param valid
   * @param rejected
   */
  initClientOrders(valid, rejected) {
    this.obs$ = this.orderService
      .getClientOrders(this.clientId, valid, rejected)
      .subscribe((orders) => {
        if (valid) this.validOrders = orders;
        if (rejected) this.rejectedOrders = orders;
        if (!valid && !rejected) this.nonValidOrders = orders;
        // hide block loader
        setTimeout(() => {
          $(".block-loader").fadeOut(500);
          $(".sk-circle").fadeOut(500);
          this.isOrdersReady = true;
        }, 700);
        // setTimeout(() => {
        //   // Show orders
        // }, 900);
        if (valid) this.initDatatable("#validated-table");
        if (rejected) this.initDatatable("#rejected-table");
        if (!valid && !rejected) this.initDatatable("#non-validated-table");
      });
  }

  /**
   * Initialize datatable
   * @param idTable
   */
  initDatatable(idTable) {
    $(document).ready(function () {
      $.fn.dataTable.moment("D/M/YYYY HH:mm");
      $(idTable).DataTable({
        responsive: true,
        language: {
          emptyTable: "Aucune donnée disponible dans le tableau",
          info: "Affichage de _START_ à _END_ de _TOTAL_ donneés",
          infoEmpty: "Affichage de 0 à 0 de 0 donneés",
          infoFiltered: "(filtered from _MAX_ total entries)",
          lengthMenu: "Afficher _MENU_ commandes",
          loadingRecords: "Loading...",
          processing: "Processing...",
          search: "Recherche:",
          zeroRecords: "Aucune commande correspondante trouvée",
          paginate: {
            first: "First",
            last: "Last",
            next: "Suivant",
            previous: "Précédent",
          },
        },
      });
    });
  }

  ngOnDestroy() {
    this.obs$.unsubscribe();
  }

  /**
   * Open order dialog info
   * @param order
   */
  showDialog(order: Order) {
    this.selectedOrder = order;
    this.displayModal = true;
  }
}
