// function to verify that all environment variables are defined and loaded
const getSetStatus = (env, systemEnv) => systemEnv[env] ? true : false;
const verifySystemEnv = () => {
  const processEnv = ['CLUSTER_DISCOVERY_URL', 'CLUSTER_SERVICE', 'CLUSTER_PUBLIC_SERVICES'];
  const serverEnv = process.env;
  const unsetEnv = [];
  _.each(processEnv, env => {
    if (!getSetStatus(env, serverEnv)) {
      unsetEnv.push(env);
    }
  });
  if (unsetEnv.length > 0) {
    throw new Meteor.Error(400, `The following environment variables are not defined: ${unsetEnv.join(', ')}. Set and restart server.`);
  }
};


/*
 * Execute start up
 */
Meteor.startup(() => {
  verifySystemEnv();
});
