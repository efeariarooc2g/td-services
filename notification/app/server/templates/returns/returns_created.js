Templates.returnOrderCreated = {
    path: 'returns/return_order_created_email.html',    // Relative to the 'private' dir.
    scss: 'orders/email_style.scss',       // Mail specific SCSS.

    helpers: {
        itemTotal: function() {
            let discount = this.discount || 0;
            return (this.quantity * this.price) * ((100 - discount)/100);
        },
        requestPath: function(){
            return "returns/" + this._id
        },
        orderRequestPath: function(){
            return "orders/" + this.orderId
        }
    },

    route: {
        path: '/returns/created/:id/:group',
        data: function(params) {
            let order;
            Partitioner.bindGroup(params.group, function () {
                o = ReturnOrders.findOne(params.id);
                o.stockLocation = o.stockLocation();
                o.salesLocation = o.salesLocation();
                let assignTo = Meteor.users.findOne(o.assigneeId);
                if (assignTo){
                    o.assignTo = assignTo.profile.fullName
                }
                let user = Meteor.users.findOne();
                if (user){
                    o.receiver = user.profile.fullName
                }
                order = o
            });
            return order
        }
    }
};