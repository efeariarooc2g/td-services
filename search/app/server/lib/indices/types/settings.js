// indexing settings
SearchService.Type.Settings = {
  "index.mapper.dynamic": false,
  "analysis": {
    "filter": {
      "nGram_filter": {
        "type": "edgeNGram",
        "min_gram": 3,
        "max_gram": 15,
        "token_chars": [ "letter", "digit", "punctuation", "symbol" ]
      }
    },
    "analyzer": {
      "nGram_analyzer": {
        "type": "custom",
        "tokenizer": "standard",
        "filter": [ "lowercase", "asciifolding", "nGram_filter" ]
      },
      "whitespace_analyzer": {
        "type": "custom",
        "tokenizer": "whitespace",
        "filter": [ "lowercase", "asciifolding" ]
      }
    }
  }
};
