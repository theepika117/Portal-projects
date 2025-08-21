sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageBox",
  "sap/ui/model/Sorter"
], function (Controller, JSONModel, MessageBox, Sorter) {
  "use strict";

  return Controller.extend("SHOP_FLOOR.controller.PlanningOrder", {
    onInit: function () {
      this._loadData(); // Initial load
    },

    /**
     * Load planning orders (always fetch all, filter client-side by Psttr)
     */
    _loadData: function (sMonth, sYear) {
      var oModel = this.getOwnerComponent().getModel("shopfloor");
      var that = this;

      if (!oModel) {
        MessageBox.error("OData model not found.");
        return;
      }

      this.getView().setBusy(true);

      // Always fetch by plant only
      oModel.read("/ZPP_PLANORDER_RTSet", {
        urlParameters: {
          "$filter": "Plwrk eq '0001'"
        },
        success: function (oData) {
          that.getView().setBusy(false);

          var aResults = (oData && oData.results) ? oData.results : [];

          // --- Client-side filter on Start Date (Psttr) ---
          if (sYear || sMonth) {
            aResults = aResults.filter(function (oOrder) {
              if (!oOrder.Psttr) {
                return false;
              }
              var dDate = new Date(oOrder.Psttr);
              var match = true;

              if (sYear) {
                match = match && (dDate.getFullYear() === parseInt(sYear, 10));
              }
              if (sMonth) {
                match = match && ((dDate.getMonth() + 1) === parseInt(sMonth, 10));
              }
              return match;
            });
          }

          // Bind to table
          that.getView().setModel(new JSONModel(aResults), "planOrders");
        },
        error: function (oError) {
          that.getView().setBusy(false);
          jQuery.sap.log.error("Failed to fetch planning orders", oError);
          MessageBox.error("Error fetching planning orders.");
        }
      });
    },

    // Triggered when Apply button is pressed
    onApplyFilters: function () {
      var sMonth = this.byId("monthSelect").getSelectedKey();
      var sYear  = this.byId("yearSelect").getSelectedKey();
      this._loadData(sMonth, sYear);
    },

    // Auto reload on dropdown change
    onFilterChange: function () {
      var sMonth = this.byId("monthSelect").getSelectedKey();
      var sYear  = this.byId("yearSelect").getSelectedKey();
      this._loadData(sMonth, sYear);
    },

    // Sort by Start Date (Psttr)
    onSort: function () {
      var oTable = this.byId("planningOrderTable");
      var oBinding = oTable && oTable.getBinding("items");
      if (oBinding) {
        oBinding.sort(new Sorter("Psttr", false)); // ascending
      }
    }
  });
});
