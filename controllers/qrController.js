import filterObject from '../helpers/filteredKeysUtils.js';
import * as qrCodeService from '../services/qrCodeServices.js';


// 2. get QR code
export const getQRCode = async (req, res) => {
    try {
        const poSupplierInvoiceMapperId = req.query.poSupplierInvoiceMapperId;
        
      
        if (!poSupplierInvoiceMapperId) {
            return res.status(400).json({ error: 'Missing poSupplierInvoiceMapperId' });
        }
        console.log(poSupplierInvoiceMapperId,'jsjsj');
        // Call the service function and send the response
        await qrCodeService.getQrCodesAndBarCodes(req, res);
        
    } catch (error) {
        console.error("Error in getting qrCode:", error);
        res.status(500).send("Internal Server Error");
    }
};