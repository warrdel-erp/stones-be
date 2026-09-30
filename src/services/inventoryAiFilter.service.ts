import { QueryTypes } from "sequelize";
import { callOpenAIResponses } from "./aiService";
import { buildScope } from "../utils/scoped";
import * as models from "../models";
import { AppError } from "../helper/appError";
import { sequelize } from "../config/database";
import { fetchProductsOnlyByLocation } from "./inventory.service";

// ── Security: forbidden SQL keywords that could mutate or leak data ────────────
const FORBIDDEN_PATTERNS = [
  /\bINSERT\b/i,
  /\bUPDATE\b/i,
  /\bDELETE\b/i,
  /\bDROP\b/i,
  /\bTRUNCATE\b/i,
  /\bALTER\b/i,
  /\bCREATE\b/i,
  /\bGRANT\b/i,
  /\bREVOKE\b/i,
  /\bEXEC\b/i,
  /\bEXECUTE\b/i,
  /\bCALL\b/i,
  /\bSHOW\b/i,
  /\bINFORMATION_SCHEMA\b/i,
  /\bPERFORMANCE_SCHEMA\b/i,
  /\bMYSQL\b/i,
  /--/,
  /\/\*/,
  /;\s*\S/,
];

const SYSTEM_PROMPT = `You are a SQL filter assistant for a stone/slab inventory CRM backed by MySQL.

Your job: convert a natural-language inventory search into a SQL query that returns the matching inventory_product rows with their product grouping.

## Output format
Return ONLY a raw SQL query (no markdown, no code fences, no explanation).
The query MUST:
- SELECT ip.id AS inventoryProductId, ip.productId
- FROM inventory_products ip
- Always include at the end of the WHERE clause:
  AND ip.clientId = :clientId AND ip.locationId = :locationId AND ip.status NOT IN ('INITIATE', 'BROKEN')
- Use named bind parameters (:paramName) for any user-supplied values

## Available tables and key columns

**inventory_products ip** (main table — always start here)
  ip.id, ip.productId, ip.siplId, ip.binId, ip.status
  ip.sellingPrice, ip.landedUnitCost, ip.FOBcost, ip.assetValue
  ip.isSlabType, ip.combinedNumber, ip.receivedDate
  ip.clientId, ip.locationId
  status values: 'IN_INVENTORY', 'SOLD', 'CANCELED', 'ALLOCATED', 'INITIATE', 'BROKEN'

**products p** (JOIN ON p.id = ip.productId)
  p.name, p.alternativeName, p.isSlabType, p.thickness, p.singleUnitPrice
  p.bundlePrice, p.status ('active'/'inactive'), p.baseColorId, p.finishId
  p.groupId, p.subCategoryId, p.originId, p.kindId

**slabs s** (JOIN ON s.inventoryProductId = ip.id)
  s.block, s.lot, s.serialNumber, s.slabNumber, s.barcode
  s.packageLength, s.packageWidth, s.receivingLength, s.receivingWidth
  area in sqft = (s.packageLength * s.packageWidth / 144)

**product_base_colors pbc** (JOIN ON pbc.id = p.baseColorId)
  pbc.name (e.g. 'White', 'Black', 'Beige')

**product_finishes pf** (JOIN ON pf.id = p.finishId)
  pf.name (e.g. 'Polished', 'Honed', 'Brushed')

**product_sub_categories psc** (JOIN ON psc.id = p.subCategoryId)
  psc.name (e.g. 'SLAB', 'GRANITE', 'MARBLE')

**holds h + inventory_product_holds iph**
  JOIN inventory_product_holds iph ON iph.inventoryProductId = ip.id
  JOIN holds h ON h.id = iph.holdId
  h.expiresAt, h.stage ('INITIATED','ACTIVE','EXPIRED','RELEASED')
  h.clientId, h.customerId

**sales_order_products sop + sales_orders so**
  JOIN sales_order_products sop ON sop.inventoryProductId = ip.id
  JOIN sales_orders so ON so.id = sop.salesOrderId
  so.status ('OPEN','CLOSED'), so.clientSoNumber
  sop.stage ('PENDING','PICKED','INVOICED','CLOSED')

**sipls si** (purchase invoice)
  JOIN sipls si ON si.id = ip.siplId
  si.invoiceCode, si.vendorId, si.status

**bins b + warehouses w**
  JOIN bins b ON b.id = ip.binId
  JOIN warehouses w ON w.id = b.warehouseId
  b.name, w.name

## Rules
1. Always start: SELECT ip.id AS inventoryProductId, ip.productId FROM inventory_products ip
2. Always end WHERE clause with: AND ip.clientId = :clientId AND ip.locationId = :locationId AND ip.status NOT IN ('INITIATE', 'BROKEN')
3. Use LEFT JOIN when optional (checking existence), INNER JOIN when required
4. For text matching use LIKE with % wildcards and LOWER() for case-insensitive
5. Do NOT include LIMIT or OFFSET — pagination is handled externally
6. Return ONLY the SQL

## Example outputs
User: "white marble slabs on hold"
SQL:
SELECT ip.id AS inventoryProductId, ip.productId
FROM inventory_products ip
JOIN products p ON p.id = ip.productId
JOIN product_base_colors pbc ON pbc.id = p.baseColorId
JOIN product_sub_categories psc ON psc.id = p.subCategoryId
JOIN inventory_product_holds iph ON iph.inventoryProductId = ip.id
JOIN holds h ON h.id = iph.holdId
WHERE LOWER(pbc.name) LIKE '%white%'
  AND LOWER(psc.name) LIKE '%marble%'
  AND h.stage IN ('INITIATED', 'ACTIVE')
  AND ip.clientId = :clientId AND ip.locationId = :locationId AND ip.status NOT IN ('INITIATE', 'BROKEN')

User: "products with open sales order"
SQL:
SELECT ip.id AS inventoryProductId, ip.productId
FROM inventory_products ip
JOIN sales_order_products sop ON sop.inventoryProductId = ip.id
JOIN sales_orders so ON so.id = sop.salesOrderId
WHERE so.status = 'OPEN'
  AND ip.clientId = :clientId AND ip.locationId = :locationId AND ip.status NOT IN ('INITIATE', 'BROKEN')
`;

function validateSql(sql: string): void {
  const normalized = sql.trim();

  if (!/^SELECT\s/i.test(normalized)) {
    throw new AppError("AI generated an invalid query. Only SELECT queries are allowed.", 400);
  }

  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(normalized)) {
      throw new AppError("AI generated an unsafe query. Please rephrase your search.", 400);
    }
  }

  if (!/ip\.clientId\s*=\s*:clientId/i.test(normalized)) {
    throw new AppError("AI query is missing tenant safety clause. Please try again.", 500);
  }
}

/**
 * Run an AI-driven inventory filter using raw SQL.
 *
 * Returns paginated product rows where each product has an extra field:
 *   filteredInventoryProductIds: number[]
 *
 * These IDs are the SPECIFIC inventory products that matched the AI filter.
 * The frontend uses them when expanding level 2/3 nesting so only matching
 * items are shown — NOT all inventory products for that product.
 *
 * PAGINATION: subsequent pages pass the same `userQuery`. AI runs once,
 * then we COUNT unique productIds and LIMIT/OFFSET on that set.
 */
export const getAiFilteredProductIds = async (
  userQuery: string,
  page: number,
  limit: number,
  excludeSoldCanceled: boolean = true
): Promise<{ products: any[]; total: number; page: number; limit: number }> => {
  if (!userQuery || userQuery.trim() === "") {
    throw new AppError("Search query is required", 400);
  }

  // ── Get tenant scope via buildScope — same as all other repositories ───────
  const scope = buildScope(models.InventoryProduct as any);
  const { clientId, locationId } = scope;

  // ── 1. Ask AI for the SQL ─────────────────────────────────────────────────
  const filterModel = process.env.OPENAI_MINI_MODEL;
  const rawSql = await callOpenAIResponses(
    [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userQuery.trim() },
    ],
    { model: filterModel, responseFormat: "text", temperature: 0 }
  );

  const aiSql = (rawSql || "").trim().replace(/^```sql\s*/i, "").replace(/```\s*$/, "").trim();



  if (!aiSql) {
    throw new AppError("AI returned an empty query. Please rephrase your search.", 500);
  }

  console.log('AI generated SQL -------------');
  console.log(aiSql)

  // ── 2. Validate — SELECT only, no mutations, tenant clause required ────────
  validateSql(aiSql);

  // Force exclude INITIATE and BROKEN statuses.
  // Optionally exclude SOLD and CANCELED if user hasn't toggled them on.
  let statusExclusion = "'INITIATE', 'BROKEN'";
  if (excludeSoldCanceled) {
    statusExclusion += ", 'SOLD', 'CANCELED'";
  }
  const enforcedSql = `${aiSql} AND ip.status NOT IN (${statusExclusion})`;

  // ── 3. Run the full AI query to get (inventoryProductId, productId) rows ──
  // We need ALL rows (not paginated) so we can:
  //   a) group them by productId for the filteredInventoryProductIds map
  //   b) paginate at the product level, not the IP level
  const allRows = await sequelize.query<{ inventoryProductId: number; productId: number }>(
    enforcedSql,
    {
      type: QueryTypes.SELECT,
      replacements: { clientId, locationId },
    }
  );

  if (!allRows.length) {
    return { products: [], total: 0, page, limit };
  }

  // ── 4. Group by productId to build { productId → inventoryProductIds[] } ──
  const ipIdsByProduct = new Map<number, number[]>();
  for (const row of allRows) {
    const { productId, inventoryProductId } = row as any;
    if (!ipIdsByProduct.has(productId)) {
      ipIdsByProduct.set(productId, []);
    }
    ipIdsByProduct.get(productId)!.push(inventoryProductId);
  }

  // ── 5. Paginate at the product level ──────────────────────────────────────
  const uniqueProductIds = Array.from(ipIdsByProduct.keys());
  const total = uniqueProductIds.length;
  const offset = (page - 1) * limit;
  const pageProductIds = uniqueProductIds.slice(offset, offset + limit);

  if (pageProductIds.length === 0) {
    return { products: [], total, page, limit };
  }

  // ── 6. Fetch full product display rows for this page ──────────────────────
  // fetchProductsOnlyByLocation handles all aggregates, images, hold counts etc.
  const data = await fetchProductsOnlyByLocation(
    1,
    limit,
    locationId,
    { id: pageProductIds },
    undefined
  );

  // ── 7. Attach filteredInventoryProductIds to each product row ─────────────
  // The frontend stores this and passes the IDs to level 2 / level 3 APIs
  // so nesting only shows the inventory products that matched the AI filter.
  const products = (data.products || []).map((product: any) => ({
    ...product,
    filteredInventoryProductIds: ipIdsByProduct.get(product.id) ?? [],
  }));

  return { products, total, page, limit };
};
