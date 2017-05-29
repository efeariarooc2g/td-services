Core = {};
Core.Schemas = {};
Core.Helpers = {};


_.extend(Core, {
    /**
     * Core.schemaIdAutoValue
     * @summary used for schemea injection autoValue
     * @example autoValue: Core.schemaIdAutoValue
     * @return {String} returns randomId
     */
    schemaIdAutoValue: function () {
        if (this.isSet && Meteor.isServer) {
            return this.value;
        } else if (Meteor.isServer || Meteor.isClient && this.isInsert) {
            return Random.id();
        }
        return this.unset();
    }
})
