
/**
 * Order type
 */
SearchService.Type.Orders = {
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
    "customerId": {
      "type": "string",
      "index": "no"
    },
    "customerName": {
      "type": "string",
      "analyzer": "nGram_analyzer",
      "search_analyzer": "whitespace_analyzer"
    },
    "customerNumber": {
      "type": "string",
      "index": "not_analyzed"
    },
    "userFullName": {
      "type": "string",
      "analyzer": "nGram_analyzer",
      "search_analyzer": "whitespace_analyzer"
    },
    "userName": {
      "type": "string",
      "analyzer": "nGram_analyzer",
      "search_analyzer": "whitespace_analyzer"
    },
    "shippingAddressId": {
      "type": "string",
      "index": "no"
    },
    "billingAddressId": {
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
    "salesLocationId": {
      "type": "string",
      "index": "no"
    },
    "salesLocationName": {
      "type": "string",
      "analyzer": "nGram_analyzer",
      "search_analyzer": "whitespace_analyzer"
    },
    "stockLocationId": {
      "type": "string",
      "index": "no"
    },
    "stockLocationName": {
      "type": "string",
      "analyzer": "nGram_analyzer",
      "search_analyzer": "whitespace_analyzer"
    },
    "currency": {
      "type": "object",
      "properties": {
        "iso": {
          "type": "string",
          "index": "no"
        },
        "symbol": {
          "type": "string",
          "index": "no"
        }
      }
    },
    "orderNumber": {
      "type": "string",
      "index": "not_analyzed"
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
    "status": {
      "type": "string",
      "index": "no"
    },
    "paymentStatus": {
      "type": "string",
      "index": "no"
    },
    "invoiceStatus": {
      "type": "string",
      "index": "no"
    },
    "shippingStatus": {
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
    "taxOverride": {
      "type": "double",
      "index": "no"
    },
    "taxRate": {
      "type": "double",
      "index": "no"
    },
    "subTotal": {
      "type": "double",
      "index": "no"
    },
    "discounts": {
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
    "cashPayments": {
      "type": "double",
      "index": "no"
    },
    "appliedCredits": {
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
