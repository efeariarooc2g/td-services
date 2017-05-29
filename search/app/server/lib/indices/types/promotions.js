

SearchService.Type.PromotionApprovals = {
  "_id": {
    "type": "string",
    "index": "no"
  },
  "message": {
    "type": "string",
    "index": "no"
  },
  "approvedBy": {
    "type": "string",
    "index": "no"
  },
  "approvedAt": {
    "type": "date",
    "index": "no"
  }
};


SearchService.Type.PromotionHistory = {
  "event": {
    "type": "string",
    "index": "no"
  },
  "newValue": {
    "type": "string",
    "index": "no"
  },
  "userId": {
    "type": "string",
    "index": "no"
  },
  "createdAt": {
    "type": "date",
    "index": "no"
  }
};



/**
 * Promotion Rebate
 */
SearchService.Type.PromotionRebates = {
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
    "rebateNumber": {
      "type": "string",
      "analyzer": "nGram_analyzer",
      "search_analyzer": "whitespace_analyzer"
    },
    "type": {
      "type": "string",
      "index": "no"
    },
    "promotionId": {
      "type": "string",
      "index": "no"
    },
    "promotionName": {
      "type": "string",
      "analyzer": "nGram_analyzer",
      "search_analyzer": "whitespace_analyzer"
    },
    "customerId": {
      "type": "string",
      "index": "no"
    },
    "customerNumber": {
      "type": "string",
      "index": "not_analyzed"
    },
    "userId": {
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
    "customerName": {
      "type": "string",
      "analyzer": "nGram_analyzer",
      "search_analyzer": "whitespace_analyzer"
    },
    "value": {
      "type": "string",
      "index": "no"
    },
    "status": {
      "type": "string",
      "index": "no"
    },
    "createdAt": {
      "type": "date",
      "index": "no"
    },
    "createdBy": {
      "type": "string",
      "index": "no"
    },
    "history": {
      "type": "nested",
      "properties": SearchService.Type.PromotionHistory
    },
    "id": {
      "type": "string",
      "index": "no"
    }
  }
};


/**
 * Promotions type
 */
SearchService.Type.Promotions = {
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
    "history": {
      "type": "nested",
      "properties": SearchService.Type.PromotionHistory
    },
    "rules": {
      "type": "nested",
      "properties": {
        "_id": {
          "type": "string",
          "index": "no"
        },
        "name": {
          "type": "string",
          "index": "no"
        },
        "promotionParameterId": {
          "type": "string",
          "index": "no"
        },
        "parameterNameInParentSchema": {
          "type": "string",
          "index": "no"
        },
        "subParamValue": {
          "type": "string",
          "index": "no"
        },
        "subParamPreview": {
          "type": "string",
          "index": "no"
        },
        "operator": {
          "type": "string",
          "index": "no"
        },
        "value": {
          "type": "string",
          "index": "no"
        },
        "previewVal": {
          "type": "string",
          "index": "no"
        },
        "from": {
          "type": "date",
          "index": "no"
        },
        "to": {
          "type": "date",
          "index": "no"
        }
      }
    },
    "rewards": {
      "type": "nested",
      "properties": {
        "_id": {
          "type": "string",
          "index": "no"
        },
        "type": {
          "type": "string",
          "index": "no"
        },
        "subType": {
          "type": "string",
          "index": "no"
        },
        "previewSubType": {
          "type": "string",
          "index": "no"
        },
        "subTypeValue": {
          "type": "string",
          "index": "no"
        },
        "previewSubTypeValue": {
          "type": "string",
          "index": "no"
        },
        "uom": {
          "type": "string",
          "index": "no"
        },
        "previewUom": {
          "type": "string",
          "index": "no"
        },
        "value": {
          "type": "string",
          "index": "no"
        },
        "applied": {
          "type": "boolean",
          "index": "no"
        }
      }
    },
    "approvals": {
      "type": "nested",
      "properties": SearchService.Type.PromotionApprovals
    },
    "status": {
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
    },
    "startDate": {
      "type": "date",
      "index": "no"
    },
    "endDate": {
      "type": "date",
      "index": "no"
    },
    "createdAt": {
      "type": "date",
      "index": "no"
    }
  }
};
