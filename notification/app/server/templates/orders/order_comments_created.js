Templates.orderCommentsCreated = {
    path: 'orders/order_comments_created.html',    // Relative to the 'private' dir.
    scss: 'orders/email_style.scss',       // Mail specific SCSS.

    helpers: {
        requestPath: function(){
            return "orders/" + this._id
        }
    },

    route: {
        path: '/orders/comments/:id/:group',
        data: function(params) {
            let order;
            Partitioner.bindGroup(params.group, function () {
                o = Orders.findOne(params.id);
                o.balance = o.balance();
                o.payments = o.payments();
                o.stockLocation = o.stockLocation();
                o.salesLocation = o.salesLocation();
                o.message = o.notes[0].body;
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