


let SalesCallHistoryHelpers = {
    getRoutePlansInPeriod: function(aSalesPerson, tenantId, startDate, endDate) {
        let periodStartMoment = moment(startDate)
        let periodEndMoment = moment(endDate)

        let routePlans = []

        if(aSalesPerson.salesProfile && aSalesPerson.salesProfile.history 
            && aSalesPerson.salesProfile.history.position) {
            let positionsHistory = aSalesPerson.salesProfile.history.position

            _.each(positionsHistory, aPositionHistory => {
                let positionId = aPositionHistory.position

                let positionStartMoment = moment(aPositionHistory.startDate)
                let positionEndMoment = moment(aPositionHistory.endDate)

                if(positionStartMoment >= periodStartMoment) {
                    if(positionEndMoment <= periodEndMoment) {
                        let routePlansInPeriod = RoutePlans.find({
                            startDate: {
                                $gte: aPositionHistory.startDate, 
                                $lte: aPositionHistory.endDate
                            },
                            salesPositionId: positionId,
                            _groupId: tenantId
                        }).fetch()
                        routePlans.push(...routePlansInPeriod)                        
                    } else {
                        let routePlansInPeriod = RoutePlans.find({
                            startDate: {
                                $gte: aPositionHistory.startDate, 
                                $lte: endDate
                            },
                            salesPositionId: positionId,
                            _groupId: tenantId
                        }).fetch()
                        routePlans.push(...routePlansInPeriod)
                    }
                } else if(positionEndMoment >= periodStartMoment) {
                    let routePlansInPeriod = RoutePlans.find({
                        startDate: {
                            $gte: startDate, 
                            $lte: aPositionHistory.endDate
                        },
                        salesPositionId: positionId,
                        _groupId: tenantId
                    }).fetch()
                    routePlans.push(...routePlansInPeriod)
                    return false
                }
            })
        } else {
            if(periodEndMoment > moment(aSalesPerson.createdAt)) {
                let routePlansInPeriod = RoutePlans.find({
                    startDate: {
                        $gte: startDate, 
                        $lte: endDate
                    },
                    salesPositionId: aSalesPerson.salesProfile.position,
                    _groupId: tenantId
                }).fetch()
                routePlans.push(...routePlansInPeriod)
            }
        }
        return routePlans
    },
    getNumberOfScheduledVisitsInRoutePlans: function (routePlans) {
        let scheduledVisitsNum = 0

        routePlans.forEach(aRoutePlan => {
            let dayPlans = aRoutePlan.plan
            if(dayPlans && dayPlans.length > 0) {
                dayPlans.forEach(aDayPlan => {
                    if(aDayPlan && aDayPlan.outlets && aDayPlan.outlets.length > 0) {
                        scheduledVisitsNum += aDayPlan.outlets.length
                    }
                })
            }
        })

        return scheduledVisitsNum
    },
    getSaleVisitsMadeOnRoutePlans: function(routePlans, userId) {
        let salesVisits = []

        _.each(routePlans, aRoutePlan => {
            let routePlanStartDate = aRoutePlan.startDate

            let dayPlans = aRoutePlan.plan
            if(dayPlans && dayPlans.length > 0) {
                dayPlans.forEach(aDayPlan => {
                    let dayIndex = aDayPlan.day
                    let dayStart = moment(routePlanStartDate).add(dayIndex, 'day').startOf('day').toDate()
                    let dayEnd = moment(routePlanStartDate).add(dayIndex, 'day').endOf('day').toDate()
                    // console.log(`\nroutePlanStartDate: `, routePlanStartDate)
                    // console.log(`routePlan.daysInWeek: `, aRoutePlan.daysInWeek)

                    // console.log(`dayStart: `, dayStart)
                    // console.log(`dayEnd: `, dayEnd)
                    // console.log(`aDayPlan.outlets: `, JSON.stringify(aDayPlan.outlets))

                    if(aDayPlan && aDayPlan.outlets && aDayPlan.outlets.length > 0) {
                        let salesVisitsOnDay = SalesVisits.find({
                            checkedInAt: {$gte: dayStart, $lt: dayEnd},
                            retailOutletId: {$in: aDayPlan.outlets},
                            userId: userId
                        }).fetch()
                        salesVisits.push(...salesVisitsOnDay)
                    }
                })
            }
        })
        return salesVisits
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
            let aSalesPerson = Users.findOne({_id: aSalesPersonId})

            let scheduledRoutePlans = SalesCallHistoryHelpers.getRoutePlansInPeriod(aSalesPerson, tenantId, start, end)
            // console.log(`\nroutePlans: `, scheduledRoutePlans)
            
            let numScheduledSalesVisits = SalesCallHistoryHelpers.getNumberOfScheduledVisitsInRoutePlans(scheduledRoutePlans)
            // console.log(`numScheduledSalesVisits: `, numScheduledSalesVisits)

            let salesVisitsMade = SalesCallHistoryHelpers.getSaleVisitsMadeOnRoutePlans(scheduledRoutePlans, aSalesPersonId)
            let numSalesVisitsMade = salesVisitsMade.length

            let strikeRate = 0 
            if(numScheduledSalesVisits > 0) {
                strikeRate = ((numSalesVisitsMade / numScheduledSalesVisits) * 100).toFixed(2)
            } else {
                strikeRate = '---'
            }

            let numVisitsWithTasks = SalesCallHistoryHelpers.getNumOfSalesVisitsWithTasksMade(salesVisitsMade)
            // console.log(`numVisitsWithTasks: `, numVisitsWithTasks)
            let productiveCalls = numVisitsWithTasks.numVisitsWithOrdersMade

            let productivity = 0 
            if(numScheduledSalesVisits > 0) {
                productivity = ((productiveCalls / numScheduledSalesVisits) * 100).toFixed(2)
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
                scheduledCalls: numScheduledSalesVisits,
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
        })

        return response
    }
})