/**
* SearchService Type Email
*/
SearchService.Type.Email = {
  "provides": {
    "type": "string",
    "index": "no"
  },
  "address": {
    "type": "string",
    "index": "not_analyzed"
  },
  "verified": {
    "type": "boolean",
    "index": "no"
  }
};

/**
* SearchService Type Address
*/
SearchService.Type.Address = {
  "fullName": {
    "type": "string",
    "analyzer": "nGram_analyzer",
    "search_analyzer": "whitespace_analyzer"
  },
  "address1": {
    "type": "string",
    "analyzer": "nGram_analyzer",
    "search_analyzer": "whitespace_analyzer"
  },
  "address2": {
    "type": "string",
    "analyzer": "nGram_analyzer",
    "search_analyzer": "whitespace_analyzer"
  },
  "city": {
    "type": "string",
    "index": "no"
  },
  "company": {
    "type": "string",
    "analyzer": "nGram_analyzer",
    "search_analyzer": "whitespace_analyzer"
  },
  "phone": {
    "type": "string",
    "index": "not_analyzed"
  },
  "state": {
    "type": "string",
    "index": "no"
  },
  "postal": {
    "type": "string",
    "index": "not_analyzed"
  },
  "country": {
    "type": "string",
    "index": "no"
  },
  "isCommercial": {
    "type": "boolean",
    "index": "no"
  },
  "isBillingDefault": {
    "type": "boolean",
    "index": "no"
  },
  "isShippingDefault": {
    "type": "boolean",
    "index": "no"
  }
};


