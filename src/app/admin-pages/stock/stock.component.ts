import { NotificationService } from "./../../services/notification.service";
import { VoucherService } from "./../../services/voucher.service";
import { DatePipe } from "@angular/common";
import { Subscription } from "rxjs";
import { Voucher } from "./../../models/voucher";
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { numberWithSpaces } from "src/app/helpers/format-stocks";
declare var $: any;

@Component({
  selector: "app-stock",
  templateUrl: "./stock.component.html",
  styleUrls: ["./stock.component.css"],
})
export class StockComponent implements OnInit {
  vouchers: Voucher[];
  selectedVoucher: Voucher;
  selectedUserForUpdate: Voucher;
  obs$: Subscription;

  pipe = new DatePipe("fr-FR");

  displayModal: boolean = false;

  addedSub$: Subscription;
  constructor(
    private voucherService: VoucherService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.selectedVoucher = {};
  }
  ngOnInit() {
    //   this.activatedLink = params.category;

    this.obs$ = this.voucherService.getVouchers().subscribe((list) => {
      this.vouchers = list;
      console.log(this.vouchers);
      // hide block loader
      setTimeout(() => {
        $(".block-loader").fadeOut(500);
        $(".sk-circle").fadeOut(500);
      }, 700);

      // clear new notification
      this.notificationService.clearNotification({ type: "voucher" });
      let _self = this;
      $(document).ready(function () {
        $.fn.dataTable.moment("D/M/YYYY HH:mm");
        $("#voucherTables").DataTable({
          responsive: true,
          language: {
            emptyTable: "Aucune donnée disponible dans le tableau",
            info: "Affichage de _START_ à _END_ de _TOTAL_ donneés",
            infoEmpty: "Affichage de 0 à 0 de 0 donneés",
            infoFiltered: "(filtered from _MAX_ total entries)",
            lengthMenu: "Afficher _MENU_ Vouchers",
            loadingRecords: "Loading...",
            processing: "Processing...",
            search: "Recherche:",
            zeroRecords: "Aucun voucher correspondant trouvé",
            paginate: {
              first: "First",
              last: "Last",
              next: "Suivant",
              previous: "Précédent",
            },
          },
          data: _self.vouchers,
          columns: [
            { data: "filename" },
            { data: "nbCodes" },
            { data: "ticketAmount" },
            { data: "ticketAmount" },
            { data: "issueDate" },
            { data: "valid" },
          ],
          order: [[0, "desc"]],
          columnDefs: [
            {
              targets: 0,
              render: function (data, type, row) {
                if (row.valid) return data.substring(data.search("VOUCHER"));
                else
                  return (
                    '<span style="color:red">' +
                    data.substring(data.search("VOUCHER")) +
                    "</span>"
                  );
              },
            },
            {
              visible: false,
              targets: 5,
              render: function (data, type, row) {
                return data;
              },
            },
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
          ],
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
            let amountCol = api.column(2).data().toArray();
            let validCol = api.column(5).data().toArray();
            nbCodeCol.forEach((element, index) => {
              if (validCol[index]) sumCol.push(element * amountCol[index]);
            });
            var total = sumCol.reduce(function (a, b) {
              return intVal(a) + intVal(b);
            }, 0);

            // Total over this page
            sumCol = [];
            nbCodeCol = api.column(1, { page: "current" }).data().toArray();
            amountCol = api.column(2, { page: "current" }).data().toArray();
            validCol = api.column(5, { page: "current" }).data().toArray();
            nbCodeCol.forEach((element, index) => {
              if (validCol[index]) sumCol.push(element * amountCol[index]);
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
      });
    });

    // subscribe to upcoming events
    this.subscribeToNewVouchers();
  }

  ngOnDestroy() {
    this.obs$.unsubscribe();
    if (this.addedSub$) this.addedSub$.unsubscribe();
  }

  refreshUsers() {
    this.obs$.unsubscribe();
    window.location.reload();
  }

  subscribeToNewVouchers() {
    this.addedSub$ = this.voucherService.newVoucher.subscribe((voucher) => {
      console.log("new voucher", voucher);
      this.addRow(voucher);
    });
  }

  addRow(voucher: Voucher) {
    // currently displaying validated orders
    const addedRow = $("#voucherTables")
      .DataTable()
      .row.add(voucher)
      .draw(false);
    const addedRowNode = addedRow.node();
    this.vouchers.push(voucher);
    $(addedRowNode).addClass("highlight");
    setTimeout(function () {
      $(addedRowNode).removeClass("highlight");
    }, 2000);
  }
}
