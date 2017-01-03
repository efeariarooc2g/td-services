"use strict"
let Core = {}

var pmongo = require('promised-mongo');

var async = require('asyncawait/async');
var await = require('asyncawait/await');
var _ = require("underscore");


_.extend(Core, {
    db: function () {
        return pmongo('mongodb://localhost:27017/general', ['companies', 'customers', 'orders', 'users',
            'retailoutlets', "masterproductvariants", "masterproducts", "productvariants", "taxes", "tenants", "promotions"]);
    },
    generateRetailerOrder: function (doc) {
        let order = {};
        let currency;
        if (doc.currency){
            currency = {};
            currency.iso = doc.currency.iso;
            currency.symbol = doc.currency.symbol
        }

        let items = [];
        await(_.each(doc.items, function (item) {
            let i = {};
            i.price = item.price;
            i.quantity = item.quantity;
            i.masterCode = item.masterCode;
            items.push(i)
        }));
        order.retailerId = doc.retailerId;
        order.items = items;
        order.currency = currency;
        order.issuedAt = new Date(doc.issuedAt);
        order.createdAt = new Date(doc.createdAt);
        return order
    },
    applyPromotionRules: function (order, tenantId) {
        if (order) {
            let excludedOrderTypes =  [];
            let promotions = await (Core.db().promotions.find({
                status: "active",
                startDate: { $lte: order.issuedAt },
                endDate: { $gte: order.issuedAt },
                _groupId: tenantId
            }, {
                rules: 1, name: 1
            }).toArray());

            let promotionResult = [];

            if (promotions) {
                await (_.each(promotions, function(promotion) {
                    let unQualified = [],
                        multiple;
                    await (_.each(promotion.rules, function(rule) {
                        if (order.hasOwnProperty(rule.parameterNameInParentSchema)) {
                            if ( await (!testRuleOperator(order[rule.parameterNameInParentSchema], rule.value, rule.operator))) {
                                await (unQualified.push(rule));
                            }
                        } else {
                            let quantity = 0,
                                value = 0;
                            if (rule.subParamValue) {
                                //handle cummultive promotions
                                if (rule.to && rule.from) {
                                    // get orders within date range
                                    let orders = await (getCummulativeOrder(rule, order.customerId, excludedOrderTypes));
                                    let param = await (Core.db().promotionparameters.findOne({_id: rule.promotionParameterId, _groupId: tenantId}, { lookUpObject: 1  }));
                                    let parent = await (eval(param.lookUpObject).findOne({ _id: rule.subParamValue, _groupId: tenantId }, { _id: 1 } ));

                                    if (parent) {
                                        let parentId = parent._id;
                                        switch (param.lookUpObject) {
                                            case 'ProductVariants':
                                                // get item value and quantity in orders
                                                await (_.each(orders, function(order) {
                                                    //filter variant in orders
                                                    let items = await (_.filter(order.items, function(item) {
                                                        return item.variantId == parentId && !item.IsPromo;
                                                    }));

                                                    quantity += getItemQtyInOrder(items);
                                                    value += getItemValueInOrder(items);
                                                }));

                                                await (evaluateRule(quantity, value, rule, unQualified));
                                                break;

                                            case 'Products':
                                                // get item value and quantity in orders
                                                await (_.each(orders, function(order) {
                                                    //filter products in orders
                                                    let items = await (_.filter(order.items, function(item) {
                                                        let product = await (Core.db().productVariants.findOne({ _id: item.variantId, IsPromo: false, _groupId: tenantId }, { productId: 1 } ));
                                                        if (product)
                                                            return product.productId == parentId;
                                                    }));

                                                    quantity += getItemQtyInOrder(items);
                                                    value += getItemValueInOrder(items);
                                                }));

                                                await (evaluateRule(quantity, value, rule, unQualified));
                                                break;
                                            case 'Brands':
                                                // get item value and quantity in orders
                                                await (_.each(orders, function(order) {
                                                    //filter brands in orders
                                                    let items = await (_.filter(order.items, function(item) {
                                                        let product = await(Core.db().productVariants.findOne({ _id: item.variantId, IsPromo: false, _groupId: tenantId }, { productId: 1 } ));
                                                        if (product) {
                                                            let brand = await(Core.db().products.findOne({ _id: product.productId, _groupId: tenantId }, { brandId: 1 } ));
                                                            if (brand)
                                                                return brand.brandId == parentId;
                                                        }
                                                    }));

                                                    quantity += getItemQtyInOrder(items);
                                                    value += getItemValueInOrder(items);
                                                }));

                                                await (evaluateRule(quantity, value, rule, unQualified));
                                                break;
                                        }
                                    } else unQualified.push(rule);
                                } else {
                                    //non cummulative promotions
                                    let param = await (Core.db().promotionparameters.findOne({_id: rule.promotionParameterId, _groupId: tenantId}, { lookUpObject: 1 } ));
                                    let parent = await (eval(Core.db()[param.lookUpObject]).findOne({ _id: rule.subParamValue, _groupId: tenantId }, { _id: 1 } ));

                                    if (parent) {
                                        let parentId = parent._id,
                                            multipleVal;
                                        switch (param.lookUpObject) {
                                            case 'ProductVariants':

                                                //filter variant in orders
                                                let items = _.filter(order.items, function(item) {
                                                    return item.variantId == parentId;
                                                });

                                                quantity = getItemQtyInOrder(items);
                                                value = getItemValueInOrder(items);

                                                multipleVal = evaluateRule(quantity, value, rule, unQualified);
                                                multiple = multiple == undefined ? multipleVal : multiple > multipleVal ? multipleVal : multiple;

                                                //special case for multiple
                                                if (rule.operator == 'multiple-of' && await (!_.findWhere(order.items, { variantId: parentId }))) {
                                                    unQualified.push(rule);
                                                }
                                                break;
                                            case 'Products':
                                                _.each(order.items, function(item) {
                                                    let variantId = item.variantId;
                                                    let product = await (Core.db().productvariants.findOne({ _id: variantId, _groupId: tenantId }, { productId: 1  }));
                                                    if (product) {
                                                        let productId = product.productId;
                                                        if (parentId == productId) {
                                                            quantity += item.quantity;
                                                            value += item.quantity * item.price * (100 + item.taxRateOverride) / 100;
                                                        }
                                                    }
                                                });
                                                multipleVal = evaluateRule(quantity, value, rule, unQualified);
                                                multiple = multiple == undefined ? multipleVal : multiple > multipleVal ? multipleVal : multiple;
                                                break;

                                            case 'Brands':
                                                _.each(order.items, function(item) {
                                                    let variantId = item.variantId;
                                                    let product = await (Core.db().productvariants.findOne({ _id: variantId, _groupId: tenantId }, { productId: 1 } ));
                                                    if (product) {
                                                        let productId = product.productId;
                                                        let brand = await (Core.db().products.findOne({ _id: productId, _groupId: tenantId }, { brandId: 1 } ));
                                                        if (brand) {
                                                            let brandId = brand.brandId;
                                                            if (parentId == brandId) {
                                                                quantity += item.quantity;
                                                                value += item.quantity * item.price * (100 + item.taxRateOverride) / 100;
                                                            }
                                                        }
                                                    }
                                                });
                                                multipleVal = await(evaluateRule(quantity, value, rule, unQualified));
                                                multiple = multiple == undefined ? multipleVal : multiple > multipleVal ? multipleVal : multiple;
                                                break;
                                        }
                                    } else await (unQualified.push(rule));
                                }
                            } else {
                                if (rule.to && rule.from) {
                                    //non cummulative promotions
                                    let param = await (Core.db().promotionparameters.findOne({_id: rule.promotionParameterId, _groupId: tenantId}, { lookUpObject: 1 }));
                                    let parent = await (eval(Core.db()[param.lookUpObject]).findOne({ _id: rule.subParamValue, _groupId: tenantId }, { _id: 1 }));

                                    if (parent) {
                                        // get orders within date range
                                        let orders = await (getCummulativeOrder(rule, order.customerId, excludedOrderTypes));
                                        await (_.each(orders, function(order) {
                                            //remove promo quantities
                                            order.items = await (_.filter(order.items, function(item) {
                                                return item.variantId == parent._id && !item.IsPromo;
                                            }));
                                            quantity += await (getOrderQty(order));
                                            value += await (order.subTotal);
                                        }));
                                        await (evaluateRule(quantity, value, rule, unQualified));
                                    }
                                } else {
                                    //Calculate order quantity and value
                                    quantity = await (getOrderQty(order));
                                    value = await (order.subTotal);
                                    let multipleVal = await (evaluateRule(quantity, value, rule, unQualified));
                                    multiple = multiple == undefined ? multipleVal : multiple > multipleVal ? multipleVal : multiple;
                                }
                            }
                        }
                    }));
                    if (_.isEmpty(unQualified)) {
                        await (promotionResult.push({ id: promotion._id, multiple: multiple }));
                    } else {
                        //Advise customer on thow to qaulify to these promotion rules
                        // console.log(unQualified);
                    }
                }));
            }

            let qualifiedPromoIds = await (_.pluck(promotionResult, 'id'));
            let promos = await (Core.db().promotions.find({
                _id: { $in: qualifiedPromoIds }
            }, {
                priority: 1,
                exclusive: 1,
                currency: 1,
                rewards: 1, _groupId: tenantId
            }).toArray());
            await (_.each(promos, function (p) {
                p.rewards = await (_.map(p.rewards, function(reward, index) {
                    //get the multiple value
                    let multiple = 1,
                        currentPromo = await (_.findWhere(promotionResult, { id: p._id }));
                    if (currentPromo)
                        multiple = currentPromo.multiple;

                    reward.value = await (evaluateRewardValue(reward, order, multiple));
                    delete reward.previewSubType;
                    delete reward.previewUom;
                    delete reward.previewSubTypeValue;
                    return reward;
                }));
            }));
            return promos
        }
    },
    applyRewardsToOrder: function (promotions, order, tenantId) {
        if (promotions.length > 0) {
            order.rawOrder = JSON.stringify(order);
            order.hasPromotions = true;
            _.each(promotions, function(promotion) {
                /*
                 * @Todo
                 * resolve conflicts on promotions
                 * promotion.exclusive [false, true]
                 * promotion.priority [low, normal, high]
                 */
                //resolve currency clashes
                if (promotion.currency === order.currency.iso) {

                    await (_.each(promotion.rewards, function(reward) {
                        let discount = 0, reduction = 0;
                        switch (reward.type) {
                            case 'addOn':
                                let addOnItem = {
                                    discount: 0,
                                    quantity: reward.value,
                                    status: "open",
                                    taxRateOverride: Core.getTaxRate(tenantId),
                                    variantId: reward.subTypeValue,
                                    isPromo: true
                                };
                                order.items.push(addOnItem);
                                let priceListCodes;
                                if (order.priceListGroup) priceListCodes = order.priceListGroup.priceListCodes;
                                break;
                            case 'lineDiscount':
                                // resolve unit of measure
                                if(reward.uom == 'afa') {
                                    let itemValue = getItemValueInOrder(order, reward.subTypeValue);
                                    if(itemValue > 0) discount = Math.round((reward.value / itemValue * 100) * 100) / 100;
                                } else if(reward.uom == 'pp') {
                                    discount = reward.value;
                                }

                                await (_.each(order.items, function(item) {
                                    if (reward.subType == 'productVariant') {
                                        if (item.variantId == reward.subTypeValue) {
                                            if (item.discount) item.discount += discount;
                                            else item.discount = discount;
                                        }
                                    } else {
                                        //it is product line discount
                                        let productV = await (Core.db().productvariants.findOne({_id: item.variantId}, { productId: 1 }));
                                        if (productV) {
                                            if (productV.productId == reward.subTypeValue) {
                                                if (item.discount) item.discount += discount;
                                                else item.discount = discount;
                                            }
                                        }
                                    }
                                }));
                                break;
                            case 'orderDiscount':
                                discount = reward.value;
                                if (order.discounts)  order.discounts += discount;
                                else order.discounts = discount;
                                break;
                            case 'shippingCost':
                                break;
                            case 'priceReduction':
                                _.each(order.items, function(item) {
                                    if(reward.uom == 'afa') {
                                        reduction = reward.value;
                                    } else if(reward.uom == 'pp') {
                                        reduction = reward.value * item.price / 100;
                                    }

                                    if (reward.subType == 'productVariant') {
                                        if (item.variantId == reward.subTypeValue){
                                            if(item.price - reduction < 0) item.price = 0;
                                            else item.price -= reduction;
                                        }
                                    } else {
                                        //it is a reduction on product
                                        let productV = await (Core.db().productvariants.findOne({_id: item.variantId}, { productId: 1 }));
                                        if (productV) {
                                            if (productV.productId == reward.subTypeValue) {

                                                if(item.price - reduction < 0) item.price = 0;
                                                else item.price -= reduction;
                                            }
                                        }
                                    }
                                });
                                break;
                        }
                    }));
                }
            });
        } else {
            order.hasPromotions = false;
        }

        return order;
    },
    getTaxRate: function (tenantId) {
        let tenant = await (Core.db().tenants.findOne({_id: tenantId}));
        if (tenant) {
            let country = tenant.country;
            let tax = await (Core.db().taxes.findOne({
                "rates.country": country
            }, {
                taxLocale: 1,
                code: 1,
                description: 1,
                shortName: 1,
                _groupId: 1,
                rates: {
                    $elemMatch: {
                        country: country
                    }
                }
            }));
            if (tax) {
                let rate = tax.rates[0];
                return rate.rate;
            }
        }
    },
    getTaxes: function (doc) {
        let items = doc.items;
        let discount = doc.discounts || 0;
        let shippingCosts = doc.shippingCosts || 0;
        let taxes = 0;
        let subTotal = 0;
        let defaultTaxRate = doc.taxRate || 0;
        _.each(items, function(item) {
            let d = item.discount || 0;
            let tax = _.isUndefined(item.taxRateOverride) ? defaultTaxRate : item.taxRateOverride;
            if (!item.isPromo && item.status !== 'deleted') {
                subTotal += ((item.quantity * item.price * ((100 - d)/100)));
                taxes += ((item.quantity * item.price * ((100 - d)/100))) * (tax/100);
            }
        });
        let effectiveTaxRate = subTotal ? taxes / subTotal : 0;
        let currency = doc.currency;
        return Math.round(taxes + ((shippingCosts - discount) * effectiveTaxRate));
    },
    getSubTotal: function (doc) {
        let items = doc.items;
        let discount = doc.discounts || 0;
        let shippingCosts = doc.shippingCosts || 0;
        let subTotal = 0;
        _.each(items, function(item) {
            let d = item.discount || 0;
            if (!item.isPromo && item.status !== 'deleted') {
                subTotal += ((item.quantity * item.price * ((100 - d)/100)));
            }
        });
        return Math.round((subTotal + shippingCosts - discount));
    },
    getTotal: function (doc) {
        let subTotal = doc.subTotal || 0;
        let taxes = doc.taxes || 0;
        return subTotal + taxes;
    },
    prepareProducerOrder: function (items, companyId, tenantId, save) {
        let defaultUserId = await(Core.db().users.findOne({group: tenantId})._id);
        await(_.each(items, function (i) {
            delete  i._id;
            if (save) delete i.originItemId;
            delete i.producerId;
            if (!i.taxRateOverride){
                i.taxRateOverride = await (Core.getTaxRate(tenantId))
            }
            i.discount = 0

        }));
        let order = {};
        let customer = await(Core.db().customers.findOne({companyId: companyId, _groupId: tenantId}));

        order.customerId = customer._id;
        order.salesLocationId = customer.defaultSalesLocationId;
        order.assigneeId = customer.defaultAssigneeId;
        order.priceListCode = customer.defaultPriceListCode;

        order.items = items;
        order.taxRate = Core.getTaxRate(tenantId);
        order.userId = defaultUserId;
        return order
    }
});

function testRuleOperator(left, right, operator) {
    let test;
    left = left.toString();
    right = right.toString();
    switch (operator) {
        case 'is':
            test = left == right;
            break;
        case 'before':
            test = left < right;
            break;
        case 'after':
            test = left > right;
            break;
        case 'exactly':
            test = left == right;
            break;
        case 'less-than':
            test = parseFloat(left) < parseFloat(right);
            break;
        case 'greater-than':
            test = parseFloat(left) > parseFloat(right);
            break;
        case 'multiple-of':
            if (right > 0)
                test = Math.floor(left / right) > 0;
            break;
        case 'cummulative':
            test = left >= right;
            break;
        default:
            test = false;
    }
    return test;
}

function getMultipleFactor(left, right, operator) {
    let multiple = 1;
    switch (operator) {
        case 'multiple-of':
            if (right > 0)
                multiple = Math.floor(left / right) > 1 ? Math.floor(left / right) : multiple;
            break;
    }
    return multiple;
}

function evaluateRule(quantity, value, rule, unQualified) {
    let multiple;
    if (rule.parameterNameInParentSchema == 'quantity') {
        if (!testRuleOperator(quantity, rule.value, rule.operator))
            unQualified.push(rule);

        multiple = getMultipleFactor(quantity, rule.value, rule.operator);

    } else if (rule.parameterNameInParentSchema == 'value') {
        if (!testRuleOperator(value, rule.value, rule.operator))
            unQualified.push(rule);

        multiple = getMultipleFactor(value, rule.value, rule.operator);
    } else unQualified.push(rule);
    return multiple;
}

function getOrderQty(order) {
    let quantity = 0;
    await (_.each(order.items, function(item) {
        quantity += item.quantity;
    }));
    return quantity;
}

function evaluateRewardValue(reward, order, multiple) {
    let value = 0;
    switch (reward.uom) {
        case 'afa':
            value = reward.value;
            if (multiple && (reward.type == 'addOn' || reward.type == 'rebates'))
                value *= multiple;
            break;
        case 'tov':
            value = Math.round((reward.value * order.subTotal / 100) * 100) / 100;
            break;
        case 'pp':
            value = reward.value;
            break;
        case 'poo':
            value = Math.floor(reward.value * getOrderQty(order) / 100);
            break;
        case 'psc':
            //to be calculated when the shipping cost is captured
            break;
    }
    return value;
}

function getItemValueInOrder(items) {
    let value = 0;
    _.each(items, function(item) {
        value += item.quantity * item.price * (100 + item.taxRateOverride) / 100;
    });
    return value;
}

function getItemQtyInOrder(items) {
    let qty = 0;
    await (_.each(items, function(item) {
        qty += item.quantity;
    }));
    return qty;
}

function getCummulativeOrder(rule, customerId, excludedOrderTypes) {
    excludedOrderTypes = excludedOrderTypes || [];
    return await(Core.db().orders.find({
        status: "shipped",
        customerId: customerId,
        orderType: {
            $nin: excludedOrderTypes
        },
        issuedAt: {
            $gte: rule.from,
            $lte: rule.to
        }
    }, {
        items: 1
    }).toArray())
}


module.exports = Core;