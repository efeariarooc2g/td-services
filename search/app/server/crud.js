

/*
* Function to set authRules for search filter
* */
const setAuthRules = (doc, which) => {
  switch (which) {
    case 1:
      doc.authGroup = doc.stockLocationId;
      doc.allAccessAuthGroup = 'ALL_STOCK_LOCATIONS';
      break;
    case 2:
      doc.authGroup = doc.groupCode;
      doc.allAccessAuthGroup = 'ALL_CUSTOMER_GROUPS';
      break;
  }
  return doc;
};


/*
* Function to add document type to document
* */
const attachDocType = (doc, type) => {
  doc.type = type;
  doc.id = doc._id;
  delete doc._id;
  delete doc.roles;
  return doc;
};


/*
* Function to clean document
* */
const cleanDoc = (doc, type) => {
  doc = attachDocType(doc, type);
  if (doc.orderNumber) {
    doc.orderNumber = String(doc.orderNumber);
  }
  if (doc.invoiceNumber) {
    doc.invoiceNumber = String(doc.invoiceNumber);
  }
  if (doc.returnOrderNumber) {
    doc.returnOrderNumber = String(doc.returnOrderNumber);
  }
  if (doc.customerNumber) {
    doc.customerNumber = String(doc.customerNumber);
  }
  if (doc.stockTransferNumber) {
    doc.stockTransferNumber = String(doc.stockTransferNumber);
  }
  if (doc.stockAdjustmentNumber) {
    doc.stockAdjustmentNumber = String(doc.stockAdjustmentNumber);
  }
  if (doc.purchaseOrderNumber) {
    doc.purchaseOrderNumber = String(doc.purchaseOrderNumber);
  }
  if (doc.rebateNumber) {
    doc.rebateNumber = String(doc.rebateNumber);
  }
  if (doc.trackingNumber) {
    doc.trackingNumber = String(doc.trackingNumber);
  }
  if (doc.code) {
    doc.code = String(doc.code);
  }
  /*if (doc.currency) {
    if (typeof doc.currency !== 'object') {
      delete doc.currency;
    }
  }*/
  return doc;
};


/*
* Function to fetch document
* */
const fetch = (index, type, id, callBack) => {
  ESMongoSync.EsClient.get({ index, type, id }, Meteor.bindEnvironment((error, response) => {
    callBack(error, response);
  }));
};


/*
* Function to include stock location to document
* */
const addLocations = (doc, callBack) => {
  fetch('user', 'locations', doc.salesLocationId, Meteor.bindEnvironment((error, response) => {
    if (!error && response) {
      const derivedLocation = response._source;
      if (derivedLocation &&  derivedLocation.name) {
        doc.salesLocationName = derivedLocation.name;
      }
    }
    fetch('user', 'locations', doc.stockLocationId, Meteor.bindEnvironment((error, response) => {
      if (!error && response) {
        const derivedLocation = response._source;
        if (derivedLocation &&  derivedLocation.name) {
          doc.stockLocationName = derivedLocation.name;
        }
      }
      callBack(doc);
    }));
  }));
};


/*
* Function to parse order
* */
const parseOrder = (index, type, doc, finalCallBack) => {
  fetch('user', 'users', doc.userId, Meteor.bindEnvironment((error, response) => {
    if (!error && response) {
      const user = response._source;
      if (user) {
        doc.userFullName = user.profile.fullName ? user.profile.fullName : '';
        doc.username = user.username ? user.username : '';
      }
    }
    // add stock location name to document
    addLocations(doc, Meteor.bindEnvironment(order => {
      finalCallBack(cleanDoc(order, type));
    }));
  }));
};



/*
 * Function to parse purchaseOrder
 * */
const parsePurchaseOrder = (index, type, doc, finalCallBack) => {
  fetch('user', 'users', doc.userId, Meteor.bindEnvironment((error, response) => {
    if (!error && response) {
      const user = response._source;
      if (user) {
        doc.userFullName = user.profile.fullName ? user.profile.fullName : '';
        doc.username = user.username ? user.username : '';
      }
      finalCallBack(cleanDoc(doc, type));
    }
  }));
};



/*
* Function to parse StockTransfer
* */
const parseStockTransfer = function (index, type, doc, finalCallBack) {
  fetch('user', 'users', doc.userId, Meteor.bindEnvironment((error, response) => {
    if (!error && response) {
      const user = response._source;
      if (user) {
        doc.userFullName = user.profile.fullName ? user.profile.fullName : '';
        doc.username = user.username ? user.username : '';
      }
    }
    fetch('user', 'locations', doc.sourceId, Meteor.bindEnvironment((error, response) => {
      if (!error && response) {
        const derivedLocation = response._source;
        if (derivedLocation &&  derivedLocation.name) {
          doc.sourceLocationName = derivedLocation.name;
        }
      }
      fetch('user', 'locations', doc.destinationId, Meteor.bindEnvironment((error, response) => {
        if (!error && response) {
          const derivedLocation = response._source;
          if (derivedLocation &&  derivedLocation.name) {
            doc.destinationLocationName = derivedLocation.name;
          }
        }
        finalCallBack(cleanDoc(doc, type));
      }));
    }));
  }));
};



/*
 * Function to parse StockAdjustment
 * */
const parseStockAdjustment = function (index, type, doc, finalCallBack) {
  fetch('user', 'users', doc.userId, Meteor.bindEnvironment((error, response) => {
    if (!error && response) {
      const user = response._source;
      if (user) {
        doc.userFullName = user.profile.fullName ? user.profile.fullName : '';
        doc.username = user.username ? user.username : '';
      }
    }
    fetch('user', 'locations', doc.locationId, Meteor.bindEnvironment((error, response) => {
      if (!error && response) {
        const derivedLocation = response._source;
        if (derivedLocation &&  derivedLocation.name) {
          doc.locationName = derivedLocation.name;
        }
      }
      finalCallBack(cleanDoc(doc, type));
    }));
  }));
};



/*
* Function to parse invoice
* */
const parseInvoice = (index, type, doc, finalCallBack) => {
  addLocations(doc, Meteor.bindEnvironment(invoice => {
    finalCallBack(cleanDoc(invoice, type));
  }));
};



/*
* Function to parse generic document
* */
const parseDocument = (index, type, doc, finalCallBack) => {
  finalCallBack(cleanDoc(doc, type));
};



/*
* Function to parse user document
* */
const parseUser = (index, type, doc, finalCallBack) => {
  finalCallBack(cleanDoc(doc, type));
};


/*
* Function to handle shipment indexing
* */
const parseShipmentDoc = (index, type, doc, finalCallBack) => {
  fetch('order', 'orders', doc.orderId, Meteor.bindEnvironment((error, response) => {
      if (!error && response) {
        const order = response._source;
        doc.orderNumber = order.orderNumber;
      }
      parseDocument(index, type, doc, finalCallBack);
    })
  );
};


/*
* Function to denormalize customer transactions
* */
const denormalizeCustomerTransaction = (sanitizedBody, callBack) => {
  fetch('order', 'customers', sanitizedBody.customerId, Meteor.bindEnvironment((error, response) => {
      if (!error && response) {
        const customer = response._source;
        sanitizedBody.customerName = customer.name;
        sanitizedBody.customerNumber = customer.customerNumber;
      }
      fetch('order', 'invoices', sanitizedBody.invoiceId, Meteor.bindEnvironment((error, response) => {
        if (!error && response) {
          var invoice = response._source;
          sanitizedBody.invoiceNumber = invoice.invoiceNumber;
        }
        fetch('order', 'orders', sanitizedBody.orderId, Meteor.bindEnvironment((error, response) => {
          if (!error && response) {
            const order = response._source;
            sanitizedBody.orderNumber = order.orderNumber;
          }
          callBack(sanitizedBody);
        }));
      }));
    })
  );
};


/*
* Function to parse customerTransaction
* */
const parseCustomerTransaction = (index, type, doc, finalCallBack) => {
  denormalizeCustomerTransaction(doc, Meteor.bindEnvironment(transaction => {
    finalCallBack(cleanDoc(transaction, type));
  }));
};


/*
* Function to parse promotion
*/
const parsePromotion = (index, type, doc, finalCallBack) => {
  finalCallBack(cleanDoc(doc, type));
};


// define all elastic search crud operations
_.extend(SearchService, {
  processDocument(watcher, document, finalCallBack) {
    const index = watcher.index;
    const type = watcher.type;
    switch (type) {
      case 'orders':
        document = setAuthRules(document, 1);
        parseOrder(index, type, document, finalCallBack);
        break;
      case 'invoices':
        document = setAuthRules(document, 1);
        parseInvoice(index, type, document, finalCallBack);
        break;
      case 'products':
        parseDocument(index, type, document, finalCallBack);
        break;
      case 'locations':
        parseDocument(index, type, document, finalCallBack);
        break;
      case 'customers':
        document = setAuthRules(document, 2);
        parseDocument(index, type, document, finalCallBack);
        break;
      case 'suppliers':
        document = setAuthRules(document, 2);
        parseDocument(index, type, document, finalCallBack);
        break;
      case 'pricelists':
        parseDocument(index, type, document, finalCallBack);
        break;
      case 'payments':
        parseDocument(index, type, document, finalCallBack);
        break;
      case 'customergroups':
        parseDocument(index, type, document, finalCallBack);
        break;
      case 'productvariants':
        parseDocument(index, type, document, finalCallBack);
        break;
      case 'users':
        document = setAuthRules(document, 2);
        parseUser(index, type, document, finalCallBack);
        break;
      case 'shipments':
        parseShipmentDoc(index, type, document, finalCallBack);
        break;
      case 'customertransactions':
        parseCustomerTransaction(index, type, document, finalCallBack);
        break;
      case 'returnorders':
        document = setAuthRules(document, 1);
        parseOrder(index, type, document, finalCallBack);
        break;
      case 'promotions':
        document = setAuthRules(document, 1);
        parsePromotion(index, type, document, finalCallBack);
        break;
      case 'promotionrebates':
        document = setAuthRules(document, 1);
        parsePromotion(index, type, document, finalCallBack);
        break;
      case 'ordertypes':
        parseDocument(index, type, document, finalCallBack);
        break;
      case 'purchaseorders':
        parsePurchaseOrder(index, type, document, finalCallBack);
        break;
      case 'stocktransfers':
        parseStockTransfer(index, type, document, finalCallBack);
        break;
      case 'stockadjustments':
        parseStockAdjustment(index, type, document, finalCallBack);
        break;
    }
  }
});
