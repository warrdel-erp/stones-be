import SIPL from "../models/sipl.model";
import SIPLProduct from "../models/siplProduct.model";
import RequestedPurchaseProduct from "../models/requestedPurchaseProduct";
import Product from "../models/product.model";
import S3File from "../models/s3File.model";
import TempAiExtractedSiplItem from "../models/tempAiExtractedSiplItem.model";
import { extractStructuredDataFromDocument } from "./aiService";
import { handleCreateSlabs, handleCreateGenericProduct } from "./sipl.service";
import { generateSignedGetUrl } from "./s3File.service";

/**
 * Helper to fetch SIPL and all required relations for AI extraction.
 */
export const fetchSiplWithDetails = async (siplId: number, clientId: number) => {
  return await SIPL.findOne({
    where: { id: siplId, clientId },
    include: [
      {
        model: S3File,
        as: "s3File",
      },
      {
        model: SIPLProduct,
        as: "siplProducts",
        include: [
          {
            model: RequestedPurchaseProduct,
            as: "requestedPurchaseProduct",
            include: [
              {
                model: Product,
                as: "product",
              },
            ],
          },
        ],
      },
    ],
  });
};

/**
 * Helper to get an accessible PDF URL for a SIPL document.
 */
export const getPdfUrlFromSipl = async (sipl: any) => {
  let pdfUrl = sipl?.s3File?.url;
  if (sipl?.s3File?.s3Bucket && sipl?.s3File?.s3Key) {
    pdfUrl = await generateSignedGetUrl(sipl.s3File.s3Bucket, sipl.s3File.s3Key);
  }
  return pdfUrl;
};

/**
 * Prepares the context of existing SIPL products to feed into the prompt.
 */
export const prepareSiplProductsContext = (sipl: any) => {
  return (sipl.siplProducts || []).map((sp: any) => ({
    id: sp.id,
    productName: sp?.requestedPurchaseProduct?.product?.name || "Unknown Product",
    isSlabType: !!sp?.requestedPurchaseProduct?.product?.isSlabType,
    quantity: sp.quantity,
    unitPrice: sp.unitPrice,
  }));
};

/**
 * Downloads a PDF and converts it into a Base64 string for the AI Service.
 */
export const fetchPdfAsBase64 = async (pdfUrl: string): Promise<string> => {
  const pdfResponse = await fetch(pdfUrl);
  if (!pdfResponse.ok) {
    throw new Error("Failed to download PDF from URL.");
  }
  const pdfBuffer = await pdfResponse.arrayBuffer();
  return Buffer.from(pdfBuffer).toString("base64");
};

/**
 * Core business logic for extracting SIPL data using AI.
 */
export const processSiplPdfExtraction = async (
  siplId: number,
  clientId: number,
  locationId?: number
) => {
  const sipl: any = await fetchSiplWithDetails(siplId, clientId);
  if (!sipl) {
    throw new Error("SIPL not found.");
  }

  const pdfUrl = await getPdfUrlFromSipl(sipl);
  if (!pdfUrl) {
    throw new Error("No PDF file attached to this SIPL. Please upload a PDF document first.");
  }

  const siplProductsContext = prepareSiplProductsContext(sipl);

  const systemPrompt = `You are an expert SIPL (Supplier Invoice / Packaging List) document parser.
Analyze the provided document and extract all individual items/slabs/products listed in the packaging info.

Important Notes:
- Inventory products are generally grouped by "bundle".
- Block number and slab number are often written together distinguished by "-" and "/" (e.g., "123-4" or "123/4", where 123 is the block number and 4 is the slab number). Parse block and slab number accordingly into separate fields.

Here is the list of expected SIPL products attached to this invoice:
${JSON.stringify(siplProductsContext, null, 2)}

Instructions:
1. Examine the document for item details like Block/Lot#, Bundle#, Slab #, Packaging Length, Packaging Width, Receiving Length, Receiving Width, Quantity.
2. Note that inventory products are generally grouped by "bundle".
3. Block number and slab number are often written together distinguished by "-" and "/" (e.g., "1234-1" or "1234/1" -> Block: "1234", Slab: 1). Extract block and slab number correctly into their respective fields.
4. For each extracted item, match its product name from the PDF to one of the expected SIPL products provided above. Set "siplProductId" to the matched product's ID.
5. If product name in PDF differs slightly (e.g. "Calacatta Gold 2cm" vs "Calacatta Gold"), perform fuzzy matching to select the correct "siplProductId".
6. Ensure dimensions (length, width) are converted to numbers in inches.

Return ONLY a valid JSON object matching this structure:
{
  "items": [
    {
      "siplProductId": number | null,
      "pdfProductName": "exact text from PDF",
      "matchedProductName": "matched SIPL product name",
      "block": "block number or empty string",
      "lot": "lot/bundle number or empty string",
      "slabNumber": 1,
      "packageLength": 120,
      "packageWidth": 65,
      "receivingLength": 120,
      "receivingWidth": 65,
      "quantity": 1
    }
  ]
}`;

  const pdfBase64 = await fetchPdfAsBase64(pdfUrl);

  const aiResult = await extractStructuredDataFromDocument(pdfBase64, systemPrompt);
  const items = Array.isArray(aiResult.data?.items) ? aiResult.data.items : [];

  const tempItem: any = await TempAiExtractedSiplItem.create({
    siplId: Number(siplId),
    extractedData: items,
    status: "pending",
    clientId,
    locationId,
  });

  return {
    tempId: tempItem.id,
    items,
    siplProductsContext,
  };
};

/**
 * Get active temporary extracted items for a SIPL
 */
export const getActiveTempExtractedItems = async (siplId: number, clientId: number) => {
  return await TempAiExtractedSiplItem.findOne({
    where: {
      siplId: Number(siplId),
      status: "pending",
      clientId,
    },
    order: [["createdAt", "DESC"]],
  });
};

/**
 * Update temporary extracted items draft
 */
export const updateTempExtractedItemsDraft = async (
  tempId: number,
  clientId: number,
  items: any[]
) => {
  const tempRecord: any = await TempAiExtractedSiplItem.findOne({
    where: { id: tempId, clientId },
  });

  if (!tempRecord) {
    throw new Error("Temporary data not found.");
  }

  tempRecord.extractedData = items;
  await tempRecord.save();
  return tempRecord;
};

/**
 * Confirm temporary extracted items and create actual InventoryProducts & Slabs
 */
export const confirmAndCreateSiplInventory = async (
  siplId: number,
  tempId: number | undefined,
  items: any[],
  clientId: number,
  locationId?: number
) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("No items provided for confirmation.");
  }

  const sipl: any = await fetchSiplWithDetails(siplId, clientId);
  if (!sipl) {
    throw new Error("SIPL not found.");
  }

  const siplProductMap = new Map<number, any>();
  (sipl.siplProducts || []).forEach((sp: any) => {
    siplProductMap.set(sp.id, sp);
  });

  // Group items by siplProductId
  const groupedItems = new Map<number, any[]>();
  for (const item of items) {
    const spId = Number(item.siplProductId);
    if (!spId || !siplProductMap.has(spId)) {
      continue;
    }
    if (!groupedItems.has(spId)) {
      groupedItems.set(spId, []);
    }
    groupedItems.get(spId)!.push(item);
  }

  let createdCount = 0;

  for (const [spId, group] of groupedItems.entries()) {
    const siplProduct = siplProductMap.get(spId);
    const isSlabType = !!siplProduct?.requestedPurchaseProduct?.product?.isSlabType;
    const productId = siplProduct?.requestedPurchaseProduct?.productId;

    if (!productId) continue;

    if (isSlabType) {
      for (let i = 0; i < group.length; i++) {
        const item = group[i];
        await handleCreateSlabs({
          siplId: Number(siplId),
          siplProductId: spId,
          productId,
          quantity: 1,
          block: item.block || "",
          lot: item.lot || "",
          packageLength: Number(item.packageLength) || 0,
          packageWidth: Number(item.packageWidth) || 0,
          receivingLength: Number(item.receivingLength) || Number(item.packageLength) || 0,
          receivingWidth: Number(item.receivingWidth) || Number(item.packageWidth) || 0,
          binId: item.binId || null,
          clientId,
          locationId,
        });
        createdCount++;
      }
    } else {
      const totalQty = group.reduce((sum: number, it: any) => sum + (Number(it.quantity) || 1), 0);
      const firstItem = group[0];
      await handleCreateGenericProduct({
        siplId: Number(siplId),
        siplProductId: spId,
        productId,
        quantity: totalQty,
        binId: firstItem?.binId || null,
        clientId,
        locationId,
      });
      createdCount += totalQty;
    }
  }

  if (tempId) {
    await TempAiExtractedSiplItem.update(
      { status: "confirmed" },
      { where: { id: tempId, clientId } }
    );
  }

  return createdCount;
};
