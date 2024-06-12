sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/model/Sorter",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Input",
    "sap/m/Text",
    "sap/ui/model/json/JSONModel",
    "sap/m/Select",
    "sap/m/Label",
    "sap/m/SelectList",
    "sap/ui/core/Item"
], function (Controller, ODataModel, Sorter, Dialog, Button, Input, Text, JSONModel, Select, Label, SelectList, Item) {
    "use strict";

    return Controller.extend("project3.controller.View1", {
        onInit: function () {
            //OData model
            let oDataModel = new ODataModel("/sap/opu/odata/sap/ztest_corsosc_srv/");
            this.getView().setModel(oDataModel);

            // JSON model
            let oJSONModelODV = new JSONModel();
            this.getView().setModel(oJSONModelODV, "jsonModelODV");

            // Initialize filter dialog
            this._initializeFilterDialog();

            // Open Dialog
            this._filterDialog.open();
        },

        _fetchData: function () {
            let oModel = this.getView().getModel();
            oModel.read("/ZTEST_CORSO_SC", {
                success: function (oData) {
                    let oJSONModelODV = this.getView().getModel("jsonModelODV");
                    oJSONModelODV.setData(oData);
                }.bind(this),
                error: function (oError) {
                    console.error("Errore nel recuperare i dati: ", oError);
                }
            });
        },

        onFilterButtonPress: function () {
            this._filterDialog.open();
        },

        _initializeFilterDialog: function () {
            // Check if the dialog already exists
            if (!this._filterDialog) {
                this._inputField = new sap.m.Input("filterValue");
                this._datePicker = new sap.m.DatePicker("filterDate");

                this._filterDialog = new sap.m.Dialog({
                    title: "Scegli un filtro",
                    content: new sap.m.VBox({
                        items: [
                            new sap.m.Label({ text: "Scegli il campo di filtro:" }),
                            new sap.m.Select("filterSelect", {
                                items: [
                                    new sap.ui.core.Item({ key: "Ernam", text: "Creato Da" }),
                                    new sap.ui.core.Item({ key: "Erdat", text: "Data Creazione" })
                                ],
                                change: this._onFilterFieldChange.bind(this)
                            }),
                            new sap.m.Label({ text: "Inserisci il valore del filtro:" }),
                            this._inputField
                        ]
                    }),
                    beginButton: new sap.m.Button({
                        text: "Applica",
                        press: function () {
                            let sFilterField = sap.ui.getCore().byId("filterSelect").getSelectedKey();
                            let sFilterValue = (sFilterField === "Erdat") ? this._datePicker.getValue() : this._inputField.getValue();
                            this._applyODataFilter(sFilterField, sFilterValue);
                            this._filterDialog.close();
                        }.bind(this)
                    }),
                    endButton: new sap.m.Button({
                        text: "Annulla",
                        press: function () {
                            this._filterDialog.close();
                        }.bind(this)
                    })
                });
            }
        },
        _onFilterFieldChange: function (oEvent) {
            let sSelectedKey = oEvent.getSource().getSelectedKey();
            let oVBox = this._filterDialog.getContent()[0];
            oVBox.removeItem(3); // Remove the current input field or date picker

            if (sSelectedKey === "Erdat") {
                oVBox.insertItem(this._datePicker, 3); 
            } else {
                oVBox.insertItem(this._inputField, 3);
            }
        },
        _parseDateFromString: function(dateString) {
            var parts = dateString.split("/");
            if (parts.length === 3) {
                var month = parseInt(parts[0], 10) - 1;
                var day = parseInt(parts[1], 10);
                var year = parseInt(parts[2], 10);
                if (year < 100) {
                    year += 2000;
                }
                var date = new Date(year, month, day);
                var formattedDay = ("0" + date.getDate()).slice(-2);
                var formattedMonth = ("0" + (date.getMonth() + 1)).slice(-2);
                var formattedYear = date.getFullYear();
                return formattedDay + formattedMonth + formattedYear;
            } else {
                return null;
            }
        },
        _applyODataFilter: function (sFilterField, sFilterValue) {
            let oModel = this.getView().getModel();
            if (oModel) {
                let aFilters = [];
                if (sFilterField && sFilterValue) {
                    if (sFilterField === "Erdat") {
                        sFilterValue = this._parseDateFromString(sFilterValue);
                        aFilters.push(new sap.ui.model.Filter(sFilterField, sap.ui.model.FilterOperator.EQ, sFilterValue));
                    } else {
                        aFilters.push(new sap.ui.model.Filter(sFilterField, sap.ui.model.FilterOperator.Contains, sFilterValue));
                    }
                }
        
                oModel.read("/ZTEST_CORSO_SC", {
                    filters: aFilters,
                    success: function (oData) {
                        let oJSONModelODV = this.getView().getModel("jsonModelODV");
                        if (oJSONModelODV) {
                            oJSONModelODV.setData(oData);
                        } else {
                            console.error("Modello JSON 'jsonModelODV' non trovato");
                        }
                    }.bind(this),
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
            let oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                pattern: "dd/MM/yyyy"
            });
            return oDateFormat.format(new Date(date));
        }
    });
});
