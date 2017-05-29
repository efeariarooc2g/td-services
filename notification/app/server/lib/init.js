this.Templates = {};

_.extend(Core, {
    /**
     * Core.eventMap
     * @summary map events to the responsible Meteor call
     */
    eventMap: {
        'order.created': 'notifier/orderCreated',
        'order.updated': 'notifier/orderUpdated', 
        'order.approvals': 'notifier/orderApprovals',
        'order.status.updated': 'notifier/orderStatusChanged',
        'order.comments.created': 'notifier/orderCommentsCreated',
        'order.shipped': 'notifier/orderShipped',
        'returnorder.created': 'notifier/returnOrderCreated',
        'returnorder.approvals': 'notifier/returnOrderApprovals',
        'invoice.created': 'notifier/invoiceCreated',
        'promotion.created': 'notifier/promotionsCreated',
        'rebate.created': 'notifier/rebatesCreated', 
        'promotion.approved': 'notifier/promotionApproved', 
        'payment.created': 'notifier/paymentCreated'
    }
})