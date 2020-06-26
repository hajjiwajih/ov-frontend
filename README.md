# Must Voucher Web App

## About

- A web application developed for phone reload tickets from Orange Tunisie to SymteleCOM entreprise and from SymteleCOM to their customers using **Angular 9, Loopback 3, MongoDB**.

- The Orange voucher web application allows SymteleCOM customers to place an order on phone reload tickets and view the progress and history of the request. The application also allows SymteleCOM's administrator to check, validate, refuse and consult customer requests. Orange Voucher simply makes it easy for the customer request transaction and Administrator Verification.

- The Orange Voucher web application allows Orange Tunisia to sell ther vouchers more easier than before and allows Symtelecom to resell the tickets to ther customers as well as to create appropriate profiles using our Api.

## Flow
When observing Orange Voucher capabilities, our elegant application will provide the following set of features.
User Roles :
•	Administrator
•	Customer


User Stories :

	**Customer :**
Every Customer will be able to do :
1.	Login with his login & password.
2.	Ordering
3.	Consult validated orders
4.	Consult refused orders
5.	Consult non-validated orders
6.	Change email address
7.	Change the phone number
8.	Change the password / Reset password
 

	**Administrator :**
Every Administrator will be able to do :
1.	Login with his login & password
2.	View active orders
3.	View refused orders
4.	View non-validated orders
5.	View customers list
6.	Consult the stock received (Stock available, Stock sold, orders)
7.	Accept / refuse an order from the customer
8.	Change email address
9.	Change the phone number
10.	Change the password / Reset password
11.	Accept/Refuse customers requests


## Architecture

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ![Demo architecture](https://trello-attachments.s3.amazonaws.com/5eddf192ecc32c45d5e609f2/1026x531/5d439633f3179f3e829816c259f531da/image.png)

## Dependencies

- [Angular v9](https://angular.io/guide): Angular is a structural framework for dynamic web apps...
- [ngx-socket-io](https://socket.io/docs/): Socket.IO is a library that enables real-time, bidirectional and event-based communication between the browser and the server.
- [FileSaver](https://www.npmjs.com/package/file-saver/v/1.3.2): FileSaver.js implements the saveAs() FileSaver interface in browsers that do not natively support it.
- [Datatables.net](https://datatables.net/): DataTables is a table enhancing plug-in for the jQuery Javascript library, adding sorting, paging and filtering abilities to plain HTML tables with minimal effort.
- [Bootstrap](https://getbootstrap.com/docs/4.0/getting-started/introduction/): Bootstrap is an open source toolkit for developing with HTML, CSS, and JS.
- [Primeng](https://www.primefaces.org/): PrimeNG is a collection of rich UI components for Angular.
- [Primeicons](https://www.primefaces.org/showcase/ui/misc/primeicons.xhtml): PrimeIcons is a font icon library for PrimeTek UI libraries such as PrimeFaces.
- [SweetAlert 2](https://sweetalert.js.org/guides/): A beautiful, responsive, customizable and accessible (WAI-ARIA) replacement for JavaScript's popup boxes.
- [jquery-ui-dist](https://www.npmjs.com/package/jquery-ui-dist): jQuery UI is a curated set of user interface interactions, effects, widgets, and themes built on top of the jQuery JavaScript Library.
- [Chart.js](https://www.chartjs.org/): Simple, clean and engaging HTML5 based JavaScript charts. Chart.js is an easy way to include animated, interactive graphs on your website for free.


## Setup (#run-locally)

### 1. Prerequisites

In order to run the `Frontend client`, you will need **Node.js** (tested with version 11.xx). This will include **npm**, needed to install dependencies.

Clone the `OV-Frontend` repository locally. In a terminal, run:

```bash
$ git clone https://gitlab.com/ditriot-consulting/orange-voucher/ov-frontend.git
```


**Installation**

- Access project orange voucher (frontend)
``` $ cd OV-frontend ``` 

- install frontend depends
``` $ npm install ```

- run the client server
``` $ ng serve ```

You can now connect to `http://localhost:4200` to start navigating.

**To deploy your instance on premise / cloud you can refer to this document:** https://app.box.com/file/676122742644.
