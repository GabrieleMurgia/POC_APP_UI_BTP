sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend("project1.controller.Master", {
        onSelectionChange: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("listItem") || oEvent.getSource();
            var sTitle = oSelectedItem.getTitle();

            // Ottieni l'istanza della SplitApp
            var oSplitApp = this.getView().getParent().getParent();

            // Ottieni la vista di dettaglio e aggiorna il contenuto
            var oDetailView = oSplitApp.getDetailPages()[0];
            var oDetailPage = oDetailView.byId("detailPage");
            oDetailPage.removeAllContent();
            oDetailPage.addContent(new sap.m.Text({ text: "Selected: " + sTitle }));

            // Naviga alla pagina di dettaglio
            oSplitApp.toDetail(oDetailView);
        }
    });
});