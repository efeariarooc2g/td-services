/**
 * Core Collections Orders
 */
Orders = new Mongo.Collection("orders", {
    transform: function (order) {
        order.salesLocation = function() {
            let location = '';
            if (order !== null ? order.salesLocationId : void 0) {
                let locations = Locations.findOne(order.salesLocationId);
                if (locations) location = locations.name;
            }
            return location;
        };
        order.stockLocation = function() {
            let location = '';
            if (order !== null ? order.stockLocationId : void 0) {
                let locations = Locations.findOne(order.stockLocationId);
                if (locations) location = locations.name;
            }
            return location;
        };
        order.payments = function() {
            let payments = 0;
            if (order !== null) {
                let cPayments = Payments.find({ orderId: order._id}).fetch();
                _.each(cPayments, function(p) {
                    payments += p.amount;
                });
            }
            return payments;
        };
        order.nonCashPayments = function() {
            let payments = 0;
            if (order !== null) {
                let cPayments = Payments.find({ orderId: order._id, isCashInHand: false }).fetch();
                _.each(cPayments, function(p) {
                    payments += p.amount;
                });
            }
            return payments;
        }();
        order.cashPayments = function() {
            let payments = 0;
            if (order !== null) {
                let cPayments = Payments.find({ orderId: order._id, isCashInHand: true }).fetch();
                _.each(cPayments, function(p) {
                    payments += p.amount;
                });
            }
            return payments;
        }();
        order.balance = function() {
            return order.total - (order.appliedCredits + order.payments())
        };
        return order;
    }
});
Partitioner.partitionCollection(Orders, {index: {userId: 1}});


/**
 * Core Collections Tenants
 */
 Tenants = new Mongo.Collection("tenants");


/**
 * Core Collections OrderTypes
 */
OrderTypes = new Mongo.Collection("ordertypes");
Partitioner.partitionCollection(OrderTypes);

/**
 * Core Collections Payments
 */
Payments = new Mongo.Collection("payments");
Partitioner.partitionCollection(Payments);


/**
 * Core Collections Locations
 */
Locations = new Mongo.Collection("locations");
Partitioner.partitionCollection(Locations);

/**
 * Core Collections ReturnOrders
 */
ReturnOrders = new Mongo.Collection("returnorders", {
    transform: function (returnOrder) {
        returnOrder.salesLocation = function () {
            let location = '';
            if (returnOrder !== null ? returnOrder.salesLocationId : void 0) {
                let locations = Locations.findOne(returnOrder.salesLocationId);
                if (locations) location = locations.name;
            }
            return location;
        };
        returnOrder.stockLocation = function () {
            let location = '';
            if (returnOrder !== null ? returnOrder.stockLocationId : void 0) {
                let locations = Locations.findOne(returnOrder.stockLocationId);
                if (locations) location = locations.name;
            }
            return location;
        };
        return returnOrder;
    }
});
Partitioner.partitionCollection(ReturnOrders, {index: {userId: 1}});

/**
 * Core Collections Invoices
 */
Invoices = new Mongo.Collection("invoices", {
    transform: function (invoice) {
        invoice.salesLocation = function () {
            let location = '';
            if (invoice !== null ? invoice.salesLocationId : void 0) {
                let locations = Locations.findOne(invoice.salesLocationId);
                if (locations) location = locations.name;
            }
            return location;
        };
        invoice.stockLocation = function () {
            let location = '';
            if (invoice !== null ? invoice.stockLocationId : void 0) {
                let locations = Locations.findOne(invoice.stockLocationId);
                if (locations) location = locations.name;
            }
            return location;
        };
        return invoice;
    }
});
Partitioner.partitionCollection(Invoices);



/**
 * Core Collections ProductVariants
 */
ProductVariants = new Mongo.Collection("productvariants");
Partitioner.partitionCollection(ProductVariants, {index: {code: 1}});

/**
 * Core Collections Promotions
 */
Promotions = new Mongo.Collection("promotions");
Partitioner.partitionCollection(Promotions);

/**
 * Core Collections Promotions Rebate
 */
PromotionRebates = new Mongo.Collection("promotionrebates");
Partitioner.partitionCollection(PromotionRebates);
