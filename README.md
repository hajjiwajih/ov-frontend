# Orange Voucher Web App

## About

- A web application developed for ticket sales management within SIM reseller companies using **Angular 9, Loopback 3, MongoDB**.

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
``` $ npm run prod ```

You can now connect to `http://localhost:4200` to start navigating.

**To deploy your instance on premise / cloud you can refer to this document:** https://app.box.com/file/676122742644.
