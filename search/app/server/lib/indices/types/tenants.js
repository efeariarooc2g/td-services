/**
 * CustomEmailSettings type definition
 */
SearchService.Type.CustomEmailSettings = {
  "username": {
    "type": "string",
    "index": "not_analyzed"
  },
  "password": {
    "type": "string",
    "index": "no"
  },
  "host": {
    "type": "string",
    "index": "no"
  },
  "port": {
    "type": "long",
    "index": "no"
  }
};


/**
 * Currency type definition
 */
SearchService.Type.Currency = {
  "_all": {
    "enabled": false
  },
  "dynamic": "false",
  "properties": {
    "iso": {
      "type": "string",
      "index": "no"
    },
    "name": {
      "type": "string",
      "analyzer": "nGram_analyzer",
      "search_analyzer": "whitespace_analyzer"
    },
    "rate": {
      "type": "float",
      "index": "no"
    },
    "symbol": {
      "type": "string",
      "index": "no"
    },
    "separator": {
      "type": "string",
      "index": "no"
    },
    "delimiter": {
      "type": "string",
      "index": "no"
    },
    "precision": {
      "type": "long",
      "index": "no"
    },
    "format": {
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


/*
 * Elastic search Tenant type definition
 * similar to the tenant data type
 */
SearchService.Type.Tenants = {
  "_all": {
    "enabled": false
  },
  "dynamic": "false",
  "properties": {
    "status": {
      "type": "string",
      "index": "no"
    },
    "name": {
      "type": "string",
      "analyzer": "nGram_analyzer",
      "search_analyzer": "whitespace_analyzer"
    },
    "description": {
      "type": "string",
      "index": "no"
    },
    "keywords": {
      "type": "string",
      "index": "no"
    },
    "addressBook": {
      "type": "nested",
      "properties": SearchService.Type.Address
    },
    "emails": {
      "type": "nested",
      "properties": SearchService.Type.Email
    },
    "baseCurrency": {
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
    "locale": {
      "type": "string",
      "index": "no"
    },
    "country": {
      "type": "string",
      "index": "not_analyzed"
    },
    "public": {
      "type": "string",
      "index": "no"
    },
    "timezone": {
      "type": "string",
      "index": "no"
    },
    "baseUOM": {
      "type": "string",
      "index": "no"
    },
    "metafields": {
      "type": "nested",
      "properties": SearchService.Type.Metafield
    },
    "layout": {
      "type": "nested",
      "properties": {
        "layout": {
          "type": "string",
          "index": "no"
        },
        "theme": {
          "type": "string",
          "index": "no"
        },
        "workflow": {
          "type": "string",
          "index": "no"
        },
        "collection": {
          "type": "string",
          "index": "no"
        },
        "enabled": {
          "type": "boolean",
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
