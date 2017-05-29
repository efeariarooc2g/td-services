
/**
 * ReturnOrder type
 */
SearchService.Type.ReturnOrders = {
  "_all": {
    "enabled": false
  },
  "dynamic": "false",
  "properties": {
    "_groupId": {
      "type": "string",
      "index" : "not_analyzed"
    },
    "authGroup": {
      "type": "string",
      "index" : "not_analyzed"
    },
    "allAccessAuthGroup": {
      "type": "string",
      "index" : "not_analyzed"
    },
    "customerId": {
      "type": "string",
      "index": "no"
    },
    "orderNumber": {
      "type": "string",
      "index": "not_analyzed"
    },
    "customerName": {
      "type": "string",
      "analyzer": "nGram_analyzer",
      "search_analyzer": "whitespace_analyzer"
    },
    "orderId": {
      "type": "string",
      "index": "no"
    },
    "userId": {
      "type": "string",
      "index": "no"
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
    "stockLocationId": {
      "type": "string",
      "index": "no"
    },
    "stockLocationName": {
      "type": "string",
      "analyzer": "nGram_analyzer",
      "search_analyzer": "whitespace_analyzer"
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
    "assigneeId": {
      "type": "string",
      "index": "no"
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
    "returnOrderNumber": {
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
    "status": {
      "type": "string",
      "index": "no"
    },
    "priceList": {
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
