Templates.paymentCreated = {
    path: 'payments/payment_created_email.html',    // Relative to the 'private' dir.
    scss: 'orders/email_style.scss',       // Mail specific SCSS.

    helpers: {
        itemTotal: function() {
            let discount = this.discount || 0;
            return (this.quantity * this.price) * ((100 - discount)/100);
        },
        requestPath: function(){
            return "orders/" + this.order._id
        }
    },

    route: {
        path: '/payment/created/:id/:group',
        data: function(params) {
            let payment;
            Partitioner.bindGroup(params.group, function () {
                o = Payments.findOne(params.id);
                o.order = Orders.findOne(o.orderId);
                let user = Meteor.users.findOne();
                if (user){
                    o.receiver = user.profile.fullName
                }
                payment = o
            });
            return payment
        }
    }
};