Templates.promotionApproved = {
    path: 'promotions/promotion_approved_email.html',    // Relative to the 'private' dir.
    scss: 'orders/email_style.scss',       // Mail specific SCSS.

    helpers: {
        requestPath: function(){
            return "promotions/" + this._id
        }
    },

    route: {
        path: '/promotion/approved/:id/:group',
        data: function(params) {
            let promotion;
            Partitioner.bindGroup(params.group, function () {
                promotion = Promotions.findOne(params.id)
            });
            return promotion
        }
    }
};