
let Future = Npm.require('fibers/future');

// function to get search filters
const getFilter = (typeParam, authProfile) => {
  if (typeParam === 'users') {
    return {
      group: authProfile.tenantId
    };
  } else {
    return {
      _groupId: authProfile.tenantId
    };
  }
};

// function to get query filter
const getQueryFilter = (authProfile, typeParam) => {
  return {
    must: [ {
      term: getFilter(typeParam, authProfile)
    }, {
      bool: {
        should: [ {
          missing: {
            field: 'authGroup'
          }
        }, {
          terms: {
            allAccessAuthGroup: authProfile.authArray
          }
        }, {
          terms: {
            authGroup: authProfile.authArray
          }
        } ]
      }
    } ]
  };
};

// function to get local search fields
const getLocalSearchField = (typeParam) => {
  var fields;
  switch (typeParam) {
    case 'orders':
      fields = ['orderNumber^7', 'customerNumber^4', 'customerName^3', 'stockLocationName^2', 'salesLocationName^2',
        'userFullName', 'userName', 'contactName', 'contactPhone', 'contactEmail'];
      break;
    case 'purchaseorders':
      fields = ['purchaseOrderNumber^7', 'companyName^4', 'supplierName^3', 'customerGroup^2', 'contactName^2',
        'contactPhone^3', 'contactEmail^3'];
      break;
    case 'customers':
      fields = ['customerNumber^7', 'originCustomerId^7', 'email^6', 'name^5', 'description^4', 'customerType',
        'addressBook.fullName^4', 'addressBook.address1^4', 'addressBook.address2^4', 'addressBook.company^4',
        'addressBook.phone^4', 'addressBook.postal^4'];
      break;
    case 'returnorders':
      fields = ['returnOrderNumber^7', 'orderNumber^6', 'customerName^5', 'userFullName^4', 'userName^4',
        'stockLocationName^3', 'salesLocationName^3', 'contactName^3', 'contactPhone^3', 'contactEmail^5'];
      break;
    case 'invoices':
      fields = ['invoiceNumber^7', 'orderNumber^6', 'customerName^4', 'salesLocationName^5', 'stockLocationName^5'];
      break;
    case 'promotions':
      fields = ['name'];
      break;
    case 'promotionrebates':
      fields = ['rebateNumber^7', 'promotionName^4', 'customerNumber^6', 'orderNumber^6', 'customerName^4'];
      break;
    case 'users':
      fields = ['username^5', 'emails.address^7', 'profile.fullName^3'];
      break;
    case 'products':
      fields = ['name^7', 'description^4', 'supplier^4'];
      break;
    case 'productvariants':
      fields = ['code^9', 'originVariantCode^9', 'name^5', 'description^4', 'supplierCode^2', 'onlineId^3', 'product^2', 'sku'];
      break;
    case 'ordertypes':
      fields = ['name'];
      break;
    case 'stocktransfers':
      fields = ['stockTransferNumber', 'destinationLocationName', 'sourceLocationName'];
      break;
    case 'stockadjustments':
      fields = ['stockAdjustmentNumber', 'locationName'];
      break;
    case 'suppliers':
      fields = ['name^5', 'supplierNumber^5', 'email^3', 'phone^3', 'searchTerms^3'];
      break;
    case 'locations':
      fields = ['name', 'city', 'country', 'state'];
      break;
    case 'customergroups':
      fields = ['name', 'code', 'originGroupCode'];
      break;
  }
  return fields;
};

// function to handle local search
const getLocalQueryObject = (searchParam, authProfile, typeParam) => {
  return {
    query: {
      filtered: {
        query: {
          multi_match: {
            query: searchParam,
            type: 'most_fields',
            fields: getLocalSearchField(typeParam)
          }
        },
        filter: {
          bool: getQueryFilter(authProfile, typeParam)
        }
      }
    }
  };
};

// function to construct query body object
const getQueryBody = (searchParam, authProfile, typeParam) => ({
  query: {
    filtered: {
      query: {
        query_string: {
          query: searchParam
        }
      },
      filter: {
        bool: getQueryFilter(authProfile, typeParam)
      }
    }
  }
});

// function to construct local queryObject
const constructQueryObject = (typeParam, searchParam, authProfile) => {
  const indexType = SearchService.getIndexType(typeParam);
  const body = getLocalQueryObject(searchParam, authProfile, typeParam);
  return {
    size: process.env['MAX_SEARCH_COUNT'] || 10000,
    index: indexType[0],
    type: indexType[1],
    body
  };
};


Meteor.methods({

  'search/authenticate'(loginToken) {
    const userId = SearchService.MainConnection.call('ddpAuth/getUserByToken', loginToken);
    this.setUserId(userId);
    return userId;
  },

  'search/global'(searchParam, authProfile) {
    // If that user is not logged in, he'll get an error
    if (!this.userId) {
      throw new Meteor.Error(401, 'Unauthorized');
    }

    let future = new Future();

    let typeArray = [];
    if (process.env['GLOBAL_SEARCH_TYPES']) {
      typeArray = process.env['GLOBAL_SEARCH_TYPES'].split(' ');
    } else {
      throw new Meteor.Error(400, 'GLOBAL_SEARCH_TYPES env var not set.');
    }

    let responses = {};
    let count = 0;
    let typeArrayLength = typeArray.length;

    let queryFunction = function (type) {
      ESMongoSync.EsClient.search(constructQueryObject(type, searchParam, authProfile), function (error, response) {
        if (error) {
          console.log('Error', error);
        }
        if (response) {
          let defaultResponse = response.hits.hits;
          let filteredResponse = [];
          _.each(defaultResponse, function (hit) {
            let doc = hit._source;
            doc._id = doc.id;
            delete doc.id;
            filteredResponse.push(doc);
          });
          responses[type] = filteredResponse;
          count++;
          if (count === typeArrayLength) {
            future.return(responses);
          } else {
            queryFunction(typeArray[count]);
          }
        }
      });
    };
    queryFunction(typeArray[count]);
    return future.wait();
  },

  'search/local'(type, searchParam, authProfile) {

    if (!this.userId) {
      throw new Meteor.Error(401, 'Unauthorized');
    }

    return ESMongoSync.EsClient.search(constructQueryObject(type, searchParam, authProfile)).then(response => {
      let defaultResponse = response.hits.hits;
      let filteredResponse = [];
      _.each(defaultResponse, function (hit) {
        let doc = hit._source;
        doc._id = doc.id;
        delete doc.id;
        filteredResponse.push(doc);
      });
      return filteredResponse;
    }, error => error);
  }

});
