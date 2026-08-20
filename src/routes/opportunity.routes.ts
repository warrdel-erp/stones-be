import { Router } from "express";
import {
  createOpportunity,
  getAllOpportunities,
  getOpportunity,
  updateOpportunity,
  deleteOpportunity,
  addRequirementLine,
  getRequirementsAndAllocations,
  updateRequirementAllocations,
  deleteRequirementLine,
  getOpportunityHold,
} from "../controllers/opportunity.controller";
import { authenticateUser } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validationMiddleware";
import {
  createOpportunitySchema,
  updateOpportunitySchema,
  addOpportunityRequirementSchema,
} from "../validators/opportunity.validator";

import {
  getQuotations,
  getQuotation,
  createQuotation,
  publishQuotation,
  updateQuotationRates,
  addQuotationProducts,
  removeQuotationProduct,
  createSalesOrderFromQuotation,
} from "../controllers/quotation.controller";

const router = Router();


router.route("/")
  .all(authenticateUser)
  .post(validateRequest(createOpportunitySchema), createOpportunity)
  .get(getAllOpportunities);

router.route("/:id")
  .all(authenticateUser)
  .get(getOpportunity)
  .put(validateRequest(updateOpportunitySchema), updateOpportunity)
  .delete(deleteOpportunity);

router.route("/:id/hold")
  .all(authenticateUser)
  .get(getOpportunityHold);

router.route("/:id/requirements")
  .all(authenticateUser)
  .get(getRequirementsAndAllocations)
  .post(validateRequest(addOpportunityRequirementSchema), addRequirementLine);

router.route("/:id/requirements/:reqId/allocations")
  .all(authenticateUser)
  .put(updateRequirementAllocations);

router.route("/:id/requirements/:reqId")
  .all(authenticateUser)
  .delete(deleteRequirementLine);

router.route("/:id/quotations")
  .all(authenticateUser)
  .get(getQuotations)
  .post(createQuotation);

router.route("/:id/quotations/:quoteId")
  .all(authenticateUser)
  .get(getQuotation);

router.route("/:id/quotations/:quoteId/rates")
  .all(authenticateUser)
  .put(updateQuotationRates);

router.route("/:id/quotations/:quoteId/products")
  .all(authenticateUser)
  .post(addQuotationProducts);

router.route("/:id/quotations/:quoteId/products/:invProductId")
  .all(authenticateUser)
  .delete(removeQuotationProduct);

router.route("/:id/quotations/:quoteId/publish")
  .all(authenticateUser)
  .put(publishQuotation);

router.route("/:id/quotations/:quoteId/create-sales-order")
  .all(authenticateUser)
  .post(createSalesOrderFromQuotation);

export default router;

