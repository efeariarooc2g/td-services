Templates.rebateCreated = {
    path: 'promotions/rebate_created_email.html',    // Relative to the 'private' dir.
    scss: 'orders/email_style.scss',       // Mail specific SCSS.

    helpers: {
        requestPath: function(){
            return "promotions/" + this._id
        }
    },

    route: {
        path: '/rebates/created/:id/:group',
        data: function(params) {
            let rebate;
            Partitioner.bindGroup(params.group, function () {
                rebate = PromotionRebates.findOne(params.id)
            });
            return rebate
        }
    }
};