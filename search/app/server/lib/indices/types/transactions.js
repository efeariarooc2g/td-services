
/**
 * CustomerTransactions type
 */
SearchService.Type.CustomerTransactions = {
  "_all": {
    "enabled": false
  },
  "dynamic": "false",
  "properties": {
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
    "customerNumber": {
      "type": "string",
      "index": "not_analyzed"
    },
    "postingDate": {
      "type": "date",
      "index": "no"
    },
    "originDocumentNo": {
      "type": "string",
      "index": "not_analyzed"
    },
    "originCustomerNumber": {
      "type": "string",
      "index": "not_analyzed"
    },
    "invoiceId": {
      "type": "string",
      "index": "no"
    },
    "invoiceNumber": {
      "type": "string",
      "index": "not_analyzed"
    },
    "paymentId": {
      "type": "string",
      "index": "no"
    },
    "transactionType": {
      "type": "string",
      "index": "no"
    },
    "isLocal": {
      "type": "boolean",
      "index": "no"
    },
    "orderId": {
      "type": "string",
      "index": "no"
    },
    "orderNumber": {
      "type": "string",
      "index": "not_analyzed"
    },
    "narration": {
      "type": "string"
    },
    "amount": {
      "type": "double",
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
    "createdAt": {
      "type": "date",
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



/**
 * CustomerTransactions type
 */
SearchService.Type.Invoices = {
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
    "invoiceNumber": {
      "type": "string",
      "index": "not_analyzed"
    },
    "orderNumber": {
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
    "orderId": {
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
      "index": "no",
    },
    "status": {
      "type": "string",
      "index": "no"
    },
    "invoicedAt": {
      "type": "date",
      "index": "no"
    },
    "shipAt": {
      "type": "date",
      "index": "no"
    },
    "dueAt": {
      "type": "date",
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
    "shippingAddressId": {
      "type": "string",
      "index": "no"
    },
    "billingAddressId": {
      "type": "string",
      "index": "no"
    },
    "exchangeRate": {
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
