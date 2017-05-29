Mailer.config({
    from: process.env.MAIL_SENDER,
    replyTo: process.env.MAIL_SENDER,
    addRoutes: true,
    plainTextOpts: {
        ignoreImage: true
    }
});

Meteor.startup(function () {
    //process.env.MAIL_URL = 'smtp://ramzauchenna@gmail.com:okaforuchenna11@smtp.gmail.com';

    Mailer.init({
        templates: Templates,     // Global Templates namespace, see lib/templates.js.
        helpers: TemplateHelpers, // Global template helper namespace.
        layout: {
            name: 'emailLayout',
            path: 'layout.html',   // Relative to 'private' dir.
            scss: 'layout.scss'
        }
    });
});



