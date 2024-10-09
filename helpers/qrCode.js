const QRCode = require('qrcode');
const fs = require('fs');


const productData = {
    id: 1,
    name: 'Product A',
    price: '$19.99',
    description: 'Lorem ipsum dolor sit amet...',

};

// Generate QR code
QRCode.toFile('./qr-codes/productA.png', JSON.stringify(productData), function (err) {
    if (err) throw err;
    console.log('QR code generated successfully');
});
