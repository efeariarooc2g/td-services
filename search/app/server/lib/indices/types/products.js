/**
 * PriceList type
 */
SearchService.Type.PriceList = {
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
    "name": {
      "type": "string",
      "analyzer": "nGram_analyzer",
      "search_analyzer": "whitespace_analyzer"
    },
    "isDefault": {
      "type": "boolean",
      "index": "no"
    },
    "currencyISO": {
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


/**
 * VariantMedia type
 */
SearchService.Type.VariantMedia = {
  "mediaId": {
    "type": "string",
    "index": "no"
  },
  "priority": {
    "type": "long",
    "index": "no"
  },
  "metafields": {
    "type": "nested",
    "properties": SearchService.Type.Metafield
  },
  "updatedAt": {
    "type": "date",
    "index": "no"
  },
  "createdAt": {
    "type": "date",
    "index": "no"
  }
};


/*
 * VariantLocation type
 */
SearchService.Type.VariantLocation = {
  "locationId": {
    "type": "string",
    "index": "no"
  },
  "stockOnHand": {
    "type": "long",
    "index": "no"
  },
  "committedStock": {
    "type": "long",
    "index": "no"
  }
};


/**
 * ProductVariant type
 */
SearchService.Type.ProductVariants = {
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
    "productId": {
      "type": "string",
      "index": "no"
    },
    "name": {
      "type": "string",
      "analyzer": "nGram_analyzer",
      "search_analyzer": "whitespace_analyzer"
    },
    "code": {
      "type": "string",
      "index" : "not_analyzed"
    },
    "originVariantCode": {
      "type": "string",
      "index" : "not_analyzed"
    },
    "description": {
      "type": "string",
      "analyzer": "nGram_analyzer",
      "search_analyzer": "whitespace_analyzer"
    },
    "status": {
      "type": "string",
      "index": "no"
    },
    "upc": {
      "type": "string",
      "index": "no"
    },
    "supplierCode": {
      "type": "string",
      "index" : "not_analyzed"
    },
    "manageStock": {
      "type": "boolean",
      "index": "no"
    },
    "keepSelling": {
      "type": "boolean",
      "index": "no"
    },
    "taxable": {
      "type": "boolean",
      "index": "no"
    },
    "isOnline": {
      "type": "boolean",
      "index": "no"
    },
    "onlineOrdering": {
      "type": "boolean",
      "index": "no"
    },
    "onlineId": {
      "type": "string",
      "index" : "not_analyzed"
    },
    "opt1": {
      "type": "string",
      "index": "no"
    },
    "opt2": {
      "type": "string",
      "index": "no"
    },
    "opt3": {
      "type": "string",
      "index": "no"
    },
    "opt4": {
      "type": "string",
      "index": "no"
    },
    "buyPrice": {
      "type": "double",
      "index": "no"
    },
    "lastCostPrice": {
      "type": "double",
      "index": "no"
    },
    "stockOnHand": {
      "type": "long",
      "index": "no"
    },
    "committedStock": {
      "type": "long",
      "index": "no"
    },
    "maxOnlineStock": {
      "type": "long",
      "index": "no"
    },
    "movingAveragePrice": {
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
    "product": {
      "type": "string",
      "analyzer": "nGram_analyzer",
      "search_analyzer": "whitespace_analyzer"
    },
    "sku": {
      "type": "string",
      "index": "not_analyzed"
    },
    "variantPrices": {
      "type": "object",
      "properties": {
        "priceListCode": {
          "type": "string",
          "index": "not_analyzed"
        },
        "value": {
          "type": "double",
          "index": "no"
        }
      }
    },
    "composite": { 
      "type": "boolean",
      "index": "no"
    },
    "sellable": {
      "type": "boolean",
      "index": "no"
    },
    "locations": {
      "type": "nested",
      "properties": SearchService.Type.VariantLocation
    },
    "barcode": {
      "type": "string",
      "index": "not_analyzed"
    },
    "retailPrice": {
      "type": "double",
      "index": "no"
    },
    "wholesalePrice": {
      "type": "double",
      "index": "no"
    },
    "weight": {
      "type": "double",
      "index": "no"
    },
    "uom": {
      "type": "string",
      "index": "no"
    },
    "media": {
      "type": "object",
      "properties": SearchService.Type.VariantMedia
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
 * Product type
 */

SearchService.Type.Products = {
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
    "productType": {
      "type": "string",
      "index": "no"
    },
    "supplier": {
      "type": "string",
      "analyzer": "nGram_analyzer",
      "search_analyzer": "whitespace_analyzer"
    },
    "brand": {
      "type": "string",
      "index": "no"
    },
    "status": {
      "type": "string",
      "index": "no"
    },
    "opt1": {
      "type": "string",
      "index": "no"
    },
    "opt2": {
      "type": "string",
      "index": "no"
    },
    "opt3": {
      "type": "string",
      "index": "no"
    },
    "opt4": {
     "type": "string",
      "index": "no"
    },
    "imageUrl": {
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