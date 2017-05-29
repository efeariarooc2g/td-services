/**
 *  Notifications Methods
 */
Meteor.methods({
    "notifier/paymentCreated": function(object){
        if (object.groupId){
            Partitioner.bindGroup(object.groupId, function () {
                let payment =  preparePayment(object.objectId);
                if (payment){
                    let recipients = preparePaymentRecipients(payment);
                    _.each(recipients, function(recipient) {
                        let user = Meteor.users.findOne(recipient);
                        if (user && (!user.notifications || (user.notifications && user.notifications.paymentCreated))){
                                payment.receiver = user.profile.fullName;
                                Mailer.send({
                                    to: user.emails[0].address,
                                    subject: `A new payment has been received for ${payment.order.customerName}`,
                                    template: 'paymentCreated',
                                    data: payment,
                                    from: process.env.MAIL_SENDER
                                });
                        }
                    })   
                }
            })
        }
    }
});

function preparePayment(id){
    let payment = Payments.findOne(id);
    if (payment){
        let order = Orders.findOne(payment.orderId);
        payment.order = order;
        return payment
    } else {
        Core.Log.warn(`Cannot find payment with id ${id}`)
    }
}

function preparePaymentRecipients(payment){
    let order = Orders.findOne(payment.orderId);
    if (order){
        let users = [order.assigneeId, order.userId];
        return _.uniq(users);
    }
}
