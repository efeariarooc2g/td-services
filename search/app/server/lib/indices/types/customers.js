
SearchService.Type.CustomerAccount = {
  "currentBalance": {
    "type": "double",
    "index": "no"
  },
  "currentDeposits": {
    "type": "double",
    "index": "no"
  },
  "currentRebates": {
    "type": "double",
    "index": "no"
  },
  "creditLimit": {
    "type": "double",
    "index": "no"
  },
  "creditAmount": {
    "type": "double",
    "index": "no"
  },
  "debitAmount": {
    "type": "double",
    "index": "no"
  },
  "valueDate": {
    "type": "date",
    "index": "no"
  },
  "createdAt": {
    "type": "date",
    "index": "no"
  }
};


/*
 * Elastic search Customer type definition
 * similar to the customer type data type (includes CustomerGroup)
 */
SearchService.Type.Customers = {
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
    "status": {
      "type": "string",
      "index": "no"
    },
    "customerNumber": {
      "type": "string",
      "index": "not_analyzed"
    },
    "originCustomerId": {
      "type": "string",
      "index": "not_analyzed"
    },
    "name": {
      "type": "string",
      "analyzer": "nGram_analyzer",
      "search_analyzer": "whitespace_analyzer"
    },
    "description": {
      "type": "string",
      "analyzer": "nGram_analyzer",
      "search_analyzer": "whitespace_analyzer"
    },
    "title": {
      "type": "string",
      "index": "no"
    },
    "addressBook": {
      "type": "nested",
      "include_in_root": true, 
      "properties": SearchService.Type.Address
    },
    "email": {
      "type": "string",
      "index": "not_analyzed"
    },
    "url": {
      "type": "string",
      "index": "no"
    },
    "groupCode": {
      "type": "string",
      "index": "no"
    },
    "customerType": {
      "type": "string"
    },
    "locale": {
      "type": "string",
      "index": "no"
    },
    "timezone": {
      "type": "string",
      "index": "no"
    },
    "account": {
      "type": "object",
      "properties": SearchService.Type.CustomerAccount
    },
    "accountHistory": {
      "type": "nested",
      "properties": SearchService.Type.CustomerAccount
    },
    /*"currency": {
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
    },*/
    "direct": { 
      "type": "boolean",
      "index": "no"
    },
    "defaultDiscountRate": {
      "type": "float",
      "index": "no"
    },
    "defaultPriceListCode": {
      "type": "string",
      "index": "no"
    },
    "defaultPaymentTerm": {
      "type": "string",
      "index": "no"
    },
    "defaultStockLocationId": {
      "type": "string",
      "index": "no"
    },
    "defaultTaxRate": {
      "type": "double",
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
