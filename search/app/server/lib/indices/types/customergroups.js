


/**
 * CustomerGroup Type
 */
SearchService.Type.CustomerGroups = {
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
    "name": {
      "type": "string",
      "analyzer": "nGram_analyzer",
      "search_analyzer": "whitespace_analyzer"
    },
    "code": {
      "type": "string",
      "index" : "not_analyzed"
    },
    "isPickupDefault": {
      "type": "boolean",
      "index" : "no"
    },
    "originGroupCode": {
      "type": "string",
      "index" : "not_analyzed"
    },
    "createdAt": {
      "type": "date",
      "index" : "no"
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



