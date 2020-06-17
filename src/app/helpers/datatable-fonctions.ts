/**
 * @utilities some utility functions related to datatable manipulation
 * add dynamically custom buttons
 * add dynamically custom badges
 */

declare var $: any;

/**
 * add dynamically custom buttons
 * @param aData
 * @param nRow
 * @param isClient
 * @param args
 */
export function appendDtActions(aData, nRow, isClient, args) {
  if (isClient) {
    $(`td:eq(${args.column})`, nRow).html("");
    if (args.valid)
      $(`td:eq(${args.column})`, nRow).append(
        `<button
      class="ml-2 mr-2 btn-icon btn-transition btn btn-outline-primary collapsed"
      aria-expanded="false"
      (click)="showDialog(order)"
      >
      <i class="pe-7s-upload btn-icon-wrapper"> </i>Aperçu
      </button>

      <button
      class="ml-2 mr-2 btn-icon btn-transition btn btn-outline-focus collapsed"
      aria-expanded="false"
      (click)="downloadCSV(order)"
      >
      <i class="pe-7s-cloud-download btn-icon-wrapper"> </i
      >Télécharger
      </button>
      <button
      class="ml-2 mr-2 btn-icon btn-transition btn btn-outline-success collapsed"
      aria-expanded="false"
      (click)="downloadPrintablePDF(order)"
      >
      <i class="pe-7s-cloud-download btn-icon-wrapper"> </i
      >Imprimer
      </button>`
      );
    else
      $(`td:eq(${args.column})`, nRow).append(
        `<button
      class="ml-2 mr-2 btn-icon btn-transition btn btn-outline-primary collapsed"
      aria-expanded="false"
      (click)="showDialog(order)"
      >
      <i class="pe-7s-upload btn-icon-wrapper"> </i>Aperçu
      </button>

      `
      );
  } else {
    $(`td:eq(${args.column})`, nRow).html("");
    if (args.valid || args.reject)
      $(`td:eq(${args.column})`, nRow).append(
        `<button
        class="ml-2 mr-2 btn-icon btn-transition btn btn-outline-primary collapsed"
        aria-expanded="false"
        (click)="showDialog(order)"
      >
        <i class="pe-7s-upload btn-icon-wrapper"> </i>Aperçu
      </button>`
      );
    else
      $(`td:eq(${args.column})`, nRow).append(
        `<button
        class="ml-2 mr-2 btn-icon btn-transition btn btn-outline-primary collapsed"
        aria-expanded="false"
        (click)="showDialog(order)"
      >
        <i class="pe-7s-upload btn-icon-wrapper"> </i>Aperçu
      </button>

      <button
        class="ml-2 mr-2 btn-icon btn-transition btn btn-outline-success collapsed"
        aria-expanded="false"
        (click)="validateOrder(order)"
      >
        <i class="pe-7s-key btn-icon-wrapper"> </i>Valider
      </button>
      <button
        class="ml-2 mr-2 btn-icon btn-transition btn btn-outline-danger collapsed"
        aria-expanded="false"
        (click)="rejectOrder(order)"
      >
        <i class="pe-7s-close btn-icon-wrapper"> </i>Rejeter
      </button>

      `
      );
  }
}

/**
 * add dynamically custom buttons (admin)
 * @param aData
 * @param nRow
 * @param args
 */
export function appendDtAdminActions(aData, nRow, args) {
  $(`td:eq(${args.column})`, nRow).html("");
  if (args.valid)
    $(`td:eq(${args.column})`, nRow).append(
      `<button
    class="ml-2 mr-2 btn-icon btn-transition btn btn-outline-primary collapsed"
    aria-expanded="false"
    >
    <i class="pe-7s-upload btn-icon-wrapper"> </i>Aperçu
    </button>

    <button disabled
    class="ml-2 mr-2 btn-icon btn-transition btn btn-outline-focus collapsed"
    aria-expanded="false"
    >
    <i class="pe-7s-check btn-icon-wrapper"> </i
    >Valider
    </button>
    <button disabled
    class="ml-2 mr-2 btn-icon btn-transition btn btn-outline-danger collapsed"
    aria-expanded="false"
    >
    <i class="pe-7s-close btn-icon-wrapper"> </i
    >Refuser
    </button>`
    );
  else
    $(`td:eq(${args.column})`, nRow).append(
      `<button
      class="ml-2 mr-2 btn-icon btn-transition btn btn-outline-primary collapsed"
      aria-expanded="false"
      >
      <i class="pe-7s-upload btn-icon-wrapper"> </i>Aperçu
      </button>
  
      <button
      class="ml-2 mr-2 btn-icon btn-transition btn btn-outline-focus collapsed"
      aria-expanded="false"
      >
      <i class="pe-7s-check btn-icon-wrapper"> </i
      >Valider
      </button>
      <button 
    class="ml-2 mr-2 btn-icon btn-transition btn btn-outline-danger collapsed"
    aria-expanded="false"
    >
    <i class="pe-7s-close btn-icon-wrapper"> </i
    >Refuser
    </button>`
    );
}

/**
 * add dynamically custom badges
 * @param aData
 * @param nRow
 * @param args
 */
export function appendDtBadges(aData, nRow, args) {
  $(`td:eq(${args.column})`, nRow).html("");
  if (aData.validated)
    $(`td:eq(${args.column})`, nRow).append(
      `<div
      class="badge badge-pill ml-2 badge-success"
    >
    VALIDÉE
    </div>`
    );
  else if (aData.isRejected)
    $(`td:eq(${args.column})`, nRow).append(
      `<div
      class="badge badge-pill ml-2 badge-danger"
    >
    REJETÉE
    </div>`
    );
  else
    $(`td:eq(${args.column})`, nRow).append(
      `<div
      class="badge badge-pill ml-2 badge-info"
    >
    NON VALIDÉE
    </div>`
    );
}

/**
 * add dynamically custom buttons (admin)
 * @param aData
 * @param nRow
 * @param args
 */
export function appendDtAdminBadges(aData, nRow, args) {
  $(`td:eq(${args.column})`, nRow).html("");
  if (aData.emailVerified)
    $(`td:eq(${args.column})`, nRow).append(
      `<div
      class="badge badge-pill ml-2 badge-success"
    >
    Vérifié
    </div>`
    );
  else
    $(`td:eq(${args.column})`, nRow).append(
      `<div
      class="badge badge-pill ml-2 badge-danger"
    >
    Non Vérifié
    </div>`
    );
}
