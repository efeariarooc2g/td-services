
/**
 * OrderType type
 */
SearchService.Type.OrderTypes = {
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
    "name": {
      "type": "string",
      "analyzer": "nGram_analyzer",
      "search_analyzer": "whitespace_analyzer"
    },
    "code": {
      "type": "string",
      "index" : "not_analyzed"
    },
    "sort": {
      "type": "double",
      "index": "no"
    },
    "id": {
      "type": "string",
      "index": "no"
    },
    "createdAt": {
      "type": "date",
      "index": "no"
    }
  }
};
