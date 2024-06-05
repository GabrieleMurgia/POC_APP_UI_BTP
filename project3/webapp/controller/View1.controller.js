sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/model/Sorter",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Input",
    "sap/m/Text",
    "sap/ui/model/json/JSONModel",
],
 function (Controller, Sorter, Dialog, Button, Input, Text,JSONModel) {
    "use strict";

    return Controller.extend("project3.controller.View1", {
        onInit: function () {
              // Ottieni il modello OData dal componente
              var oJSONModelODV = new JSONModel();

            // Ottieni il modello dal componente
            var oModel = this.getOwnerComponent().getModel();
            if (oModel) {
                oModel.read("/ZTEST_CORSO_SC", {
                    success: function (oData) {
                        console.log(oData); // Visualizza i dati nella console
                        oJSONModelODV.setData({ ZTEST_CORSO_SC: oData.results });
                        this.getView().setModel(oJSONModelODV, "jsonModelODV");
                        
                    },
                    error: function (oError) {
                        console.error("Errore nel recuperare i dati: ", oError);
                        
                    }
                });
            } else {
                console.error("Modello OData non trovato");
            }
        },
        /* Formatter per date */
        formatDate: function(date) {
            if (!date) {
                return "";
            }
            var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                pattern: "dd/MM/yyyy"
            });
            return oDateFormat.format(new Date(date));
        },
        onSortPress: function (oEvent) {
            var sColumnId = oEvent.getSource().getId();
            var sSortOrder = this._getSortOrder(sColumnId);
            var sPath = this._getColumnPath(sColumnId);
            var bDescending = sSortOrder === "Descending";
            this._sortTableData(sPath, bDescending);
            this._toggleSortIcon(sColumnId, bDescending);
        },
        _sortTableData: function (sPath, bDescending) {
            var oModel = this.getView().getModel("jsonModelODV");
            var aData = oModel.getProperty("/ZTEST_CORSO_SC");

            aData.sort(function (a, b) {
                var valueA = a[sPath];
                var valueB = b[sPath];
                if (valueA < valueB) {
                    return bDescending ? 1 : -1;
                }
                if (valueA > valueB) {
                    return bDescending ? -1 : 1;
                }
                return 0;
            });

            oModel.setProperty("/ZTEST_CORSO_SC", aData);
        },

        onFilterPress: function (oEvent) {
            var sColumnId = oEvent.getSource().getId();
            this._currentFilterColumn = sColumnId;
            if (!this._oDialog) {
                this._oDialog = new Dialog({
                    title: "Filter",
                    content: [
                        new Text({ text: "Enter filter value:" }),
                        new Input({ id: "filterInput" })
                    ],
                    beginButton: new Button({
                        text: "Apply",
                        press: this._applyFilter.bind(this)
                    }),
                    endButton: new Button({
                        text: "Cancel",
                        press: function () {
                            this._oDialog.close();
                        }.bind(this)
                    })
                });
            }
            this._oDialog.open();
        },

        _applyFilter: function () {
            var sValue = sap.ui.getCore().byId("filterInput").getValue();
            var sPath = this._getColumnPath(this._currentFilterColumn);
            var oTable = this.byId("myTable");
            var oBinding = oTable.getBinding("items");
            var aFilters = [];
            if (sValue) {
                aFilters.push(new sap.ui.model.Filter(sPath, sap.ui.model.FilterOperator.Contains, sValue));
            }
            oBinding.filter(aFilters);
            this._oDialog.close();
        },

        _getSortOrder: function (sColumnId) {
            var oButton = this.byId(sColumnId);
            var sIcon = oButton.getIcon();
            if (sIcon === "sap-icon://sort") {
                return "Ascending";
            } else if (sIcon === "sap-icon://sort-ascending") {
                return "Descending";
            } else {
                return "Ascending";
            }
        },

        _getColumnPath: function (sColumnId) {
            switch (sColumnId) {
                case "btnSortDocVendita":
                case "btnFilterDocVendita":
                    return "Vbeln";
                case "btnSortDataCreazione":
                case "btnFilterDataCreazione":
                    return "Erdat";
                case "btnSortErnam":
                case "btnFilterErnam":
                    return "Ernam";
                default:
                    return "";
            }
        },

        _toggleSortIcon: function (sColumnId, bDescending) {
            var oButton = this.byId(sColumnId);
            if (bDescending) {
                oButton.setIcon("sap-icon://sort-descending");
            } else {
                oButton.setIcon("sap-icon://sort-ascending");
            }
        }
    });
});
