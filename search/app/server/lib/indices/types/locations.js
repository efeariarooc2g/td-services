/**
 * Location Type
 */
SearchService.Type.Locations = {
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
    "city": {
      "type": "string",
      "index": "not_analyzed"
    },
    "country": {
      "type": "string",
      "index": "not_analyzed"
    },
    "state": {
      "type": "string",
      "index": "not_analyzed"
    },
    "address1": {
      "type": "string",
      "index": "no"
    },
    "address2": {
      "type": "string",
      "index": "no"
    },
    "postal": {
      "type": "string",
      "index": "no"
    },
    "status": {
      "type": "string",
      "index": "no"
    },
    "selfManaged": {
      "type": "boolean",
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
  
