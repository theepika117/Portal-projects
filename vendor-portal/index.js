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
    const { vendorId, password } = req.body;

    console.log(`[Backend] Received login request for Vendor ID: ${vendorId}`);

    // Validate inputs
    if (!vendorId || !password) {
        console.warn('[Backend] Validation Error: Vendor ID or password missing.');
        return res.status(400).json({ error: 'Vendor ID and password are required.' });
    }

    // Construct SOAP envelope
    const soapEnvelope = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:ZfmVendorLoginRt>
         <IvLfa1>${vendorId}</IvLfa1>
         <IvPassword>${password}</IvPassword>
      </urn:ZfmVendorLoginRt>
   </soapenv:Body>
</soapenv:Envelope>`;

    // SAP RFC Endpoint
    const sapEndpoint = 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zvp_vendor_login_srvc_defn_rt';

    try {
        console.log(`[Backend] Sending SOAP request to SAP endpoint: ${sapEndpoint}`);
        console.log(`[Backend] SOAP Envelope: \n${soapEnvelope}`);
        console.log(`[Backend] Using SAP User: ${process.env.SAP_USER}`);

        // Define auth object for axios
        const authConfig = {
            username: process.env.SAP_USER,
            password: process.env.SAP_PASS
        };
        console.log('[Backend] Auth config for login:', JSON.stringify(authConfig, null, 2));

        // Send SOAP request to SAP
        const response = await axios.post(sapEndpoint, soapEnvelope, {
            headers: {
                'Content-Type': 'text/xml',
                'Accept': 'text/xml',
                'SOAPAction': ''
            },
            auth: authConfig,
            params: {
                'sap-client': '100'
            },
            timeout: 15000
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
                const body = result['soap-env:Envelope']['soap-env:Body'];
                const loginResponse = body['n0:ZfmVendorLoginRtResponse'];

                if (!loginResponse) {
                    console.error('[Backend] SAP Response Error: ZfmVendorLoginRtResponse not found in XML.');
                    console.error('[Backend] Full Parsed XML Result:', JSON.stringify(result, null, 2));
                    return res.status(500).json({ error: 'Unexpected SAP response structure: Missing login response.' });
                }

                const evMessage = loginResponse['EvMessage'];
                const evStatus = loginResponse['EvStatus'];

                console.log(`[Backend] SAP Response - Message: "${evMessage}", Status: "${evStatus}"`);

                // Send final response to frontend including vendorId for storage
                res.json({ 
                    message: evMessage, 
                    status: evStatus,
                    vendorId: vendorId // Include vendorId in response for frontend storage
                });
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
app.get('/api/profile/:vendorId', async (req, res) => {
    const { vendorId } = req.params;

    console.log(`[Backend] Received profile request for Vendor ID: ${vendorId}`);

    // Validate input
    if (!vendorId) {
        console.warn('[Backend] Validation Error: Vendor ID missing.');
        return res.status(400).json({ error: 'Vendor ID is required.' });
    }

    // Construct SOAP envelope for profile
    const soapEnvelope = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:ZfmVendorProfileRt>
         <IvLifnr>${vendorId}</IvLifnr>
      </urn:ZfmVendorProfileRt>
   </soapenv:Body>
</soapenv:Envelope>`;

    // SAP Profile Endpoint
    const sapEndpoint = 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zvp_profile_srvc_defn';

    try {
        console.log(`[Backend] Sending SOAP request to SAP profile endpoint: ${sapEndpoint}`);
        console.log(`[Backend] SOAP Envelope: \n${soapEnvelope}`);
        console.log(`[Backend] Using SAP User: ${process.env.SAP_USER}`);

        // Define auth object for axios
        const authConfig = {
            username: process.env.SAP_USER,
            password: process.env.SAP_PASS
        };
        console.log('[Backend] Auth config for profile:', JSON.stringify(authConfig, null, 2));

        // Send SOAP request to SAP
        const response = await axios.post(sapEndpoint, soapEnvelope, {
            headers: {
                'Content-Type': 'text/xml',
                'Accept': 'text/xml',
                'SOAPAction': ''
            },
            auth: authConfig,
            params: {
                'sap-client': '100'
            },
            timeout: 15000
        });

        console.log('[Backend] Received profile response from SAP.');
        console.log('[Backend] SAP Profile Response Data (Raw):', response.data);

        // Parse SOAP XML response
        xml2js.parseString(response.data, { explicitArray: false }, (err, result) => {
            if (err) {
                console.error('[Backend] XML Parse Error:', err);
                return res.status(500).json({ error: 'Failed to parse SAP profile response XML.' });
            }

            try {
                const body = result['soap-env:Envelope']['soap-env:Body'];
                const profileResponse = body['n0:ZfmVendorProfileRtResponse'];

                if (!profileResponse) {
                    console.error('[Backend] SAP Profile Response Error: ZfmVendorProfileRtResponse not found in XML.');
                    console.error('[Backend] Full Parsed XML Result:', JSON.stringify(result, null, 2));
                    return res.status(500).json({ error: 'Unexpected SAP profile response structure: Missing profile response.' });
                }

                const profileData = profileResponse['EtProfileData'];
                
                if (!profileData || !profileData.item) {
                    console.error('[Backend] SAP Profile Response Error: Profile data not found.');
                    return res.status(404).json({ error: 'Profile data not found for the given vendor ID.' });
                }

                // Extract profile information
                const profile = profileData.item;
                
                console.log(`[Backend] SAP Profile Response - Vendor: "${profile.Name}", ID: "${profile.VendorId}"`);

                // Send final response to frontend
                res.json({
                    success: true,
                    profile: {
                        vendorId: profile.VendorId,
                        name: profile.Name,
                        address: profile.Address,
                        street: profile.Street,
                        city: profile.City,
                        postalCode: profile.PostalCode,
                        companyCode: profile.CompanyCode,
                        reconciliationAccount: profile.ReconciliationAccount,
                        purchasingOrg: profile.PurchasingOrg,
                        purchaseOrderCurrency: profile.PurchaseOrderCurrency
                    }
                });
            } catch (parseError) {
                console.error('[Backend] Profile response structure unexpected (during internal parsing):', parseError);
                console.error('[Backend] Full Parsed XML Result:', JSON.stringify(result, null, 2));
                res.status(500).json({ error: 'Unexpected SAP profile response structure during internal parsing.' });
            }
        });

    } catch (error) {
        console.error('[Backend] SAP profile request failed:', error.message);
        if (error.response) {
            console.error('[Backend] SAP Profile Response Status:', error.response.status);
            console.error('[Backend] SAP Profile Response Data:', error.response.data);
            res.status(error.response.status).json({
                error: `SAP responded with status ${error.response.status}.`,
                details: error.response.data
            });
        } else if (error.request) {
            console.error('[Backend] No response received from SAP:', error.request);
            res.status(500).json({ error: 'No response received from SAP. Check network or SAP server.' });
        } else {
            console.error('[Backend] Error setting up SAP profile request:', error.message);
            res.status(500).json({ error: 'Error setting up SAP profile request.' });
        }
    }
});






// Request for Quotation route
app.get('/api/quotation/:vendorId', async (req, res) => {
    const { vendorId } = req.params;

    console.log(`[Backend] Received quotation request for Vendor ID: ${vendorId}`);

    // Validate input
    if (!vendorId) {
        console.warn('[Backend] Validation Error: Vendor ID missing.');
        return res.status(400).json({ error: 'Vendor ID is required.' });
    }

    // Construct SOAP envelope for quotation
    const soapEnvelope = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:ZfmQuotationRt>
         <IvLifnr>${vendorId}</IvLifnr>
      </urn:ZfmQuotationRt>
   </soapenv:Body>
</soapenv:Envelope>`;

    // SAP Quotation Endpoint
    const sapEndpoint = 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zvp_quotation_srvc_defn_rt';

    try {
        console.log(`[Backend] Sending SOAP request to SAP quotation endpoint: ${sapEndpoint}`);
        console.log(`[Backend] SOAP Envelope: \n${soapEnvelope}`);
        console.log(`[Backend] Using SAP User: ${process.env.SAP_USER}`);

        // Define auth object for axios
        const authConfig = {
            username: process.env.SAP_USER,
            password: process.env.SAP_PASS
        };
        console.log('[Backend] Auth config for quotation:', JSON.stringify(authConfig, null, 2));

        // Send SOAP request to SAP
        const response = await axios.post(sapEndpoint, soapEnvelope, {
            headers: {
                'Content-Type': 'text/xml',
                'Accept': 'text/xml',
                'SOAPAction': ''
            },
            auth: authConfig,
            params: {
                'sap-client': '100'
            },
            timeout: 15000
        });

        console.log('[Backend] Received quotation response from SAP.');
        console.log('[Backend] SAP Quotation Response Data (Raw):', response.data);

        // Parse SOAP XML response
        xml2js.parseString(response.data, { explicitArray: false }, (err, result) => {
            if (err) {
                console.error('[Backend] XML Parse Error:', err);
                return res.status(500).json({ error: 'Failed to parse SAP quotation response XML.' });
            }

            try {
                const body = result['soap-env:Envelope']['soap-env:Body'];
                const quotationResponse = body['n0:ZfmQuotationRtResponse'];

                if (!quotationResponse) {
                    console.error('[Backend] SAP Quotation Response Error: ZfmQuotationRtResponse not found in XML.');
                    console.error('[Backend] Full Parsed XML Result:', JSON.stringify(result, null, 2));
                    return res.status(500).json({ error: 'Unexpected SAP quotation response structure: Missing quotation response.' });
                }

                const quotationData = quotationResponse['EtQuotationRequest'];
                
                if (!quotationData) {
                    console.log('[Backend] No quotation requests found for vendor.');
                    return res.json({
                        success: true,
                        quotations: []
                    });
                }

                // Handle both single item and array of items
                let quotations = [];
                if (Array.isArray(quotationData.item)) {
                    quotations = quotationData.item;
                } else if (quotationData.item) {
                    quotations = [quotationData.item];
                }

                // Map quotation data to frontend structure
                const mappedQuotations = quotations.map(item => ({
                    docNum: item.DocNum,
                    docType: item.DocType,
                    purchasingOrg: item.PurchasingOrg,
                    purchasingGrp: item.PuchasingGrp,
                    docDate: item.DocDate,
                    creator: item.Creator,
                    itemNum: item.ItemNum,
                    materialNum: item.MaterialNum,
                    shortTxt: item.ShortTxt,
                    purchaseOrderQnty: parseFloat(item.PurchaseOrderQnty) || 0,
                    unitOfMeasure: item.UnitOfMeasure,
                    netPrice: parseFloat(item.NetPrice) || 0,
                    deliveryDate: item.DeliveryDate,
                    currencyKey: item.CurrencyKey
                }));
                
                console.log(`[Backend] SAP Quotation Response - Found ${mappedQuotations.length} quotation(s)`);

                // Send final response to frontend
                res.json({
                    success: true,
                    quotations: mappedQuotations
                });
            } catch (parseError) {
                console.error('[Backend] Quotation response structure unexpected (during internal parsing):', parseError);
                console.error('[Backend] Full Parsed XML Result:', JSON.stringify(result, null, 2));
                res.status(500).json({ error: 'Unexpected SAP quotation response structure during internal parsing.' });
            }
        });

    } catch (error) {
        console.error('[Backend] SAP quotation request failed:', error.message);
        if (error.response) {
            console.error('[Backend] SAP Quotation Response Status:', error.response.status);
            console.error('[Backend] SAP Quotation Response Data:', error.response.data);
            res.status(error.response.status).json({
                error: `SAP responded with status ${error.response.status}.`,
                details: error.response.data
            });
        } else if (error.request) {
            console.error('[Backend] No response received from SAP:', error.request);
            res.status(500).json({ error: 'No response received from SAP. Check network or SAP server.' });
        } else {
            console.error('[Backend] Error setting up SAP quotation request:', error.message);
            res.status(500).json({ error: 'Error setting up SAP quotation request.' });
        }
    }
});

// Purchase Order route
app.get('/api/purchase-order/:vendorId', async (req, res) => {
    const { vendorId } = req.params;

    console.log(`[Backend] Received purchase order request for Vendor ID: ${vendorId}`);

    // Validate input
    if (!vendorId) {
        console.warn('[Backend] Validation Error: Vendor ID missing.');
        return res.status(400).json({ error: 'Vendor ID is required.' });
    }

    // Construct SOAP envelope for purchase order
    const soapEnvelope = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:ZfmPurchaseOrderRt>
         <IvLifnr>${vendorId}</IvLifnr>
      </urn:ZfmPurchaseOrderRt>
   </soapenv:Body>
</soapenv:Envelope>`;

    // SAP Purchase Order Endpoint
    const sapEndpoint = 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zvp_purchaseorder_srvc_defn_rt';

    try {
        console.log(`[Backend] Sending SOAP request to SAP purchase order endpoint: ${sapEndpoint}`);
        console.log(`[Backend] SOAP Envelope: \n${soapEnvelope}`);
        console.log(`[Backend] Using SAP User: ${process.env.SAP_USER}`);

        // Define auth object for axios
        const authConfig = {
            username: process.env.SAP_USER,
            password: process.env.SAP_PASS
        };
        console.log('[Backend] Auth config for purchase order:', JSON.stringify(authConfig, null, 2));

        // Send SOAP request to SAP
        const response = await axios.post(sapEndpoint, soapEnvelope, {
            headers: {
                'Content-Type': 'text/xml',
                'Accept': 'text/xml',
                'SOAPAction': ''
            },
            auth: authConfig,
            params: {
                'sap-client': '100'
            },
            timeout: 15000
        });

        console.log('[Backend] Received purchase order response from SAP.');
        console.log('[Backend] SAP Purchase Order Response Data (Raw):', response.data);

        // Parse SOAP XML response
        xml2js.parseString(response.data, { explicitArray: false }, (err, result) => {
            if (err) {
                console.error('[Backend] XML Parse Error:', err);
                return res.status(500).json({ error: 'Failed to parse SAP purchase order response XML.' });
            }

            try {
                const body = result['soap-env:Envelope']['soap-env:Body'];
                const purchaseOrderResponse = body['n0:ZfmPurchaseOrderRtResponse'];

                if (!purchaseOrderResponse) {
                    console.error('[Backend] SAP Purchase Order Response Error: ZfmPurchaseOrderRtResponse not found in XML.');
                    console.error('[Backend] Full Parsed XML Result:', JSON.stringify(result, null, 2));
                    return res.status(500).json({ error: 'Unexpected SAP purchase order response structure: Missing purchase order response.' });
                }

                const purchaseOrderData = purchaseOrderResponse['EtPurchaseOrder'];
                
                if (!purchaseOrderData) {
                    console.log('[Backend] No purchase orders found for vendor.');
                    return res.json({
                        success: true,
                        purchaseOrders: []
                    });
                }

                // Handle both single item and array of items
                let purchaseOrders = [];
                if (Array.isArray(purchaseOrderData.item)) {
                    purchaseOrders = purchaseOrderData.item;
                } else if (purchaseOrderData.item) {
                    purchaseOrders = [purchaseOrderData.item];
                }

                // Map purchase order data to frontend structure
                const mappedPurchaseOrders = purchaseOrders.map(item => ({
                    docNum: item.DocNum,
                    docType: item.DocType,
                    purchasingOrg: item.PurchasingOrg,
                    purchasingGrp: item.PuchasingGrp,
                    docDate: item.DocDate,
                    deliveryDate: item.DeliveryDate,
                    creator: item.Creator,
                    itemNum: item.ItemNum,
                    materialNum: item.MaterialNum,
                    shortTxt: item.ShortTxt,
                    purchaseOrderQnty: parseFloat(item.PurchaseOrderQnty) || 0,
                    unitOfMeasure: item.UnitOfMeasure,
                    netPrice: parseFloat(item.NetPrice) || 0,
                    plant: item.Plant,
                    itemCat: item.ItemCat
                }));
                
                console.log(`[Backend] SAP Purchase Order Response - Found ${mappedPurchaseOrders.length} purchase order(s)`);

                // Send final response to frontend
                res.json({
                    success: true,
                    purchaseOrders: mappedPurchaseOrders
                });
            } catch (parseError) {
                console.error('[Backend] Purchase order response structure unexpected (during internal parsing):', parseError);
                console.error('[Backend] Full Parsed XML Result:', JSON.stringify(result, null, 2));
                res.status(500).json({ error: 'Unexpected SAP purchase order response structure during internal parsing.' });
            }
        });

    } catch (error) {
        console.error('[Backend] SAP purchase order request failed:', error.message);
        if (error.response) {
            console.error('[Backend] SAP Purchase Order Response Status:', error.response.status);
            console.error('[Backend] SAP Purchase Order Response Data:', error.response.data);
            res.status(error.response.status).json({
                error: `SAP responded with status ${error.response.status}.`,
                details: error.response.data
            });
        } else if (error.request) {
            console.error('[Backend] No response received from SAP:', error.request);
            res.status(500).json({ error: 'No response received from SAP. Check network or SAP server.' });
        } else {
            console.error('[Backend] Error setting up SAP purchase order request:', error.message);
            res.status(500).json({ error: 'Error setting up SAP purchase order request.' });
        }
    }
});

// Goods Receipt route
app.get('/api/goods-receipt/:vendorId', async (req, res) => {
    const { vendorId } = req.params;

    console.log(`[Backend] Received goods receipt request for Vendor ID: ${vendorId}`);

    // Validate input
    if (!vendorId) {
        console.warn('[Backend] Validation Error: Vendor ID missing.');
        return res.status(400).json({ error: 'Vendor ID is required.' });
    }

    // Construct SOAP envelope for goods receipt
    const soapEnvelope = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:ZfmGoodsReceiptRt>
         <IvLifnr>${vendorId}</IvLifnr>
      </urn:ZfmGoodsReceiptRt>
   </soapenv:Body>
</soapenv:Envelope>`;

    // SAP Goods Receipt Endpoint
    const sapEndpoint = 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zvp_goods_receipt_srvc_defn_rt';

    try {
        console.log(`[Backend] Sending SOAP request to SAP goods receipt endpoint: ${sapEndpoint}`);
        console.log(`[Backend] SOAP Envelope: \n${soapEnvelope}`);
        console.log(`[Backend] Using SAP User: ${process.env.SAP_USER}`);

        // Define auth object for axios
        const authConfig = {
            username: process.env.SAP_USER,
            password: process.env.SAP_PASS
        };
        console.log('[Backend] Auth config for goods receipt:', JSON.stringify(authConfig, null, 2));

        // Send SOAP request to SAP
        const response = await axios.post(sapEndpoint, soapEnvelope, {
            headers: {
                'Content-Type': 'text/xml',
                'Accept': 'text/xml',
                'SOAPAction': ''
            },
            auth: authConfig,
            params: {
                'sap-client': '100'
            },
            timeout: 15000
        });

        console.log('[Backend] Received goods receipt response from SAP.');
        console.log('[Backend] SAP Goods Receipt Response Data (Raw):', response.data);

        // Parse SOAP XML response
        xml2js.parseString(response.data, { explicitArray: false }, (err, result) => {
            if (err) {
                console.error('[Backend] XML Parse Error:', err);
                return res.status(500).json({ error: 'Failed to parse SAP goods receipt response XML.' });
            }

            try {
                const body = result['soap-env:Envelope']['soap-env:Body'];
                const goodsReceiptResponse = body['n0:ZfmGoodsReceiptRtResponse'];

                if (!goodsReceiptResponse) {
                    console.error('[Backend] SAP Goods Receipt Response Error: ZfmGoodsReceiptRtResponse not found in XML.');
                    console.error('[Backend] Full Parsed XML Result:', JSON.stringify(result, null, 2));
                    return res.status(500).json({ error: 'Unexpected SAP goods receipt response structure: Missing goods receipt response.' });
                }

                const goodsReceiptData = goodsReceiptResponse['EtGoodsReceipt'];
                
                if (!goodsReceiptData) {
                    console.log('[Backend] No goods receipts found for vendor.');
                    return res.json({
                        success: true,
                        goodsReceipts: []
                    });
                }

                // Handle both single item and array of items
                let goodsReceipts = [];
                if (Array.isArray(goodsReceiptData.item)) {
                    goodsReceipts = goodsReceiptData.item;
                } else if (goodsReceiptData.item) {
                    goodsReceipts = [goodsReceiptData.item];
                }

                // Map goods receipt data to frontend structure
                const mappedGoodsReceipts = goodsReceipts.map(item => ({
                    materialDocNum: item.MaterialDocNum,
                    materialDocYear: item.MaterialDocYear,
                    docDate: item.DocDate,
                    postingDate: item.PostingDate,
                    docType: item.DocType,
                    userName: item.UserName,
                    itemNumM: item.ItemNumM,
                    purchaseOrderNum: item.PurchaseOrderNum,
                    itemNumP: item.ItemNumP,
                    movementType: item.MovementType,
                    unitOfMeasure: item.UnitOfMeasure,
                    materialNum: item.MaterialNum,
                    plant: item.Plant,
                    storageLoc: item.StorageLoc,
                    supplierNum: item.SuplierNum
                }));
                
                console.log(`[Backend] SAP Goods Receipt Response - Found ${mappedGoodsReceipts.length} goods receipt(s)`);

                // Send final response to frontend
                res.json({
                    success: true,
                    goodsReceipts: mappedGoodsReceipts
                });
            } catch (parseError) {
                console.error('[Backend] Goods receipt response structure unexpected (during internal parsing):', parseError);
                console.error('[Backend] Full Parsed XML Result:', JSON.stringify(result, null, 2));
                res.status(500).json({ error: 'Unexpected SAP goods receipt response structure during internal parsing.' });
            }
        });

    } catch (error) {
        console.error('[Backend] SAP goods receipt request failed:', error.message);
        if (error.response) {
            console.error('[Backend] SAP Goods Receipt Response Status:', error.response.status);
            console.error('[Backend] SAP Goods Receipt Response Data:', error.response.data);
            res.status(error.response.status).json({
                error: `SAP responded with status ${error.response.status}.`,
                details: error.response.data
            });
        } else if (error.request) {
            console.error('[Backend] No response received from SAP:', error.request);
            res.status(500).json({ error: 'No response received from SAP. Check network or SAP server.' });
        } else {
            console.error('[Backend] Error setting up SAP goods receipt request:', error.message);
            res.status(500).json({ error: 'Error setting up SAP goods receipt request.' });
        }
    }
});

//invoice download route:
app.get('/api/download-invoice/:docNum', async (req, res) => {
    const { docNum } = req.params;

    const vendorId = req.query.vendorId; // <-- Get vendorId from query params

    console.log(`[Backend] Received invoice download request for Document Number: ${docNum}`);
    console.log(`[Backend] Vendor ID from request: ${vendorId}`);

    if (!docNum || !vendorId) {
        console.warn('[Backend] Validation Error: Missing Document Number or Vendor ID.');
        return res.status(400).json({ error: 'Document Number and Vendor ID are required.' });
    }

    // Construct SOAP envelope for invoice download
    const soapEnvelope = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
        <soapenv:Header/>
        <soapenv:Body>
            <urn:ZfmMmInvoiceDownloadRt>
                <IvDoc>${docNum}</IvDoc>
                <IvVendorid>${vendorId}</IvVendorid>
            </urn:ZfmMmInvoiceDownloadRt>
        </soapenv:Body>
    </soapenv:Envelope>`;

    // SAP Invoice Download Endpoint
    const sapEndpoint = 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zvp_invoice_download_srvf_defn?sap-client=100';

    try {
        console.log(`[Backend] Sending SOAP request to SAP invoice download endpoint: ${sapEndpoint}`);
        console.log(`[Backend] SOAP Envelope: \n${soapEnvelope}`);
        console.log(`[Backend] Using SAP User: ${process.env.SAP_USER}`);

        // Define auth object for axios
        const authConfig = {
            username: process.env.SAP_USER,
            password: process.env.SAP_PASS
        };
        console.log('[Backend] Auth config for invoice download:', JSON.stringify(authConfig, null, 2));

        // Send SOAP request to SAP
        const response = await axios.post(sapEndpoint, soapEnvelope, {
            headers: {
                'Content-Type': 'text/xml',
                'SOAPAction': '',
                'Accept': 'text/xml'
            },
            auth: authConfig,
            params: {
                'sap-client': '100'
            },
            timeout: 15000
        });

        console.log('[Backend] Received invoice download response from SAP.');
        console.log('[Backend] SAP Invoice Download Response Data (Raw):', response.data);

        // Parse SOAP XML response
        xml2js.parseString(response.data, { explicitArray: false }, (err, result) => {
            if (err) {
                console.error('[Backend] XML Parse Error:', err);
                return res.status(500).json({ error: 'Failed to parse SAP invoice download response XML.' });
            }

            try {
                const body = result['soap-env:Envelope']['soap-env:Body'];
                
                // --- MODIFIED LOGIC START ---
                // The correct response tag for vendor invoices is 'n0:ZfmMmInvoiceDownloadRtResponse'
                // The PDF data is correctly located in the 'PPdf' field within this tag.
                const invoiceDownloadResponse = body['n0:ZfmMmInvoiceDownloadRtResponse'];
                const base64Pdf = invoiceDownloadResponse?.['PPdf'];

                if (!base64Pdf) {
                    console.error('[Backend] SAP Invoice Download Response Error: PPdf field not found in XML.');
                    console.error('[Backend] Full Parsed XML Result:', JSON.stringify(result, null, 2));
                    return res.status(404).json({ error: 'No PDF data found for this invoice.' });
                }
                // --- MODIFIED LOGIC END ---

                console.log('[Backend] Found base64 PDF string.');

                // Decode the base64 string and send the PDF data as a buffer
                const pdfBuffer = Buffer.from(base64Pdf, 'base64');
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename="Invoice_${docNum}.pdf"`);
                res.send(pdfBuffer);
                console.log('[Backend] Successfully sent PDF to frontend.');

            } catch (parseError) {
                console.error('[Backend] Invoice download response structure unexpected (during internal parsing):', parseError);
                console.error('[Backend] Full Parsed XML Result:', JSON.stringify(result, null, 2));
                res.status(500).json({ error: 'Unexpected SAP invoice download response structure during internal parsing.' });
            }
        });
    } catch (error) {
        console.error('[Backend] SAP invoice download request failed:', error.message);
        if (error.response) {
            console.error('[Backend] SAP Invoice Download Response Status:', error.response.status);
            console.error('[Backend] SAP Invoice Download Response Data:', error.response.data);
            res.status(error.response.status).json({
                error: `SAP responded with status ${error.response.status}.`,
                details: error.response.data
            });
        } else if (error.request) {
            console.error('[Backend] No response received from SAP:', error.request);
            res.status(500).json({ error: 'No response received from SAP. Check network or SAP server.' });
        } else {
            console.error('[Backend] Error setting up SAP invoice download request:', error.message);
            res.status(500).json({ error: 'Error setting up SAP invoice download request.' });
        }
    }
});

// Invoice Details route
app.get('/api/invoice-details/:vendorId', async (req, res) => {
    const { vendorId } = req.params;

    console.log(`[Backend] Received invoice details request for Vendor ID: ${vendorId}`);

    // Validate input
    if (!vendorId) {
        console.warn('[Backend] Validation Error: Vendor ID missing.');
        return res.status(400).json({ error: 'Vendor ID is required.' });
    }

    // Construct SOAP envelope for invoice details
    const soapEnvelope = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:ZfmVpInvoiceDisplayRt>
         <IvLifnr>${vendorId}</IvLifnr>
      </urn:ZfmVpInvoiceDisplayRt>
   </soapenv:Body>
</soapenv:Envelope>`;

    // SAP Invoice Details Endpoint
    const sapEndpoint = 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zvp_invoice_disp_srvc_defn';

    try {
        console.log(`[Backend] Sending SOAP request to SAP invoice details endpoint: ${sapEndpoint}`);
        console.log(`[Backend] SOAP Envelope: \n${soapEnvelope}`);
        console.log(`[Backend] Using SAP User: ${process.env.SAP_USER}`);

        // Define auth object for axios
        const authConfig = {
            username: process.env.SAP_USER,
            password: process.env.SAP_PASS
        };
        console.log('[Backend] Auth config for invoice details:', JSON.stringify(authConfig, null, 2));

        // Send SOAP request to SAP
        const response = await axios.post(sapEndpoint, soapEnvelope, {
            headers: {
                'Content-Type': 'text/xml',
                'Accept': 'text/xml',
                'SOAPAction': ''
            },
            auth: authConfig,
            params: {
                'sap-client': '100'
            },
            timeout: 15000
        });

        console.log('[Backend] Received invoice details response from SAP.');
        console.log('[Backend] SAP Invoice Details Response Data (Raw):', response.data);

        // Parse SOAP XML response
        xml2js.parseString(response.data, { explicitArray: false }, (err, result) => {
            if (err) {
                console.error('[Backend] XML Parse Error:', err);
                return res.status(500).json({ error: 'Failed to parse SAP invoice details response XML.' });
            }

            try {
                const body = result['soap-env:Envelope']['soap-env:Body'];
                const invoiceDetailsResponse = body['n0:ZfmVpInvoiceDisplayRtResponse'];

                if (!invoiceDetailsResponse) {
                    console.error('[Backend] SAP Invoice Details Response Error: ZfmVpInvoiceDisplayRtResponse not found in XML.');
                    console.error('[Backend] Full Parsed XML Result:', JSON.stringify(result, null, 2));
                    return res.status(500).json({ error: 'Unexpected SAP invoice details response structure: Missing invoice details response.' });
                }

                const invoiceDetailsData = invoiceDetailsResponse['EtInvoiceData'];
                
                if (!invoiceDetailsData) {
                    console.log('[Backend] No invoice details found for vendor.');
                    return res.json({
                        success: true,
                        invoiceDetails: []
                    });
                }

                // Handle both single item and array of items
                let invoiceDetails = [];
                if (Array.isArray(invoiceDetailsData.item)) {
                    invoiceDetails = invoiceDetailsData.item;
                } else if (invoiceDetailsData.item) {
                    invoiceDetails = [invoiceDetailsData.item];
                }

                // Map invoice details data to frontend structure
                const mappedInvoiceDetails = invoiceDetails.map(item => ({
                    docNum: item.DocNum,
                    fiscalYear: item.FiscalYear,
                    docType: item.DocType,
                    docDate: item.DocDate,
                    userName: item.UserName,
                    companyCode: item.CompanyCode,
                    waers: item.Waers,
                    grossAmount: parseFloat(item.GrossAmount) || 0,
                    taxAmount: parseFloat(item.TaxAmount) || 0,
                    purchaseDocNum: item.PurchaseDocNum,
                    itemNum: item.ItemNum,
                    materialNum: item.MaterialNum,
                    plant: item.Plant,
                    amount: parseFloat(item.Amount) || 0,
                    quantity: parseFloat(item.Quantity) || 0,
                    unit: item.Unit
                }));
                
                console.log(`[Backend] SAP Invoice Details Response - Found ${mappedInvoiceDetails.length} invoice detail(s)`);

                // Send final response to frontend
                res.json({
                    success: true,
                    invoiceDetails: mappedInvoiceDetails
                });
            } catch (parseError) {
                console.error('[Backend] Invoice details response structure unexpected (during internal parsing):', parseError);
                console.error('[Backend] Full Parsed XML Result:', JSON.stringify(result, null, 2));
                res.status(500).json({ error: 'Unexpected SAP invoice details response structure during internal parsing.' });
            }
        });

    } catch (error) {
        console.error('[Backend] SAP invoice details request failed:', error.message);
        if (error.response) {
            console.error('[Backend] SAP Invoice Details Response Status:', error.response.status);
            console.error('[Backend] SAP Invoice Details Response Data:', error.response.data);
            res.status(error.response.status).json({
                error: `SAP responded with status ${error.response.status}.`,
                details: error.response.data
            });
        } else if (error.request) {
            console.error('[Backend] No response received from SAP:', error.request);
            res.status(500).json({ error: 'No response received from SAP. Check network or SAP server.' });
        } else {
            console.error('[Backend] Error setting up SAP invoice details request:', error.message);
            res.status(500).json({ error: 'Error setting up SAP invoice details request.' });
        }
    }
});

// Payments and Ageing route
app.get('/api/payments-ageing/:vendorId', async (req, res) => {
    const { vendorId } = req.params;

    console.log(`[Backend] Received payments and ageing request for Vendor ID: ${vendorId}`);

    // Validate input
    if (!vendorId) {
        console.warn('[Backend] Validation Error: Vendor ID missing.');
        return res.status(400).json({ error: 'Vendor ID is required.' });
    }

    // Construct SOAP envelope for payments and ageing
    const soapEnvelope = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:ZfmVendorPaymentsRt>
         <IvLifnr>${vendorId}</IvLifnr>
      </urn:ZfmVendorPaymentsRt>
   </soapenv:Body>
</soapenv:Envelope>`;

    // SAP Payments and Ageing Endpoint
    const sapEndpoint = 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zvp_payments_srvc_defn_rt';

    try {
        console.log(`[Backend] Sending SOAP request to SAP payments and ageing endpoint: ${sapEndpoint}`);
        console.log(`[Backend] SOAP Envelope: \n${soapEnvelope}`);
        console.log(`[Backend] Using SAP User: ${process.env.SAP_USER}`);

        // Define auth object for axios
        const authConfig = {
            username: process.env.SAP_USER,
            password: process.env.SAP_PASS
        };
        console.log('[Backend] Auth config for payments and ageing:', JSON.stringify(authConfig, null, 2));

        // Send SOAP request to SAP
        const response = await axios.post(sapEndpoint, soapEnvelope, {
            headers: {
                'Content-Type': 'text/xml',
                'Accept': 'text/xml',
                'SOAPAction': ''
            },
            auth: authConfig,
            params: {
                'sap-client': '100'
            },
            timeout: 15000
        });

        console.log('[Backend] Received payments and ageing response from SAP.');
        console.log('[Backend] SAP Payments and Ageing Response Data (Raw):', response.data);

        // Parse SOAP XML response
        xml2js.parseString(response.data, { explicitArray: false }, (err, result) => {
            if (err) {
                console.error('[Backend] XML Parse Error:', err);
                return res.status(500).json({ error: 'Failed to parse SAP payments and ageing response XML.' });
            }

            try {
                const body = result['soap-env:Envelope']['soap-env:Body'];
                const paymentsAgeingResponse = body['n0:ZfmVendorPaymentsRtResponse'];

                if (!paymentsAgeingResponse) {
                    console.error('[Backend] SAP Payments and Ageing Response Error: ZfmVendorPaymentsRtResponse not found in XML.');
                    console.error('[Backend] Full Parsed XML Result:', JSON.stringify(result, null, 2));
                    return res.status(500).json({ error: 'Unexpected SAP payments and ageing response structure: Missing payments and ageing response.' });
                }

                const paymentsAgeingData = paymentsAgeingResponse['EtAgeingData'];
                
                if (!paymentsAgeingData) {
                    console.log('[Backend] No payments and ageing data found for vendor.');
                    return res.json({
                        success: true,
                        paymentsAgeing: []
                    });
                }

                // Handle both single item and array of items
                let paymentsAgeing = [];
                if (Array.isArray(paymentsAgeingData.item)) {
                    paymentsAgeing = paymentsAgeingData.item;
                } else if (paymentsAgeingData.item) {
                    paymentsAgeing = [paymentsAgeingData.item];
                }

                // Map payments and ageing data to frontend structure
                const mappedPaymentsAgeing = paymentsAgeing.map(item => ({
                    docNum: item.DocNum,
                    docDate: item.DocDate,
                    dats: item.Dats,
                    amount: parseFloat(item.Amount) || 0,
                    aging: parseInt(item.Aging) || 0
                }));
                
                console.log(`[Backend] SAP Payments and Ageing Response - Found ${mappedPaymentsAgeing.length} payment(s) and ageing record(s)`);

                // Send final response to frontend
                res.json({
                    success: true,
                    paymentsAgeing: mappedPaymentsAgeing
                });
            } catch (parseError) {
                console.error('[Backend] Payments and ageing response structure unexpected (during internal parsing):', parseError);
                console.error('[Backend] Full Parsed XML Result:', JSON.stringify(result, null, 2));
                res.status(500).json({ error: 'Unexpected SAP payments and ageing response structure during internal parsing.' });
            }
        });

    } catch (error) {
        console.error('[Backend] SAP payments and ageing request failed:', error.message);
        if (error.response) {
            console.error('[Backend] SAP Payments and Ageing Response Status:', error.response.status);
            console.error('[Backend] SAP Payments and Ageing Response Data:', error.response.data);
            res.status(error.response.status).json({
                error: `SAP responded with status ${error.response.status}.`,
                details: error.response.data
            });
        } else if (error.request) {
            console.error('[Backend] No response received from SAP:', error.request);
            res.status(500).json({ error: 'No response received from SAP. Check network or SAP server.' });
        } else {
            console.error('[Backend] Error setting up SAP payments and ageing request:', error.message);
            res.status(500).json({ error: 'Error setting up SAP payments and ageing request.' });
        }
    }
});

// Credit Debit route
app.get('/api/credit-debit/:vendorId', async (req, res) => {
    const { vendorId } = req.params;

    console.log(`[Backend] Received credit debit request for Vendor ID: ${vendorId}`);

    // Validate input
    if (!vendorId) {
        console.warn('[Backend] Validation Error: Vendor ID missing.');
        return res.status(400).json({ error: 'Vendor ID is required.' });
    }

    // Construct SOAP envelope for credit debit
    const soapEnvelope = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:ZfmVendorCreditdebitRt>
         <IvLifnr>${vendorId}</IvLifnr>
      </urn:ZfmVendorCreditdebitRt>
   </soapenv:Body>
</soapenv:Envelope>`;

    // SAP Credit Debit Endpoint
    const sapEndpoint = 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zvp_creditdebit_srvc_defn_rt';

    try {
        console.log(`[Backend] Sending SOAP request to SAP credit debit endpoint: ${sapEndpoint}`);
        console.log(`[Backend] SOAP Envelope: \n${soapEnvelope}`);
        console.log(`[Backend] Using SAP User: ${process.env.SAP_USER}`);

        // Define auth object for axios
        const authConfig = {
            username: process.env.SAP_USER,
            password: process.env.SAP_PASS
        };
        console.log('[Backend] Auth config for credit debit:', JSON.stringify(authConfig, null, 2));

        // Send SOAP request to SAP
        const response = await axios.post(sapEndpoint, soapEnvelope, {
            headers: {
                'Content-Type': 'text/xml',
                'Accept': 'text/xml',
                'SOAPAction': ''
            },
            auth: authConfig,
            params: {
                'sap-client': '100'
            },
            timeout: 15000
        });

        console.log('[Backend] Received credit debit response from SAP.');
        console.log('[Backend] SAP Credit Debit Response Data (Raw):', response.data);

        // Parse SOAP XML response
        xml2js.parseString(response.data, { explicitArray: false }, (err, result) => {
            if (err) {
                console.error('[Backend] XML Parse Error:', err);
                return res.status(500).json({ error: 'Failed to parse SAP credit debit response XML.' });
            }

            try {
                const body = result['soap-env:Envelope']['soap-env:Body'];
                const creditDebitResponse = body['n0:ZfmVendorCreditdebitRtResponse'];

                if (!creditDebitResponse) {
                    console.error('[Backend] SAP Credit Debit Response Error: ZfmVendorCreditdebitRtResponse not found in XML.');
                    console.error('[Backend] Full Parsed XML Result:', JSON.stringify(result, null, 2));
                    return res.status(500).json({ error: 'Unexpected SAP credit debit response structure: Missing credit debit response.' });
                }

                const creditDebitData = creditDebitResponse['EtCreditDebit'];
                
                if (!creditDebitData) {
                    console.log('[Backend] No credit debit data found for vendor.');
                    return res.json({
                        success: true,
                        creditDebit: []
                    });
                }

                // Handle both single item and array of items
                let creditDebit = [];
                if (Array.isArray(creditDebitData.item)) {
                    creditDebit = creditDebitData.item;
                } else if (creditDebitData.item) {
                    creditDebit = [creditDebitData.item];
                }

                // Map credit debit data to frontend structure
                const mappedCreditDebit = creditDebit.map(item => ({
                    companyCode: item.CompanyCode,
                    docNum: item.DocNum,
                    fiscalYear: item.FiscalYear,
                    lineItemNum: item.LineItemNum,
                    type: item.Type,
                    amount: parseFloat(item.Amount) || 0,
                    generalLedger: item.GendralLedger,
                    postingKey: item.PostingKey,
                    vendorNum: item.VendorNum,
                    clearingDocNum: item.ClearingDocNum,
                    specialIndicator: item.SpecialIndicator,
                    postingDate: item.PostingDate,
                    docDate: item.DocDate,
                    docCurrency: item.DocCurrency,
                    creatorName: item.CreatorName
                }));
                
                console.log(`[Backend] SAP Credit Debit Response - Found ${mappedCreditDebit.length} credit debit record(s)`);

                // Send final response to frontend
                res.json({
                    success: true,
                    creditDebit: mappedCreditDebit
                });
            } catch (parseError) {
                console.error('[Backend] Credit debit response structure unexpected (during internal parsing):', parseError);
                console.error('[Backend] Full Parsed XML Result:', JSON.stringify(result, null, 2));
                res.status(500).json({ error: 'Unexpected SAP credit debit response structure during internal parsing.' });
            }
        });

    } catch (error) {
        console.error('[Backend] SAP credit debit request failed:', error.message);
        if (error.response) {
            console.error('[Backend] SAP Credit Debit Response Status:', error.response.status);
            console.error('[Backend] SAP Credit Debit Response Data:', error.response.data);
            res.status(error.response.status).json({
                error: `SAP responded with status ${error.response.status}.`,
                details: error.response.data
            });
        } else if (error.request) {
            console.error('[Backend] No response received from SAP:', error.request);
            res.status(500).json({ error: 'No response received from SAP. Check network or SAP server.' });
        } else {
            console.error('[Backend] Error setting up SAP credit debit request:', error.message);
            res.status(500).json({ error: 'Error setting up SAP credit debit request.' });
        }
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`[Backend] Server is running on http://localhost:${PORT}`);
    console.log(`[Backend] Login endpoint available at: http://localhost:${PORT}/api/login`);
});
