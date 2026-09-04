import re

with open('src/services/salesOrder.service.ts', 'r') as f:
    content = f.read()

content = re.sub(
    r"financials: \{\n\s*subTotal: calculations\.soReceiving\.subTotal,\n\s*tax: calculations\.soReceiving\.tax,\n\s*total: calculations\.soReceiving\.total,\n\s*advancedDeposit: totalAdvancedDeposit,\n\s*balanceDue: calculations\.soReceiving\.total - totalAdvancedDeposit\n\s*\},",
    r"financials: calculations,\n    advancedDeposit: totalAdvancedDeposit,",
    content
)

with open('src/services/salesOrder.service.ts', 'w') as f:
    f.write(content)
