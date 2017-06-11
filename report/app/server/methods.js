/*****************************************************************************/
/*  Server Methods */
/*****************************************************************************/

Meteor.methods({
  'report/authenticate'(loginToken) {
    const userId = SearchService.MainConnection.call('ddpAuth/getUserByToken', loginToken);
    this.setUserId(userId);
    return userId;
  },
  'server/method_name': function () {
    // server method logic
  }
});

