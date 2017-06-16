
/**
* TD Core Collections
* Maintain collections available from the main service
*
*/


Users = new Mongo.Collection("users")

Orders = new Mongo.Collection("orders")

OrderTypes = new Mongo.Collection("ordertypes");

Tenants = new Mongo.Collection("tenants");

RoutePlans = new Mongo.Collection("routeplans");

VisitTasks = new Mongo.Collection("visittasks");

SalesVisits = new Mongo.Collection("salesvisits");

Presentations = new Mongo.Collection("presentations");

PresentationTypes = new Mongo.Collection("presentationtypes");

Opportunities = new Mongo.Collection("opportunities");
