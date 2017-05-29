

/**
 * Payment type
 */

SearchService.Type.Payments = {
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
    "invoiceId": {
      "type": "string",
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
    "amount": {
      "type": "double",
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
    "exchangeRate": {
      "type": "double",
      "index": "no"
    },
    "paidAt": {
      "type": "date",
      "index": "no"
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
