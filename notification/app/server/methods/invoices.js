/**
 *  Notifications Methods
 */
Meteor.methods({
    "notifier/invoiceCreated": function(object){
        if (object.groupId){
            Partitioner.bindGroup(object.groupId, function () {
                let invoice =  prepareInvoice(object.objectId);
                if (invoice){
                    let recipients = prepareInvoiceRecipients(invoice);
                    _.each(recipients, function(recipient) {
                        let user = Meteor.users.findOne(recipient);
                        if (user && (!user.notifications || (user.notifications && user.notifications.invoiceCreated))){
                            invoice.receiver = user.profile.fullName;
                            Mailer.send({
                                to: user.emails[0].address,
                                subject: `New invoice ${invoice.invoiceNumber} has been created`,
                                template: 'invoiceCreated',
                                data: invoice,
                                from: process.env.MAIL_SENDER
                            });
                        }
                    })   
                }
            })
        }
    }
});

function prepareInvoice(id){
    let invoice = Invoices.findOne(id);
    if (invoice){
        invoice.stockLocation = invoice.stockLocation();
        invoice.salesLocation = invoice.salesLocation();
        return invoice   
    } else {
        Core.Log.warn(`Cannot find invoice with id ${id}`)
    }
}

function prepareInvoiceRecipients(invoice){
    let order = Orders.findOne({orderNumber: invoice.orderNumber});
    if (order){
        let users = [order.assigneeId, order.userId];
        return _.uniq(users);
    }
}
