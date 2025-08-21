sap.ui.define([
  "sap/ui/core/mvc/Controller"
], function (Controller) {
  "use strict";
 
  return Controller.extend("SHOP_FLOOR.controller.Dashboard", {
    onInit: function () {
      // init logic if needed
    },
    onPlanningOrderTilePress: function () {
  this.getOwnerComponent().getRouter().navTo("PlanningOrder");
},
onProductionOrderTilePress: function () {
  this.getOwnerComponent().getRouter().navTo("ProductionOrder");
}
 
    

  });
});