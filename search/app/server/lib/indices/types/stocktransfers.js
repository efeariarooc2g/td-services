
/**
 * StockTransfer type
 */

SearchService.Type.StockTransfers = {
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
    "destinationId": {
      "type": "string",
      "index": "no"
    },
    "quantity": {
      "type": "double",
      "index": "no"
    },
    "sourceId": {
      "type": "string",
      "index": "no"
    },
    "stockTransferNumber": {
      "type": "string",
      "index": "not_analyzed"
    },
    "sourceLocationName": {
      "type": "string",
      "analyzer": "nGram_analyzer",
      "search_analyzer": "whitespace_analyzer"
    },
    "destinationLocationName": {
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
