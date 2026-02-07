# Customer Bulk Upload

## Overview
The customer bulk upload endpoint allows you to create multiple customers with their addresses (shipping and remit) in a single CSV file upload.

## Endpoint
```
POST /customers/bulkUpload
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

## CSV Format

### Required Fields
- `name` - Customer name (required)
- `email` - Customer email (required, must be valid email format)
- `primaryPhoneNumber` - Primary phone number (required for bulk upload; must be unique per client)

### Optional Customer Fields
- `contactName` - Primary contact person name
- `printName` - Name to use on printed documents
- `secondaryPhoneNumber` - Secondary phone number
- `landlineNumber` - Landline phone number
- `type` - Customer type
- `priceLevel` - Price level for customer
- `taxExempt` - Tax exempt status (true/false or 1/0)
- `salesTaxId` - Sales tax ID (must be valid ID from SALES_TAX constant)
- `paymentTermId` - Payment term ID (must be valid ID from PAYMENT_TERMS constant)
- `internalNotes` - Internal notes about customer
- `status` - Customer status (active/inactive, defaults to active)
- `scopeId` - Scope ID (must be valid ID from SCOP constant: 1=National, 2=International)

### Shipping Address Fields (Optional)
- `shippingAddress` - Shipping address (street)
- `shippingAddressLine` - Additional address line
- `shippingUnit` - Unit/Suite number
- `shippingLat` - Latitude coordinate (decimal)
- `shippingLong` - Longitude coordinate (decimal)
- `shippingContactName` - Shipping address contact name
- `shippingContactEmail` - Shipping address contact email
- `shippingContactNumber` - Shipping address contact phone
- `shippingCountryId` - Country ID (must be valid ID from COUNTRIES constant)

### Remit Address Fields (Optional)
- `remitAddress` - Remit address (street)
- `remitAddressLine` - Additional address line
- `remitUnit` - Unit/Suite number
- `remitLat` - Latitude coordinate (decimal)
- `remitLong` - Longitude coordinate (decimal)
- `remitContactName` - Remit address contact name
- `remitContactEmail` - Remit address contact email
- `remitContactNumber` - Remit address contact phone
- `remitCountryId` - Country ID (must be valid ID from COUNTRIES constant)

## CSV Example

```csv
name,email,contactName,primaryPhoneNumber,salesTaxId,paymentTermId,shippingAddress,shippingAddressLine,shippingUnit,shippingLat,shippingLong,shippingContactName,shippingContactNumber,shippingCountryId,remitAddress,remitAddressLine,remitLat,remitLong,remitContactName,remitContactNumber,remitCountryId
Acme Corporation,acme@example.com,John Doe,555-1234,1,1,123 Main St,Suite 100,A-1,33.7490,-84.3880,Jane Smith,555-5678,1,456 Billing Blvd,Floor 2,33.7500,-84.3900,Bob Johnson,555-9999,1
Beta Industries,beta@example.com,Sarah Johnson,555-4321,2,2,789 Oak Ave,,B-5,33.7600,-84.4000,Mike Davis,555-1111,1,789 Oak Ave,,33.7600,-84.4000,Mike Davis,555-1111,1
Gamma LLC,gamma@example.com,Tom Wilson,555-8888,1,3,321 Pine Rd,Building C,,33.7700,-84.4100,Lisa Brown,555-2222,1,,,,,,
```

## Response

### Success Response (201)
```json
{
  "success": true,
  "message": "Customers uploaded successfully",
  "data": {
    "createdCustomersCount": 3
  }
}
```

### Error Response (400)
```json
{
  "success": false,
  "message": "Validation failed for some rows: \nRow 2: email: Invalid email format",
  "statusCode": 400
}
```

## Notes

1. **Bulk Operations**: The endpoint uses efficient bulk operations to create all customers, addresses, and ledger accounts at once for optimal performance.

2. **Address Types**: 
   - Shipping addresses are automatically marked as `SHIPPING` type
   - Remit addresses are automatically marked as `REMIT` type

3. **Ledger Accounts**: A ledger account is automatically created for each customer for accounting purposes.

4. **Validation**: 
   - All referenced IDs (salesTaxId, paymentTermId, scopeId, countryId) are validated against their respective constants
   - Email format is validated
   - All data is validated using Zod schema before database insertion

5. **Coordinates**: Latitude and longitude should be provided as decimal numbers (e.g., 33.7490, -84.3880)

6. **File Size**: CSV file size is limited to 5MB

7. **Performance**: Designed to efficiently handle thousands of customers in a single upload

## Common Country IDs
Refer to the `COUNTRIES` constant in the system. Some examples:
- 1: United States
- (Check the constants file for the complete list)

## Common Sales Tax IDs
Refer to the `SALES_TAX` constant. Some examples:
- 1: GW - Georgia State, Gwinnett County (6%)
- 2: FR - Georgia State, Forsyth County (7%)
- 3: EX - Tax Exempt (0%)
- (Check the constants file for the complete list)

## Common Payment Term IDs
- 1: 30 days
- 2: 45 days
- 3: 60 days
- 4: 90 days
- 5: 120 days
- 6: COD
