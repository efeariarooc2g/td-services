
/**
 * StockAdjustment type
 */

SearchService.Type.StockAdjustments = {
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
    "locationId": {
      "type": "string",
      "index": "no"
    },
    "stockAdjustmentNumber": {
      "type": "string",
      "index": "not_analyzed"
    },
    "locationName": {
      "type": "string",
      "analyzer": "nGram_analyzer",
      "search_analyzer": "whitespace_analyzer"
    },
    "items": {
      "type": "nested",
      "properties": {
        "quantity": {
          "type": "double",
          "index": "not_analyzed"
        },
        "variantId": {
          "type": "string",
          "index": "no"
        }
      }
    },
    "comments": {
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
    "receivedAt": {
      "type": "date",
      "index": "no"
    },
    "userId": {
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
