'use strict';

angular.module('bahmni.common.domain')
    .service('observationsService', ['$http', function ($http) {

        this.fetch = function (patientUuid, conceptNames, scope, numberOfVisits, visitUuid, obsIgnoreList, filterObsWithOrders, patientProgramUuid) {
            var params = {concept: conceptNames};
            if (obsIgnoreList) {
                params.obsIgnoreList = obsIgnoreList
            }
            if (filterObsWithOrders != null) {
                params.filterObsWithOrders = filterObsWithOrders;
            }

            if (visitUuid) {
                params.visitUuid = visitUuid;
                params.scope = scope;
            } else {
                params.patientUuid = patientUuid;
                params.numberOfVisits = numberOfVisits;
                params.scope = scope;
                params.patientProgramUuid = patientProgramUuid;
            }
            return $http.get(Bahmni.Common.Constants.observationsUrl, {
                params: params,
                withCredentials: true
            });
        };

        this.getByUuid = function(observationUuid){
            return $http.get(Bahmni.Common.Constants.observationsUrl, {
                params: {observationUuid: observationUuid},
                withCredentials: true
            });
        };

        this.fetchForEncounter = function (encounterUuid, conceptNames) {
            return $http.get(Bahmni.Common.Constants.observationsUrl, {
                params: {encounterUuid: encounterUuid, concept: conceptNames},
                withCredentials: true
            });
        };

        this.fetchForPatientProgram = function(patientProgramUuid, conceptNames, scope) {
            return $http.get(Bahmni.Common.Constants.observationsUrl, {
                params: {patientProgramUuid: patientProgramUuid, concept: conceptNames, scope: scope},
                withCredentials: true
            });
        };

        this.getObsRelationship = function (targetObsUuid) {
            return $http.get(Bahmni.Common.Constants.obsRelationshipUrl, {
                params: {
                    targetObsUuid: targetObsUuid
                },
                withCredentials: true
            });
        };

        this.getObsInFlowSheet = function (patientUuid, conceptSet, groupByConcept, orderByConcept, conceptNames,
                                           numberOfVisits, initialCount, latestCount, groovyExtension,
                                           startDate, endDate, patientProgramUuid) {
            var params = {
                patientUuid: patientUuid,
                conceptSet: conceptSet,
                groupByConcept: groupByConcept,
                orderByConcept: orderByConcept,
                conceptNames: conceptNames,
                numberOfVisits: numberOfVisits,
                initialCount: initialCount,
                latestCount: latestCount,
                name: groovyExtension,
                startDate: Bahmni.Common.Util.DateUtil.parseLongDateToServerFormat(startDate),
                endDate: Bahmni.Common.Util.DateUtil.parseLongDateToServerFormat(endDate),
                enrollment: patientProgramUuid
            };
            return $http.get(Bahmni.Common.Constants.observationsUrl + "/flowSheet", {
                params: params,
                withCredentials: true
            });
        }

    }]);
