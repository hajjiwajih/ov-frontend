import { NotificationService } from "./../services/notification.service";
import { DatePipe } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { OrderService } from "./../services/order.service";
import { UserService } from "./../services/user.service";
import { Message } from "primeng/api/message";
import { MessageService } from "primeng/api";
import { Subscription } from "rxjs";
import { Order } from "./../models/order";
import { Component, OnInit } from "@angular/core";
import Swal from "sweetalert2";
import { appendDtActions } from "../helpers/datatable-fonctions";
import { numberWithSpaces } from "../helpers/format-stocks";
import { User } from "../models/user";

declare var $: any;

@Component({
  selector: "app-orders",
  templateUrl: "./orders.component.html",
  providers: [MessageService],
  styleUrls: ["./orders.component.css"],
})
export class OrdersComponent implements OnInit {
  orders: Order[];
  user: User;
  selectedOrder: Order;
  selectedUserForUpdate: Order;
  obs$: Subscription;

  availableTickets: any;
  proccesAvailableTickets: any;
  soldTickets = 0;
  totalOrders = 0;

  isCmdLoading = true;
  isStockLoading = true;
  isSoldLoading = true;

  validationSub$: Subscription;
  rejectionSub$: Subscription;
  addedSub$: Subscription;

  msgs: Message[] = [];

  pipe = new DatePipe("fr-FR");

  title = "Non Validées";

  activatedLink: string;

  isValidated: boolean;

  isRejected: boolean;

  displayModal: boolean = false;
  displayDetails: boolean = false;

  // availbale stock details
  amounts = [1000, 5000, 10000];
  stocks = [0, 0, 0];
  totalPerType = [0, 0, 0];
  percents = [0, 0, 0];
  loaders = [false, false, false];

  amountStocks: string;
  amountSails: string;

  orderHidden = false;

  constructor(
    private messageService: MessageService,
    private orderService: OrderService,
    private userService: UserService,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    private router: Router
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
    // stats component
    this.getStats();

    // default get active orders
    this.route.data.subscribe((data) => {
      this.isValidated = data["valid"];
      this.isRejected = data["rejected"];
      if (data["valid"]) this.title = "Validées";
      if (data["rejected"]) this.title = "Rejetées";
      let _self = this;

      this.obs$ = this.orderService
        .getOrders(this.isValidated, this.isRejected)
        .subscribe((orders) => {
          this.orders = orders;
          this.orders.map((item) => {
            item.validationDate = item.validationDate || "";
            return item;
          });
          console.log(orders);
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
                { data: "clientRef" },
                { data: "issueDate" },
                { data: "validationDate" },
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
                    return `
                    <div class='content text-center'>
                      <a class="${row.clientId}" href="/monitor/clients/${row.clientId}" title='Please wait..'><img src="../../assets/icons/info.png" width="26px" /></a>
                    </div>`;
                  },
                },
                {
                  targets: 5,
                  render: function (data, type, row) {
                    return _self.pipe.transform(data, "short");
                  },
                },
                {
                  visible: _self.isValidated && !_self.isRejected,
                  targets: 6,
                  render: function (data, type, row) {
                    return _self.pipe.transform(data, "short");
                  },
                },
                {
                  visible: !_self.isValidated && _self.isRejected,
                  targets: 7,
                  render: function (data, type, row) {
                    return _self.pipe.transform(data, "short");
                  },
                },
              ],
              fnCreatedRow: function (nRow, aData, iDataIndex) {
                appendDtActions(aData, nRow, false, {
                  valid: _self.isValidated,
                  reject: _self.isRejected,
                  column: _self.isValidated || _self.isRejected ? 7 : 6,
                });
              },
              footerCallback: function (row, data, start, end, display) {
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
                let amountCol = api.column(3).data().toArray();
                nbCodeCol.forEach((element, index) => {
                  sumCol.push(element * amountCol[index]);
                });
                var total = sumCol.reduce(function (a, b) {
                  return intVal(a) + intVal(b);
                }, 0);

                // Total over this page
                sumCol = [];
                nbCodeCol = api.column(1, { page: "current" }).data().toArray();
                amountCol = api.column(3, { page: "current" }).data().toArray();
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

            // handle button click ->validate row
            $("#orderTables tbody").on(
              "click",
              "tr .btn-outline-success",
              function () {
                _self.validateOrder(
                  table.row($(this).parent().parent()).data()
                );
              }
            );

            // handle button click -> reject row
            $("#orderTables tbody").on(
              "click",
              "tr .btn-outline-danger",
              function () {
                _self.rejectOrder(table.row($(this).parent().parent()).data());
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
            $(".content a").tooltip({
              track: true,
              open: function (event, ui) {
                _self.userService
                  .getUserById(event.target.className)
                  .subscribe((clientInfo) => {
                    $("." + event.target.className).tooltip(
                      "option",
                      "content",
                      `<div>
                      <span>Username: </span>
                        <span class="text-right text-success mt-2"> ${
                          clientInfo.fname + " " + clientInfo.lname
                        }</span><br>
                        <span>Email: </span>
                        <span class="text-right text-success my-2">${
                          clientInfo.email
                        }</span><br>
                        <span>User status: </span>
                        ${
                          clientInfo.emailVerified
                          ? 
                          '<button style="border-radius: .3rem" class="text-right bg-success btn-rounded text-white border-0 px-2 py-0 my-2"> Vérifié </button>'
                          :
                          '<button style="border-radius: .3rem" class="text-right bg-warning btn-rounded text-white border-0 px-2 py-0 my-2"> Non vérifié </button>'
                        }
                        
                      </div>`
                    );
                  });
              },
            });
            $(".content a").mouseout(function () {
              $(this).attr("title", "Please wait...");
              $(this).tooltip();
              $(".ui-tooltip").hide();
            });
          });
        });
      // subscribe to incoming events
      this.subscribeToNewOrders();

      // reset notification
      if (!this.isValidated && !this.isRejected)
        this.notificationService.clearNotification({ type: "order" });
      // this.subscribeToValidatedOrders();
      // this.subscribeToRejectedOrders();
    });
  }

  /**
   * Highlight and calculate overall stats
   *
   */
  getStats() {
    // available stocks
    this.orderService.countTickets().subscribe((available) => {
      this.availableTickets = numberWithSpaces(available.count);
      setTimeout(() => {
        this.isStockLoading = false;
      }, 700);
    });

    let amountStocks = 0;
    let amountSails = 0;

    // tickets per amount
    this.amounts.forEach((amount, index) => {
      this.orderService.countTicketsByAmount(amount).subscribe((available) => {
        this.stocks[index] = available.count;
        amountStocks += (available.count * amount) / 1000;
        console.log(available.count, amount, amountStocks);
        this.amountStocks = numberWithSpaces(amountStocks);
        if (index + 1 == this.amounts.length)
          this.amounts.forEach((amount, index) => {
            this.orderService.getSoldTicketsCount(amount).subscribe((sold) => {
              this.stocks[index] = numberWithSpaces(sold.count);
              amountSails += (sold.count * amount) / 1000;
              console.log(sold.count, amount, amountSails);
              this.amountSails = numberWithSpaces(amountSails);
              this.isSoldLoading = false;
            });
          });
      });
    });
  }

  ngOnDestroy() {
    this.obs$.unsubscribe();
    if (this.addedSub$) this.addedSub$.unsubscribe();
    if (this.validationSub$) this.validationSub$.unsubscribe();
    if (this.rejectionSub$) this.rejectionSub$.unsubscribe();
  }

  subscribeToNewOrders() {
    this.addedSub$ = this.orderService.newOrder.subscribe((order) => {
      console.log("new order", order);
      if (this.isValidated || this.isRejected) {
        // });
      } else {
        this.addRow(order);
        // update stats
        this.totalOrders++;
        this.isCmdLoading = true;
        setTimeout(() => {
          this.isCmdLoading = false;
        }, 700);
      }
    });
  }

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

  validateOrder(order: Order) {
    let status = false;
    Swal.queue([
      {
        title: "Voulez vous confirmer?",
        text: "Cette commande sera validée pour votre client",
        icon: "warning",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Oui, procéder!",
        showLoaderOnConfirm: true,
        preConfirm: (ok) => {
          return new Promise<any>((resolve, reject) => {
            this.orderService
              .countTicketsByAmount(order.ticketAmount)
              .subscribe((available) => {
                console.log(available.count);
                if (available.count >= order.nbCodes) {
                  if (order.isRejected)
                    order.comment = "Commande validée aprés refus";
                  order.validated = true;
                  order.isRejected = false;
                  order.validationDate = new Date();
                  this.orderService
                    .updateOrder(order, order.idOrder)
                    .subscribe((updatedOrder) => {
                      console.log(updatedOrder);
                      this.orderService
                        .updateTickets(
                          order.idOrder,
                          order.nbCodes,
                          order.ticketAmount
                        )
                        .subscribe(
                          (result) => {
                            let info = JSON.parse(JSON.stringify(result)).info;
                            console.log(info);
                            resolve(info.count);
                          },
                          (err) => {
                            reject(
                              new Error(
                                "Commande non effectuée - Stock insuffisant" +
                                  err.toString()
                              )
                            );
                          }
                        );
                    });
                } else {
                  reject(
                    new Error("Commande non effectuée - Stock insuffisant")
                  );
                }
              });
          })
            .then(
              (soldTickets) => {
                console.log(soldTickets);
                if (soldTickets != order.nbCodes) {
                  throw new Error(
                    "Operation non terminée - Rollback transaction"
                  );
                } else {
                  Swal.insertQueueStep({
                    title: "Terminé",
                    text: "Commande Validée avec succès",
                    icon: "success",
                  });
                  this.orderService.triggerEvent("validated", order);
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

  rejectOrder(order: Order) {
    let status = false;

    Swal.queue([
      {
        title: "Voulez vous confirmer?",
        text:
          "Cette commande client sera rejetée, Veuillez commenter votre raison!",
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
            order.isRejected = true;
            order.validationDate = new Date();
            order.comment = comment;
            this.orderService.updateOrder(order, order.idOrder).subscribe(
              (updatedOrder) => {
                console.log(updatedOrder);
                resolve(updatedOrder);
              },
              (err) => {
                reject(
                  new Error("Commande non rejetée - Service non-disponible")
                );
              }
            );
          })
            .then(
              (updated) => {
                console.log(updated);
                if (!updated) {
                  throw new Error(
                    "Operation non terminée - Rollback transaction"
                  );
                } else {
                  Swal.insertQueueStep({
                    title: "Terminé",
                    text: "Commande rejetée avec succès",
                    icon: "success",
                  });
                  this.orderService.triggerEvent("rejected", order);
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
        },
        allowOutsideClick: () => !Swal.isLoading(),
      },
    ]).then((result) => {
      console.log(result);
      if (status) {
        // setTimeout(() => {
        window.location.reload();
        // window.location.reload();
        // }, 700);
      }
    });
  }

  showDialog(order: Order) {
    this.selectedOrder = order;
    this.displayModal = true;
  }

  /**
   * Count available ticket per amount / price type
   */
  getStockDetails() {
    this.orderHidden = false;
    this.percents = [0, 0, 0];
    this.loaders = [true, true, true];
    this.amounts.forEach((amount, index) => {
      this.orderService.countTicketsByAmount(amount).subscribe((available) => {
        this.stocks[index] = numberWithSpaces(available.count);
        let totalPerType = 0;
        totalPerType = (available.count * amount) / 1000;
        this.totalPerType[index] = numberWithSpaces(totalPerType);

        /**
         * Since we are doing some calculation on this.availableTickets variable
         * and i change it to string before to add suitable spaces i can't do operation since it's string and has spaces
         * so i had to remove spaces using .replace() method and then convert it to number
         */
        this.proccesAvailableTickets = this.availableTickets.replace(/ /g, "");
        this.proccesAvailableTickets = Number(this.availableTickets);
        if (this.proccesAvailableTickets)
          this.percents[index] = Math.round(
            (available.count / this.proccesAvailableTickets) * 100
          );
        else this.percents[index] = 0;
        this.loaders[index] = false;
      });
    });
  }

  /**
   * Count sold ticket per amount / price type
   */
  getSailsDetails() {
    this.orderHidden = false;
    this.percents = [0, 0, 0];
    this.loaders = [true, true, true];
    this.amounts.forEach((amount, index) => {
      this.orderService.getSoldTicketsCount(amount).subscribe((sold) => {
        this.stocks[index] = numberWithSpaces(sold.count);
        let totalPerType = 0;
        console.log(this.percents[index], sold.count, amount, this.soldTickets);
        totalPerType = (sold.count * amount) / 1000;
        this.totalPerType[index] = numberWithSpaces(totalPerType);
        if (parseInt(this.amountSails))
          this.percents[index] = Math.round(
            (sold.count / parseInt(this.amountSails)) * 100
          );
        else this.percents[index] = 0;
        this.loaders[index] = false;
      });
    });
  }

  /**
   * Count orders per amount / price type
   */

  getOrderDetails() {
    this.orderHidden = true;
    this.loaders = [true, true, true];
    this.amounts.forEach((amount, index) => {
      this.orderService.getOrderCount(amount).subscribe((orders) => {
        this.stocks[index] = orders.count;
        setTimeout(() => {
          this.percents[index] = Math.round(
            (orders.count / this.totalOrders) * 100
          );
          this.loaders[index] = false;
        }, 700);
      });
    });
  }

  /**
   * show stat details
   */

  openStockDetails(type) {
    this.displayDetails = true;
    switch (type) {
      case "available":
        this.getStockDetails();
        break;
      case "sold":
        this.getSailsDetails();
        break;
      case "orders":
        this.getOrderDetails();
        break;
    }
  }
}
