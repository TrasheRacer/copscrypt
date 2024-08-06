"use strict";

function appendRow(tBody, data) {
    // insert a row at the end of table
    var newRow = tBody.insertRow();

    // insert a cell at the end of the row
    var newTimeCell = newRow.insertCell();
    // append a text node to the cell
    var newTimeCellText = document.createTextNode(
        (new Date().toLocaleString("en-GB"))
    );
    newTimeCell.appendChild(newTimeCellText);

    // insert a cell at the end of the row
    var newDataCell = newRow.insertCell();
    // append a text node to the cell
    var newDataCellText = document.createTextNode(data);
    newDataCell.appendChild(newDataCellText);
}

function appendClient(tBody, clientId) {
    appendRow(tBody, `${clientId} JOINED`)
}