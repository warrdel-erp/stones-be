awk '
/export const getSalesOrderById = catchAsync/ {
    print "export const getSalesOrderSummary = catchAsync(async (req: Request, res: Response) => {"
    print "  const { id } = req.params;"
    print "  const summary = await salesOrderService.getSalesOrderSummary(Number(id));"
    print ""
    print "  if (!summary) {"
    print "    return SuccessResponse(res, 404, \"Sales Order not found\", null);"
    print "  }"
    print ""
    print "  SuccessResponse(res, 200, \"Sales Order summary retrieved successfully\", summary);"
    print "});"
    print ""
}
{ print }
' src/controllers/salesOrder.controller.ts > temp.ts && mv temp.ts src/controllers/salesOrder.controller.ts
