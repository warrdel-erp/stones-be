import fs from 'fs';


const qrCodeDir = 'public/qrCodes';
const barCodeDir = 'public/barCodes';

export async function getQrCodesAndBarCodes(req, res) {
    try {
        const poSupplierInvoiceMapper = req.query.poSupplierInvoiceMapperId; 
        console.log(req,'jsjsj');
        
        const qrCodeFiles = fs.readdirSync(qrCodeDir).filter(file => file.endsWith('.png'));
        const barCodeFiles = fs.readdirSync(barCodeDir).filter(file => file.endsWith('.png'));
        const extractIdFromFilename = (filename) => {
            const match = filename.match(/-(\d+)\.png$/);
            return match ? match[1] : null;
        };
        const qrCodes = qrCodeFiles
            .filter(file => extractIdFromFilename(file) === poSupplierInvoiceMapper)
            .map(file => {
                const filePath = `${qrCodeDir}/${file}`;
                const fileData = fs.readFileSync(filePath);
                const base64Image = `data:image/png;base64,${fileData.toString('base64')}`;
                return {
                    filename: file,
                    image: base64Image,
                };
            });

        const barCodes = barCodeFiles
            .filter(file => extractIdFromFilename(file) === poSupplierInvoiceMapper)
            .map(file => {
                const filePath = `${barCodeDir}/${file}`;
                const fileData = fs.readFileSync(filePath);
                const base64Image = `data:image/png;base64,${fileData.toString('base64')}`;
                return {
                    filename: file,
                    image: base64Image,
                };
            });

        res.json({
            qrCodes,
            barCodes
        });
    } catch (error) {
        console.error('Error fetching QR Codes and Bar Codes:', error);
        res.status(500).json({ error: 'Error fetching QR Codes and Bar Codes' });
    }
}
