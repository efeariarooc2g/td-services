

/**
 * Shipment type
 */

SearchService.Type.Shipments = {
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
    "orderId": {
      "type": "string",
      "index": "no"
    },
    "orderNumber": {
      "type": "string",
      "index": "not_analyzed"
    },
    "status": {
      "type": "string",
      "index": "no"
    },
    "shippedAt": {
      "type": "date",
      "index": "no"
    },
    "receivedAt": {
      "type": "date",
      "index": "no"
    },
    "packedAt": {
      "type": "date",
      "index": "no"
    },
    "isPickup": {
      "type": "boolean",
      "index": "no"
    },
    "shippingAddressId": {
      "type": "string",
      "index": "no"
    },
    "billingAddressId": {
      "type": "string",
      "index": "no"
    },
    "trackingCompany": {
      "type": "string",
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
    "items": {
      "type": "nested",
      "properties": {
        "orderItemId": {
          "type": "string",
          "index": "no"
        },
        "quantity": {
          "type": "double",
          "index": "no"
        },
        "variantId": {
          "type": "string",
          "index": "no"
        },
        "orderPrice": {
          "type": "double",
          "index": "no"
        }
      }
    },
    "exchangeRate": {
      "type": "double",
      "index": "no"
    },
    "receipt": {
      "type": "string",
      "index": "not_analyzed"
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
