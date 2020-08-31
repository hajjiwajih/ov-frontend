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
import { appendDtActions } from "src/app/helpers/datatable-fonctions";

declare var $: any;

@Component({
  selector: "app-client-orders",
  providers: [MessageService],
  templateUrl: "./client-orders.component.html",
  styleUrls: ["./client-orders.component.css"],
})
export class ClientOrdersComponent implements OnInit {
  orders: Order[];
  selectedOrder: Order;
  selectedUserForUpdate: Order;
  obs$: Subscription;

  validationSub$: Subscription;
  rejectionSub$: Subscription;

  pipe = new DatePipe("fr-FR");

  msgs: Message[] = [];

  title = "Non Validées";

  activatedLink: string;

  isValidated: boolean;

  isRejected: boolean;

  displayModal: boolean = false;
  displayPrintModal: boolean = false;

  downloading: boolean = false;

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
    //   this.activatedLink = params.category;
    let id = localStorage.getItem("currentUserId");
    this.route.data.subscribe((data) => {
      this.isValidated = data["valid"];
      this.isRejected = data["rejected"];
      if (data["valid"]) this.title = "Validées";
      if (data["rejected"]) this.title = "Rejetées";

      let _self = this;
      this.obs$ = this.orderService
        .getClientOrders(id, this.isValidated, this.isRejected)
        .subscribe((orders) => {
          this.orders = orders;
          console.log(orders);

          this.orders.map((item) => {
            item.validationDate = item.validationDate || "";
            return item;
          });

          // hide block loader
          setTimeout(() => {
            $(".block-loader").fadeOut(500);
            $(".sk-circle").fadeOut(500);
          }, 700);

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
                { data: "validationDate" },
                { data: "validationDate" },
                { defaultContent: "" },
              ],
              order: [[0, "desc"]],
              columnDefs: [
                { responsivePriority: 2, targets: -1 },
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
                  visible: _self.isValidated && !_self.isRejected,
                  targets: 5,
                  render: function (data, type, row) {
                    return _self.pipe.transform(data, "short");
                  },
                },
                {
                  visible: !_self.isValidated && _self.isRejected,
                  targets: 6,
                  render: function (data, type, row) {
                    return _self.pipe.transform(data, "short");
                  },
                },
              ],
              fnCreatedRow: function (nRow, aData, iDataIndex) {
                appendDtActions(aData, nRow, true, {
                  valid: _self.isValidated,
                  column: _self.isValidated || _self.isRejected ? 6 : 5,
                });
              },
              footerCallback: function (row, data, start, end, display) {
                // sumup the totals
                var api = this.api(),
                  data;

                // Remove the formatting to get integer data for summation
                var intVal = function (i) {
                  return typeof i === "string"
                    ? parseInt(i.replace(/[\$,]/g, "")) * 1
                    : typeof i === "number"
                    ? i
                    : 0;
                };

                // Total over all pages
                let sumCol = [];
                let nbCodeCol = api.column(1).data().toArray();
                let amountCol = api.column(2).data().toArray();
                nbCodeCol.forEach((element, index) => {
                  sumCol.push(element * amountCol[index]);
                });
                var total = sumCol.reduce(function (a, b) {
                  return intVal(a) + intVal(b);
                }, 0);

                // Total over this page
                sumCol = [];
                nbCodeCol = api.column(1, { page: "current" }).data().toArray();
                amountCol = api.column(2, { page: "current" }).data().toArray();
                nbCodeCol.forEach((element, index) => {
                  sumCol.push(element * amountCol[index]);
                });

                var pageTotal = sumCol.reduce(function (a, b) {
                  return intVal(a) + intVal(b);
                }, 0);

                // Update footer
                $("#sum").html(
                  numberWithSpaces(pageTotal / 1000) +
                    " TND ( " +
                    numberWithSpaces(total / 1000) +
                    " TND total)"
                );
              },
            });
            // handle button click -> download csv
            $("#orderTables tbody").on(
              "click",
              "tr .btn-outline-focus",
              function () {
                _self.downloadCSV(table.row($(this).parent().parent()).data());
              }
            );

            // handle button click -> download csv
            $("#orderTables tbody").on(
              "click",
              "tr .btn-outline-success",
              function () {
                _self.choosePrintableFormat(
                  table.row($(this).parent().parent()).data()
                );
              }
            );

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
    });

    // subscribe to incoming events
    this.subscribeToValidatedOrders();
    this.subscribeToRejectedOrders();

    // reset notification
    if (this.isValidated)
      this.notificationService.clearNotification({
        valid: true,
        reject: false,
      });

    if (this.isRejected)
      this.notificationService.clearNotification({
        valid: false,
        reject: true,
      });
  }

  ngOnDestroy() {
    this.obs$.unsubscribe();
    if (this.validationSub$) this.validationSub$.unsubscribe();
    if (this.rejectionSub$) this.rejectionSub$.unsubscribe();
  }

  /**
   * Subscribe to newly confirmed orders
   */
  subscribeToValidatedOrders() {
    this.validationSub$ = this.orderService.validatedOrder.subscribe(
      (order) => {
        if (this.isValidated) {
          // currently displaying validated orders
          this.addRow(order);
        } else if (!this.isRejected) {
          this.deleteRow(order);
        }
        console.log("validated", order);
      }
    );
  }

  /**
   * Subscribe to newly rejected orders
   */
  subscribeToRejectedOrders() {
    this.rejectionSub$ = this.orderService.rejectedOrder.subscribe((order) => {
      if (this.isRejected) {
        this.addRow(order);
      } else if (!this.isRejected) {
        this.deleteRow(order);
      }

      console.log("rejected", order);
    });
  }

  /**
   * Add new row on top of the list
   * @param order
   */
  addRow(order: Order) {
    // currently displaying validated orders
    const addedRow = $("#orderTables").DataTable().row.add(order).draw(false);
    const addedRowNode = addedRow.node();
    this.orders.push(order);
    $(addedRowNode).addClass("highlight");
    setTimeout(function () {
      $(addedRowNode).removeClass("highlight");
    }, 2000);
  }

  /**
   * delete row from datatable list
   * @param order
   */
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

  /**
   * find row with specific index
   * @param index
   */
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

  /**
   * Download tickets in CSV format
   * @param order
   */
  downloadCSV(order: Order) {
    this.orderService.getOrderTickets(order.idOrder).subscribe((tickets) => {
      console.log(tickets);
      var csv;
      var json = JSON.parse(JSON.stringify(tickets));
      var fields = Object.keys(json[0]);
      fields = fields.filter(
        (item) =>
          !item.includes("issueDate") &&
          !item.includes("agent") &&
          !item.includes("orderId") &&
          !item.includes("ID") &&
          !item.includes("_hash")
      );
      var replacer = function (key, value) {
        return value === null ? "" : value;
      };
      csv = json.map(function (row) {
        return fields
          .map(function (fieldName) {
            return JSON.stringify(row[fieldName], replacer).replace(
              /^"(.+(?="$))"$/,
              "$1"
            );
          })
          .join(",");
      });
      csv.unshift(fields.join(",")); // add header column
      csv = csv.join("\r\n");
      console.log(csv);
      const blob = new Blob([csv], {
        type: "application/vnd.ms-excel;charset=utf-8",
      });
      var d = new Date(Date.parse(order.validationDate));
      var formatted = this.pipe.transform(d, "yyyyMMddHHmmss");

      saveAs(blob, formatted + "-" + order.orderAuto + ".csv");
    });
  }

  /**
   * Download PDF printable format
   * @param order
   */
  choosePrintableFormat(order: Order) {
    this.displayPrintModal = true;
    this.selectedOrder = order;
  }

  downloadPrintablePDF(formatCode: number) {
    // display progress bar
    this.downloading = true;
    this.orderService
      .getOrderTicketsPDF(this.selectedOrder.idOrder, formatCode)
      .subscribe((data) => {
        // create the blob object with content-type "application/pdf"
        var blob = new Blob([data], { type: "application/pdf" });

        var d = new Date(Date.parse(this.selectedOrder.validationDate));
        var formatted = this.pipe.transform(d, "yyyyMMddHHmmss");

        // directly open in new window
        var fileURL = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = fileURL;
        a.target = "_blank";
        a.title = "pdfFile.pdf";
        document.body.appendChild(a);
        a.click();

        // hide progress bar
        this.downloading = false;

        // hide modal
        this.displayPrintModal = false;

        // download file instead
        // saveAs(blob, formatted + "-" + order.orderAuto + ".pdf");
      });
  }

  /**
   * Show order info dialog
   * @param order
   */
  showDialog(order: Order) {
    this.selectedOrder = order;
    this.displayModal = true;
  }
}
