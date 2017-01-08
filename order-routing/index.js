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



app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 3000;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();

router.get('/', function(req, res) {

});

router.route('/orders')
    .post(function(req, res) {
        processOrder(req.body).then(function (result) {
            res.json(result);
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
    let pendingOrders = []


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
            orders.push(finalOrder)
        }))

    } else if (_.some(initialOrders, function (o) {
            return _.contains(coverageProducerIds, o.producerId)
        })) {
        await (_.each(initialOrders, function (order) {
            let coverageProfile =  _.findWhere(retailOutlet.coverageProfile, {producerId: order.producerId});
            if (coverageProfile){
                let finalOrder = await (setupOrder(order, retailOutlet, doc));
                orders.push(finalOrder)
            } else {
                let finalOrder = await (setupDistributorOrder(order, retailOutlet, doc));
                pendingOrders.push(finalOrder)
            }
        }));
    } else if (pendingOrders.length > 0){
        let totalItemsQuantity = 0;
        var METERS_PER_MILE = 1609.34;
        let lng = retailOutlet.location.longitude;
        let lat = retailOutlet.location.latitude;
        let distributorOutlets  = await (Core.db().distributoroutlets.find({ geoSearch: { $nearSphere: { $geometry: { type: "Point", coordinates: [ lng, lat ] },
            $maxDistance: 5 * METERS_PER_MILE } } }).toArray());

        let outlet;
        outlet = _.find(distributorOutlets, function (o) {
            return canServiceAll(o, pendingOrders, retailOutlet)
        });
        if (outlet){
            _.each(pendingOrders, function (order) {
                orders.push(order)
            });
            pendingOrders = []
        } else {
            _.each(distributorOutlets, function (o) {
                let order = _.find(pendingOrders, function (order) {
                    return canServiceOrder(order, o)
                })
                if (order){
                    pendingOrders = _.reject(pendingOrders, order)
                    orders.push(order)
                }
            }) 
        }
        if (pendingOrders.length > 0) {
          _.each(pendingOrders, function (order) {
              order.hasError = true;
              order.errorMessage = ""
          })
        }
    }



    let coverageProfiles = [];
    let unAssignedProducerIds = [];



   /* if (unAssignedProducerIds && unAssignedProducerIds.length > 0){
        let itemsPerProducer = {};
        await(_.each(unAssignedProducerIds, function (producerId) {
            let items = _.where(doc.items, {producerId: producerId});
            var METERS_PER_MILE = 1609.34;
            let lng = retailOutlet.location.longitude;
            let lat = retailOutlet.location.latitude;
            let distributorOutlets  = await (Core.db().distributoroutlets.find({ geoSearch: { $nearSphere: { $geometry: { type: "Point", coordinates: [ lng, lat ] },
                $maxDistance: 5 * METERS_PER_MILE } } }).toArray());
            let companyIds = _.pluck(distributorOutlets, "distributorId");
            let companies = await (Core.db().companies.find({_id: {$in: companyIds}, tenantId: {$exists: true}}).toArray());
            let tenantIds = _.pluck(companies, "tenantId");
            _.each(distributorOutlets, function (d) {
                let company = await(Core.db().companies.findOne({_id: d.distributorId}));
                if (company && company.tenantId){

                }
            })

        }))
    }*/

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


function canAutoAssignOrder(distributorId, items, locationId) {
    let autoAssign = true;
    let company = await (Core.db().companies.findOne({_id: distributorId}));
    if (company && company.tenantId){
        let tenantId= company.tenantId;
        _.each(items, function (item) {
            if (autoAssign === false) return;
            let variant = await(Core.db().productvariants.findOne({masterCode: item.masterCode, _groupId: tenantId}));
            if (variant){
                if (_.isArray(variant.locations) && variant.locations.length > 0 ) {
                    let location =  await(_.findWhere(variant.locations, {locationId: locationId}));
                    if (!(location && location.stockOnHand > item.quantity)){
                        console.log("no stock for location");
                        autoAssign = false
                    }
                } else {
                    console.log("Empty locations array on item for", item.masterCode);
                    //autoAssign = false
                }
            } else {
                console.log("item not found");
                autoAssign = false
            }
        })
    } else {
        console.log("company not found");
        autoAssign = false
    }
    return autoAssign
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


/*function isExcludedOrderType(order, excludedOrderTypes) {
    if (excludedOrderTypes && typeof excludedOrderTypes === "object") {
        return order.orderType && _.indexOf(excludedOrderTypes, order.orderType) > -1 ? true : false;
    } else return false;
};*/



Array.min = function( array ){
    return Math.min.apply( Math, array );
};

function canServiceAll(outlet, orders, retailOutlet) {
    let canProcess = true;
    let orderQty = _.reduce( _.pluck(orders.items, "quantity"), function(memo, num){ return memo + num; }, 0);
    let lng = retailOutlet.location.longitude;
    let lat = retailOutlet.location.latitude;
    if (orderQty < outlet.moq){
        return false
    }
    let company = Core.db.companies.findOne({_id: outlet.distributorId});
    if (company && company.tenantId){
        let nearestLocation = Core.db().locations.findOne({_groupId: company.tenantId, geoSearch:
        { $near :
        {
            $geometry: { type: "Point",  coordinates: [ lng, lat ] }
        }
        }});
        _.each(orders, function (order) {
            if (!canProcess) return;
            _.each(order.items, function (i) {
                     let item = Core.db().productvariants.findOne({_groupId: company.tenantId, masterCode: i.masterCode});
                     if (item){
                         if (_.isArray(item.locations) && item.locations.length > 0 && nearestLocation) {
                             let location = _.findWhere(variant.locations, {locationId: nearestLocation._id});
                             if (!(location && location.stockOnHand >= i.quantity)){
                                 canProcess = false
                             }
                         } else {
                             canProcess = false
                         }
                     } else {
                         canProcess = false
                     }
            })
        })
    }
}