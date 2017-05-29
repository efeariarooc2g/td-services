/**
 *  Notifications Methods
 */
Meteor.methods({
    "notifier/promotionsCreated": function(object){
        if (object.groupId){
            Partitioner.bindGroup(object.groupId, function () {
                let promotion = Promotions.findOne(object.objectId);
                if (promotion){
                    let recipients = preparePromotionsRecipients();
                    _.each(recipients, function(recipient) {
                        let user = Meteor.users.findOne(recipient);
                        if (user && (!user.notifications || (user.notifications && user.notifications.promotionsCreated))){
                            promotion.receiver = user.profile.fullName;
                            Mailer.send({
                                to: user.emails[0].address,
                                subject: `A promotion "${promotion.name}" has been created`,
                                template: 'promotionCreated',
                                data: promotion,
                                from: process.env.MAIL_SENDER
                            });
                        }
                    })   
                } else {
                    Core.log.warn(`Cannot find promotion with id ${object.objectId}`)
                }
            })
        }
    },

    "notifier/rebatesCreated": function(object){
        if (object.groupId){
            Partitioner.bindGroup(object.groupId, function () {
                let rebate = PromotionRebates.findOne(object.objectId);
                if (rebate){
                    let recipients = preparePromotionRebatesRecipients();
                    _.each(recipients, function(recipient) {
                        let user = Meteor.users.findOne(recipient);
                        if (user && (!user.notifications || (user.notifications && user.notifications.rebatesCreated))){
                            rebate.receiver = user.profile.fullName;
                            Mailer.send({
                                to: user.emails[0].address,
                                subject: `A new rebate has been created for ${rebate.customerName}`,
                                template: 'rebateCreated',
                                data: rebate,
                                from: process.env.MAIL_SENDER
                            });
                        }
                    })   
                } else {
                    Core.log.warn(`Cannot find rebate with id ${object.objectId}`)
                }
            })
        }
    },

    "notifier/promotionApproved": function(object){
        if (object.groupId){
            Partitioner.bindGroup(object.groupId, function () {
                let promotion = Promotions.findOne(object.objectId);
                if (promotion){
                    let recipient = Meteor.users.findOne(promotion.userId);
                    if (recipient && (!recipient.notifications || (recipient.notifications && recipient.notifications.promotionApproved))){
                            promotion.receiver = recipient.profile.fullName;
                            Mailer.send({
                                to: recipient.emails[0].address,
                                subject: `Promotion "${promotion.name}" has been approved`,
                                template: 'promotionApproved',
                                data: promotion,
                                from: process.env.MAIL_SENDER
                            });
                    }   
                } else {
                    Core.log.warn(`Cannot find promotion with id ${object.objectId}`)
                }
            })
        }
    }

});


function preparePromotionsRecipients(order) {
    let users = [];
    let selector = {};
    selector['roles.__global_roles__'] = {$in: ["promotions/approve"]};
    let approvalUsers = Meteor.users.find(selector).fetch();
    if (approvalUsers) {
        let selectedIds = _.pluck(approvalUsers, '_id');
        users.push.apply(users, selectedIds);
    }
    return _.uniq(users);
}

function preparePromotionRebatesRecipients(){
    let users = [];
    let selector = {};
    selector['roles.__global_roles__'] = {$in: ["rebates/manage"]};
    let approvalUsers = Meteor.users.find(selector).fetch();
    if (approvalUsers) {
        let selectedIds = _.pluck(approvalUsers, '_id');
        users.push.apply(users, selectedIds);
    }
    return _.uniq(users);
}