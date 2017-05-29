Templates.invoiceCreated = {
    path: 'invoices/invoice_created_email.html',    // Relative to the 'private' dir.
    scss: 'orders/email_style.scss',       // Mail specific SCSS.

    helpers: {
        itemTotal: function() {
            let discount = this.discount || 0;
            return (this.quantity * this.price) * ((100 - discount)/100);
        },
        requestPath: function(){
            return "invoices/" + this._id
        }
    },

    route: {
        path: '/invoice/created/:id/:group',
        data: function(params) {
            let invoice;
            Partitioner.bindGroup(params.group, function () {
                o = Invoices.findOne(params.id);
                o.stockLocation = o.stockLocation();
                o.salesLocation = o.salesLocation();
                let user = Meteor.users.findOne();
                if (user){
                    o.receiver = user.profile.fullName
                }
                invoice = o
            });
            return invoice
        }
    }
};