// define settings and mapping for td-central elastic search indices
SearchService.Indices.User = {
  "settings": SearchService.Type.Settings,
  "mappings": {
    "locations": SearchService.Type.Locations,
    "users": SearchService.Type.Users
  }
};

SearchService.Indices.Order = {
  "settings": SearchService.Type.Settings,
  "mappings": {
    "promotions": SearchService.Type.Promotions,
    "promotionrebates": SearchService.Type.PromotionRebates,
    "customers": SearchService.Type.Customers,
    "suppliers": SearchService.Type.Suppliers,
    "orders": SearchService.Type.Orders,
    "customertransactions": SearchService.Type.CustomerTransactions,
    "invoices": SearchService.Type.Invoices,
    "returnorders": SearchService.Type.ReturnOrders,
    "payments": SearchService.Type.Payments,
    "shipments": SearchService.Type.Shipments,
    "ordertypes": SearchService.Type.OrderTypes,
    "purchaseorders": SearchService.Type.PurchaseOrders,
    "customergroups": SearchService.Type.CustomerGroups
  }
};

SearchService.Indices.Product = {
  "settings": SearchService.Type.Settings,
  "mappings": {
    "pricelists": SearchService.Type.PriceList,
    "products": SearchService.Type.Products,
    "productvariants": SearchService.Type.ProductVariants,
    "stocktransfers": SearchService.Type.StockTransfers,
    "stockadjustments": SearchService.Type.StockAdjustments
  }
};
