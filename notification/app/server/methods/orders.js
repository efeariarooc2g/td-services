/**
 *  Notifications Methods
 */
Meteor.methods({
    "notifier/orderCreated": function(object){
        if (object.groupId){
            Partitioner.bindGroup(object.groupId, function () {
                let order =  prepareOrder(object.objectId);
                if (order){
                    let withApprovers = !order.isApproved;
                    let recipients = prepareRecipients(order, withApprovers);
                    _.each(recipients, function(recipient) {
                        let user = Meteor.users.findOne(recipient);
                        if (user && (!user.notifications || (user.notifications && user.notifications.orderCreated))){
                            if (order) {
                                order.receiver = user.profile.fullName;
                                Mailer.send({
                                    to: user.emails[0].address,
                                    subject: `Order ${order.orderNumber} has been created`,
                                    template: 'orderCreated',
                                    data: order,
                                    from: process.env.MAIL_SENDER
                                });
                            }
                        }
                    })
                }
            })
        }
    },

    // Send order updated email
    "notifier/orderUpdated": function (object){
        if (object.groupId){
            Partitioner.bindGroup(object.groupId, function () {
                let order =  prepareOrder(object.objectId);
                if (order){
                    let withApprovers = !order.isApproved; // only include approvers if order is not approved
                    let recipients = prepareRecipients(order, withApprovers);
                    _.each(recipients, function(recipient) {
                        let user = Meteor.users.findOne(recipient);
                        if (user && (!user.notifications || (user.notifications && user.notifications.orderUpdated))){
                            if (order) {
                                order.receiver = user.profile.fullName;
                                Mailer.send({
                                    to: user.emails[0].address,
                                    subject: `Order ${order.orderNumber} has been updated`,
                                    template: 'orderUpdated',
                                    data: order,
                                    from: process.env.MAIL_SENDER
                                });
                            }
                        }
                    })
                }
            })
        }
    },

    "notifier/orderApprovals": function(object){
        if (object.groupId){
            Partitioner.bindGroup(object.groupId, function () {
                let order =  prepareOrder(object.objectId);
                if (order){
                    let approvedBy = Meteor.users.findOne(object.userId);
                    if (approvedBy) order.approverFullName = approvedBy.profile.fullName;


                    let recipients = prepareRecipients(order, true);
                    _.each(recipients, function(recipient) {
                        let user = Meteor.users.findOne(recipient);
                        if (user && (!user.notifications || (user.notifications && user.notifications.orderApprovals))){
                            order.receiver = user.profile.fullName;
                            if (order) {
                                Mailer.send({
                                    to: user.emails[0].address,
                                    subject: `Order ${order.orderNumber} has been ${order.approvalStatus}`,
                                    template: 'orderApprovals',
                                    data: order,
                                    from: process.env.MAIL_SENDER
                                });
                            }
                        }
                    })
                }
            })
        }
    },

    "notifier/orderStatusChanged": function(object){
        if (object.groupId){
            Partitioner.bindGroup(object.groupId, function () {
                let order =  prepareOrder(object.objectId);
                if (order){
                    let recipients = prepareRecipients(order);
                    _.each(recipients, function(recipient) {
                        let user = Meteor.users.findOne(recipient);
                        if (user && (!user.notifications || (user.notifications && user.notifications.orderStatusChanged))){
                            order.receiver = user.profile.fullName;
                            Mailer.send({
                                to: user.emails[0].address,
                                subject: `Order ${order.orderNumber} is ${order.status}`,
                                template: 'orderStatusChanged',
                                data: order,
                                from: process.env.MAIL_SENDER
                            });
                        }
                    })
                }
            })
        }
    },

    "notifier/orderCommentsCreated": function(object){
        if (object.groupId){
            Partitioner.bindGroup(object.groupId, function () {
                if (object.message){
                    let order =  prepareOrder(object.objectId);
                    if (order){
                        order.message = object.message;

                        let messageCreatedBy = Meteor.users.findOne(object.userId);
                        if (messageCreatedBy) order.messageCreatedBy = messageCreatedBy.profile.fullName;

                        let recipients = prepareRecipients(order);
                        _.each(recipients, function(recipient) {
                            let user = Meteor.users.findOne(recipient);
                            if (user && (!user.notifications || (user.notifications && user.notifications.orderCommentsCreated))){
                                order.receiver = user.profile.fullName;
                                Mailer.send({
                                    to: user.emails[0].address,
                                    subject: `Order ${order.orderNumber} has a new comment`,
                                    template: 'orderCommentsCreated',
                                    data: order,
                                    from: process.env.MAIL_SENDER
                                });
                            }
                        })
                    }
                }
            })
        }
    },

    "notifier/orderShipped": function(object){
        if (object.groupId){
            Partitioner.bindGroup(object.groupId, function () {
                let order =  prepareOrder(object.objectId);
                if (order) {
                    let recipients = prepareRecipients(order);
                    _.each(recipients, function(recipient) {
                        let user = Meteor.users.findOne(recipient);
                        if (user && (!user.notifications || (user.notifications && user.notifications.orderShipped))){
                            order.receiver = user.profile.fullName;
                            Mailer.send({
                                to: user.emails[0].address,
                                subject: `Order ${order.orderNumber} has been shipped`,
                                template: 'orderShipped',
                                data: order,
                                from: process.env.MAIL_SENDER
                            });
                        }
                    })
                }
            })
        }
    }
});


function prepareOrder(id){
    let order = Orders.findOne(id);
    if (order){
        order.balance = order.balance();
        order.payments = order.payments();
        order.stockLocation = order.stockLocation();
        order.salesLocation = order.salesLocation();

        let orderType = OrderTypes.findOne({ code: order.orderType});
        if (orderType) order.orderTypeName = orderType.name;

        let assignTo = Meteor.users.findOne(order.assigneeId);
        if (assignTo) order.assignTo = assignTo.profile.fullName;

        let createdBy = Meteor.users.findOne(order.userId);
        if (createdBy) order.userFullName = createdBy.profile.fullName;

        return order
    } else {
        Core.Log.warn("Order not found " + id)
    }
}

function prepareRecipients(order, withApprovers){
    let users = [order.assigneeId, order.userId];
    if (withApprovers) {
        let selector = {};
        selector['roles.' + order.salesLocationId] = {$in: ["orders/approve"]};
        selector['roles.' + String(order.orderType)] = {$in: ["ordertypes/approve"]};
        let approvalUsers = Meteor.users.find(selector).fetch();
        if (approvalUsers){
            let selectedIds = _.pluck(approvalUsers, '_id');
            users.push.apply(users, selectedIds);
        }
    }
    return _.uniq(users);
}