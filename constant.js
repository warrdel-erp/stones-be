export const secretKey = 'wardellsolutionprivatelimited'

export const country = ['Vietnam', 'Angola', 'Brazil', 'Canada', 'China', 'Greece', 'India', 'Italy', 'Norway', 'Saudi Arabia', 'South Africa', 'Spain', 'Ukraine'];

export const customerType = ['Homeowner', 'Architect', 'KB Dealer', 'Designer', 'Fabricator', 'Builder'];
export const paymentTerms = ['30', '45', '60', '90', '120'];
export const reasons = ['Reseller'];
export const priceLevel = ['Single Slab', 'Bundle', 'Standard'];
export const wayOfDocsSend =['Fax', 'Email','Mail', 'Text'];


export const language = ['English', 'French', 'Spanish', 'Italian'];

export const supplierType = ['National', 'International'];

export const statusCode = {
    SUCCESS: 200,
    CREATED: 201,
    UPDATED: 204,
    NOT_FOUND: 404,
};

export const errorMessage = (status) => {
    switch (status) {
        case 404: return `Not Found`
        default: return `Internal Server Error`
    }
};

export const productKindEnum = ['Stock', 'Non-stock'];

export const productTypeEnum = ['Slab', 'Pavers', 'Bench', 'Table', 'Sink', 'Mirror'];

export const productCategoryEnum = ['GRANITE', 'LIMESTONE', 'MARBLE', 'QUARTZ', 'QUARTZITE', 'SOAPSTONE'];

export const productColoursEnum = ['Black', 'Beige', 'Blue', 'Dark Blue', 'Brown', 'Pink', 'Gold', 'Gray', 'Crimson', 'Red', 'Dark Red', 'Mute Red', 'White', 'Yellow', 'Green', 'Sea Green', 'Mute sea green', 'light Green'];

export const productOriginEnum = ['Vietnam', 'Angola', 'Brazil', 'Canada', 'China', 'Greece', 'India', 'Italy', 'Norway', 'Saudi Arabia', 'South Africa', 'Spain', 'Ukraine'];

export const productUomEnum = ['lb', 'in', 'CF', 'CM', 'SF', 'Kg', 'SQM', 'CBM', 'EA'];

export const productPriceRangeEnum = ['low', 'mid', 'high', 'very high'];

export const productAssignedBinEnum = ['A1', 'A2', 'A3', 'B1', 'B2', 'B3'];

export const status = ['ACTIVE', 'INACTIVE'];

export const deliveryType = ['Pickup', 'Delivery', 'Other'];

export const shipmentTerm = ['Prepaid', 'Prepaid & Add', 'Collect', 'Prepaid & COD', 'Add & COD', 'Collect & COD', 'Credit 45', 'CAD', 'Consigment'];

export const freightForwarder = ['Ace Drayage', 'Airlift (USA) Inc', 'AJ Worldwide services Inc', 'Avenger Logistics', 'CMA CGM (AMERICA) LLC', 'Crystal Granite (Ocean Freight)', 'DahNAY Logistics', 'Del Corona', 'Edmund Freight', 'Eurybia Logistics Inc', 'Ever Concord Logistics Inc', 'Fortuna Global Logistics LLC', 'Freight Experts Inc', 'General Noli USA Inc', 'Global Logistics & Customs of Charleston', 'Gramazini Freight', 'Heavy Weight Transport, Inc', 'Howard Sheppard, Inc', 'Interglobog', 'LAM USA International Transport, LLC', 'Leonardi & Co. USA Inc', 'Optimal Container Logistics', 'Pacific Granites Inc', 'Pacific Quartz (Freight)', 'Patagon Logistics LLC', 'PKD Logistics', 'Savannah River Logistics, LLC', 'SBB Shipping USA Inc', 'Surfaces by Pacific (Freight)', 'Total Quality Logistics (TQL)', 'Tova Trucking, Inc', 'Trans-World Shipping Service, Inc', 'Trident Freight', 'U.S. Customs and Border Protection', 'Western Overseas Corp', 'World-Wide Transportation', 'Worldwide Express Inc', 'Xpress Logistic Solution LLP'];

export const purchaseStatus = ['OPEN', 'CLOSE', 'UNAPPROVED'];

export const otherCharges = ['Consignment Payable', 'Delivery', 'Fabrication & Installation', 'FINANCE CHARGE', 'Insurance', 'Pre-migration Return/Pruchase', 'Vendor Credit'];

export const slabBinEnum = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6'];

export const inventoryStock = ['Available'];

export const deliveryTypeSales = ['DELIVERY','PICKUP'];

export const salesStatus = ['INITIATED','LOADING ORDER','PACKING LIST','INVOICE']