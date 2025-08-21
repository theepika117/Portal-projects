sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast",
  "sap/ui/core/UIComponent",
  "sap/ui/model/odata/v2/ODataModel"
], function (Controller, MessageToast, UIComponent, ODataModel) {
  "use strict";

  return Controller.extend("SHOP_FLOOR.controller.Login", {

    onInit: function () {
      // Explicitly create ODataModel (since not defined in manifest)
      if (!this.getOwnerComponent().getModel("shopfloor")) {
        var oModel = new ODataModel("/sap/opu/odata/sap/ZPP_SHOPFLOOR_RT_SRV/");
        this.getOwnerComponent().setModel(oModel, "shopfloor");
      }
    },

    onLogin: function () {
      var sEmpId = this.byId("empId").getValue();
      var sPassword = this.byId("password").getValue();

      if (!sEmpId || !sPassword) {
        MessageToast.show("Please enter Employee ID and Password");
        return;
      }

      var oModel = this.getOwnerComponent().getModel("shopfloor");
      var that = this;

      if (!oModel) {
        MessageToast.show("OData model not found.");
        return;
      }

      // Build key path
      var sPath = oModel.createKey("/ZPP_LOGINSet", {
        PLWRK: sEmpId,
        PASSWORD: sPassword
      });

      jQuery.sap.log.info("Generated OData Path:", sPath);

      this.getView().setBusy(true);

      oModel.read(sPath, {
        success: function (oData) {
          that.getView().setBusy(false);
          jQuery.sap.log.info("Login Success:", oData);
    	  MessageToast.show("Login successful!");
          UIComponent.getRouterFor(that).navTo("Dashboard");
        },
        error: function (oError) {
          that.getView().setBusy(false);
          jQuery.sap.log.info("Login Failed:", oError);
          MessageToast.show("Invalid credentials. Please try again.");
        }
      });
    }
  });
});




