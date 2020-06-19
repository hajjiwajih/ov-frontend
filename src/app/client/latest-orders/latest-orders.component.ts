import { numberWithSpaces } from "src/app/helpers/format-stocks";
import { NotificationService } from "./../../services/notification.service";
import { DatePipe } from "@angular/common";
import { ActivatedRoute } from "@angular/router";
import { OrderService } from "./../../services/order.service";
import { Message } from "primeng/api/message";
import { MessageService } from "primeng/api";
import { Subscription } from "rxjs";
import { Order } from "./../../models/order";
import { Component, OnInit } from "@angular/core";
import { saveAs } from "file-saver";
import {
  appendDtBadges,
  appendDtActions,
} from "src/app/helpers/datatable-fonctions";
declare var $: any;

@Component({
  selector: "app-latest-orders",
  providers: [MessageService],
  templateUrl: "./latest-orders.component.html",
  styleUrls: ["./latest-orders.component.css"],
})
export class LatestOrdersComponent implements OnInit {
  orders: Order[];
  selectedOrder: Order;
  selectedUserForUpdate: Order;
  obs$: Subscription;

  currentDate: Date;

  validationSub$: Subscription;
  rejectionSub$: Subscription;

  pipe = new DatePipe("fr-FR");

  msgs: Message[] = [];

  title = "Non Validées";

  orderivatedLink: string;

  isValidated: boolean;

  isRejected: boolean;

  displayModal: boolean = false;

  // availbale stock details
  stats = [0, 0, 0];
  countings = [0, 0, 0];
  percents = [0, 0, 0];
  loaders = [false, false, false];

  constructor(
    private messageService: MessageService,
    private notificationService: NotificationService,
    private orderService: OrderService,
    private route: ActivatedRoute
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
    //   this.orderivatedLink = params.category;
    let id = localStorage.getItem("currentUserId");

    this.currentDate = new Date();

    this.loaders = [true, true, true];

    let _self = this;
    this.obs$ = this.orderService
      .getLatestClientOrders(id)
      .subscribe((orders) => {
        this.orders = orders;
        console.log(orders, orders.length);

        // this.showStats();

        this.orders.map((item) => {
          item.validationDate = item.validationDate || "";
          return item;
        });

        // hide block loader
        setTimeout(() => {
          $(".block-loader").fadeOut(500);
          $(".sk-circle").fadeOut(500);
        }, 700);

        // intialize datatable
        $(document).ready(function () {
          $.fn.dataTable.moment("D/M/YYYY HH:mm");
          let table = $("#orderTables").DataTable({
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
            data: _self.orders,
            columns: [
              { data: "orderAuto" },
              { data: "nbCodes" },
              { data: "ticketAmount" },
              { data: "ticketAmount" },
              { data: "issueDate" },
              { data: "validated" },
              { data: "validationDate" },
              { defaultContent: "" },
            ],
            order: [[0, "desc"]],
            columnDefs: [
              {
                targets: 2,
                render: function (data, type, row) {
                  return data / 1000 + " DT";
                },
              },
              {
                targets: 3,
                render: function (data, type, row) {
                  return (data * row.nbCodes) / 1000 + " DT";
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
                  if (row.validated || row.isRejected)
                    return _self.pipe.transform(data, "short");
                  else return "--------------";
                },
              },
              {
                targets: 5,
                render: function (data, type, row) {
                  return data;
                },
              },
            ],
            fnCreatedRow: function (nRow, aData, iDataIndex) {
              appendDtActions(aData, nRow, true, {
                valid: false,
                column: 7,
              });
              appendDtBadges(aData, nRow, {
                column: 5,
              });
            },
          });
          // handle button click -> view dialog
          $("#orderTables tbody").on(
            "click",
            "tr .btn-outline-primary",
            function () {
              _self.showDialog(table.row($(this).parent().parent()).data());
            }
          );
        });
      });

    // subscribe to incoming events
    this.subscribeToValidatedOrders();
    this.subscribeToRejectedOrders();
  }

  refreshOrders() {}

  ngOnDestroy() {
    this.obs$.unsubscribe();
    if (this.validationSub$) this.validationSub$.unsubscribe();
    if (this.rejectionSub$) this.rejectionSub$.unsubscribe();
  }

  subscribeToValidatedOrders() {
    this.validationSub$ = this.orderService.validatedOrder.subscribe(
      (order) => {
        // currently displaying validated orders
        this.updateRow(order);
        console.log("validated", order);
      }
    );
  }

  subscribeToRejectedOrders() {
    this.rejectionSub$ = this.orderService.rejectedOrder.subscribe((order) => {
      this.updateRow(order);

      console.log("rejected", order);
    });
  }

  /**
   * Update row in datatable list
   * @param order
   */
  updateRow(order: Order) {
    // find & replace
    // only displayed orders (visible & not visible)
    // consistent visible updates
    let displayedOrders = $("#orderTables")
      .DataTable()
      .rows({ search: "applied", order: "applied" })
      .data()
      .toArray();
    let index = displayedOrders.findIndex(
      (item) => order.idOrder == item.idOrder
    );
    // let index = this.orders.findIndex(item => order.id == item.id);
    let idx = this.orders.findIndex((item) => order.idOrder == item.idOrder);
    this.orders[idx] = order;

    if (index >= 0) {
      // this.orders = [];
      var info = $("#orderTables").DataTable().page.info();
      var pageLength = $("#orderTables").DataTable().page.len();

      if (info.page == Math.trunc(index / pageLength)) {
        // if within the same page
        var row = $(
          "#orderTables tbody tr:eq(" +
            (index % $("#orderTables").DataTable().page.len()) +
            ")"
        );

        $("#orderTables").DataTable().row(row).data(order).draw(false);
        appendDtActions(order, row, true, {
          valid: false,
          column: 7,
        }); // sent to enable unlock holded orders
        appendDtBadges(order, row, { column: 5 }); // sent to enable unlock holded orders
      } // else refresh table
      else {
        $("#orderTables").DataTable().clear();

        $("#orderTables").DataTable().rows.add(this.orders).draw();
      }
    } else {
      // else refresh table
      $("#orderTables").DataTable().clear();

      $("#orderTables").DataTable().rows.add(this.orders).draw();
    }
  }

  deleteRow(order: Order) {
    let displayedOrders = $("#orderTables")
      .DataTable()
      .rows({ search: "applied", order: "applied" })
      .data()
      .toArray();
    let index = displayedOrders.findIndex(
      (item) => order.orderAuto == item.orderAuto
    );
    let target = this.findRow(index);
    this.orders = this.orders.filter(
      (item) => item.orderAuto != order.orderAuto
    );
    $(target).addClass("highlight-delete");
    setTimeout(function () {
      $(target).removeClass("highlight-delete");
      $("#orderTables")
        .DataTable()
        .rows({ search: "applied", order: "applied" })
        .row(target)
        .remove()
        .draw(false);
    }, 2000);
  }

  findRow(index) {
    var info = $("#orderTables").DataTable().page.info();
    var pageLength = $("#orderTables").DataTable().page.len();

    if (info.page == Math.trunc(index / pageLength)) {
      // if within the same page
      var row = $(
        "#orderTables tbody tr:eq(" +
          (index % $("#orderTables").DataTable().page.len()) +
          ")"
      );
      return row;
    }
    return null;
  }

  showDialog(order: Order) {
    this.selectedOrder = order;
    this.displayModal = true;
  }

  /**
   * Has been moved to another component for many uses
   */
  // showStats() {
  //   // filter by status
  //   let validatedOrders = this.orders.filter(
  //     (order) => order.validated == true
  //   );
  //   let nonValidatedOrders = this.orders.filter(
  //     (order) => order.validated == false && order.isRejected == false
  //   );
  //   let rejectedOrders = this.orders.filter(
  //     (order) => order.isRejected == true
  //   );

  //   this.countings = [
  //     validatedOrders.length,
  //     rejectedOrders.length,
  //     nonValidatedOrders.length,
  //   ];
  //   // sum by ticket amount
  //   validatedOrders.forEach((order) => {
  //     this.stats[0] += order.nbCodes * order.ticketAmount;
  //   });
  //   this.stats[0] /= 1000;
  //   this.stats[0] = numberWithSpaces(this.stats[0]);
  //   rejectedOrders.forEach((order) => {
  //     this.stats[1] += order.nbCodes * order.ticketAmount;
  //   });
  //   this.stats[1] /= 1000;
  //   this.stats[1] = numberWithSpaces(this.stats[1]);
  //   nonValidatedOrders.forEach((order) => {
  //     this.stats[2] += order.nbCodes * order.ticketAmount;
  //   });
  //   this.stats[2] /= 1000;
  //   this.stats[2] = numberWithSpaces(this.stats[2]);
  //   // percents
  //   this.percents[0] = Math.round(
  //     (validatedOrders.length / (this.orders.length || 1)) * 100
  //   );
  //   this.percents[1] = Math.round(
  //     (rejectedOrders.length / (this.orders.length || 1)) * 100
  //   );
  //   this.percents[2] = Math.round(
  //     (nonValidatedOrders.length / (this.orders.length || 1)) * 100
  //   );
  //   // update loaders -> set back to default
  //   this.loaders = [false, false, false];
  // }
}
