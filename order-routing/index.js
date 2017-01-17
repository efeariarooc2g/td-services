/**
 * Created by ramza on 12/22/16.
 */
"use strict";

var moq = [];

var _ = require("underscore");
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');

var Core = require("./core");


var processOrder = async (function(order) {
    let doc = await (Core.generateRetailerOrder(order));
    let retailOutlet = await (Core.db().retailoutlets.findOne({retailerId: doc.retailerId}));
    if (retailOutlet){
        return await (generateProducerOrders(doc, retailOutlet))
    } else {
       console.log("Cannot find retail outlet")
    }
});

var postOrders = async (function (orders) {
    let transaction = await (Core.generateTransaction(orders));
    transaction = await(Core.db().retailtransactions.insert(transaction));
    let retailOrders = []
    orders = await (_.where(orders,  {isPending: false}));
    await (_.each(orders, function (order) {
       if (order.hasCoverageProfile){
          let rOrder =  await (Core.saveProducerOrder(order, transaction));
          retailOrders.push(rOrder) 
       } else if (order.distributorId) {
          let rOrder = aait (Core.saveDistributorOrder(order))
           retailOrders.push(rOrder)
       }
    }));
    return retailOrders
});


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 4000;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();

router.get('/', function(req, res) {

});

router.route('/v2/orders/preview')
    .post(function(req, res) {
        processOrder(req.body).then(function (result) {
            let orderObject = {};
            orderObject.rawOrder = req.body;
            orderObject.orders = result;
            res.json(orderObject);
        });
    });

router.route('/v2/orders')
    .post(function(req, res) {
        processOrder(req.body).then(function (result) {
            postOrders(result).then(function (result) {
                res.json(result);
            });
        });
    });


// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);



function generateProducerOrders(doc, retailOutlet){
    doc.items = await(assignProducerIds(doc.items));
    let items = _.groupBy(doc.items, "producerId");
    let producerIds = Object.keys(items);
    let initialOrders = [];
    let coverageProducerIds =  _.pluck(retailOutlet.coverageProfile, "producerId");
    let orders = [];
    let pendingOrders = [];


    await (_.each(producerIds, function (id) {
        let orderItems = items[id];
        let order = {};
        order.producerId = id;
        order.items = orderItems;
        initialOrders.push(order)
    }));

    if (_.every(initialOrders, function (o) {
            return _.contains(coverageProducerIds, o.producerId)
        })) {
        await (_.each(initialOrders, function (order) {
            let finalOrder = await (setupOrder(order, retailOutlet, doc));
            finalOrder.producerId = order.producerId;
            finalOrder.hasCoverageProfile = true;
            finalOrder.retailerId = retailOutlet.retailerId;
            orders.push(finalOrder)
        }))

    } else if (_.some(initialOrders, function (o) {
            return _.contains(coverageProducerIds, o.producerId)
        })) {
        await (_.each(initialOrders, function (order) {
            let coverageProfile =  _.findWhere(retailOutlet.coverageProfile, {producerId: order.producerId});
            if (coverageProfile){
                let finalOrder = await (setupOrder(order, retailOutlet, doc));
                finalOrder.producerId = order.producerId;
                finalOrder.hasCoverageProfile = true;
                finalOrder.retailerId = retailOutlet.retailerId;
                finalOrder.isPending = false;
                orders.push(finalOrder)
            } else {
                let finalOrder = await (setupDistributorOrder(order, retailOutlet, doc));
                finalOrder.producerId = order.producerId;
                finalOrder.retailerId = retailOutlet.retailerId;
                pendingOrders.push(finalOrder)
            }
        }));
    }

    if (pendingOrders.length > 0){
        var METERS_PER_MILE = 1609.34;
        let lng = retailOutlet.location.longitude;
        let lat = retailOutlet.location.latitude;
        let distributorOutlets  = await (Core.db().distributoroutlets.find({ geoSearch: { $nearSphere: { $geometry: { type: "Point", coordinates: [ lng, lat ] },
            $maxDistance: 10 * METERS_PER_MILE } } }).toArray());

        let outlet;
        outlet = await (_.find(distributorOutlets, function (o) {
            return await (canServiceAll(o, pendingOrders, retailOutlet))
        }));
        if (outlet){
            _.each(pendingOrders, function (order) {
                order.isPending = false;
                orders.push(order)
            });
            pendingOrders = []
        } else {
            _.each(distributorOutlets, function (o) {
                let order = await (_.find(pendingOrders, function (order) {
                    return await (canServiceOrder(order, o, retailOutlet, pendingOrders))
                }));
                if (order){
                    let index = _.findLastIndex(pendingOrders, order);
                    pendingOrders = pendingOrders.splice(index, 1);
                    order.isPending = false;
                    orders.push(order)
                }
            })
        }
        if (pendingOrders.length > 0) {
            _.each(pendingOrders, function (order, index) {
                let oOrder = _.find(moq, function (qty) {
                    return qty.index === index
                });
                if (oOrder){
                    let oQty = _.findWhere(moq, {index: index});
                    let minQty = Math.min.apply( Math, _.pluck(oQty, 'moq') );
                    order.errorMessage = "Minimum order quantity is " + minQty;
                } else {
                    order.errorMessage = "No distributor outlet found";
                }
                order.isPending = true;
                orders.push(order)
            })
        }
    }
    return orders
}


function assignVariantIds(items, tenantId) {
    let allItems = [];
    await(_.each(items, function (item) {
        let variant = await (Core.db().productvariants.findOne({masterCode: item.masterCode, _groupId: tenantId}));
        item.variantId = variant._id;
        allItems.push(item)
    }));
    return allItems
}


function assignProducerIds(items){
    await(_.each(items, function (i) {
        let productVariant = await (Core.db().masterproductvariants.findOne({masterCode: i.masterCode}));
        if (productVariant){
            let product = await (Core.db().masterproducts.findOne({_id: productVariant.productId}));
            if (product){
                i.producerId = product.producerId
            }
        }
    }));
    return items;
}

function setupOrder(order, retailOutlet, doc) {
    let coverageProfile =  _.findWhere(retailOutlet.coverageProfile, {producerId: order.producerId});
    let producerCompany = await(Core.db().companies.findOne({_id: order.producerId}));
    let company = await(Core.db().companies.findOne({_id: coverageProfile.defaultDistributorId}));
    let tenantId = company.tenantId;
    let finalOrder;
    let producerItems = await (assignVariantIds(order.items, producerCompany.tenantId));
    let previewOrder = await(Core.prepareProducerOrder(producerItems, company._id, producerCompany.tenantId));
    previewOrder.issuedAt = doc.issuedAt;
    previewOrder.currency = doc.currency;
    finalOrder = await (prepareFinalOrder(previewOrder, producerCompany.tenantId));
    finalOrder.discounts = finalOrder.discounts ? finalOrder.discounts : 0;
    finalOrder.taxes = await(Core.getTaxes(finalOrder));
    finalOrder.subTotal = await (Core.getSubTotal(finalOrder));
    finalOrder.total = await (Core.getTotal(finalOrder));
    return finalOrder
}

function setupDistributorOrder(order, retailOutlet, doc) {
    let producerCompany = await(Core.db().companies.findOne({_id: order.producerId}));
    let previewOrder;
    if (producerCompany.tenantId){
        let producerItems = await (assignVariantIds(order.items, producerCompany.tenantId));
        previewOrder = await(Core.prepareOrder(producerItems, retailOutlet, producerCompany.tenantId));
        previewOrder.issuedAt = doc.issuedAt;
        previewOrder.currency = doc.currency;
        previewOrder.discounts = previewOrder.discounts ? previewOrder.discounts : 0;
        previewOrder.taxes = await(Core.getTaxes(previewOrder));
        previewOrder.subTotal = await (Core.getSubTotal(previewOrder));
        previewOrder.total = await (Core.getTotal(previewOrder));
    } else {
        previewOrder = order
    }
    return previewOrder;
    // Apply taxrate to order based on found distributor

}

function prepareFinalOrder(order, tenantId){
    let finalOrder;
    let promo = await (Core.applyPromotionRules(order, tenantId));
    finalOrder = await (Core.applyRewardsToOrder(promo, order,tenantId));
    await (_.each(finalOrder.items, function (item) {
        if (!item.masterCode){
            let productVariant = await (Core.db().productvariants.findOne({_id: item.variantId, _groupId: tenantId}));
            if (productVariant){
                item.masterCode = productVariant.masterCode;
            }
        }
    }));
    return finalOrder
}




function canServiceAll(outlet, orders, retailOutlet) {
    let canProcess = true;
    let quantity = [];
    await (_.each(orders, function (o) {
        await (_.each(o.items, function (i) {
            quantity.push(i.quantity)
        }))
    }));
    let orderQty = _.reduce(quantity, function(memo, num){ return memo + num; }, 0);
    let lng = retailOutlet.location.longitude;
    let lat = retailOutlet.location.latitude;
    if (orderQty < outlet.moq){
        return false
    }
    let company = await (Core.db().companies.findOne({_id: outlet.distributorId}));
    if (company && company.tenantId){
        let nearestLocation = await (Core.db().locations.findOne({_groupId: company.tenantId, geoSearch:
        { $near :
        {
            $geometry: { type: "Point",  coordinates: [ lng, lat ] }
        }
        }}));
        await (_.each(orders, function (order) {
            if (!canProcess) return;
            await (_.each(order.items, function (i) {
                     let item = await (Core.db().productvariants.findOne({_groupId: company.tenantId, masterCode: i.masterCode}));
                     if (item){
                         if (_.isArray(item.locations) && item.locations.length > 0 && nearestLocation) {
                             let location = _.findWhere(item.locations, {locationId: nearestLocation._id});
                             if (!(location && location.stockOnHand >= i.quantity)){
                                 canProcess = false
                             }
                         } else {
                             canProcess = false
                         }
                     } else {
                         canProcess = false
                     }
            }))
        }))
    } else {
        canProcess = false
    }
    return canProcess
}

function canServiceOrder(order, outlet, retailOutlet, orders) {
    let canProcess = true;
    let orderQty = _.reduce( _.pluck(order.items, "quantity"), function(memo, num){ return memo + num; }, 0);
    let lng = retailOutlet.location.longitude;
    let lat = retailOutlet.location.latitude;
    let company = await (Core.db().companies.findOne({_id: outlet.distributorId}));
    if (company && company.tenantId){
        let nearestLocation = await (Core.db().locations.findOne({_groupId: company.tenantId, geoSearch:
        { $near :
        {
            $geometry: { type: "Point",  coordinates: [ lng, lat ] }
        }
        }}));
        await (_.each(order.items, function (i) {
            let item = await (Core.db().productvariants.findOne({_groupId: company.tenantId, masterCode: i.masterCode}));
            if (item){
                if (_.isArray(item.locations) && item.locations.length > 0 && nearestLocation) {
                    let location = await (_.findWhere(item.locations, {locationId: nearestLocation._id}));
                    if (!(location && location.stockOnHand >= i.quantity)){
                        canProcess = false
                    }
                } else {
                    canProcess = false
                }
            } else {
                canProcess = false
            }
        }));
        if (orderQty < outlet.moq && canProcess){
            moq.push({index: _.findLastIndex(orders, order), moq: outlet.moq});
            canProcess = false
        }
    } else {
        canProcess = false
    }
    return canProcess
}