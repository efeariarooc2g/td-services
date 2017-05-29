/**
 *  Notifications Methods
 */
Meteor.methods({
    "notifier/returnOrderCreated": function(object){
        if (object.groupId){
            Partitioner.bindGroup(object.groupId, function () {
                let order =  prepareReturnOrder(object.objectId);
                if (order){
                    let recipients = prepareReturnRecipients(order);
                    _.each(recipients, function(recipient) {
                        let user = Meteor.users.findOne(recipient);
                        if (user && (!user.notifications || (user.notifications && user.notifications.returnOrderCreated))){
                            order.receiver = user.profile.fullName;
                            Mailer.send({
                                to: user.emails[0].address,
                                subject: `Return Order ${order.returnOrderNumber} has been created`,
                                template: 'returnOrderCreated',
                                data: order,
                                from: process.env.MAIL_SENDER
                            });
                        }
                    })
                }
            })
        }
    },


    "notifier/returnOrderApprovals": function(object){
        if (object.groupId){
            Partitioner.bindGroup(object.groupId, function () {
                let order =  prepareReturnOrder(object.objectId);
                if (order){
                    let recipients = prepareReturnRecipients(order);
                    _.each(recipients, function(recipient) {
                        let user = Meteor.users.findOne(recipient);
                        if (user && (!user.notifications || (user.notifications && user.notifications.returnOrderApprovals))){
                            order.receiver = user.profile.fullName;
                            Mailer.send({
                                to: user.emails[0].address,
                                subject: `ReturnOrder ${order.returnOrderNumber} has been ${order.status}`,
                                template: 'returnOrderApprovals',
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

function prepareReturnOrder(id){
    let order = ReturnOrders.findOne(id);
    if (order){
        order.stockLocation = order.stockLocation();
        order.salesLocation = order.salesLocation();
        
        let assignTo = Meteor.users.findOne(order.assigneeId);
        if (assignTo) order.assignTo = assignTo.profile.fullName;

        let createdBy = Meteor.users.findOne(order.userId);
        if (createdBy) order.userFullName = createdBy.profile.fullName;

        return order
    } else {
        Core.Log.warn(`Cannot find return order with id ${id}`)
    }
}

function prepareReturnRecipients(order){
    let users = [order.assigneeId, order.userId];
    let selector = {};
    selector['roles.' + order.salesLocationId] = {$in: ["returnorders/approve"]};
    let approvalUsers = Meteor.users.find(selector).fetch();
    if (approvalUsers){
        let selectedIds = _.pluck(approvalUsers, '_id');
        users.push.apply(users, selectedIds);
    }
    return _.uniq(users);
}
