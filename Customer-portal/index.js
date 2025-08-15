// index.js
require('dotenv').config(); // Ensure this is at the very top!

const express = require('express');
const axios = require('axios');
const xml2js = require('xml2js');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json()); // To parse JSON bodies from Angular frontend

// Log environment variables to confirm they are loaded
console.log('--- Environment Variables Loaded ---');
console.log('SAP_USER:', process.env.SAP_USER ? 'Loaded' : 'NOT LOADED');
console.log('SAP_PASS:', process.env.SAP_PASS ? 'Loaded' : 'NOT LOADED');
console.log('PORT:', process.env.PORT);
console.log('----------------------------------');


// Login route
app.post('/api/login', async (req, res) => {
    const { customerId, password } = req.body;

    console.log(`[Backend] Received login request for Customer ID: ${customerId}`);

    // Validate inputs
    if (!customerId || !password) {
        console.warn('[Backend] Validation Error: Customer ID or password missing.');
        return res.status(400).json({ error: 'Customer ID and password are required.' });
    }

    // Construct SOAP envelope
    const soapEnvelope = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                      xmlns:urn="urn:sap-com:document:sap:rfc:functions">
       <soapenv:Header/>
       <soapenv:Body>
         <urn:ZFM_CUSTOMER_PORTAL_LOGIN_RT>
            <IV_CUSTOMER_ID>${customerId}</IV_CUSTOMER_ID>
            <IV_PASSWORD>${password}</IV_PASSWORD>
         </urn:ZFM_CUSTOMER_PORTAL_LOGIN_RT>
       </soapenv:Body>
    </soapenv:Envelope>`;

    // SAP RFC Endpoint
    const sapEndpoint = 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zlogin_svce_defn_rt?sap-client=100';

    try {
        console.log(`[Backend] Sending SOAP request to SAP endpoint: ${sapEndpoint}`);
        console.log(`[Backend] SOAP Envelope: \n${soapEnvelope}`);
        console.log(`[Backend] Using SAP User: ${process.env.SAP_USER}`);

        // Define auth object for axios
        const authConfig = {
            username: process.env.SAP_USER,
            password: process.env.SAP_PASS // Ensure this matches your .env file key
        };
        console.log('[Backend] Auth config for login:', JSON.stringify(authConfig, null, 2));


        // Send SOAP request to SAP
        const response = await axios.post(sapEndpoint, soapEnvelope, {
            headers: {
                'Content-Type': 'text/xml',
                'Accept': 'text/xml',
                'SOAPAction': '' // Usually empty for SAP
            },
            auth: authConfig, // Use the defined auth object
            timeout: 15000 // Increased timeout for potentially slow SAP responses
        });

        console.log('[Backend] Received response from SAP.');
        console.log('[Backend] SAP Response Data (Raw):', response.data);

        // Parse SOAP XML response
        xml2js.parseString(response.data, { explicitArray: false }, (err, result) => {
            if (err) {
                console.error('[Backend] XML Parse Error:', err);
                return res.status(500).json({ error: 'Failed to parse SAP response XML.' });
            }

            try {
                const body = result['soap-env:Envelope']['soap-env:Body']; // Note: 'soap-env' namespace
                const loginResponse = body['n0:ZFM_CUSTOMER_PORTAL_LOGIN_RTResponse'];

                if (!loginResponse) {
                    console.error('[Backend] SAP Response Error: ZFM_CUSTOMER_PORTAL_LOGIN_RTResponse not found in XML.');
                    console.error('[Backend] Full Parsed XML Result:', JSON.stringify(result, null, 2));
                    return res.status(500).json({ error: 'Unexpected SAP response structure: Missing login response.' });
                }

                const evMessage = loginResponse['EV_MESSAGE'];
                const evStatus = loginResponse['EV_STATUS'];

                console.log(`[Backend] SAP Response - Message: "${evMessage}", Status: "${evStatus}"`);

                // Send final response to frontend
                res.json({ message: evMessage, status: evStatus });
            } catch (parseError) {
                console.error('[Backend] Response structure unexpected (during internal parsing):', parseError);
                console.error('[Backend] Full Parsed XML Result:', JSON.stringify(result, null, 2));
                res.status(500).json({ error: 'Unexpected SAP response structure during internal parsing.' });
            }
        });

    } catch (error) {
        console.error('[Backend] SAP login request failed:', error.message);
        if (error.response) {
            console.error('[Backend] SAP Response Status:', error.response.status);
            console.error('[Backend] SAP Response Data:', error.response.data);
            res.status(error.response.status).json({
                error: `SAP responded with status ${error.response.status}.`,
                details: error.response.data
            });
        } else if (error.request) {
            console.error('[Backend] No response received from SAP:', error.request);
            res.status(500).json({ error: 'No response received from SAP. Check network or SAP server.' });
        } else {
            console.error('[Backend] Error setting up SAP request:', error.message);
            res.status(500).json({ error: 'Error setting up SAP request.' });
        }
    }
});

// Profile route
app.post('/api/profile', async (req, res) => {
    const { customerId } = req.body;

    console.log(`[Backend] Received profile request for Customer ID: ${customerId}`);

    if (!customerId) {
        console.warn('[Backend] Validation Error: Customer ID missing for profile request.');
        return res.status(400).json({ error: 'Customer ID is required to fetch profile.' });
    }

    const sapProfileEndpoint = 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zprofile_service_defn_rt?sap-client=100';

    const soapEnvelope = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
       <soapenv:Header/>
       <soapenv:Body>
         <urn:ZfmCustomerPortalProfileTr>
            <IvKunnr>${customerId}</IvKunnr>
         </urn:ZfmCustomerPortalProfileTr>
       </soapenv:Body>
    </soapenv:Envelope>`;

    try {
        console.log(`[Backend] Sending SOAP profile request to SAP endpoint: ${sapProfileEndpoint}`);
        console.log(`[Backend] Profile SOAP Envelope: \n${soapEnvelope}`);
        console.log(`[Backend] Using SAP User: ${process.env.SAP_USER}`);

        // Define auth object for axios
        const authConfig = {
            username: process.env.SAP_USER,
            password: process.env.SAP_PASS // Ensure this matches your .env file key
        };
        console.log('[Backend] Auth config for profile:', JSON.stringify(authConfig, null, 2));

        const response = await axios.post(sapProfileEndpoint, soapEnvelope, {
            headers: {
                'Content-Type': 'text/xml',
                'Accept': 'text/xml',
                'SOAPAction': ''
            },
            auth: authConfig, // Use the defined auth object
            timeout: 15000
        });

        console.log('[Backend] Received profile response from SAP.');
        console.log('[Backend] SAP Profile Response Data (Raw):', response.data);

        xml2js.parseString(response.data, { explicitArray: false }, (err, result) => {
            if (err) {
                console.error('[Backend] Profile XML Parse Error:', err);
                return res.status(500).json({ error: 'Failed to parse SAP profile response XML.' });
            }

            try {
                // Adjusting for the 'soap-env' namespace and specific response structure
                const body = result['soap-env:Envelope']['soap-env:Body'];
                const profileResponse = body['n0:ZfmCustomerPortalProfileTrResponse'];

                if (!profileResponse) {
                    console.error('[Backend] SAP Profile Response Error: ZfmCustomerPortalProfileTrResponse not found in XML.');
                    console.error('[Backend] Full Parsed Profile XML Result:', JSON.stringify(result, null, 2));
                    return res.status(500).json({ error: 'Unexpected SAP profile response structure: Missing profile response.' });
                }

                const evCustomerProfile = profileResponse['EvCustomerProfile'];
                const evMessage = profileResponse['EvMessage'];
                const evStatus = profileResponse['EvStatus'];

                // Map SAP's response structure to your frontend's CustomerProfile interface
                const customerProfile = {
                    KUNNR: evCustomerProfile?.Kunnr || '',
                    NAME: evCustomerProfile?.Name || '',
                    ADDRESS: evCustomerProfile?.Address || '',
                    CITY: evCustomerProfile?.City || '',
                    STREET: evCustomerProfile?.Street || '',
                    POSTAL_CODE: evCustomerProfile?.PostalCode || ''
                };

                console.log(`[Backend] SAP Profile Response - Message: "${evMessage}", Status: "${evStatus}"`);
                console.log('[Backend] Parsed Customer Profile:', customerProfile);

                res.json({
                    profile: customerProfile,
                    message: evMessage,
                    status: evStatus
                });

            } catch (parseError) {
                console.error('[Backend] Profile response structure unexpected (during internal parsing):', parseError);
                console.error('[Backend] Full Parsed Profile XML Result:', JSON.stringify(result, null, 2));
                res.status(500).json({ error: 'Unexpected SAP response structure during internal parsing.' });
            }
        });

    } catch (error) {
        console.error('[Backend] SAP profile request failed:', error.message);
        if (error.response) {
            console.error('[Backend] SAP Response Status:', error.response.status);
            console.error('[Backend] SAP Response Data:', error.response.data);
            res.status(error.response.status).json({
                error: `SAP responded with status ${error.response.status}.`,
                details: error.response.data
            });
        } else if (error.request) {
            console.error('[Backend] No response received from SAP for profile:', error.request);
            res.status(500).json({ error: 'No response received from SAP for profile. Check network or SAP server.' });
        } else {
            console.error('[Backend] Error setting up SAP request:', error.message);
            res.status(500).json({ error: 'Error setting up SAP request.' });
        }
    }
});

// ROUTE TO Fetch Customer Inquiry Data
app.post('/api/inquiry', async (req, res) => {
    const { customerId } = req.body;

    console.log(`[Backend] Received inquiry request for Customer ID: ${customerId}`);

    if (!customerId) {
        console.warn('[Backend] Validation Error: Customer ID missing for inquiry request.');
        return res.status(400).json({ error: 'Customer ID is required to fetch inquiry data.' });
    }

    const sapInquiryEndpoint = 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zinquiry_srvc_defn_rt?sap-client=100';

    const soapEnvelope = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
       <soapenv:Header/>
       <soapenv:Body>
         <urn:ZfmCustomerPortalInquiryRt>
            <IvKunnr>${customerId}</IvKunnr>
         </urn:ZfmCustomerPortalInquiryRt>
       </soapenv:Body>
    </soapenv:Envelope>`;

    try {
        console.log(`[Backend] Sending SOAP inquiry request to SAP endpoint: ${sapInquiryEndpoint}`);
        console.log(`[Backend] Inquiry SOAP Envelope: \n${soapEnvelope}`);
        console.log(`[Backend] Using SAP User: ${process.env.SAP_USER}`);

        // Define auth object for axios
        const authConfig = {
            username: process.env.SAP_USER,
            password: process.env.SAP_PASS // Ensure this matches your .env file key
        };
        console.log('[Backend] Auth config for inquiry:', JSON.stringify(authConfig, null, 2));

        const response = await axios.post(sapInquiryEndpoint, soapEnvelope, {
            headers: {
                'Content-Type': 'text/xml',
                'Accept': 'text/xml',
                'SOAPAction': ''
            },
            auth: authConfig, // Use the defined auth object
            timeout: 15000
        });

        console.log('[Backend] Received inquiry response from SAP.');
        console.log('[Backend] SAP Inquiry Response Data (Raw):', response.data);

        // CHANGE HERE: explicitArray: false for the main parsing
        xml2js.parseString(response.data, { explicitArray: false }, (err, result) => {
            if (err) {
                console.error('[Backend] Inquiry XML Parse Error:', err);
                return res.status(500).json({ error: 'Failed to parse SAP inquiry response XML.' });
            }

            try {
                console.log('[Backend] XML parsed successfully. Result (with explicitArray: false):', JSON.stringify(result, null, 2));
                const body = result['soap-env:Envelope']['soap-env:Body'];
                // This should now correctly find the element without the array wrapper
                const inquiryResponse = body['n0:ZfmCustomerPortalInquiryRtResponse'];

                if (!inquiryResponse) {
                    console.error('[Backend] SAP Inquiry Response Error: ZfmCustomerPortalInquiryRtResponse not found in XML.');
                    console.error('[Backend] Full Parsed Inquiry XML Result (explicitArray: false):', JSON.stringify(result, null, 2));
                    return res.status(500).json({ error: 'Unexpected SAP inquiry response structure: Missing inquiry response.' });
                }

                const evCustomerInquiry = inquiryResponse['EvCustomerInquiry'];
                console.log('[Backend] Extracted EvCustomerInquiry:', JSON.stringify(evCustomerInquiry, null, 2));

                let inquiryItems = [];
                if (evCustomerInquiry && evCustomerInquiry.item) {
                    // With explicitArray: false, if there's only one 'item', it won't be an array.
                    // So, ensure it's always an array for consistent mapping.
                    inquiryItems = Array.isArray(evCustomerInquiry.item) ? evCustomerInquiry.item : [evCustomerInquiry.item];
                }
                console.log('[Backend] Processed inquiryItems (before mapping):', JSON.stringify(inquiryItems, null, 2));

                const inquiries = inquiryItems.map((item) => {
                    if (!item) {
                        console.warn('[Backend] Skipping undefined/null item in inquiryItems map.');
                        return null;
                    }
                    console.log('[Backend] Mapping item:', JSON.stringify(item, null, 2));
                    // REMOVED .[0] for individual properties as explicitArray: false means they are not arrays
                    return {
                        SALES_DOC_NO: item.SalesDocNo || '',
                        CREATION_DATE: item.CreationDate || '',
                        CUSTOMER_ID: item.CustomerId || '',
                        SALES_GRP: item.SalesGrp || '',
                        DOC_ITEM: item.DocItem || '',
                        MATERIAL_NO: item.MaterialNo || '', // SAP is sending units here, not material numbers
                        DESCRIPTION: item.Description || '',
                        VRKME: item.Vrkme || '', // SAP is sending units here
                        MEASUREMENT_UNIT: item.MeasurementUnit || ''
                    };
                }).filter(item => item !== null);

                console.log('[Backend] Parsed Customer Inquiries (before sending):', JSON.stringify(inquiries, null, 2));

                try {
                    res.json({
                        inquiries: inquiries,
                        message: inquiryResponse['EvMessage'] || 'Inquiry data fetched.',
                        status: inquiryResponse['EvStatus'] || 'S'
                    });
                    console.log('[Backend] Successfully sent JSON response to frontend.');
                } catch (sendError) {
                    console.error('[Backend] Error sending JSON response to frontend:', sendError);
                    res.status(500).json({ error: 'Error sending final JSON response.' });
                }


            } catch (parseError) {
                console.error('[Backend] Inquiry response structure unexpected (during internal parsing):', parseError);
                console.error('[Backend] Full Parsed Inquiry XML Result:', JSON.stringify(result, null, 2));
                res.status(500).json({ error: 'Unexpected SAP inquiry response structure during internal parsing.' });
            }
        });

    } catch (error) {
        console.error('[Backend] SAP inquiry request failed:', error.message);
        if (error.response) {
            console.error('[Backend] SAP Inquiry Response Status:', error.response.status);
            console.error('[Backend] SAP Inquiry Response Data:', error.response.data);
            res.status(error.response.status).json({
                error: `SAP responded with status ${error.response.status}.`,
                details: error.response.data
            });
        } else if (error.request) {
            console.error('[Backend] No response received from SAP for inquiry:', error.request);
            res.status(500).json({ error: 'No response received from SAP for inquiry. Check network or SAP server.' });
        } else {
            console.error('[Backend] Error setting up SAP inquiry request:', error.message);
            res.status(500).json({ error: 'Error setting up SAP request.' });
        }
    }
});


// // ROUTE TO Fetch Customer Sales Order Data
// app.post('/api/sales-orders', async (req, res) => {
//     const { customerId } = req.body;

//     console.log(`[Backend] Received sales order request for Customer ID: ${customerId}`);

//     if (!customerId) {
//         console.warn('[Backend] Validation Error: Customer ID missing for sales order request.');
//         return res.status(400).json({ error: 'Customer ID is required to fetch sales order data.' });
//     }

//     const sapSalesOrderEndpoint = 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zdelivery_srvc_defn_rt?sap-client=100';

//     //const soapEnvelope = `
//     const soapEnvelope = `
//         <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
//                         xmlns:urn="urn:sap-com:document:sap:rfc:functions">
//             <soapenv:Header/>
//             <soapenv:Body>
//                 <urn:ZFM_CUSTOMER_PORTAL_SALESORDER>
//                     <IV_CUSTOMER_ID>${customerId}</IV_CUSTOMER_ID>
//                 </urn:ZFM_CUSTOMER_PORTAL_SALESORDER>
//             </soapenv:Body>
//             </soapenv:Envelope>`;
//     // <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
//     //    <soapenv:Header/>
//     //    <soapenv:Body>
//     //       <urn:ZfmCustomerPortalSalesorder>
//     //          <IvKunnr>${customerId}</IvKunnr>
//     //       </urn:ZfmCustomerPortalSalesorder>
//     //    </soapenv:Body>
//     // </soapenv:Envelope>`;

//     try {
//         console.log(`[Backend] Sending SOAP sales order request to SAP endpoint: ${sapSalesOrderEndpoint}`);

//         const response = await axios.post(sapSalesOrderEndpoint, soapEnvelope, {
//             headers: {
//                 'Content-Type': 'text/xml',
//                 'Accept': 'text/xml',
//                 'SOAPAction': ''
//             },
//             auth: {
//                 username: process.env.SAP_USER,
//                 password: process.env.SAP_PASS
//             },
//             timeout: 15000
//         });

//         console.log('[Backend] Received sales order response from SAP.');

//         xml2js.parseString(response.data, { explicitArray: false }, (err, result) => {
//             if (err) {
//                 console.error('[Backend] Sales Order XML Parse Error:', err);
//                 return res.status(500).json({ error: 'Failed to parse SAP sales order response XML.' });
//             }

//             try {
//                 const body = result['soap-env:Envelope']['soap-env:Body'];
//                 const responseData = body['n0:ZfmCustomerPortalSalesorderResponse'];

//                 if (!responseData || !responseData.EvCustomerSalesorder) {
//                     console.error('[Backend] Sales Order response missing expected data.');
//                     return res.status(500).json({ error: 'Unexpected SAP sales order response structure.' });
//                 }

//                 const salesOrderItems = responseData.EvCustomerSalesorder.item;
//                 const items = Array.isArray(salesOrderItems) ? salesOrderItems : [salesOrderItems];

//                 const orders = items.map(item => ({
//                     CUSTOMER_ID: item.CustomerId || '',
//                     DOC_NUM: item.DocNum || '',
//                     SALES_DOC_TYPE: item.SalesDocType || '',
//                     SALES_ORG: item.SalesOrg || '',
//                     DISTRIBUTION_CHANNEL: item.DistributionChannel || '',
//                     ITEM_NUM: item.ItemNum || '',
//                     SALES_ORDER_ITEM: item.SalesOrderItem || '',
//                     LINE_NUM: item.LineNum || '',
//                     DELIVERY_DATE: item.DeliveryDate || '',
//                     QUANTITY: item.Quantity || '',
//                     ISSUE_DATE: item.IssueDate || ''
//                 }));

//                 console.log('[Backend] Successfully parsed and sending sales order data:', JSON.stringify(orders, null, 2));
//                 res.json(orders);
//             } catch (parseError) {
//                 console.error('[Backend] Sales Order parsing failed:', parseError);
//                 res.status(500).json({ error: 'Unexpected structure in SAP sales order response.' });
//             }
//         });

//     } catch (error) {
//         console.error('[Backend] SAP sales order request failed:', error.message);
//         if (error.response) {
//             res.status(error.response.status).json({
//                 error: `SAP responded with status ${error.response.status}.`,
//                 details: error.response.data
//             });
//         } else if (error.request) {
//             res.status(500).json({ error: 'No response received from SAP for sales order request.' });
//         } else {
//             res.status(500).json({ error: 'Error setting up SAP request for sales orders.' });
//         }
//     }
// });

// app.post('/api/salesorders', async (req, res) => {
//     const { customerId } = req.body;

//     if (!customerId) {
//         return res.status(400).json({ error: 'Customer ID is required' });
//     }

//     const soapEnvelope = `
//     <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
//                       xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
//        <soapenv:Header/>
//        <soapenv:Body>
//           <urn:ZfmCustomerPortalSalesorder>
//              <IvKunnr>${customerId}</IvKunnr>
//           </urn:ZfmCustomerPortalSalesorder>
//        </soapenv:Body>
//     </soapenv:Envelope>`;

//     const url = 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zdelivery_srvc_defn_rt?sap-client=100';

//     try {
//         const response = await axios.post(url, soapEnvelope, {
//             headers: {
//                 'Content-Type': 'text/xml',
//                 'Accept': 'text/xml',
//                 'SOAPAction': ''
//             },
//             auth: {
//                 username: process.env.SAP_USER,
//                 password: process.env.SAP_PASS
//             },
//             timeout: 15000
//         });

//         xml2js.parseString(response.data, { explicitArray: false }, (err, result) => {
//             if (err) {
//                 return res.status(500).json({ error: 'Failed to parse SAP response' });
//             }

//             const body = result['soap-env:Envelope']['soap-env:Body'];
//             const responseData = body['n0:ZfmCustomerPortalSalesorderResponse'];

//             if (!responseData || !responseData.EvCustomerSalesorder) {
//                 return res.status(500).json({ error: 'Invalid SAP response structure' });
//             }

//             let items = responseData.EvCustomerSalesorder.item || [];

//             if (!Array.isArray(items)) {
//                 items = [items]; // Wrap single item as array
//             }

//             const orders = items.map(item => ({
//                 CUSTOMER_ID: item.CustomerId || '',
//                 DOC_NUM: item.DocNum || '',
//                 SALES_DOC_TYPE: item.SalesDocType || '',
//                 SALES_ORG: item.SalesOrg || '',
//                 DISTRIBUTION_CHANNEL: item.DistributionChannel || '',
//                 ITEM_NUM: item.ItemNum || '',
//                 SALES_ORDER_ITEM: item.SalesOrderItem || '',
//                 LINE_NUM: item.LineNum || '',
//                 DELIVERY_DATE: item.DeliveryDate || '',
//                 QUANTITY: item.Quantity || '',
//                 ISSUE_DATE: item.IssueDate || ''
//             }));

//             res.json(orders);
//         });
//     } catch (error) {
//         console.error('SAP sales order request failed:', error.message);

//         if (error.response) {
//             return res.status(error.response.status).json({
//                 error: `SAP responded with status ${error.response.status}.`,
//                 details: error.response.data
//             });
//         } else if (error.request) {
//             return res.status(500).json({ error: 'No response received from SAP.' });
//         } else {
//             return res.status(500).json({ error: 'Error setting up SAP request.' });
//         }
//     }
// });


// NEW ROUTE: Fetch Customer Sales Order Data
// app.post('/api/sales-order', async (req, res) => {
//     const { customerId } = req.body;

//     console.log(`[Backend] Received sales order request for Customer ID: ${customerId}`);

//     if (!customerId) {
//         console.warn('[Backend] Validation Error: Customer ID missing for sales order request.');
//         return res.status(400).json({ error: 'Customer ID is required to fetch sales order data.' });
//     }

//     const sapSalesOrderEndpoint = 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zsalesdata_srvc_defn_rt?sap-client=100';

//     const soapEnvelope = `
//     <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
//        <soapenv:Header/>
//        <soapenv:Body>
//          <urn:ZfmCustomerPortalSalesorder>
//             <IvKunnr>${customerId}</IvKunnr>
//          </urn:ZfmCustomerPortalSalesorder>
//        </soapenv:Body>
//     </soapenv:Envelope>`;

//     try {
//         console.log(`[Backend] Sending SOAP sales order request to SAP endpoint: ${sapSalesOrderEndpoint}`);
//         console.log(`[Backend] Sales Order SOAP Envelope: \n${soapEnvelope}`);
//         console.log(`[Backend] Using SAP User: ${process.env.SAP_USER}`);

//         // Define auth object for axios
//         const authConfig = {
//             username: process.env.SAP_USER,
//             password: process.env.SAP_PASS
//         };
//         // THIS IS THE MISSING LINE!
//         // console.log('[Backend] Auth config for sales order:', JSON.stringify(authConfig, null, 2));


//         const response = await axios.post(sapSalesOrderEndpoint, soapEnvelope, {
//             headers: {
//                 'Content-Type': 'text/xml',
//                 'Accept': 'text/xml',
//                 'SOAPAction': ''
//             },
//             // auth: {
//             //     username: process.env.SAP_USER,
//             //     password: process.env.SAP_PASS
//             // },
//             auth: authConfig,
//             timeout: 15000
//         });

//         console.log('[Backend] Received sales order response from SAP.');
//         console.log('[Backend] SAP Sales Order Response Data (Raw):', response.data);

//         xml2js.parseString(response.data, { explicitArray: false }, (err, result) => {
//             if (err) {
//                 console.error('[Backend] Sales Order XML Parse Error:', err);
//                 return res.status(500).json({ error: 'Failed to parse SAP sales order response XML.' });
//             }

//             try {
//                 console.log('[Backend] Sales Order XML parsed successfully. Result (with explicitArray: false):', JSON.stringify(result, null, 2));
//                 const body = result['soap-env:Envelope']['soap-env:Body'];
//                 const salesOrderResponse = body['n0:ZfmCustomerPortalSalesorderResponse'];

//                 if (!salesOrderResponse) {
//                     console.error('[Backend] SAP Sales Order Response Error: ZfmCustomerPortalSalesorderResponse not found in XML.');
//                     console.error('[Backend] Full Parsed Sales Order XML Result (explicitArray: false):', JSON.stringify(result, null, 2));
//                     return res.status(500).json({ error: 'Unexpected SAP sales order response structure: Missing sales order response.' });
//                 }

//                 const evCustomerSalesorder = salesOrderResponse['EvCustomerSalesorder'];
//                 console.log('[Backend] Extracted EvCustomerSalesorder:', JSON.stringify(evCustomerSalesorder, null, 2));

//                 let salesOrderItems = [];
//                 if (evCustomerSalesorder && evCustomerSalesorder.item) {
//                     // Ensure 'item' is always an array, even if there's only one item
//                     salesOrderItems = Array.isArray(evCustomerSalesorder.item) ? evCustomerSalesorder.item : [evCustomerSalesorder.item];
//                 }
//                 console.log('[Backend] Processed salesOrderItems (before mapping):', JSON.stringify(salesOrderItems, null, 2));

//                 const salesOrders = salesOrderItems.map((item) => {
//                     if (!item) {
//                         console.warn('[Backend] Skipping undefined/null item in salesOrderItems map.');
//                         return null;
//                     }
//                     console.log('[Backend] Mapping sales order item:', JSON.stringify(item, null, 2));
//                     return {
//                         CustomerId: item.CustomerId || '',
//                         DocNum: item.DocNum || '',
//                         SalesDocType: item.SalesDocType || '',
//                         SalesOrg: item.SalesOrg || '',
//                         DistributionChannel: item.DistributionChannel || '',
//                         ItemNum: item.ItemNum || '',
//                         SalesOrderItem: item.SalesOrderItem || '',
//                         LineNum: item.LineNum || '',
//                         DeliveryDate: item.DeliveryDate || '',
//                         Quantity: item.Quantity || '0.0', // Default to '0.0' if not present
//                         IssueDate: item.IssueDate || ''
//                     };
//                 }).filter(item => item !== null);

//                 console.log('[Backend] Parsed Customer Sales Orders (before sending):', JSON.stringify(salesOrders, null, 2));

//                 try {
//                     res.json(salesOrders); // Send the array directly, as frontend expects SalesOrderData[]
//                     console.log('[Backend] Successfully sent JSON response to frontend.');
//                 } catch (sendError) {
//                     console.error('[Backend] Error sending JSON response to frontend:', sendError);
//                     res.status(500).json({ error: 'Error sending final JSON response.' });
//                 }

//             } catch (parseError) {
//                 console.error('[Backend] Sales Order response structure unexpected (during internal parsing):', parseError);
//                 console.error('[Backend] Full Parsed Sales Order XML Result:', JSON.stringify(result, null, 2));
//                 res.status(500).json({ error: 'Unexpected SAP sales order response structure during internal parsing.' });
//             }
//         });

//     } catch (error) {
//         console.error('[Backend] SAP sales order request failed:', error.message);
//         if (error.response) {
//             console.error('[Backend] SAP Response Status:', error.response.status);
//             console.error('[Backend] SAP Response Data:', error.response.data);
//             res.status(error.response.status).json({
//                 error: `SAP responded with status ${error.response.status}.`,
//                 details: error.response.data
//             });
//         } else if (error.request) {
//             console.error('[Backend] No response received from SAP for sales order:', error.request);
//             res.status(500).json({ error: 'No response received from SAP for sales order. Check network or SAP server.' });
//         } else {
//             console.error('[Backend] Error setting up SAP request:', error.message);
//             res.status(500).json({ error: 'Error setting up SAP request.' });
//         }
//     }
// });



// NEW ROUTE: Fetch Customer Delivery Data
app.post('/api/delivery', async (req, res) => {
    const { customerId } = req.body;

    console.log(`[Backend] Received delivery request for Customer ID: ${customerId}`);

    if (!customerId) {
        console.warn('[Backend] Validation Error: Customer ID missing for delivery request.');
        return res.status(400).json({ error: 'Customer ID is required to fetch delivery data.' });
    }

    const sapDeliveryEndpoint = 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zdelivery_srvc_defn_rt?sap-client=100';

    const soapEnvelope = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
       <soapenv:Header/>
       <soapenv:Body>
         <urn:ZfmCustomerPortalDeliveryR>
            <IvKunnr>${customerId}</IvKunnr>
         </urn:ZfmCustomerPortalDeliveryR>
       </soapenv:Body>
    </soapenv:Envelope>`;

    try {
        console.log(`[Backend] Sending SOAP delivery request to SAP endpoint: ${sapDeliveryEndpoint}`);
        console.log(`[Backend] Delivery SOAP Envelope: \n${soapEnvelope}`);
        console.log(`[Backend] Using SAP User: ${process.env.SAP_USER}`);

        // Define auth object for axios
        const authConfig = {
            username: process.env.SAP_USER,
            password: process.env.SAP_PASS
        };
        console.log('[Backend] Auth config for delivery:', JSON.stringify(authConfig, null, 2));


        const response = await axios.post(sapDeliveryEndpoint, soapEnvelope, {
            headers: {
                'Content-Type': 'text/xml',
                'Accept': 'text/xml',
                'SOAPAction': ''
            },
            auth: authConfig,
            timeout: 15000
        });

        console.log('[Backend] Received delivery response from SAP.');
        console.log('[Backend] SAP Delivery Response Data (Raw):', response.data);

        xml2js.parseString(response.data, { explicitArray: false }, (err, result) => {
            if (err) {
                console.error('[Backend] Delivery XML Parse Error:', err);
                return res.status(500).json({ error: 'Failed to parse SAP delivery response XML.' });
            }

            try {
                console.log('[Backend] Delivery XML parsed successfully. Result (with explicitArray: false):', JSON.stringify(result, null, 2));
                const body = result['soap-env:Envelope']['soap-env:Body'];
                const deliveryResponse = body['n0:ZfmCustomerPortalDeliveryRResponse'];

                if (!deliveryResponse) {
                    console.error('[Backend] SAP Delivery Response Error: ZfmCustomerPortalDeliveryRResponse not found in XML.');
                    console.error('[Backend] Full Parsed Delivery XML Result (explicitArray: false):', JSON.stringify(result, null, 2));
                    return res.status(500).json({ error: 'Unexpected SAP delivery response structure: Missing delivery response.' });
                }

                const evCustomerDelivery = deliveryResponse['EvCustomerDelivery'];
                console.log('[Backend] Extracted EvCustomerDelivery:', JSON.stringify(evCustomerDelivery, null, 2));

                let deliveryItems = [];
                if (evCustomerDelivery && evCustomerDelivery.item) {
                    // Ensure 'item' is always an array, even if there's only one item
                    deliveryItems = Array.isArray(evCustomerDelivery.item) ? evCustomerDelivery.item : [evCustomerDelivery.item];
                }
                console.log('[Backend] Processed deliveryItems (before mapping):', JSON.stringify(deliveryItems, null, 2));

                const deliveries = deliveryItems.map((item) => {
                    if (!item) {
                        console.warn('[Backend] Skipping undefined/null item in deliveryItems map.');
                        return null;
                    }
                    console.log('[Backend] Mapping delivery item:', JSON.stringify(item, null, 2));
                    return {
                        DocNum: item.DocNum || '',
                        CreationDate: item.CreationDate || '',
                        DeliveryType: item.DeliveryType || '',
                        DeliveryDate: item.DeliveryDate || '',
                        GoodsIssueDate: item.GoodsIssueDate || '',
                        ReceivingPoint: item.ReceivingPoint || '',
                        SalesOrg: item.SalesOrg || '',
                        ItemNum: item.ItemNum || '',
                        MaterialNum: item.MaterialNum || '',
                        Plant: item.Plant || '',
                        StorageLoc: item.StorageLoc || '',
                        MaterialEntered: item.MaterialEntered || ''
                    };
                }).filter(item => item !== null);

                console.log('[Backend] Parsed Customer Deliveries (before sending):', JSON.stringify(deliveries, null, 2));

                try {
                    res.json(deliveries); // Send the array directly, as frontend expects DeliveryData[]
                    console.log('[Backend] Successfully sent JSON response to frontend.');
                } catch (sendError) {
                    console.error('[Backend] Error sending JSON response to frontend:', sendError);
                    res.status(500).json({ error: 'Error sending final JSON response.' });
                }

            } catch (parseError) {
                console.error('[Backend] Delivery response structure unexpected (during internal parsing):', parseError);
                console.error('[Backend] Full Parsed Delivery XML Result:', JSON.stringify(result, null, 2));
                res.status(500).json({ error: 'Unexpected SAP delivery response structure during internal parsing.' });
            }
        });

    } catch (error) {
        console.error('[Backend] SAP delivery request failed:', error.message);
        if (error.response) {
            console.error('[Backend] SAP Response Status:', error.response.status);
            console.error('[Backend] SAP Response Data:', error.response.data);
            res.status(error.response.status).json({
                error: `SAP responded with status ${error.response.status}.`,
                details: error.response.data
            });
        } else if (error.request) {
            console.error('[Backend] No response received from SAP for delivery:', error.request);
            res.status(500).json({ error: 'No response received from SAP for delivery. Check network or SAP server.' });
        } else {
            console.error('[Backend] Error setting up SAP delivery request:', error.message);
            res.status(500).json({ error: 'Error setting up SAP request.' });
        }
    }
});



// NEW ROUTE: Fetch Credit/Debit Memo Data
app.post('/api/credit-memo', async (req, res) => {
  const { customerId } = req.body;

  console.log(`[Backend] Received credit memo request for Customer ID: ${customerId}`);
  if (!customerId) {
    return res.status(400).json({ error: 'Customer ID is required to fetch credit/debit memo data.' });
  }

  const sapMemoEndpoint = 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zcredit_memo_srvc_defn_rt?sap-client=100';

  const soapEnvelope = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
      <soapenv:Header/>
      <soapenv:Body>
        <urn:ZfmCustomerPortalCreditRt>
          <IvKunnr>${customerId}</IvKunnr>
        </urn:ZfmCustomerPortalCreditRt>
      </soapenv:Body>
    </soapenv:Envelope>`;

  try {
    const response = await axios.post(sapMemoEndpoint, soapEnvelope, {
      headers: {
        'Content-Type': 'text/xml',
        'Accept': 'text/xml',
        'SOAPAction': ''
      },
      auth: {
        username: process.env.SAP_USER,
        password: process.env.SAP_PASS
      },
      timeout: 15000
    });

    xml2js.parseString(response.data, { explicitArray: false }, (err, result) => {

        console.log('SAP Credit Memo Response (Parsed):', JSON.stringify(result, null, 2));
      if (err) {
        console.error('[Backend] Memo XML Parse Error:', err);
        return res.status(500).json({ error: 'Failed to parse SAP memo response XML.' });
      }
      console.log('SAP Credit Memo Response (Parsed):', result);


      try {
        
        try {
            const body = result['soap-env:Envelope']['soap-env:Body'];
            const memoResponse = body['n0:ZfmCustomerPortalCreditRtResponse'];
            const memoList = memoResponse?.EvCustomerCreditMemo?.item || [];

            console.log('[Backend] Extracted credit/debit memo list:', memoList);

            // ✅ Send only once here
            return res.json(memoList);
            } catch (error) {
            console.error('[Backend] Error extracting memo data:', error);

            // ✅ Send error only if above failed
            if (!res.headersSent) {
                return res.status(500).json({ message: 'Failed to extract credit/debit memos.' });
            }
        }



        let memoItems = [];
        if (evMemoList?.item) {
          memoItems = Array.isArray(evMemoList.item) ? evMemoList.item : [evMemoList.item];
        }

        const parsedMemos = memoItems.map((item) => ({
          DOC_NUM: item.DocNum || '',
          SOLD_TO_PARTY: item.SoldToParty || '',
          BILLING_DATE: item.BillingDate || '',
          BILLING_TYPE: item.BillingType || '',
          DIVISION: item.Division || '',
          TERMS: item.Terms || '',
          REF_DOC_NUM: item.RefDocNum || '',
          ASSIGNMENT_NUM: item.AssignmentNum || '',
          ITEM_NUM: item.ItemNum || '',
          MATERIAL_NUM: item.MaterialNum || '',
          INVOICED_QNTY: item.InvoicedQnty || '',
          UNIT: item.Unit || ''
        }));

        res.json(parsedMemos);
      } catch (parseErr) {
        console.error('[Backend] Error extracting memo data:', parseErr);
        res.status(500).json({ error: 'Unexpected structure in SAP memo response.' });
      }
    });

  } catch (error) {
    console.error('[Backend] SAP memo request failed:', error.message);
    if (error.response) {
      return res.status(error.response.status).json({
        error: `SAP responded with status ${error.response.status}.`,
        details: error.response.data
      });
    } else if (error.request) {
      return res.status(500).json({ error: 'No response received from SAP for memo request.' });
    } else {
      return res.status(500).json({ error: 'Error setting up SAP memo request.' });
    }
  }
});




// Route: /api/aging-data
app.post('/api/aging-data', async (req, res) => {
  const { customerId } = req.body;

  console.log(`[Backend] Received aging data request for Customer ID: ${customerId}`);
  if (!customerId) {
    return res.status(400).json({ error: 'Customer ID is required to fetch aging data.' });
  }

  const sapAgingEndpoint = 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zageing_srvc_defn_rt?sap-client=100';

  const soapEnvelope = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
      <soapenv:Header/>
      <soapenv:Body>
        <urn:ZfmCustomerPortalAgeingRt>
          <IvKunnr>${customerId}</IvKunnr>
        </urn:ZfmCustomerPortalAgeingRt>
      </soapenv:Body>
    </soapenv:Envelope>`;

  try {
    const response = await axios.post(sapAgingEndpoint, soapEnvelope, {
      headers: {
        'Content-Type': 'text/xml',
        'Accept': 'text/xml',
        'SOAPAction': ''
      },
      auth: {
        username: process.env.SAP_USER, // set these in your .env file
        password: process.env.SAP_PASS
      },
      timeout: 15000
    });

    xml2js.parseString(response.data, { explicitArray: false }, (err, result) => {
      if (err) {
        console.error('[Backend] Aging XML Parse Error:', err);
        return res.status(500).json({ error: 'Failed to parse SAP aging response XML.' });
      }

      try {
        const body = result['soap-env:Envelope']['soap-env:Body'];
        const agingResponse = body['n0:ZfmCustomerPortalAgeingRtResponse'];
        const itemList = agingResponse?.EtAgeingData?.item || [];

        const parsedAgingData = Array.isArray(itemList) ? itemList : [itemList];

        const formattedData = parsedAgingData.map((item) => ({
          FUNC_CODE: item.FuncCode || '',
          DOC_NUM: item.DocNum || '',
          BILLING_DATE: item.BillingDate || '',
          NET_AMT: item.NetAmt || '',
          SD_DOC_CURRENCY: item.SdDocCurrency || ''
        }));

        console.log('[Backend] Extracted aging data:', formattedData);
        return res.json(formattedData);
      } catch (parseErr) {
        console.error('[Backend] Error extracting aging data:', parseErr);
        return res.status(500).json({ error: 'Unexpected structure in SAP aging response.' });
      }
    });

  } catch (error) {
    console.error('[Backend] SAP aging request failed:', error.message);
    if (error.response) {
      return res.status(error.response.status).json({
        error: `SAP responded with status ${error.response.status}.`,
        details: error.response.data
      });
    } else if (error.request) {
      return res.status(500).json({ error: 'No response received from SAP for aging request.' });
    } else {
      return res.status(500).json({ error: 'Error setting up SAP aging request.' });
    }
  }
});

// Route: /api/overall-sales-data
app.post('/api/overall-sales-data', async (req, res) => {
  const { customerId } = req.body;

  console.log(`[Backend] Received overall sales data request for Customer ID: ${customerId}`);
  if (!customerId) {
    return res.status(400).json({ error: 'Customer ID is required to fetch overall sales data.' });
  }

  const sapSalesEndpoint = 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zsalesdata_srvc_defn_rt?sap-client=100';

  const soapEnvelope = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
      <soapenv:Header/>
      <soapenv:Body>
        <urn:ZfmCustomerPortalSalesdata>
          <IvKunnr>${customerId.padStart(10, '0')}</IvKunnr>
        </urn:ZfmCustomerPortalSalesdata>
      </soapenv:Body>
    </soapenv:Envelope>`;

  try {
    const response = await axios.post(sapSalesEndpoint, soapEnvelope, {
      headers: {
        'Content-Type': 'text/xml',
        'Accept': 'text/xml',
        'SOAPAction': ''
      },
      auth: {
        username: process.env.SAP_USER, // Use your actual username/password or .env
        password: process.env.SAP_PASS
      },
      timeout: 15000
    });

    xml2js.parseString(response.data, { explicitArray: false }, (err, result) => {
      if (err) {
        console.error('[Backend] Sales XML Parse Error:', err);
        return res.status(500).json({ error: 'Failed to parse SAP sales data XML.' });
      }

      try {
        const body = result['soap-env:Envelope']['soap-env:Body'];
        const salesResponse = body['n0:ZfmCustomerPortalSalesdataResponse'];
        const itemList = salesResponse?.EvCustomerSalesdata?.item || [];

        const parsedSalesData = Array.isArray(itemList) ? itemList : [itemList];

        const formattedData = parsedSalesData.map((item) => ({
          CUSTOMER_ID: customerId,
          DOC_NUM: item.DocNum || '',
          DOC_TYPE: item.DocType || '',
          SALES_ORG: item.SalesOrg || '',
          ITEM_NUM: item.ItemNum || '',
          SALES_UNIT: item.SalesUnit || '',
          NET_PRICE: item.NetPrice || '',
          NET_VALUE: item.NetValue || '',
          SD_DOC_CURRENCY: item.SdDocCurrency || '',
          COST: item.Cost || '',
          LINE_NUM: item.LineNum || '',
          DELIVERY_DATE: item.DeliveryDate || '',
          QUANTITY: item.Quantity || '',
          GOODS_ISSUED_DATE: item.GoodsIssuedDate || ''
        }));

        console.log('[Backend] Extracted overall sales data:', formattedData);
        return res.json(formattedData);
      } catch (parseErr) {
        console.error('[Backend] Error extracting overall sales data:', parseErr);
        return res.status(500).json({ error: 'Unexpected structure in SAP sales response.' });
      }
    });

  } catch (error) {
    console.error('[Backend] SAP sales data request failed:', error.message);
    if (error.response) {
      return res.status(error.response.status).json({
        error: `SAP responded with status ${error.response.status}.`,
        details: error.response.data
      });
    } else if (error.request) {
      return res.status(500).json({ error: 'No response received from SAP for sales data request.' });
    } else {
      return res.status(500).json({ error: 'Error setting up SAP sales data request.' });
    }
  }
});






// Route: /api/sales-order-data
app.post('/api/sales-order-data', async (req, res) => {
  const { customerId } = req.body;

  console.log(`[Backend] Received sales order request for Customer ID: ${customerId}`);
  if (!customerId) {
    return res.status(400).json({ error: 'Customer ID is required to fetch sales order data.' });
  }

  const salesOrderEndpoint = 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zsalesorder_wsd_rt?sap-client=100';

  const soapEnvelope = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
      <soapenv:Header/>
      <soapenv:Body>
        <urn:ZfmCustomerPortalSalesorder>
          <IvKunnr>${customerId.padStart(10, '0')}</IvKunnr>
        </urn:ZfmCustomerPortalSalesorder>
      </soapenv:Body>
    </soapenv:Envelope>`;

  try {
    const response = await axios.post(salesOrderEndpoint, soapEnvelope, {
      headers: {
        'Content-Type': 'text/xml',
        'Accept': 'text/xml',
        'SOAPAction': ''
      },
      auth: {
        username: process.env.SAP_USER || 'k901677',
        password: process.env.SAP_PASS || 'Rth3eep!@677'
      },
      timeout: 15000
    });

    xml2js.parseString(response.data, { explicitArray: false }, (err, result) => {
      if (err) {
        console.error('[Backend] Sales Order XML Parse Error:', err);
        return res.status(500).json({ error: 'Failed to parse SAP sales order XML.' });
      }

      try {
        const body = result['soap-env:Envelope']['soap-env:Body'];
        const salesResponse = body['n0:ZfmCustomerPortalSalesorderResponse'];
        const itemList = salesResponse?.EvCustomerSalesorder?.item || [];

        const parsedOrders = Array.isArray(itemList) ? itemList : [itemList];

        const formattedOrders = parsedOrders.map((item) => ({
          CUSTOMER_ID: item.CustomerId || '',
          DOC_NUM: item.DocNum || '',
          SALES_DOC_TYPE: item.SalesDocType || '',
          SALES_ORG: item.SalesOrg || '',
          DISTRIBUTION_CHANNEL: item.DistributionChannel || '',
          ITEM_NUM: item.ItemNum || '',
          SALES_ORDER_ITEM: item.SalesOrderItem || '',
          LINE_NUM: item.LineNum || '',
          DELIVERY_DATE: item.DeliveryDate || '',
          QUANTITY: item.Quantity || '',
          ISSUE_DATE: item.IssueDate || ''
        }));

        console.log('[Backend] Extracted sales order data:', formattedOrders);
        return res.json(formattedOrders);
      } catch (parseErr) {
        console.error('[Backend] Error extracting sales order data:', parseErr);
        return res.status(500).json({ error: 'Unexpected structure in SAP sales order response.' });
      }
    });

  } catch (error) {
    console.error('[Backend] SAP sales order request failed:', error.message);
    if (error.response) {
      return res.status(error.response.status).json({
        error: `SAP responded with status ${error.response.status}.`,
        details: error.response.data
      });
    } else if (error.request) {
      return res.status(500).json({ error: 'No response received from SAP for sales order request.' });
    } else {
      return res.status(500).json({ error: 'Error setting up SAP sales order request.' });
    }
  }
});














// Route: /api/invoice-data
app.post('/api/invoice-data', async (req, res) => {
  const { customerId } = req.body;

  console.log(`[Backend] Received invoice data request for Customer ID: ${customerId}`);
  if (!customerId) {
    return res.status(400).json({ error: 'Customer ID is required to fetch invoice data.' });
  }

  const sapInvoiceEndpoint = 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zinvoice_srvc_defn_rt?sap-client=100';

  const soapEnvelope = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
      <soapenv:Header/>
      <soapenv:Body>
        <urn:ZfmCustomerPortalInvoiceRt>
          <IvKunnr>${customerId.padStart(10, '0')}</IvKunnr>
        </urn:ZfmCustomerPortalInvoiceRt>
      </soapenv:Body>
    </soapenv:Envelope>`;

  try {
    const response = await axios.post(sapInvoiceEndpoint, soapEnvelope, {
      headers: {
        'Content-Type': 'text/xml',
        'Accept': 'text/xml',
        'SOAPAction': ''
      },
      auth: {
        username: process.env.SAP_USER, // set in .env
        password: process.env.SAP_PASS
      },
      timeout: 15000
    });

    xml2js.parseString(response.data, { explicitArray: false }, (err, result) => {
      if (err) {
        console.error('[Backend] Invoice XML Parse Error:', err);
        return res.status(500).json({ error: 'Failed to parse SAP invoice response XML.' });
      }

      try {
        const body = result['soap-env:Envelope']['soap-env:Body'];
        const invoiceResponse = body['n0:ZfmCustomerPortalInvoiceRtResponse'];
        const itemList = invoiceResponse?.EvCustomerInvoice?.item || [];

        const parsedInvoices = Array.isArray(itemList) ? itemList : [itemList];

        const formattedData = parsedInvoices.map((item) => ({
          DOC_NUM: item.DocNum || '',
          SOLD_TO_PARTY: item.SoldToParty || '',
          BILLING_DATE: item.BillingDate || '',
          BILLING_TYPE: item.BillingType || '',
          SALES_ORG: item.SalesOrg || '',
          DISTRIBUTION_CHANNEL: item.DistributionChannel || '',
          DIVISION: item.Division || '',
          TERMS: item.Terms || '',
          DOC_ITEM: item.DocItem || '',
          MATERIAL_NUM: item.MaterialNum || '',
          BILLING_QNTY: item.BillingQnty || '',
          NET_VALUE: item.NetValue || ''
        }));

        console.log('[Backend] Extracted invoice data:', formattedData);
        return res.json(formattedData);
      } catch (parseErr) {
        console.error('[Backend] Error extracting invoice data:', parseErr);
        return res.status(500).json({ error: 'Unexpected structure in SAP invoice response.' });
      }
    });

  } catch (error) {
    console.error('[Backend] SAP invoice request failed:', error.message);
    if (error.response) {
      return res.status(error.response.status).json({
        error: `SAP responded with status ${error.response.status}.`,
        details: error.response.data
      });
    } else if (error.request) {
      return res.status(500).json({ error: 'No response received from SAP for invoice request.' });
    } else {
      return res.status(500).json({ error: 'Error setting up SAP invoice request.' });
    }
  }
});












// Start server
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});












// index.js
// require('dotenv').config(); // Ensure this is at the very top!

// const express = require('express');
// const axios = require('axios');
// const xml2js = require('xml2js');
// const bodyParser = require('body-parser');
// const cors = require('cors');

// const app = express();
// const PORT = process.env.PORT || 3000;

// // Middleware
// app.use(cors());
// app.use(bodyParser.json()); // To parse JSON bodies from Angular frontend

// // Log environment variables to confirm they are loaded
// console.log('--- Environment Variables Loaded ---');
// console.log('SAP_USER:', process.env.SAP_USER ? 'Loaded' : 'NOT LOADED');
// console.log('SAP_PASS:', process.env.SAP_PASS ? 'Loaded' : 'NOT LOADED');
// console.log('PORT:', process.env.PORT);
// console.log('----------------------------------');


// // Login route
// app.post('/api/login', async (req, res) => {
//     const { customerId, password } = req.body;

//     console.log(`[Backend] Received login request for Customer ID: ${customerId}`);

//     // Validate inputs
//     if (!customerId || !password) {
//         console.warn('[Backend] Validation Error: Customer ID or password missing.');
//         return res.status(400).json({ error: 'Customer ID and password are required.' });
//     }

//     // Construct SOAP envelope
//     const soapEnvelope = `
//     <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
//                       xmlns:urn="urn:sap-com:document:sap:rfc:functions">
//        <soapenv:Header/>
//        <soapenv:Body>
//          <urn:ZFM_CUSTOMER_PORTAL_LOGIN_RT>
//             <IV_CUSTOMER_ID>${customerId}</IV_CUSTOMER_ID>
//             <IV_PASSWORD>${password}</IV_PASSWORD>
//          </urn:ZFM_CUSTOMER_PORTAL_LOGIN_RT>
//        </soapenv:Body>
//     </soapenv:Envelope>`;

//     // SAP RFC Endpoint
//     const sapEndpoint = 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zlogin_svce_defn_rt?sap-client=100';

//     try {
//         console.log(`[Backend] Sending SOAP request to SAP endpoint: ${sapEndpoint}`);
//         console.log(`[Backend] SOAP Envelope: \n${soapEnvelope}`);
//         console.log(`[Backend] Using SAP User: ${process.env.SAP_USER}`);

//         //Define auth object for axios
//         const authConfig = {
//             username: process.env.SAP_USER,
//             password: process.env.SAP_PASS
//         };
//         console.log('[Backend] Auth config for login:', JSON.stringify(authConfig, null, 2));

//         // Send SOAP request to SAP
//         const response = await axios.post(sapEndpoint, soapEnvelope, {
//             headers: {
//                 'Content-Type': 'text/xml',
//                 'Accept': 'text/xml',
//                 'SOAPAction': '' // Usually empty for SAP
//             },
//             // auth: {
//             //     username: process.env.SAP_USER,
//             //     password: process.env.SAP_PASS
//             // },
//             auth: authConfig, // Use the defined auth object
//             timeout: 15000 // Increased timeout for potentially slow SAP responses
//         });

//         console.log('[Backend] Received response from SAP.');
//         console.log('[Backend] SAP Response Data (Raw):', response.data);

//         xml2js.parseString(response.data, { explicitArray: false }, (err, result) => {
//             if (err) {
//                 console.error('[Backend] XML Parse Error:', err);
//                 return res.status(500).json({ error: 'Failed to parse SAP response XML.' });
//             }

//             try {
//                 const body = result['soap-env:Envelope']['soap-env:Body']; // Note: 'soap-env' namespace
//                 const loginResponse = body['n0:ZFM_CUSTOMER_PORTAL_LOGIN_RTResponse'];

//                 if (!loginResponse) {
//                     console.error('[Backend] SAP Response Error: ZFM_CUSTOMER_PORTAL_LOGIN_RTResponse not found in XML.');
//                     console.error('[Backend] Full Parsed XML Result:', JSON.stringify(result, null, 2));
//                     return res.status(500).json({ error: 'Unexpected SAP response structure: Missing login response.' });
//                 }

//                 const evMessage = loginResponse['EV_MESSAGE'];
//                 const evStatus = loginResponse['EV_STATUS'];

//                 console.log(`[Backend] SAP Response - Message: "${evMessage}", Status: "${evStatus}"`);

//                 // Send final response to frontend
//                 res.json({ message: evMessage, status: evStatus });
//             } catch (parseError) {
//                 console.error('[Backend] Response structure unexpected (during internal parsing):', parseError);
//                 console.error('[Backend] Full Parsed XML Result:', JSON.stringify(result, null, 2));
//                 res.status(500).json({ error: 'Unexpected SAP response structure during internal parsing.' });
//             }
//         });

//     } catch (error) {
//         console.error('[Backend] SAP login request failed:', error.message);
//         if (error.response) {
//             console.error('[Backend] SAP Response Status:', error.response.status);
//             console.error('[Backend] SAP Response Data:', error.response.data);
//             res.status(error.response.status).json({
//                 error: `SAP responded with status ${error.response.status}.`,
//                 details: error.response.data
//             });
//         } else if (error.request) {
//             console.error('[Backend] No response received from SAP:', error.request);
//             res.status(500).json({ error: 'No response received from SAP. Check network or SAP server.' });
//         } else {
//             console.error('[Backend] Error setting up SAP request:', error.message);
//             res.status(500).json({ error: 'Error setting up SAP request.' });
//         }
//     }
// });

// // Profile route
// app.post('/api/profile', async (req, res) => {
//     const { customerId } = req.body;

//     console.log(`[Backend] Received profile request for Customer ID: ${customerId}`);

//     if (!customerId) {
//         console.warn('[Backend] Validation Error: Customer ID missing for profile request.');
//         return res.status(400).json({ error: 'Customer ID is required to fetch profile.' });
//     }

//     const sapProfileEndpoint = 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zprofile_service_defn_rt?sap-client=100';

//     const soapEnvelope = `
//     <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
//        <soapenv:Header/>
//        <soapenv:Body>
//          <urn:ZfmCustomerPortalProfileTr>
//             <IvKunnr>${customerId}</IvKunnr>
//          </urn:ZfmCustomerPortalProfileTr>
//        </soapenv:Body>
//     </soapenv:Envelope>`;

//     try {
//         console.log(`[Backend] Sending SOAP profile request to SAP endpoint: ${sapProfileEndpoint}`);
//         console.log(`[Backend] Profile SOAP Envelope: \n${soapEnvelope}`);
//         console.log(`[Backend] Using SAP User: ${process.env.SAP_USER}`);

//         const response = await axios.post(sapProfileEndpoint, soapEnvelope, {
//             headers: {
//                 'Content-Type': 'text/xml',
//                 'Accept': 'text/xml',
//                 'SOAPAction': ''
//             },
//             auth: {
//                 username: process.env.SAP_USER,
//                 password: process.env.SAP_PASS
//             },
//             timeout: 15000
//         });

//         console.log('[Backend] Received profile response from SAP.');
//         console.log('[Backend] SAP Profile Response Data (Raw):', response.data);

//         xml2js.parseString(response.data, { explicitArray: false }, (err, result) => {
//             if (err) {
//                 console.error('[Backend] Profile XML Parse Error:', err);
//                 return res.status(500).json({ error: 'Failed to parse SAP profile response XML.' });
//             }

//             try {
//                 // Adjusting for the 'soap-env' namespace and specific response structure
//                 const body = result['soap-env:Envelope']['soap-env:Body'];
//                 const profileResponse = body['n0:ZfmCustomerPortalProfileTrResponse'];

//                 if (!profileResponse) {
//                     console.error('[Backend] SAP Profile Response Error: ZfmCustomerPortalProfileTrResponse not found in XML.');
//                     console.error('[Backend] Full Parsed Profile XML Result:', JSON.stringify(result, null, 2));
//                     return res.status(500).json({ error: 'Unexpected SAP profile response structure: Missing profile response.' });
//                 }

//                 const evCustomerProfile = profileResponse['EvCustomerProfile'];
//                 const evMessage = profileResponse['EvMessage'];
//                 const evStatus = profileResponse['EvStatus'];

//                 // Map SAP's response structure to your frontend's CustomerProfile interface
//                 const customerProfile = {
//                     KUNNR: evCustomerProfile?.Kunnr || '',
//                     NAME: evCustomerProfile?.Name || '',
//                     ADDRESS: evCustomerProfile?.Address || '',
//                     CITY: evCustomerProfile?.City || '',
//                     STREET: evCustomerProfile?.Street || '',
//                     POSTAL_CODE: evCustomerProfile?.PostalCode || ''
//                 };

//                 console.log(`[Backend] SAP Profile Response - Message: "${evMessage}", Status: "${evStatus}"`);
//                 console.log('[Backend] Parsed Customer Profile:', customerProfile);

//                 res.json({
//                     profile: customerProfile,
//                     message: evMessage,
//                     status: evStatus
//                 });

//             } catch (parseError) {
//                 console.error('[Backend] Profile response structure unexpected (during internal parsing):', parseError);
//                 console.error('[Backend] Full Parsed Profile XML Result:', JSON.stringify(result, null, 2));
//                 res.status(500).json({ error: 'Unexpected SAP profile response structure during internal parsing.' });
//             }
//         });

//     } catch (error) {
//         console.error('[Backend] SAP profile request failed:', error.message);
//         if (error.response) {
//             console.error('[Backend] SAP Response Status:', error.response.status);
//             console.error('[Backend] SAP Response Data:', error.response.data);
//             res.status(error.response.status).json({
//                 error: `SAP responded with status ${error.response.status}.`,
//                 details: error.response.data
//             });
//         } else if (error.request) {
//             console.error('[Backend] No response received from SAP for profile:', error.request);
//             res.status(500).json({ error: 'No response received from SAP for profile. Check network or SAP server.' });
//         } else {
//             console.error('[Backend] Error setting up SAP profile request:', error.message);
//             res.status(500).json({ error: 'Error setting up SAP request.' });
//         }
//     }
// });

// // ROUTE TO Fetch Customer Inquiry Data
// app.post('/api/inquiry', async (req, res) => {
//     const { customerId } = req.body;

//     console.log(`[Backend] Received inquiry request for Customer ID: ${customerId}`);

//     if (!customerId) {
//         console.warn('[Backend] Validation Error: Customer ID missing for inquiry request.');
//         return res.status(400).json({ error: 'Customer ID is required to fetch inquiry data.' });
//     }

//     const sapInquiryEndpoint = 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zinquiry_srvc_defn_rt?sap-client=100';

//     const soapEnvelope = `
//     <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
//        <soapenv:Header/>
//        <soapenv:Body>
//          <urn:ZfmCustomerPortalInquiryRt>
//             <IvKunnr>${customerId}</IvKunnr>
//          </urn:ZfmCustomerPortalInquiryRt>
//        </soapenv:Body>
//     </soapenv:Envelope>`;

//     try {
//         console.log(`[Backend] Sending SOAP inquiry request to SAP endpoint: ${sapInquiryEndpoint}`);
//         console.log(`[Backend] Inquiry SOAP Envelope: \n${soapEnvelope}`);
//         console.log(`[Backend] Using SAP User: ${process.env.SAP_USER}`);

//         const response = await axios.post(sapInquiryEndpoint, soapEnvelope, {
//             headers: {
//                 'Content-Type': 'text/xml',
//                 'Accept': 'text/xml',
//                 'SOAPAction': ''
//             },
//             auth: {
//                 username: process.env.SAP_USER,
//                 password: process.env.SAP_PASS
//             },
//             timeout: 15000
//         });

//         console.log('[Backend] Received inquiry response from SAP.');
//         console.log('[Backend] SAP Inquiry Response Data (Raw):', response.data);

//         // CHANGE HERE: explicitArray: false for the main parsing
//         xml2js.parseString(response.data, { explicitArray: false }, (err, result) => {
//             if (err) {
//                 console.error('[Backend] Inquiry XML Parse Error:', err);
//                 return res.status(500).json({ error: 'Failed to parse SAP inquiry response XML.' });
//             }

//             try {
//                 console.log('[Backend] XML parsed successfully. Result (with explicitArray: false):', JSON.stringify(result, null, 2));
//                 const body = result['soap-env:Envelope']['soap-env:Body'];
//                 // This should now correctly find the element without the array wrapper
//                 const inquiryResponse = body['n0:ZfmCustomerPortalInquiryRtResponse'];

//                 if (!inquiryResponse) {
//                     console.error('[Backend] SAP Inquiry Response Error: ZfmCustomerPortalInquiryRtResponse not found in XML.');
//                     console.error('[Backend] Full Parsed Inquiry XML Result (explicitArray: false):', JSON.stringify(result, null, 2));
//                     return res.status(500).json({ error: 'Unexpected SAP inquiry response structure: Missing inquiry response.' });
//                 }

//                 const evCustomerInquiry = inquiryResponse['EvCustomerInquiry'];
//                 console.log('[Backend] Extracted EvCustomerInquiry:', JSON.stringify(evCustomerInquiry, null, 2));

//                 let inquiryItems = [];
//                 if (evCustomerInquiry && evCustomerInquiry.item) {
//                     // With explicitArray: false, if there's only one 'item', it won't be an array.
//                     // So, ensure it's always an array for consistent mapping.
//                     inquiryItems = Array.isArray(evCustomerInquiry.item) ? evCustomerInquiry.item : [evCustomerInquiry.item];
//                 }
//                 console.log('[Backend] Processed inquiryItems (before mapping):', JSON.stringify(inquiryItems, null, 2));

//                 const inquiries = inquiryItems.map((item) => {
//                     if (!item) {
//                         console.warn('[Backend] Skipping undefined/null item in inquiryItems map.');
//                         return null;
//                     }
//                     console.log('[Backend] Mapping item:', JSON.stringify(item, null, 2));
//                     // REMOVED .[0] for individual properties as explicitArray: false means they are not arrays
//                     return {
//                         SALES_DOC_NO: item.SalesDocNo || '',
//                         CREATION_DATE: item.CreationDate || '',
//                         CUSTOMER_ID: item.CustomerId || '',
//                         SALES_GRP: item.SalesGrp || '',
//                         DOC_ITEM: item.DocItem || '',
//                         MATERIAL_NO: item.MaterialNo || '', // SAP is sending units here, not material numbers
//                         DESCRIPTION: item.Description || '',
//                         VRKME: item.Vrkme || '', // SAP is sending units here
//                         MEASUREMENT_UNIT: item.MeasurementUnit || ''
//                     };
//                 }).filter(item => item !== null);

//                 console.log('[Backend] Parsed Customer Inquiries (before sending):', JSON.stringify(inquiries, null, 2));

//                 try {
//                     res.json({
//                         inquiries: inquiries,
//                         // REMOVED .[0] for message/status as explicitArray: false means they are not arrays
//                         message: inquiryResponse['EvMessage'] || 'Inquiry data fetched.',
//                         status: inquiryResponse['EvStatus'] || 'S'
//                     });
//                     console.log('[Backend] Successfully sent JSON response to frontend.');
//                 } catch (sendError) {
//                     console.error('[Backend] Error sending JSON response to frontend:', sendError);
//                     res.status(500).json({ error: 'Error sending final JSON response.' });
//                 }


//             } catch (parseError) {
//                 console.error('[Backend] Inquiry response structure unexpected (during internal parsing):', parseError);
//                 console.error('[Backend] Full Parsed Inquiry XML Result:', JSON.stringify(result, null, 2));
//                 res.status(500).json({ error: 'Unexpected SAP inquiry response structure during internal parsing.' });
//             }
//         });

//     } catch (error) {
//         console.error('[Backend] SAP inquiry request failed:', error.message);
//         if (error.response) {
//             console.error('[Backend] SAP Inquiry Response Status:', error.response.status);
//             console.error('[Backend] SAP Inquiry Response Data:', error.response.data);
//             res.status(error.response.status).json({
//                 error: `SAP responded with status ${error.response.status}.`,
//                 details: error.response.data
//             });
//         } else if (error.request) {
//             console.error('[Backend] No response received from SAP for inquiry:', error.request);
//             res.status(500).json({ error: 'No response received from SAP for inquiry. Check network or SAP server.' });
//         } else {
//             console.error('[Backend] Error setting up SAP inquiry request:', error.message);
//             res.status(500).json({ error: 'Error setting up SAP request.' });
//         }
//     }
// });


// // NEW ROUTE: Fetch Customer Sales Order Data
// app.post('/api/sales-order', async (req, res) => {
//     const { customerId } = req.body;

//     console.log(`[Backend] Received sales order request for Customer ID: ${customerId}`);

//     if (!customerId) {
//         console.warn('[Backend] Validation Error: Customer ID missing for sales order request.');
//         return res.status(400).json({ error: 'Customer ID is required to fetch sales order data.' });
//     }

//     const sapSalesOrderEndpoint = 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zdelivery_srvc_defn_rt?sap-client=100';

//     const soapEnvelope = `
//     <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
//        <soapenv:Header/>
//        <soapenv:Body>
//          <urn:ZfmCustomerPortalSalesorder>
//             <IvKunnr>${customerId}</IvKunnr>
//          </urn:ZfmCustomerPortalSalesorder>
//        </soapenv:Body>
//     </soapenv:Envelope>`;

//     try {
//         console.log(`[Backend] Sending SOAP sales order request to SAP endpoint: ${sapSalesOrderEndpoint}`);
//         console.log(`[Backend] Sales Order SOAP Envelope: \n${soapEnvelope}`);
//         console.log(`[Backend] Using SAP User: ${process.env.SAP_USER}`);

//         // Define auth object for axios
//         const authConfig = {
//             username: process.env.SAP_USER,
//             password: process.env.SAP_PASS
//         };

//         const response = await axios.post(sapSalesOrderEndpoint, soapEnvelope, {
//             headers: {
//                 'Content-Type': 'text/xml',
//                 'Accept': 'text/xml',
//                 'SOAPAction': ''
//             },
//             // auth: {
//             //     username: process.env.SAP_USER,
//             //     password: process.env.SAP_PASS
//             // },
//             auth: authConfig, 
//             timeout: 15000
//         });

//         console.log('[Backend] Received sales order response from SAP.');
//         console.log('[Backend] SAP Sales Order Response Data (Raw):', response.data);

//         xml2js.parseString(response.data, { explicitArray: false }, (err, result) => {
//             if (err) {
//                 console.error('[Backend] Sales Order XML Parse Error:', err);
//                 return res.status(500).json({ error: 'Failed to parse SAP sales order response XML.' });
//             }

//             try {
//                 console.log('[Backend] Sales Order XML parsed successfully. Result (with explicitArray: false):', JSON.stringify(result, null, 2));
//                 const body = result['soap-env:Envelope']['soap-env:Body'];
//                 const salesOrderResponse = body['n0:ZfmCustomerPortalSalesorderResponse'];

//                 if (!salesOrderResponse) {
//                     console.error('[Backend] SAP Sales Order Response Error: ZfmCustomerPortalSalesorderResponse not found in XML.');
//                     console.error('[Backend] Full Parsed Sales Order XML Result (explicitArray: false):', JSON.stringify(result, null, 2));
//                     return res.status(500).json({ error: 'Unexpected SAP sales order response structure: Missing sales order response.' });
//                 }

//                 const evCustomerSalesorder = salesOrderResponse['EvCustomerSalesorder'];
//                 console.log('[Backend] Extracted EvCustomerSalesorder:', JSON.stringify(evCustomerSalesorder, null, 2));

//                 let salesOrderItems = [];
//                 if (evCustomerSalesorder && evCustomerSalesorder.item) {
//                     // Ensure 'item' is always an array, even if there's only one item
//                     salesOrderItems = Array.isArray(evCustomerSalesorder.item) ? evCustomerSalesorder.item : [evCustomerSalesorder.item];
//                 }
//                 console.log('[Backend] Processed salesOrderItems (before mapping):', JSON.stringify(salesOrderItems, null, 2));

//                 const salesOrders = salesOrderItems.map((item) => {
//                     if (!item) {
//                         console.warn('[Backend] Skipping undefined/null item in salesOrderItems map.');
//                         return null;
//                     }
//                     console.log('[Backend] Mapping sales order item:', JSON.stringify(item, null, 2));
//                     return {
//                         CustomerId: item.CustomerId || '',
//                         DocNum: item.DocNum || '',
//                         SalesDocType: item.SalesDocType || '',
//                         SalesOrg: item.SalesOrg || '',
//                         DistributionChannel: item.DistributionChannel || '',
//                         ItemNum: item.ItemNum || '',
//                         SalesOrderItem: item.SalesOrderItem || '',
//                         LineNum: item.LineNum || '',
//                         DeliveryDate: item.DeliveryDate || '',
//                         Quantity: item.Quantity || '0.0', // Default to '0.0' if not present
//                         IssueDate: item.IssueDate || ''
//                     };
//                 }).filter(item => item !== null);

//                 console.log('[Backend] Parsed Customer Sales Orders (before sending):', JSON.stringify(salesOrders, null, 2));

//                 try {
//                     res.json(salesOrders); // Send the array directly, as frontend expects SalesOrderData[]
//                     console.log('[Backend] Successfully sent JSON response to frontend.');
//                 } catch (sendError) {
//                     console.error('[Backend] Error sending JSON response to frontend:', sendError);
//                     res.status(500).json({ error: 'Error sending final JSON response.' });
//                 }

//             } catch (parseError) {
//                 console.error('[Backend] Sales Order response structure unexpected (during internal parsing):', parseError);
//                 console.error('[Backend] Full Parsed Sales Order XML Result:', JSON.stringify(result, null, 2));
//                 res.status(500).json({ error: 'Unexpected SAP sales order response structure during internal parsing.' });
//             }
//         });

//     } catch (error) {
//         console.error('[Backend] SAP sales order request failed:', error.message);
//         if (error.response) {
//             console.error('[Backend] SAP Sales Order Response Status:', error.response.status);
//             console.error('[Backend] SAP Sales Order Response Data:', error.response.data);
//             res.status(error.response.status).json({
//                 error: `SAP responded with status ${error.response.status}.`,
//                 details: error.response.data
//             });
//         } else if (error.request) {
//             console.error('[Backend] No response received from SAP for sales order:', error.request);
//             res.status(500).json({ error: 'No response received from SAP for sales order. Check network or SAP server.' });
//         } else {
//             console.error('[Backend] Error setting up SAP sales order request:', error.message);
//             res.status(500).json({ error: 'Error setting up SAP request.' });
//         }
//     }
// });

// // Start server
// app.listen(PORT, () => {
//     console.log(`✅ Server running on http://localhost:${PORT}`);
// });

















// // index.js
// require('dotenv').config(); // Ensure this is at the very top!

// const express = require('express');
// const axios = require('axios');
// const xml2js = require('xml2js');
// const bodyParser = require('body-parser');
// const cors = require('cors');

// const app = express();
// const PORT = process.env.PORT || 3000;

// // Middleware
// app.use(cors());
// app.use(bodyParser.json()); // To parse JSON bodies from Angular frontend

// // Log environment variables to confirm they are loaded
// console.log('--- Environment Variables Loaded ---');
// console.log('SAP_USER:', process.env.SAP_USER ? 'Loaded' : 'NOT LOADED');
// console.log('SAP_PASS:', process.env.SAP_PASS ? 'Loaded' : 'NOT LOADED');
// console.log('PORT:', process.env.PORT);
// console.log('----------------------------------');


// // Login route
// app.post('/api/login', async (req, res) => {
//     const { customerId, password } = req.body;

//     console.log(`[Backend] Received login request for Customer ID: ${customerId}`);

//     // Validate inputs
//     if (!customerId || !password) {
//         console.warn('[Backend] Validation Error: Customer ID or password missing.');
//         return res.status(400).json({ error: 'Customer ID and password are required.' });
//     }

//     // Construct SOAP envelope
//     const soapEnvelope = `
//     <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
//                       xmlns:urn="urn:sap-com:document:sap:rfc:functions">
//        <soapenv:Header/>
//        <soapenv:Body>
//          <urn:ZFM_CUSTOMER_PORTAL_LOGIN_RT>
//             <IV_CUSTOMER_ID>${customerId}</IV_CUSTOMER_ID>
//             <IV_PASSWORD>${password}</IV_PASSWORD>
//          </urn:ZFM_CUSTOMER_PORTAL_LOGIN_RT>
//        </soapenv:Body>
//     </soapenv:Envelope>`;

//     // SAP RFC Endpoint
//     const sapEndpoint = 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zlogin_svce_defn_rt?sap-client=100';

//     try {
//         console.log(`[Backend] Sending SOAP request to SAP endpoint: ${sapEndpoint}`);
//         console.log(`[Backend] SOAP Envelope: \n${soapEnvelope}`);
//         console.log(`[Backend] Using SAP User: ${process.env.SAP_USER}`);

//         // Send SOAP request to SAP
//         const response = await axios.post(sapEndpoint, soapEnvelope, {
//             headers: {
//                 'Content-Type': 'text/xml',
//                 'Accept': 'text/xml',
//                 'SOAPAction': '' // Usually empty for SAP
//             },
//             auth: {
//                 username: process.env.SAP_USER,
//                 password: process.env.SAP_PASS
//             },
//             timeout: 15000 // Increased timeout for potentially slow SAP responses
//         });

//         console.log('[Backend] Received response from SAP.');
//         console.log('[Backend] SAP Response Data (Raw):', response.data);

//         // Parse SOAP XML response
//         xml2js.parseString(response.data, { explicitArray: false }, (err, result) => {
//             if (err) {
//                 console.error('[Backend] XML Parse Error:', err);
//                 return res.status(500).json({ error: 'Failed to parse SAP response XML.' });
//             }

//             try {
//                 const body = result['soap-env:Envelope']['soap-env:Body']; // Note: 'soap-env' namespace
//                 const loginResponse = body['n0:ZFM_CUSTOMER_PORTAL_LOGIN_RTResponse'];

//                 if (!loginResponse) {
//                     console.error('[Backend] SAP Response Error: ZFM_CUSTOMER_PORTAL_LOGIN_RTResponse not found in XML.');
//                     console.error('[Backend] Full Parsed XML Result:', JSON.stringify(result, null, 2));
//                     return res.status(500).json({ error: 'Unexpected SAP response structure: Missing login response.' });
//                 }

//                 const evMessage = loginResponse['EV_MESSAGE'];
//                 const evStatus = loginResponse['EV_STATUS'];

//                 console.log(`[Backend] SAP Response - Message: "${evMessage}", Status: "${evStatus}"`);

//                 // Send final response to frontend
//                 res.json({ message: evMessage, status: evStatus });
//             } catch (parseError) {
//                 console.error('[Backend] Response structure unexpected (during internal parsing):', parseError);
//                 console.error('[Backend] Full Parsed XML Result:', JSON.stringify(result, null, 2));
//                 res.status(500).json({ error: 'Unexpected SAP response structure during internal parsing.' });
//             }
//         });

//     } catch (error) {
//         console.error('[Backend] SAP login request failed:', error.message);
//         if (error.response) {
//             console.error('[Backend] SAP Response Status:', error.response.status);
//             console.error('[Backend] SAP Response Data:', error.response.data);
//             res.status(error.response.status).json({
//                 error: `SAP responded with status ${error.response.status}.`,
//                 details: error.response.data
//             });
//         } else if (error.request) {
//             console.error('[Backend] No response received from SAP:', error.request);
//             res.status(500).json({ error: 'No response received from SAP. Check network or SAP server.' });
//         } else {
//             console.error('[Backend] Error setting up SAP request:', error.message);
//             res.status(500).json({ error: 'Error setting up SAP request.' });
//         }
//     }
// });

// // Profile route
// app.post('/api/profile', async (req, res) => {
//     const { customerId } = req.body;

//     console.log(`[Backend] Received profile request for Customer ID: ${customerId}`);

//     if (!customerId) {
//         console.warn('[Backend] Validation Error: Customer ID missing for profile request.');
//         return res.status(400).json({ error: 'Customer ID is required to fetch profile.' });
//     }

//     const sapProfileEndpoint = 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zprofile_service_defn_rt?sap-client=100';

//     const soapEnvelope = `
//     <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
//        <soapenv:Header/>
//        <soapenv:Body>
//          <urn:ZfmCustomerPortalProfileTr>
//             <IvKunnr>${customerId}</IvKunnr>
//          </urn:ZfmCustomerPortalProfileTr>
//        </soapenv:Body>
//     </soapenv:Envelope>`;

//     try {
//         console.log(`[Backend] Sending SOAP profile request to SAP endpoint: ${sapProfileEndpoint}`);
//         console.log(`[Backend] Profile SOAP Envelope: \n${soapEnvelope}`);
//         console.log(`[Backend] Using SAP User: ${process.env.SAP_USER}`);

//         const response = await axios.post(sapProfileEndpoint, soapEnvelope, {
//             headers: {
//                 'Content-Type': 'text/xml',
//                 'Accept': 'text/xml',
//                 'SOAPAction': ''
//             },
//             auth: {
//                 username: process.env.SAP_USER,
//                 password: process.env.SAP_PASS
//             },
//             timeout: 15000
//         });

//         console.log('[Backend] Received profile response from SAP.');
//         console.log('[Backend] SAP Profile Response Data (Raw):', response.data);

//         xml2js.parseString(response.data, { explicitArray: false }, (err, result) => {
//             if (err) {
//                 console.error('[Backend] Profile XML Parse Error:', err);
//                 return res.status(500).json({ error: 'Failed to parse SAP profile response XML.' });
//             }

//             try {
//                 const body = result['soap-env:Envelope']['soap-env:Body'];
//                 const profileResponse = body['n0:ZfmCustomerPortalProfileTrResponse'];

//                 if (!profileResponse) {
//                     console.error('[Backend] SAP Profile Response Error: ZfmCustomerPortalProfileTrResponse not found in XML.');
//                     console.error('[Backend] Full Parsed Profile XML Result:', JSON.stringify(result, null, 2));
//                     return res.status(500).json({ error: 'Unexpected SAP profile response structure: Missing profile response.' });
//                 }

//                 const evCustomerProfile = profileResponse['EvCustomerProfile'];
//                 const evMessage = profileResponse['EvMessage'];
//                 const evStatus = profileResponse['EvStatus'];

//                 // Map SAP's response structure to your frontend's CustomerProfile interface
//                 const customerProfile = {
//                     KUNNR: evCustomerProfile?.Kunnr || '',
//                     NAME: evCustomerProfile?.Name || '',
//                     ADDRESS: evCustomerProfile?.Address || '',
//                     CITY: evCustomerProfile?.City || '',
//                     STREET: evCustomerProfile?.Street || '',
//                     POSTAL_CODE: evCustomerProfile?.PostalCode || ''
//                 };

//                 console.log(`[Backend] SAP Profile Response - Message: "${evMessage}", Status: "${evStatus}"`);
//                 console.log('[Backend] Parsed Customer Profile:', customerProfile);

//                 res.json({
//                     profile: customerProfile,
//                     message: evMessage,
//                     status: evStatus
//                 });

//             } catch (parseError) {
//                 console.error('[Backend] Profile response structure unexpected (during internal parsing):', parseError);
//                 console.error('[Backend] Full Parsed Profile XML Result:', JSON.stringify(result, null, 2));
//                 res.status(500).json({ error: 'Unexpected SAP profile response structure during internal parsing.' });
//             }
//         });

//     } catch (error) {
//         console.error('[Backend] SAP profile request failed:', error.message);
//         if (error.response) {
//             console.error('[Backend] SAP Profile Response Status:', error.response.status);
//             console.error('[Backend] SAP Profile Response Data:', error.response.data);
//             res.status(error.response.status).json({
//                 error: `SAP responded with status ${error.response.status}.`,
//                 details: error.response.data
//             });
//         } else if (error.request) {
//             console.error('[Backend] No response received from SAP for profile:', error.request);
//             res.status(500).json({ error: 'No response received from SAP for profile. Check network or SAP server.' });
//         } else {
//             console.error('[Backend] Error setting up SAP profile request:', error.message);
//             res.status(500).json({ error: 'Error setting up SAP profile request.' });
//         }
//     }
// });

// // NEW ROUTE: Fetch Customer Inquiry Data
// app.post('/api/inquiry', async (req, res) => {
//     const { customerId } = req.body;

//     console.log(`[Backend] Received inquiry request for Customer ID: ${customerId}`);

//     if (!customerId) {
//         console.warn('[Backend] Validation Error: Customer ID missing for inquiry request.');
//         return res.status(400).json({ error: 'Customer ID is required to fetch inquiry data.' });
//     }

//     const sapInquiryEndpoint = 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zinquiry_srvc_defn_rt?sap-client=100';

//     const soapEnvelope = `
//     <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
//        <soapenv:Header/>
//        <soapenv:Body>
//          <urn:ZfmCustomerPortalInquiryRt>
//             <IvKunnr>${customerId}</IvKunnr>
//          </urn:ZfmCustomerPortalInquiryRt>
//        </soapenv:Body>
//     </soapenv:Envelope>`;

//     try {
//         console.log(`[Backend] Sending SOAP inquiry request to SAP endpoint: ${sapInquiryEndpoint}`);
//         console.log(`[Backend] Inquiry SOAP Envelope: \n${soapEnvelope}`);
//         console.log(`[Backend] Using SAP User: ${process.env.SAP_USER}`);

//         const response = await axios.post(sapInquiryEndpoint, soapEnvelope, {
//             headers: {
//                 'Content-Type': 'text/xml',
//                 'Accept': 'text/xml',
//                 'SOAPAction': ''
//             },
//             auth: {
//                 username: process.env.SAP_USER,
//                 password: process.env.SAP_PASS
//             },
//             timeout: 15000
//         });

//         console.log('[Backend] Received inquiry response from SAP.');
//         console.log('[Backend] SAP Inquiry Response Data (Raw):', response.data);

//         xml2js.parseString(response.data, { explicitArray: true }, (err, result) => { // explicitArray: true for 'item' nodes
//             if (err) {
//                 console.error('[Backend] Inquiry XML Parse Error:', err);
//                 return res.status(500).json({ error: 'Failed to parse SAP inquiry response XML.' });
//             }

//             try {
//                 const body = result['soap-env:Envelope']['soap-env:Body'];
//                 const inquiryResponse = body['n0:ZfmCustomerPortalInquiryRtResponse'];

//                 if (!inquiryResponse) {
//                     console.error('[Backend] SAP Inquiry Response Error: ZfmCustomerPortalInquiryRtResponse not found in XML.');
//                     console.error('[Backend] Full Parsed Inquiry XML Result:', JSON.stringify(result, null, 2));
//                     return res.status(500).json({ error: 'Unexpected SAP inquiry response structure: Missing inquiry response.' });
//                 }

//                 // The inquiry data is under EvCustomerInquiry and then an array of 'item'
//                 const evCustomerInquiry = inquiryResponse['EvCustomerInquiry'];
//                 const inquiryItems = evCustomerInquiry && evCustomerInquiry.item ? evCustomerInquiry.item : [];

//                 // Map SAP's response structure to your frontend's InquiryData interface
//                 const inquiries = inquiryItems.map((item) => ({
//                     SALES_DOC_NO: item.SalesDocNo || '',
//                     CREATION_DATE: item.CreationDate || '', // Assuming YYYY-MM-DD from SAP
//                     CUSTOMER_ID: item.CustomerId || '',
//                     SALES_GRP: item.SalesGrp || '',
//                     DOC_ITEM: item.DocItem || '',
//                     MATERIAL_NO: item.MaterialNo || '',
//                     DESCRIPTION: item.Description || '',
//                     VRKME: item.Vrkme || '',
//                     MEASUREMENT_UNIT: item.MeasurementUnit || ''
//                 }));

//                 console.log('[Backend] Parsed Customer Inquiries:', inquiries);

//                 res.json({
//                     inquiries: inquiries,
//                     message: inquiryResponse['EvMessage'] || 'Inquiry data fetched.',
//                     status: inquiryResponse['EvStatus'] || 'S'
//                 });

//             } catch (parseError) {
//                 console.error('[Backend] Inquiry response structure unexpected (during internal parsing):', parseError);
//                 console.error('[Backend] Full Parsed Inquiry XML Result:', JSON.stringify(result, null, 2));
//                 res.status(500).json({ error: 'Unexpected SAP inquiry response structure during internal parsing.' });
//             }
//         });

//     } catch (error) {
//         console.error('[Backend] SAP inquiry request failed:', error.message);
//         if (error.response) {
//             console.error('[Backend] SAP Inquiry Response Status:', error.response.status);
//             console.error('[Backend] SAP Inquiry Response Data:', error.response.data);
//             res.status(error.response.status).json({
//                 error: `SAP responded with status ${error.response.status}.`,
//                 details: error.response.data
//             });
//         } else if (error.request) {
//             console.error('[Backend] No response received from SAP for inquiry:', error.request);
//             res.status(500).json({ error: 'No response received from SAP for inquiry. Check network or SAP server.' });
//         } else {
//             console.error('[Backend] Error setting up SAP inquiry request:', error.message);
//             res.status(500).json({ error: 'Error setting up SAP inquiry request.' });
//         }
//     }
// });


// // Start server
// app.listen(PORT, () => {
//     console.log(`✅ Server running on http://localhost:${PORT}`);
// });

















// require('dotenv').config(); // Ensure this is at the very top!

// const express = require('express');
// const axios = require('axios');
// const xml2js = require('xml2js');
// const bodyParser = require('body-parser');
// const cors = require('cors');

// const app = express();
// const PORT = process.env.PORT || 3000;

// // Middleware
// app.use(cors());
// app.use(bodyParser.json()); // To parse JSON bodies from Angular frontend

// // Log environment variables to confirm they are loaded
// console.log('--- Environment Variables Loaded ---');
// console.log('SAP_USER:', process.env.SAP_USER ? 'Loaded' : 'NOT LOADED');
// console.log('SAP_PASS:', process.env.SAP_PASS ? 'Loaded' : 'NOT LOADED');
// console.log('PORT:', process.env.PORT);
// console.log('----------------------------------');


// // Login route
// app.post('/api/login', async (req, res) => {
//     const { customerId, password } = req.body;

//     console.log(`[Backend] Received login request for Customer ID: ${customerId}`);

//     // Validate inputs
//     if (!customerId || !password) {
//         console.warn('[Backend] Validation Error: Customer ID or password missing.');
//         return res.status(400).json({ error: 'Customer ID and password are required.' });
//     }

//     // Construct SOAP envelope
//     const soapEnvelope = `
//     <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
//                       xmlns:urn="urn:sap-com:document:sap:rfc:functions">
//        <soapenv:Header/>
//        <soapenv:Body>
//          <urn:ZFM_CUSTOMER_PORTAL_LOGIN_RT>
//             <IV_CUSTOMER_ID>${customerId}</IV_CUSTOMER_ID>
//             <IV_PASSWORD>${password}</IV_PASSWORD>
//          </urn:ZFM_CUSTOMER_PORTAL_LOGIN_RT>
//        </soapenv:Body>
//     </soapenv:Envelope>`;

//     // SAP RFC Endpoint
//     const sapEndpoint = 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zlogin_svce_defn_rt?sap-client=100';

//     try {
//         console.log(`[Backend] Sending SOAP request to SAP endpoint: ${sapEndpoint}`);
//         console.log(`[Backend] SOAP Envelope: \n${soapEnvelope}`);
//         console.log(`[Backend] Using SAP User: ${process.env.SAP_USER}`);

//         // Send SOAP request to SAP
//         const response = await axios.post(sapEndpoint, soapEnvelope, {
//             headers: {
//                 'Content-Type': 'text/xml',
//                 'Accept': 'text/xml',
//                 'SOAPAction': '' // Usually empty for SAP
//             },
//             auth: {
//                 username: process.env.SAP_USER,
//                 password: process.env.SAP_PASS
//             },
//             timeout: 15000 // Increased timeout for potentially slow SAP responses
//         });

//         console.log('[Backend] Received response from SAP.');
//         console.log('[Backend] SAP Response Data (Raw):', response.data);

//         // Parse SOAP XML response
//         xml2js.parseString(response.data, { explicitArray: false }, (err, result) => {
//             if (err) {
//                 console.error('[Backend] XML Parse Error:', err);
//                 return res.status(500).json({ error: 'Failed to parse SAP response XML.' });
//             }

//             try {
//                 const body = result['soap-env:Envelope']['soap-env:Body']; // Note: 'soap-env' namespace
//                 const loginResponse = body['n0:ZFM_CUSTOMER_PORTAL_LOGIN_RTResponse'];

//                 if (!loginResponse) {
//                     console.error('[Backend] SAP Response Error: ZFM_CUSTOMER_PORTAL_LOGIN_RTResponse not found in XML.');
//                     console.error('[Backend] Full Parsed XML Result:', JSON.stringify(result, null, 2));
//                     return res.status(500).json({ error: 'Unexpected SAP response structure: Missing login response.' });
//                 }

//                 const evMessage = loginResponse['EV_MESSAGE'];
//                 const evStatus = loginResponse['EV_STATUS'];

//                 console.log(`[Backend] SAP Response - Message: "${evMessage}", Status: "${evStatus}"`);

//                 // Send final response to frontend
//                 res.json({ message: evMessage, status: evStatus });
//             } catch (parseError) {
//                 console.error('[Backend] Response structure unexpected (during internal parsing):', parseError);
//                 console.error('[Backend] Full Parsed XML Result:', JSON.stringify(result, null, 2));
//                 res.status(500).json({ error: 'Unexpected SAP response structure during internal parsing.' });
//             }
//         });

//     } catch (error) {
//         console.error('[Backend] SAP login request failed:', error.message);
//         if (error.response) {
//             console.error('[Backend] SAP Response Status:', error.response.status);
//             console.error('[Backend] SAP Response Data:', error.response.data);
//             res.status(error.response.status).json({
//                 error: `SAP responded with status ${error.response.status}.`,
//                 details: error.response.data
//             });
//         } else if (error.request) {
//             console.error('[Backend] No response received from SAP:', error.request);
//             res.status(500).json({ error: 'No response received from SAP. Check network or SAP server.' });
//         } else {
//             console.error('[Backend] Error setting up SAP request:', error.message);
//             res.status(500).json({ error: 'Error setting up SAP request.' });
//         }
//     }
// });

// // NEW ROUTE: Fetch Customer Profile
// app.post('/api/profile', async (req, res) => {
//     const { customerId } = req.body;

//     console.log(`[Backend] Received profile request for Customer ID: ${customerId}`);

//     if (!customerId) {
//         console.warn('[Backend] Validation Error: Customer ID missing for profile request.');
//         return res.status(400).json({ error: 'Customer ID is required to fetch profile.' });
//     }

//     const sapProfileEndpoint = 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zprofile_service_defn_rt?sap-client=100';

//     const soapEnvelope = `
//     <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
//        <soapenv:Header/>
//        <soapenv:Body>
//          <urn:ZfmCustomerPortalProfileTr>
//             <IvKunnr>${customerId}</IvKunnr>
//          </urn:ZfmCustomerPortalProfileTr>
//        </soapenv:Body>
//     </soapenv:Envelope>`;

//     try {
//         console.log(`[Backend] Sending SOAP profile request to SAP endpoint: ${sapProfileEndpoint}`);
//         console.log(`[Backend] Profile SOAP Envelope: \n${soapEnvelope}`);
//         console.log(`[Backend] Using SAP User: ${process.env.SAP_USER}`);

//         const response = await axios.post(sapProfileEndpoint, soapEnvelope, {
//             headers: {
//                 'Content-Type': 'text/xml',
//                 'Accept': 'text/xml',
//                 'SOAPAction': ''
//             },
//             auth: {
//                 username: process.env.SAP_USER,
//                 password: process.env.SAP_PASS
//             },
//             timeout: 15000
//         });

//         console.log('[Backend] Received profile response from SAP.');
//         console.log('[Backend] SAP Profile Response Data (Raw):', response.data);

//         xml2js.parseString(response.data, { explicitArray: false }, (err, result) => {
//             if (err) {
//                 console.error('[Backend] Profile XML Parse Error:', err);
//                 return res.status(500).json({ error: 'Failed to parse SAP profile response XML.' });
//             }

//             try {
//                 // Adjusting for the 'soap-env' namespace and specific response structure
//                 const body = result['soap-env:Envelope']['soap-env:Body'];
//                 const profileResponse = body['n0:ZfmCustomerPortalProfileTrResponse'];

//                 if (!profileResponse) {
//                     console.error('[Backend] SAP Profile Response Error: ZfmCustomerPortalProfileTrResponse not found in XML.');
//                     console.error('[Backend] Full Parsed Profile XML Result:', JSON.stringify(result, null, 2));
//                     return res.status(500).json({ error: 'Unexpected SAP profile response structure: Missing profile response.' });
//                 }

//                 const evCustomerProfile = profileResponse['EvCustomerProfile'];
//                 const evMessage = profileResponse['EvMessage'];
//                 const evStatus = profileResponse['EvStatus'];

//                 // Map SAP's response structure to your frontend's CustomerProfile interface
//                 const customerProfile = {
//                     KUNNR: evCustomerProfile?.Kunnr || '',
//                     NAME: evCustomerProfile?.Name || '',
//                     ADDRESS: evCustomerProfile?.Address || '',
//                     CITY: evCustomerProfile?.City || '',
//                     STREET: evCustomerProfile?.Street || '',
//                     POSTAL_CODE: evCustomerProfile?.PostalCode || ''
//                 };

//                 console.log(`[Backend] SAP Profile Response - Message: "${evMessage}", Status: "${evStatus}"`);
//                 console.log('[Backend] Parsed Customer Profile:', customerProfile);

//                 res.json({
//                     profile: customerProfile,
//                     message: evMessage,
//                     status: evStatus
//                 });

//             } catch (parseError) {
//                 console.error('[Backend] Profile response structure unexpected (during internal parsing):', parseError);
//                 console.error('[Backend] Full Parsed Profile XML Result:', JSON.stringify(result, null, 2));
//                 res.status(500).json({ error: 'Unexpected SAP profile response structure during internal parsing.' });
//             }
//         });

//     } catch (error) {
//         console.error('[Backend] SAP profile request failed:', error.message);
//         if (error.response) {
//             console.error('[Backend] SAP Profile Response Status:', error.response.status);
//             console.error('[Backend] SAP Profile Response Data:', error.response.data);
//             res.status(error.response.status).json({
//                 error: `SAP responded with status ${error.response.status}.`,
//                 details: error.response.data
//             });
//         } else if (error.request) {
//             console.error('[Backend] No response received from SAP for profile:', error.request);
//             res.status(500).json({ error: 'No response received from SAP for profile. Check network or SAP server.' });
//         } else {
//             console.error('[Backend] Error setting up SAP profile request:', error.message);
//             res.status(500).json({ error: 'Error setting up SAP profile request.' });
//         }
//     }
// });


// // Start server
// app.listen(PORT, () => {
//     console.log(`✅ Server running on http://localhost:${PORT}`);
// });










// // index.js

// const express = require('express');
// const axios = require('axios');
// const xml2js = require('xml2js');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// require('dotenv').config();

// const app = express();
// const PORT = process.env.PORT || 3000;

// // Middleware
// app.use(cors());
// app.use(bodyParser.json());

// // Login route
// app.post('/api/login', async (req, res) => {
//     const { customerId, password } = req.body;

//     // Validate inputs
//     if (!customerId || !password) {
//         return res.status(400).json({ error: 'Customer ID and password are required.' });
//     }

//     // Construct SOAP envelope
//     const soapEnvelope = `
//     <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
//                       xmlns:urn="urn:sap-com:document:sap:rfc:functions">
//        <soapenv:Header/>
//        <soapenv:Body>
//           <urn:ZFM_CUSTOMER_PORTAL_LOGIN_RT>
//              <IV_CUSTOMER_ID>${customerId}</IV_CUSTOMER_ID>
//              <IV_PASSWORD>${password}</IV_PASSWORD>
//           </urn:ZFM_CUSTOMER_PORTAL_LOGIN_RT>
//        </soapenv:Body>
//     </soapenv:Envelope>`;

//     // SAP RFC Endpoint (you can also move this to .env)
//     const sapEndpoint = 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zlogin_svce_defn_rt?sap-client=100';

//     try {
//         // Send SOAP request to SAP
//         const response = await axios.post(sapEndpoint, soapEnvelope, {
//             headers: {
//                 'Content-Type': 'text/xml',
//                 'Accept': 'text/xml',
//                 'SOAPAction': '' // Usually empty for SAP
//             },
//             auth: {
//                 username: process.env.SAP_USER,
//                 password: process.env.SAP_PASS
//             },
//             timeout: 10000
//         });

//         // Parse SOAP XML response
//         xml2js.parseString(response.data, { explicitArray: false }, (err, result) => {
//             if (err) {
//                 console.error('XML Parse Error:', err);
//                 return res.status(500).json({ error: 'Failed to parse SAP response.' });
//             }

//             try {
//                 const body = result['soapenv:Envelope']['soapenv:Body'];
//                 const loginResponse = body['n0:ZFM_CUSTOMER_PORTAL_LOGIN_RTResponse'];

//                 const evMessage = loginResponse['EV_MESSAGE'];
//                 const evStatus = loginResponse['EV_STATUS'];

//                 // Send final response to frontend
//                 res.json({ message: evMessage, status: evStatus });
//             } catch (parseError) {
//                 console.error('Response structure unexpected:', parseError);
//                 res.status(500).json({ error: 'Unexpected SAP response structure.' });
//             }
//         });

//     } catch (error) {
//         console.error('SAP login error:', error.message);
//         res.status(500).json({ error: 'SAP login failed. Check connection or credentials.' });
//     }
// });

// // Start server
// app.listen(PORT, () => {
//     console.log(`✅ Server running on http://localhost:${PORT}`);
// });










// // index.js
// const express = require('express');
// const axios = require('axios');
// const xml2js = require('xml2js');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// require('dotenv').config();

// const app = express();
// const PORT = process.env.PORT || 3000;

// // Middleware
// app.use(cors());
// app.use(bodyParser.json());

// // Login route
// app.post('/api/login', async (req, res) => {
//     const { customerId, password } = req.body;

//     const soapEnvelope = `
//     <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
//                       xmlns:urn="urn:sap-com:document:sap:rfc:functions">
//        <soapenv:Header/>
//        <soapenv:Body>
//           <urn:ZFM_CUSTOMER_PORTAL_LOGIN_RT>
//              <IV_CUSTOMER_ID>${customerId}</IV_CUSTOMER_ID>
//              <IV_PASSWORD>${password}</IV_PASSWORD>
//           </urn:ZFM_CUSTOMER_PORTAL_LOGIN_RT>
//        </soapenv:Body>
//     </soapenv:Envelope>`;

//     const url = 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zlogin_svce_defn_rt?sap-client=100';

//     try {
//         const response = await axios.post(url, soapEnvelope, {
//             headers: {
//                 'Content-Type': 'text/xml',
//                 'Accept': 'text/xml',
//                 'SOAPAction': ''
//             },
//             auth: {
//                 username: process.env.SAP_USER,   // stored in .env
//                 password: process.env.SAP_PASS    // stored in .env
//             }
//         });

//         // Parse XML to JSON
//         xml2js.parseString(response.data, { explicitArray: false }, (err, result) => {
//             if (err) return res.status(500).json({ error: 'Failed to parse SOAP response' });

//             const body = result['soap-env:Envelope']['soap-env:Body'];
//             const responseData = body['n0:ZFM_CUSTOMER_PORTAL_LOGIN_RTResponse'];

//             const evMessage = responseData['EV_MESSAGE'];
//             const evStatus = responseData['EV_STATUS'];

//             res.json({ message: evMessage, status: evStatus });
//         });
//     } catch (error) {
//         console.error('SAP login error:', error);
//         res.status(500).json({ error: 'SAP login failed' });
//     }
// });

// app.listen(PORT, () => {
//     console.log(`Server running on http://localhost:${PORT}`);
// });
