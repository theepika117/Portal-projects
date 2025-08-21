// server.js
const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// const cors = require("cors");
// app.use(cors());
const cors = require('cors');
app.use(cors({
  origin: ['http://localhost:8080', 'http://127.0.0.1:8080'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// SAP OData Config
const SAP_URL = "http://AZKTLDS5CP.kcloud.com:8000/sap/opu/odata/sap/ZMAINTENANCE_PORTAL_RT_SRV/ZPM_LOGIN_RTSet";
const SAP_USERNAME = "k901677";
const SAP_PASSWORD = "Rth3eep!@677";



// Login API for Flutter
app.post("/login", async (req, res) => {
  const { empId, password } = req.body;

  try {
    // Prepare OData filter
    const filter = `EmpId eq '${empId}' and Password eq '${password}'`;

    // Send request to SAP OData
    const response = await axios.get(SAP_URL, {
      params: {
        $filter: filter,
        $format: "json",
      },
      auth: {
        username: SAP_USERNAME,
        password: SAP_PASSWORD,
      },
    });

    // Extract result
    const results = response.data.d?.results || [];

    if (results.length > 0) {
        console.log("✅ Login success:", results[0]);
      res.json({
        success: true,
        user: results[0],
      });
    } else {
        console.log("❌ Invalid credentials for:", empId);
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }
  } catch (error) {
    console.error("SAP Login Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});


// SAP Plants OData Config
const SAP_PLANTS_URL =
  "http://AZKTLDS5CP.kcloud.com:8000/sap/opu/odata/sap/ZMAINTENANCE_PORTAL_RT_SRV/ZPM_PLANT_RTSet";

// Get Plants API
app.post("/plants", async (req, res) => {
  const { mainEngineer } = req.body; // Flutter will send engineer ID

  try {
    // Prepare OData filter
    const filter = `MainEngineer eq '${mainEngineer}'`;

    // Call SAP OData
    const response = await axios.get(SAP_PLANTS_URL, {
      params: {
        $filter: filter,
        $format: "json",
      },
      auth: {
        username: SAP_USERNAME,
        password: SAP_PASSWORD,
      },
    });

    // Extract results
    const plants = response.data.d?.results || [];

    if (plants.length > 0) {
      console.log(`✅ Found ${plants.length} plants for engineer ${mainEngineer}`);
      res.json({
        success: true,
        plants: plants.map((plant) => ({
          Werks: plant.Werks,
          Name1: plant.Name1,
          Ort01: plant.Ort01,
          Stras: plant.Stras,
        })),
      });
    } else {
      console.log(`❌ No plants found for engineer ${mainEngineer}`);
      res.status(404).json({
        success: false,
        message: "No plants found",
      });
    }
  } catch (error) {
    console.error("🚨 SAP Plants Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});






// SAP Notifications OData Config
const SAP_NOTIFICATIONS_URL =
  "http://AZKTLDS5CP.kcloud.com:8000/sap/opu/odata/sap/ZMAINTENANCE_PORTAL_RT_SRV/ZPM_NOTIFICATIONSet";

// Get Notifications API
app.post("/notifications", async (req, res) => {
  const { plant } = req.body; // Flutter will send plant code

  try {
    // Prepare OData filter
    const filter = `Plant eq '${plant}'`;

    // Call SAP OData
    const response = await axios.get(SAP_NOTIFICATIONS_URL, {
      params: {
        $filter: filter,
        $format: "json",
      },
      auth: {
        username: SAP_USERNAME,
        password: SAP_PASSWORD,
      },
    });

    // Extract results
    const notifications = response.data.d?.results || [];

    if (notifications.length > 0) {
      console.log(`✅ Found ${notifications.length} notifications for plant ${plant}`);
      res.json({
        success: true,
        notifications: notifications.map((n) => ({
          NotificationNum: n.NotificationNum,
          Plant: n.Plant,
          LocAcc: n.LocAcc,
          EqupNum: n.EqupNum,
          PlannerGrp: n.PlannerGrp,
          NotificationType: n.NotificationType,
          Text: n.Text,
          PriorityType: n.PriorityType,
          Priorty: n.Priorty,
          MalfunctionDate: n.MalfunctionDate,
          MalfunctionTime: n.MalfunctionTime,
          WrkCenter: n.WrkCenter,
          MaintanancePlant: n.MaintanancePlant,
          NotifnCmplDat: n.NotifnCmplDat,
        })),
      });
    } else {
      console.log(`❌ No notifications found for plant ${plant}`);
      res.status(404).json({
        success: false,
        message: "No notifications found",
      });
    }
  } catch (error) {
    console.error("🚨 SAP Notifications Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});




// SAP Work Orders OData Config
const SAP_WORKORDERS_URL =
  "http://AZKTLDS5CP.kcloud.com:8000/sap/opu/odata/sap/ZMAINTENANCE_PORTAL_RT_SRV/ZPM_WORKORDERSet";

// Get Work Orders API
app.post("/workorders", async (req, res) => {
  const { plant } = req.body; // Flutter will send plant code

  try {
    // Prepare OData filter
    const filter = `Plant eq '${plant}'`;

    // Call SAP OData
    const response = await axios.get(SAP_WORKORDERS_URL, {
      params: {
        $filter: filter,
        $format: "json", // force JSON instead of XML
      },
      auth: {
        username: SAP_USERNAME,
        password: SAP_PASSWORD,
      },
    });

    // Extract results
    const workorders = response.data.d?.results || [];

    if (workorders.length > 0) {
      console.log(`✅ Found ${workorders.length} work orders for plant ${plant}`);
      res.json({
        success: true,
        workorders: workorders.map((w) => ({
          OrderNum: w.OrderNum,
          OrderType: w.OrderType,
          OrderCategory: w.OrderCategory,
          Description: w.Description,
          CompanyCode: w.CompanyCode,
          Plant: w.Plant,
          PlantLoc: w.PlantLoc,
          Application: w.Application,
          CostingSheet: w.CostingSheet,
          WrkCenter: w.WrkCenter,
          CostCenter: w.CostCenter,
          CreatedDate: w.CreatedDate,
          ObjNum: w.ObjNum,
        })),
      });
    } else {
      console.log(`❌ No work orders found for plant ${plant}`);
      res.status(404).json({
        success: false,
        message: "No work orders found",
      });
    }
  } catch (error) {
    console.error("🚨 SAP Work Orders Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});




// Start Server
const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Node server running on port ${PORT}`);
});
