import { OrderService } from "./../../services/order.service";
import { Router } from "@angular/router";
import { ActivatedRoute } from "@angular/router";
import { Order } from "./../../models/order";
import { Component, OnInit } from "@angular/core";
import { Location } from "@angular/common";
import Swal from "sweetalert2";

@Component({
  selector: "app-confirmation",
  templateUrl: "./confirmation.component.html",
  styleUrls: ["./confirmation.component.css"],
})
export class ConfirmationComponent implements OnInit {
  order: Order;
  id: string; // current userId
  ref: string; // current user reference
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private orderService: OrderService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.order = JSON.parse(params["order"]);
    });
    this.id = localStorage.getItem("currentUserId");
    this.ref = localStorage.getItem("currentUserRef");
  }

  confirmOrder() {
    Swal.queue([
      {
        title: "Voulez vous confirmer?",
        text: "Votre commande sera traitée dans les meilleurs delais!",
        icon: "warning",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Oui, procéder!",
        showLoaderOnConfirm: true,
        preConfirm: (ok) => {
          return new Promise<any>((resolve, reject) => {
            this.orderService;
            this.order.clientId = this.id;
            this.order.clientRef = this.ref;
            this.orderService.addOrder(this.order).subscribe(
              (createdOrder) => {
                console.log(createdOrder);
                resolve(createdOrder);
              },
              (err) => {
                reject(
                  new Error("Commande non effectuée - Service non-disponible")
                );
              }
            );
          })
            .then(
              (created) => {
                console.log(created);
                if (!created) {
                  throw new Error(
                    "Operation non terminée - Rollback transaction"
                  );
                } else {
                  Swal.insertQueueStep({
                    title: "Terminé",
                    text: "Commande effectuée avec succès",
                    icon: "success",
                    allowOutsideClick: false,
                  });
                  this.orderService.triggerEvent("newOrder", created);
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
      if (result.value) {
        // setTimeout(() => {
        this.router.navigateByUrl("portal");
        // }, 700);
      }
    });
  }

  dismissOrder() {
    this.location.back();
  }
}
