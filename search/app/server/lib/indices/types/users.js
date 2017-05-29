/**
 * User type
 */
SearchService.Type.Users = {
  "_all": {
    "enabled": false
  },
  "dynamic": "false",
  "properties": {
    "group": {
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
    "username": {
      "type": "string",
      "index" : "not_analyzed"
    },
    "emails": {
      "type": "nested",
      "include_in_root": true,
      "properties": SearchService.Type.Email
    },
    "profile": {
      "type": "object",
      "properties": {
        "fullName": {
          "type": "string",
          "analyzer": "nGram_analyzer",
          "search_analyzer": "whitespace_analyzer"
        }
      }
    },
    "createdAt": {
      "type": "date",
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
