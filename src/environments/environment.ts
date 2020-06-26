// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  companyName: "Orange",
  production: false,
  enableDebug: true,
  // api routes
  api_url: "http://localhost:3500/api",
  api_url_users: "http://localhost:3500/api/users",
  api_url_orders: "http://localhost:3500/api/orders",
  api_url_tickets: "http://localhost:3500/api/tickets",
  api_url_vouchers: "http://localhost:3500/api/vouchers",
  // socket server
  socketIO_endpoint: "http://localhost:4000",
};

// export const environment = {
//   companyName: "Orange",
//   production: false,
//   enableDebug: true,
//   // api routes
//   api_url: "http://localhost:4200/api",
//   api_url_users: "https://orange.ditriot.tn:8443/api/users",
//   api_url_orders: "https://orange.ditriot.tn:8443/api/orders",
//   api_url_tickets: "https://orange.ditriot.tn:8443/api/tickets",
//   api_url_vouchers: "https://orange.ditriot.tn:8443/api/vouchers",
//   // socket server
//   socketIO_endpoint: "http://localhost:4000",
// };

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
