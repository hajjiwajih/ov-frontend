import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.css']
})
export class PageNotFoundComponent implements OnInit {

  redirectLink: string;
  constructor() { }

  ngOnInit() {
    this.redirectLink = localStorage.getItem("role") == "admin" ? "/login-admin" : "/login"
  }

}
