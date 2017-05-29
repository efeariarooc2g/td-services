
/**
 * Supplier Type
 */
SearchService.Type.Suppliers = {
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
      "index" : "not_analyzed"
    },
    "allAccessAuthGroup": {
      "type": "string",
      "index" : "not_analyzed"
    },
    "status": {
      "type": "string",
      "index" : "no"
    },
    "supplierNumber": {
      "type": "string",
      "index" : "not_analyzed"
    },
    "name": {
      "type": "string",
      "analyzer": "nGram_analyzer",
      "search_analyzer": "whitespace_analyzer"
    },
    "title": {
      "type": "string",
      "index" : "no"
    },
    "email": {
      "type": "string",
      "index" : "not_analyzed"
    },
    "phone": {
      "type": "string",
      "index" : "not_analyzed"
    },
    "url": {
      "type": "string",
      "index": "no"
    },
    "locale": {
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
    "blocked": {
      "type": "boolean",
      "index": "no"
    },
    "direct": {
      "type": "boolean",
      "index": "no"
    },
    "defaultTaxRate": {
      "type": "double",
      "index": "no"
    },
    "creditTerms": {
      "type": "string",
      "index": "no"
    },
    "searchTerms": {
      "type": "string",
      "analyzer": "nGram_analyzer",
      "search_analyzer": "whitespace_analyzer"
    },
    "createdBy": {
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
    "companyId": {
      "type": "string",
      "index": "no"
    },
    "type": {
      "type": "string",
      "index": "no"
    },
    "id": {
      "type": "string",
      "index": "no"
    }
  }
};

