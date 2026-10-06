const fs = require('fs');

let content = fs.readFileSync('src/models/salesOrderProduct.model.ts', 'utf8');

if (!content.includes('discountPercentage: {')) {
    content = content.replace(
      'amount: {',
      `discountPercentage: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0,
    },
    amount: {`
    );
    fs.writeFileSync('src/models/salesOrderProduct.model.ts', content);
    console.log("Updated model");
}
