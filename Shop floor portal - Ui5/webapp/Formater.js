sap.ui.define([], function () {
    "use strict";
    return {
        formatDate: function (value) {
            if (!value) return "";

            // handle OData /Date(1684454400000)/ format
            if (typeof value === "string" && value.indexOf("/Date") === 0) {
                value = new Date(parseInt(value.replace(/[^0-9]/g, ""), 10));
            } else {
                value = new Date(value);
            }

            if (isNaN(value.getTime())) {
                return "";
            }

            // Format as dd-MM-yyyy
            var dd = String(value.getDate()).padStart(2, "0");
            var mm = String(value.getMonth() + 1).padStart(2, "0");
            var yyyy = value.getFullYear();

            return dd + "-" + mm + "-" + yyyy;
        }
    };
});