


let SalesCallHistoryHelpers = {

    getSalesVisitsMadeAndNumScheduledVisits: function (userId, routePlan, startDate, endDate, timezone) {
        let salesVisitsMade = []
        let scheduledVisitsNum = 0
        //--
        let startDateMoment = moment(startDate).tz(timezone)
        let endDateMoment = moment(endDate).tz(timezone)

        // console.log(`routePlan: `, routePlan)
        let routePlanStartDate = routePlan.startDate
        // console.log(`routePlan.startDate: `, routePlan.startDate)
        let routePlanStartMoment = moment(routePlanStartDate).tz(timezone)

        let dayPlans = routePlan.plan
        if(dayPlans && dayPlans.length > 0) {
            if(routePlanStartMoment.isBefore(startDateMoment, 'day')) {
                let iteratorMoment = startDateMoment.clone()

                while(iteratorMoment.diff(endDateMoment) < 0) {
                    let day = iteratorMoment.day()
                    let aDayPlan = _.find(dayPlans, aDayPlan => {
                        return aDayPlan.day === day
                    })
                    if(aDayPlan) {
                        if(aDayPlan && aDayPlan.outlets && aDayPlan.outlets.length > 0) {
                            let dayStart = iteratorMoment.startOf('day').toDate()
                            let dayEnd = iteratorMoment.endOf('day').toDate()

                            let salesVisitsOnDay = SalesVisits.find({
                                checkedInAt: {$gte: dayStart, $lt: dayEnd},
                                retailOutletId: {$in: aDayPlan.outlets},
                                userId: userId
                            }).fetch()
                            salesVisitsMade.push(...salesVisitsOnDay)

                            scheduledVisitsNum += aDayPlan.outlets.length
                        }
                    }
                    iteratorMoment.add(1, 'days')
                }
            } else if(endDateMoment.isAfter(startDateMoment, 'day')) {
                let iteratorMoment = routePlanStartMoment.clone()

                while(iteratorMoment.diff(endDateMoment) < 0) {
                    let day = iteratorMoment.day()
                    let aDayPlan = _.find(dayPlans, aDayPlan => {
                        return aDayPlan.day === day
                    })
                    if(aDayPlan) {
                        if(aDayPlan && aDayPlan.outlets && aDayPlan.outlets.length > 0) {
                            let dayStart = iteratorMoment.startOf('day').toDate()
                            let dayEnd = iteratorMoment.endOf('day').toDate()

                            let salesVisitsOnDay = SalesVisits.find({
                                checkedInAt: {$gte: dayStart, $lt: dayEnd},
                                retailOutletId: {$in: aDayPlan.outlets},
                                userId: userId
                            }).fetch()
                            salesVisitsMade.push(...salesVisitsOnDay)

                            scheduledVisitsNum += aDayPlan.outlets.length
                        }
                    }
                    iteratorMoment.add(1, 'days')
                }
            } 
        }
        return {salesVisitsMade, scheduledVisitsNum}
    },
    getNumOfSalesVisitsWithTasksMade: function(salesVisits) {
        let numVisitsWithOrdersMade = 0
        let numVisitsWithAuditsMade = 0
        let numVisitsWithPresentationsMade = 0

        _.each(salesVisits, aSalesVisit => {
            let salesVisitTasks = aSalesVisit.tasks

            if(salesVisitTasks) {
                _.each(salesVisitTasks, aTask => {
                    if(aTask.taskType === 'order-create') {
                        numVisitsWithOrdersMade += 1
                    } else if(aTask.taskType === 'instore-audit') {
                        numVisitsWithAuditsMade += 1
                    } else if(aTask.taskType === 'presentation') {
                        numVisitsWithPresentationsMade += 1
                    }
                })
            }
        })

        return {numVisitsWithOrdersMade, numVisitsWithAuditsMade, numVisitsWithPresentationsMade}
    },
    getSalesQuantityMadeInSalesVisits: function(salesPersonUserId, salesVisitsMade) {      
        let  salesVisitIds = salesVisitsMade.map(aSalesVisit => {
            return aSalesVisit._id
        })

        let salesPersonSales = Orders.aggregate([
            { $match: {assigneeId: salesPersonUserId, refSalesVisitId: {$in: salesVisitIds}} },
            { $group: {_id: "$assigneeId", totalSales: { $sum: "$total" }, items: {$push: "$items"}} },
            {$unwind: "$items"}, 
            {$unwind: "$items"},
            { $group: { 
                '_id': '$_id', 
                'totalAmountSold': { $first: '$totalSales' }, 
                'totalQuantitySold': { $sum: '$items.quantity' }
            }}
        ]);
        // console.log(`salesPersonSales: `, salesPersonSales)

        let actualAmountSold = salesPersonSales[0] ? salesPersonSales[0].totalAmountSold : 0
        let actualQuanitySold = salesPersonSales[0] ? salesPersonSales[0].totalQuantitySold : 0

        return {actualAmountSold, actualQuanitySold}
    },
    getOpportunitiesMadeInSalesVisits: function(salesPersonUserId, salesVisitsMade) {      
        let  salesVisitIds = salesVisitsMade.map(aSalesVisit => {
            return aSalesVisit._id
        })

        let opportunitiesTotal = Opportunities.find({
            userId: salesPersonUserId, 
            refSalesVisitId: {$in: salesVisitIds}
        }).count()

        return opportunitiesTotal
    }
}

Meteor.methods({
    'report/getSalesCallHistoryReports': function(userId, tenantId, timezone, searchFilters){
        if (!userId) {
            throw new Meteor.Error(401, "Unauthorized");
        }
        this.unblock();

        let startDate = searchFilters.startDate
        let endDate = searchFilters.endDate

        let start = moment(startDate).tz(timezone).toDate()
        let end = moment(endDate).tz(timezone).toDate()

        let salesRepUserIds = searchFilters.salesRepUserIds
        if(!salesRepUserIds || salesRepUserIds.length === 0) {
            let salesPersons = Users.find({
                "salesProfile.position": {$exists: true},
                group: tenantId
            }).fetch()
            salesRepUserIds = salesPersons.map(aSalesPerson => {
                return aSalesPerson._id
            })
        }

        let response = []

        _.each(salesRepUserIds, (aSalesPersonId) => {
            let aSalesPerson = Users.findOne({_id: aSalesPersonId, group: tenantId})

            let salesRepRoutePlan = RoutePlans.findOne({
                salesPositionId: aSalesPerson.salesProfile.position,
                _groupId: tenantId
            })

            if(salesRepRoutePlan) {
                let {salesVisitsMade, scheduledVisitsNum} = 
                    SalesCallHistoryHelpers.getSalesVisitsMadeAndNumScheduledVisits(aSalesPersonId, salesRepRoutePlan, startDate, endDate, timezone)
                console.log(`salesVisitsMade: `, salesVisitsMade)
                console.log(`scheduledVisitsNum: `, scheduledVisitsNum)
                let numSalesVisitsMade = salesVisitsMade.length

                let strikeRate = 0 
                if(scheduledVisitsNum > 0) {
                    strikeRate = ((numSalesVisitsMade / scheduledVisitsNum) * 100).toFixed(2)
                } else {
                    strikeRate = '---'
                }

                let numVisitsWithTasks = SalesCallHistoryHelpers.getNumOfSalesVisitsWithTasksMade(salesVisitsMade)
                // console.log(`numVisitsWithTasks: `, numVisitsWithTasks)
                let productiveCalls = numVisitsWithTasks.numVisitsWithOrdersMade

                let productivity = 0 
                if(scheduledVisitsNum > 0) {
                    productivity = ((productiveCalls / scheduledVisitsNum) * 100).toFixed(2)
                } else {
                    productivity = '---'
                }

                let salesMade = SalesCallHistoryHelpers.getSalesQuantityMadeInSalesVisits(aSalesPerson._id, salesVisitsMade)
                let actualAmountSold = salesMade.actualAmountSold
                let actualQuanitySold = salesMade.actualQuanitySold

                let dropSize = 0
                if(productiveCalls > 0) {
                    dropSize = (actualQuanitySold / productiveCalls).toFixed(2)
                }

                let opportunities = SalesCallHistoryHelpers.getOpportunitiesMadeInSalesVisits(aSalesPerson._id, salesVisitsMade)

                response.push({
                    userId: aSalesPerson._id,
                    salesPerosnFullName: aSalesPerson.profile.fullName,
                    scheduledCalls: scheduledVisitsNum,
                    callsMade: numSalesVisitsMade,
                    strikeRate: strikeRate,

                    productiveCalls: productiveCalls,
                    productivity: productivity,

                    totalDropSize: dropSize,
                    salesValue: actualAmountSold,

                    outletAudit: numVisitsWithTasks.numVisitsWithAuditsMade,
                    presentations: numVisitsWithTasks.numVisitsWithPresentationsMade,
                    opportunities: opportunities
                })
            }
        })
        return response
    }
})