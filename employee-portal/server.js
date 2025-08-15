// server.js
// This middleware acts as a secure proxy for the SAP OData service.
// It keeps the Basic Auth credentials off the frontend.

// Require necessary modules
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from a .env file.
// In a production environment, you should use a proper secrets management system.
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(cors()); // Enable CORS for communication with the Angular frontend
app.use(bodyParser.json()); // Parse incoming JSON request bodies

// --- Configuration from your SAP details ---
// It is CRITICAL that these credentials are not hardcoded.
// They are shown here for demonstration but should be stored in a `.env` file.
const odataServiceUrl = 'http://AZKTLDS5CP.kcloud.com:8000/sap/opu/odata/sap/ZEMP_RT_SRV/ZEMP_LOGIN_RTSet';
const sapClient = '100';

// Use environment variables for credentials
const basicAuthUser = process.env.SAP_USER || 'k901677';
const basicAuthPass = process.env.SAP_PASS || 'Rth3eep!@677';

// Create a Base64 string for Basic Authentication
const authString = Buffer.from(`${basicAuthUser}:${basicAuthPass}`).toString('base64');

// Log loaded environment variables (useful for debugging)
console.log('--- Middleware Initialized ---');
console.log('SAP_USER:', process.env.SAP_USER ? 'Loaded' : 'NOT LOADED, using default');
console.log('SAP_PASS:', process.env.SAP_PASS ? 'Loaded' : 'NOT LOADED, using default');
console.log(`Listening on port ${PORT}`);
console.log('------------------------------');

// Endpoint for Angular to call for login
app.post('/api/login-odata', async (req, res) => {
  const { employeeId, password } = req.body;

  // Basic input validation
  if (!employeeId || !password) {
    console.warn('Validation Error: Employee ID or password missing.');
    return res.status(400).json({ error: 'Employee ID and password are required.' });
  }

  console.log(`[Middleware] Received login request for Employee ID: ${employeeId}`);

  try {
    // Construct the OData URL with the filter.
    // The password MUST be URI encoded.
    const encodedPassword = encodeURIComponent(password);
    const filter = `EmpId eq '${employeeId}' and Password eq '${encodedPassword}'`;
    const url = `${odataServiceUrl}?$filter=${filter}&$format=json`;

    // Define the headers for the request to SAP
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'sap-client': sapClient,
      'Authorization': `Basic ${authString}`
    };

    console.log('[Middleware] Forwarding request to SAP OData service...');
    
    // Make the GET request to the SAP OData service using Axios
    const response = await axios.get(url, { headers });

    // Check if the response from SAP is a success
    if (response.data && response.data.d && response.data.d.results && response.data.d.results.length > 0) {
      console.log('[Middleware] Login successful for user:', employeeId);
      // Send a successful response back to the Angular frontend
      res.json({ message: 'Login successful', success: true });
    } else {
      // If no results are returned, it's an invalid login
      console.warn('[Middleware] Login failed for user:', employeeId);
      res.status(401).json({ error: 'Invalid Employee ID or Password.' });
    }

  } catch (error) {
    console.error('[Middleware] Error communicating with SAP:', error.message);
    
    // Handle different types of errors from the Axios call
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('SAP Response Status:', error.response.status);
      res.status(error.response.status).json({
        error: 'SAP responded with an error.',
        details: error.response.data
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from SAP:', error.request);
      res.status(500).json({ error: 'No response received from SAP. Check network or SAP server.' });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up the request:', error.message);
      res.status(500).json({ error: 'An unexpected error occurred.' });
    }
  }
});


// ENDPOINT for fetching profile data
app.get('/api/profile-odata/:employeeId', async (req, res) => {
  const { employeeId } = req.params;
  
  if (!employeeId) {
    return res.status(400).json({ error: 'Employee ID is required.' });
  }

  const odataProfileUrl = 'http://AZKTLDS5CP.kcloud.com:8000/sap/opu/odata/sap/ZEMP_RT_SRV/ZEMP_PROFILE_RTSet';
  // Use the employeeId from the URL parameter for the filter
  const filter = `EmpId eq '${employeeId}'`;
  const url = `${odataProfileUrl}?$filter=${filter}&$format=json`;

  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'sap-client': sapClient,
    'Authorization': `Basic ${authString}`
  };

  try {
    console.log(`[Middleware] Fetching profile for Employee ID: ${employeeId}`);
    const response = await axios.get(url, { headers });

    // The SAP response contains an array of results. We need to find the specific employee.
    //const profileData = response.data?.d?.results?.[0];
    const results = response.data?.d?.results || [];
    const profileData = results.find(emp => emp.EmpId === employeeId);

    if (profileData) {
      console.log(`[Middleware] Profile found for Employee ID: ${employeeId}`);
      // console.log("📦 API response:", profileData);
      res.json(profileData);
    } else {
      console.warn(`[Middleware] Profile not found for Employee ID: ${employeeId}`);
      res.status(404).json({ error: 'Profile not found.' });
    }
  } catch (error) {
    console.error('Error communicating with SAP during profile fetch:', error.message);
    if (error.response) {
      res.status(error.response.status).json({
        error: 'SAP responded with an error during profile fetch.',
        details: error.response.data
      });
    } else {
      res.status(500).json({ error: 'An unexpected error occurred during profile fetch.' });
    }
  }
});



// --- LEAVE DETAILS ENDPOINT ---
app.get('/api/leave-details', async (req, res) => {
  const empId = req.query.empId;

  if (!empId) {
    console.warn('[Middleware] Employee ID missing in leave request.');
    return res.status(400).json({ error: 'Employee ID is required.' });
  }

  console.log(`[Middleware] Fetching leave details for Employee ID: ${empId}`);

  try {
    // SAP OData leave request service
    const leaveServiceUrl = 'http://AZKTLDS5CP.kcloud.com:8000/sap/opu/odata/sap/ZEMP_RT_SRV/ZEMP_LEAVE_RTSet';

    // Construct URL with filter
    const filter = `EmpId eq '${empId}'`;
    const url = `${leaveServiceUrl}?$filter=${encodeURIComponent(filter)}&$format=json`;

    // SAP headers with basic auth
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'sap-client': sapClient,
      'Authorization': `Basic ${authString}`
    };

    console.log('[Middleware] Requesting leave details from SAP...');
    const response = await axios.get(url, { headers });

    if (response.data && response.data.d && Array.isArray(response.data.d.results)) {
      console.log(`[Middleware] Retrieved ${response.data.d.results.length} leave records for ${empId}`);
      res.json({
        success: true,
        empId: empId,
        leaveDetails: response.data.d.results
      });
    } else {
      console.warn(`[Middleware] No leave records found for Employee ID: ${empId}`);
      res.json({
        success: true,
        empId: empId,
        leaveDetails: []
      });
    }

  } catch (error) {
    console.error('[Middleware] Error fetching leave details from SAP:', error.message);

    if (error.response) {
      console.error('SAP Response Status:', error.response.status);
      res.status(error.response.status).json({
        error: 'SAP responded with an error.',
        details: error.response.data
      });
    } else if (error.request) {
      console.error('No response received from SAP:', error.request);
      res.status(500).json({ error: 'No response received from SAP. Check network or SAP server.' });
    } else {
      console.error('Error setting up the request:', error.message);
      res.status(500).json({ error: 'An unexpected error occurred.' });
    }
  }
});


// --- PAYSLIP DETAILS ENDPOINT ---
app.get('/api/payslip-details', async (req, res) => {
  const empId = req.query.empId;

  if (!empId) {
    console.warn('[Middleware] Employee ID missing in payslip request.');
    return res.status(400).json({ error: 'Employee ID is required.' });
  }

  console.log(`[Middleware] Fetching payslip details for Employee ID: ${empId}`);

  try {
    // SAP OData payslip service
    const payslipServiceUrl = 'http://AZKTLDS5CP.kcloud.com:8000/sap/opu/odata/sap/ZEMP_RT_SRV/ZEMP_PAYSLIPSet';

    // Construct OData filter
    const filter = `Emp_Id eq '${empId}'`;
    const url = `${payslipServiceUrl}?$filter=${encodeURIComponent(filter)}&$format=json`;

    // SAP headers with basic auth
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'sap-client': sapClient,
      'Authorization': `Basic ${authString}`
    };

    console.log('[Middleware] Requesting payslip details from SAP...');
    const response = await axios.get(url, { headers });

    if (response.data && response.data.d && Array.isArray(response.data.d.results)) {
      console.log(`[Middleware] Retrieved ${response.data.d.results.length} payslip records for ${empId}`);
      res.json({
        success: true,
        empId: empId,
        payslipDetails: response.data.d.results
      });
    } else {
      console.warn(`[Middleware] No payslip records found for Employee ID: ${empId}`);
      res.json({
        success: true,
        empId: empId,
        payslipDetails: []
      });
    }

  } catch (error) {
    console.error('[Middleware] Error fetching payslip details from SAP:', error.message);

    if (error.response) {
      console.error('SAP Response Status:', error.response.status);
      res.status(error.response.status).json({
        error: 'SAP responded with an error.',
        details: error.response.data
      });
    } else if (error.request) {
      console.error('No response received from SAP:', error.request);
      res.status(500).json({ error: 'No response received from SAP. Check network or SAP server.' });
    } else {
      console.error('Error setting up the request:', error.message);
      res.status(500).json({ error: 'An unexpected error occurred.' });
    }
  }
});



// Start the server
app.listen(PORT, () => {
  console.log(`Middleware server running on http://localhost:${PORT}`);
});
