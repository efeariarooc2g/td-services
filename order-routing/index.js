/**
 * Created by ramza on 12/22/16.
 */
"use strict";

// test order
let order = {
    "retailerId": "23jk4Z3dpmcPoMakJ",
    "shippingAddressId": "p5a34hmtLwc7wXJCf",
    "billingAddressId": "p5a34hmtLwc7wXJCf",
    "currency": {
        "iso": "NGN",
        "symbol": "₦"
    },
    "contactName": "Chief Chukwuma Okezue",
    "contactPhone": "8023368786",
    "contactEmail": "abc@gmail.com",
    "isPickup": true,
    "status": "open",
    "paymentStatus": "unpaid",
    "invoiceStatus": "pending",
    "shippingStatus": "pending",
    "createdAt": "2016-12-08T09:46:08Z",
    "issuedAt": "2016-12-08T09:46:08Z",
    "updatedAt": "2016-12-08T09:46:08Z",
    "taxRate": 5,
    "subtotal": 260000,
    "taxes": 13000,
    "total": 273000,
    "orderType": 20,
    "items": [{
        "price": 10000,
        "quantity": 20,
        "masterCode": "20",
        "status": "open"
    }, {
        "price": 2000,
        "quantity": 30,
        "masterCode": "20",
        "status": "open"
    }, {
        "price": 2000,
        "quantity": 5,
        "masterCode": "20",
        "status": "open",
        "isPromo": true
    }],
    "priceListCode": "10"
}


var _ = require("underscore");
var async = require('asyncawait/async');
var await = require('asyncawait/await');

var Core = require("./core");


var processOrder = async (function() {
   let doc = await (Core.generateRetailerOrder(order));
   let retailOutlet = await (Core.db().retailoutlets.findOne({retailerId: doc.retailerId}));
    if (retailOutlet){
        return await (generateProducerOrders(doc, retailOutlet))
    } else {
       console.log("Cannot find retail outlet")
    }
});

processOrder().then(function (result) {
    console.log(result)
});




function generateProducerOrders(doc, retailOutlet, save){
    doc.items = await(assignProducerIds(doc.items))
    let producerIds = _.uniq(_.pluck(doc.items, "producerId"));
    let coverageProfiles = [];
    let orders = []

    if (producerIds && producerIds.length > 0){
        if (retailOutlet.coverageProfile && retailOutlet.coverageProfile.length > 0){
           await(_.each(producerIds, function (p) {
                let coverageProfile =  _.findWhere(retailOutlet.coverageProfile, {producerId: p});
                if (coverageProfile){
                    coverageProfiles.push(coverageProfile)
                }
            }))
        }
        let itemsPerProducer = {};
        if (coverageProfiles.length > 0){
           await(_.each(coverageProfiles, function (p) {
                itemsPerProducer[p.producerId] = {};
                itemsPerProducer[p.producerId].items = _.where(doc.items, {producerId: p.producerId});
                itemsPerProducer[p.producerId].defaultDistributorId = p.defaultDistributorId;
                itemsPerProducer[p.producerId].defaultSupplyLocationId = p.defaultSupplyLocationId;
                itemsPerProducer[p.producerId].producerId = p.producerId;
                itemsPerProducer[p.producerId].assigneeId = p.defaultSalesRepId;
            }))
        }
        let allProducers = Object.keys(itemsPerProducer);
        await(_.each(allProducers, function(producer){
            let  assignedProducer = itemsPerProducer[producer];
            let globalOrderNumber;
            let producerCompany = await(Core.db().companies.findOne({_id: assignedProducer.producerId}));

            let company = await(Core.db().companies.findOne({_id: assignedProducer.defaultDistributorId}));
            let tenantId = company.tenantId;
            let finalOrder;
            let producerItems = await (assignVariantIds(assignedProducer.items, producerCompany.tenantId));
            if (producerCompany && producerCompany.tenantId) {
                let order = await(Core.prepareProducerOrder(producerItems, company._id, producerCompany.tenantId));
                order.issuedAt = doc.issuedAt;
                order.currency = doc.currency;
                finalOrder = await (prepareFinalOrder(order, producerCompany.tenantId));
                await (orders.push(finalOrder));
            } else {
                //find the nearest possible distributor
            }

            if (save){
                if (canAutoAssignOrder(assignedProducer.defaultDistributorId,
                        assignedProducer.items, assignedProducer.defaultSupplyLocationId)){
                        let newDistributorOrder;
                        //Code to save the order
                        /*
                         Partitioner.bindGroup(tenantId, function () {
                         let orderItems =  assignVariantIds(finalOrder.items);
                         let distributorOrder = prepareOrder(doc, orderItems, assignedProducer.defaultSupplyLocationId);
                         if (assignedProducer.assigneeId){
                         distributorOrder.assigneeId = assignedProducer.assigneeId
                         }
                         check(distributorOrder, Core.Schemas.Order);
                         let user = Meteor.users.findOne();
                         try {
                         check(distributorOrder, Core.Schemas.Order);
                         } catch (e) {
                         Core.Log.error(`There's invalid data in your order. Please correct and retry ${e}`);
                         return callback(e, null);
                         }
                         let distributorOrderId =  Orders.insert(distributorOrder);
                         newdistributorOrder = Orders.findOne(distributorOrderId);
                         globalOrderNumber = newdistributorOrder.globalOrderNumber
                         });
                         Partitioner.bindGroup(producerCompany.tenantId, function () {
                         if (producerCompany && producerCompany.tenantId) {
                         let indirectOrder = {};
                         let customer = Customers.findOne({companyId: assignedProducer.defaultDistributorId });
                         indirectOrder.retailerId = doc.retailerId;
                         indirectOrder.customerId = customer ? customer._id : null;
                         indirectOrder.amount = newdistributorOrder.total;
                         indirectOrder.orderNumber = globalOrderNumber;
                         indirectOrder.orderId = newdistributorOrder._id;
                         indirectOrder.status = newdistributorOrder.status;
                         indirectOrder.createdAt = newdistributorOrder.createdAt;
                         indirectOrder.currency = newdistributorOrder.currency;
                         IndirectOrders.insert(indirectOrder)
                         }
                         })*/
                } else {
                    /*Partitioner.bindGroup(producerCompany.tenantId, function () {
                     let company = Companies.findOne(assignedProducer.defaultDistributorId);
                     let producerItems =  assignVariantIds(assignedProducer.items);
                     let order = prepareProducerOrder(producerItems, company._id);
                     order.issuedAt = doc.issuedAt;
                     order.currency = doc.currency;
                     let defaultUserId = Meteor.users.findOne()._id
                     let finalOrder = prepareFinalOrder(order);

                     let unassignedOrder = {};
                     let items = [];
                     unassignedOrder.retailerId = doc.retailerId;
                     unassignedOrder.retailOrderId = doc._id;
                     unassignedOrder.retailOrderNumber = doc.retailOrderNumber;
                     unassignedOrder.priceListCode = doc.priceListCode;
                     unassignedOrder.createdAt = new Date;
                     unassignedOrder.salesLocationId = assignedProducer.defaultSupplyLocationId;
                     unassignedOrder.customerId = assignedProducer.defaultDistributorId;
                     unassignedOrder.currency = doc.currency;
                     unassignedOrder.paymentReference = doc.paymentReference;

                     _.each(finalOrder.items, function (i) {
                     delete  i._id;
                     delete i.producerId;
                     delete  i.originItemId;
                     if (!i.taxRateOverride){
                     i.taxRateOverride = getTaxRate(defaultUserId)
                     }
                     if (!i.discount){
                     i.discount = 0;
                     }
                     if (i.isPromo){
                     i.price = 0;
                     i.taxRateOverride = 0
                     }
                     i.quantity = Number(i.quantity) //ensure quantity is a number for promo items

                     let variant = ProductVariants.findOne({masterCode: i.masterCode});
                     i.variantId = variant._id;
                     items.push(i)
                     });
                     unassignedOrder.items = items;
                     UnassignedOrders.insert(unassignedOrder)
                     })*/
                }
            }
        }));
        if (!save){
            return orders
        }
        //return callback(null, "all transactions processed");
    } else {
         //console.log("The selected items have no producer on our system")
        //return callback("The selected items have no producer on our system", null);
    }
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


