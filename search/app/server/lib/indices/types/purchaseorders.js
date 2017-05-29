

/**
 * PurchaseOrder type
 */

SearchService.Type.PurchaseOrders = {

  "_all": {
    "enabled": false
  },
  "dynamic": "false",
  "properties": {
    "_groupId": {
      "type": "string",
      "index": "not_analyzed"
    },
    "authGroup": {
      "type": "string",
      "index": "not_analyzed"
    },
    "allAccessAuthGroup": {
      "type": "string",
      "index": "not_analyzed"
    },
    "purchaseOrderNumber": {
      "type": "string",
      "index": "not_analyzed"
    },
    "companyId": {
      "type": "string",
      "index": "no"
    },
    "customerId": {
      "type": "string",
      "index": "no"
    },
    "supplierId": {
      "type": "string",
      "index": "no"
    },
    "companyName": {
      "type": "string",
      "analyzer": "nGram_analyzer",
      "search_analyzer": "whitespace_analyzer"
    },
    "supplierName": {
      "type": "string",
      "analyzer": "nGram_analyzer",
      "search_analyzer": "whitespace_analyzer"
    },
    "customerGroup": {
      "type": "string",
      "index": "not_analyzed"
    },
    "shippingAddressId": {
      "type": "string",
      "index": "no"
    },
    "originShippingAddressId": {
      "type": "string",
      "index": "no"
    },
    "billingAddressId": {
      "type": "string",
      "index": "no"
    },
    "originBillingAddressId": {
      "type": "string",
      "index": "no"
    },
    "userId": {
      "type": "string",
      "index": "no"
    },
    "assigneeId": {
      "type": "string",
      "index": "no"
    },
    "originAssigneeCode": {
      "type": "string",
      "index": "no"
    },
    "salesLocationId": {
      "type": "string",
      "index": "no"
    },
    "originSalesLocationId": {
      "type": "string",
      "index": "no"
    },
    "stockLocationId": {
      "type": "string",
      "index": "no"
    },
    "originStockLocationId": {
      "type": "string",
      "index": "no"
    },
    "contactName": {
      "type": "string",
      "analyzer": "nGram_analyzer",
      "search_analyzer": "whitespace_analyzer"
    },
    "contactPhone": {
      "type": "string",
      "index": "not_analyzed"
    },
    "contactEmail": {
      "type": "string",
      "index": "not_analyzed"
    },
    "comment": {
      "type": "string",
      "index": "no"
    },
    "reference": {
      "type": "string",
      "index": "no"
    },
    "discounts": {
      "type": "double",
      "index": "no"
    },
    "shippingCosts": {
      "type": "double",
      "index": "no"
    },
    "subTotal": {
      "type": "double",
      "index": "no"
    },
    "taxes": {
      "type": "double",
      "index": "no"
    },
    "total": {
      "type": "double",
      "index": "no"
    },
    "appliedCredits": {
      "type": "double",
      "index": "no"
    },
    "paymentStatus": {
      "type": "string",
      "index": "no"
    },
    "status": {
      "type": "string",
      "index": "no"
    },
    "taxType": {
      "type": "string",
      "index": "no"
    },
    "priceListCode": {
      "type": "string",
      "index": "no"
    },
    "priceListName": {
      "type": "string",
      "index": "no"
    },
    "issuedAt": {
      "type": "date",
      "index": "no"
    },
    "createdAt": {
      "type": "date",
      "index": "no"
    },
    "updatedAt": {
      "type": "date",
      "index": "no"
    },
    "shipAt": {
      "type": "date",
      "index": "no"
    },
    "rawOrder": {
      "type": "string",
      "index": "no"
    },
    "taxOverride": {
      "type": "double",
      "index": "no"
    },
    "taxRate": {
      "type": "double",
      "index": "no"
    },
    "items": {
      "type": "nested",
      "properties": {
        "quantity": {
          "type": "double",
          "index": "no"
        },
        "taxRateOverride": {
          "type": "double",
          "index": "no"
        },
        "discount": {
          "type": "double",
          "index": "no"
        },
        "variantId": {
          "type": "string",
          "index": "no"
        },
        "status": {
          "type": "string",
          "index": "no"
        },
        "originVariantCode": {
          "type": "string",
          "index": "no"
        },
        "price": {
          "type": "double",
          "index": "no"
        },
        "isPromo": {
          "type": "boolean",
          "index": "no"
        }
      }
    },
    "orderType": {
      "type": "double",
      "index": "no"
    },
    "isPickup": {
      "type": "boolean",
      "index": "no"
    },
    "clonedFrom": {
      "type": "string",
      "index": "no"
    },
    "hasPromotions": {
      "type": "boolean",
      "index": "no"
    },
    "createdBy": {
      "type": "string",
      "index": "no"
    },
    "id": {
      "type": "string",
      "index": "no"
    },
    "type": {
      "type": "string",
      "index": "no"
    }
  }
};
