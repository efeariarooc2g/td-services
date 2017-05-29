
import deepMerge from 'deepmerge';

// exported, global/window scope
SearchService = {};
SearchService.Type = {};
SearchService.Analyzer = {};
SearchService.Doc = {};
SearchService.Indices = {};
SearchService.IndexType = {
  customers: ['order', 'customers'],
  promotions: ['order', 'promotions'],
  promotionRebates: ['order', 'promotionrebates'],
  locations: ['user', 'locations'],
  users: ['user', 'users'],
  orders: ['order', 'orders'],
  returnOrders: ['order', 'returnorders'],
  payments: ['order', 'payments'],
  shipments: ['order', 'shipments'],
  products: ['product', 'products'],
  productVariants: ['product', 'productvariants'],
  priceLists: ['product', 'pricelists'],
  customerTransactions: ['order', 'customertransactions'],
  invoices: ['order', 'invoices'],
  orderTypes: ['order', 'ordertypes'],
  purchaseOrders: ['order', 'purchaseorders'],
  stockTransfers: ['product', 'stocktransfers'],
  stockAdjustments: ['product', 'stockadjustments'],
  suppliers: ['order', 'suppliers'],
  customerGroups: ['order', 'customergroups']
};
SearchService.generics = ['locations', 'products', 'customers', 'suppliers', 'pricelists', 'productvariants'];
SearchService.nonGenerics = ['users', 'orders', 'promotions', 'promotionrebates', 'returnorders', 'customergroups',
  'payments', 'shipments', 'customertransactions', 'invoices', 'ordertypes', 'purchaseorders', 'stocktransfers', 'stockadjustments'];


SearchService.documentCount = 500;
SearchService.reindexInterval = 'on the first day of the week';
SearchService.MainConnection = Cluster.discoverConnection('main');

Indices = [ 'user', 'order', 'product' ];


let processUpdate = newMappings => {
  _.each(newMappings, (mapping, index) => {
    ESMongoSync.EsClient.indices.putMapping({
      index: mapping.index,
      type: mapping.type,
      body: mapping.mapping,
      update_all_types: true
    }, (error, response) => {
      if (error) {
        console.log(error.message);
      } else {
        //console.log(response);
      }
    });
  });
};

let processMaps = (key, fileMap, loadedMap) => {
  const newMappings = [];
  // use fileMap to loop and push merged map to array
  for (var prop in fileMap) {
    if (!fileMap.hasOwnProperty(prop)) {
      continue;
    }
    if (!loadedMap[prop]) {
      newMappings.push({
        index: key.toLowerCase(),
        type: prop,
        mapping: fileMap[prop]
      });
    } else {
      const newObject = deepMerge(loadedMap[prop], fileMap[prop]);
      newMappings.push({
        index: key.toLowerCase(),
        type: prop,
        mapping: newObject
      });
    }
  }
  processUpdate(newMappings);
};

let updateMappings = response => {
  const mappings = {};
  const fileMappings = SearchService.Indices;

  for (prop in response) {
    if (response.hasOwnProperty(prop)) {
      mappings[prop.capitalize()] = {
        tag: prop,
        mappings: response[prop].mappings
      };
    }
  }

  for (var prop in fileMappings) {
    if (fileMappings.hasOwnProperty(prop)) {
      const fileMap = fileMappings[prop].mappings;
      const loadedMap = mappings[prop] ? mappings[prop].mappings : null;
      processMaps(prop, fileMap, loadedMap);
    }
  }
};

var getQueryDocTypes = flag => {
  const documentClass = flag ? SearchService.generics : SearchService.nonGenerics;
  const queryArray = [];
  _.each(documentClass, type => {
    queryArray.push({
      collection: type
    });
  });
  return queryArray;
};

String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

_.extend(SearchService, {
  init() {
    // get all available indices
    ESMongoSync.EsClient.indices.stats().then(response => {
      if (response) {
        SearchService.analyzeStats(response);
      }
    });
  },
  analyzeStats(response) {
    const registeredIndices = response.indices;
    const unregisteredIndices = [];
    // loop through the indices to check if they've all been created
    _.each(Indices, (element) => {
      if (!registeredIndices.hasOwnProperty(element)) {
        unregisteredIndices.push(element);
      }
    });
    if (unregisteredIndices.length > 0) {
      SearchService.defineIndices(unregisteredIndices);
    } else {
      SearchService.updateMappings();
    }
  },
  getIndex(key) {
    switch (key) {
      case 'user':
        return SearchService.Indices.User;
      case 'order':
        return SearchService.Indices.Order;
      case 'product':
        return SearchService.Indices.Product;
    }
    return undefined;
  },
  defineIndices(indices) {
    // loop through the array and create index for each element
    const length = indices.length;
    let count = 0;
    _.each(indices, (element) => {
      ESMongoSync.EsClient.indices.create({
        'index': element,
        'body': SearchService.getIndex(element),
        'update_all_types': true
      }, (error, response, responseCode) => {
        console.log(error);
        //console.log(response);
        //console.log(responseCode);
        count++;
        if (count === length) {
          console.log('Indices created successfully. Updating mappings...');
          SearchService.updateMappings();
        }
      });
    });
  },
  updateMappings() {
    ESMongoSync.EsClient.indices.getMapping((error, response) => {
      if (error) {
        console.log(error);
      } else {
        updateMappings(response);
      }
    });
  },
  getIndexType(type) {
    let returnType = false;
    switch (type) {
      case 'customers':
        returnType = SearchService.IndexType.customers;
        break;
      case 'suppliers':
        returnType = SearchService.IndexType.suppliers;
        break;
      case 'promotions':
        returnType = SearchService.IndexType.promotions;
        break;
      case 'promotionrebates':
        returnType = SearchService.IndexType.promotionRebates;
        break;
      case 'locations':
        returnType =  SearchService.IndexType.locations;
        break;
      case 'users':
        returnType =  SearchService.IndexType.users;
        break;
      case 'orders':
        returnType = SearchService.IndexType.orders;
        break;
      case 'returnorders':
        returnType = SearchService.IndexType.returnOrders;
        break;
      case 'payments':
        returnType = SearchService.IndexType.payments;
        break;
      case 'shipments':
        returnType = SearchService.IndexType.shipments;
        break;
      case 'products':
        returnType = SearchService.IndexType.products;
        break;
      case 'productvariants':
        returnType = SearchService.IndexType.productVariants;
        break;
      case 'pricelists':
        returnType = SearchService.IndexType.priceLists;
        break;
      case 'customertransactions':
        returnType = SearchService.IndexType.customerTransactions;
        break;
      case 'invoices':
        returnType = SearchService.IndexType.invoices;
        break;
      case 'ordertypes':
        returnType = SearchService.IndexType.orderTypes;
        break;
      case 'purchaseorders':
        returnType = SearchService.IndexType.purchaseOrders;
        break;
      case 'stocktransfers':
        returnType = SearchService.IndexType.stockTransfers;
        break;
      case 'stockadjustments':
        returnType = SearchService.IndexType.stockAdjustments;
        break;
      case 'customergroups':
        returnType = SearchService.IndexType.customerGroups;
        break;
    }
    return returnType;
  }
});
