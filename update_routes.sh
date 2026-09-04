awk '
/^\/\/ Get SO by Id/ && !seen {
    print "// Get SO Summary"
    print "router.get(\"/:id/summary\", authenticateUser, salesOrderController.getSalesOrderSummary);"
    print ""
    seen = 1
}
{ print }
' src/routes/salesOrder.routes.ts > temp.ts && mv temp.ts src/routes/salesOrder.routes.ts
