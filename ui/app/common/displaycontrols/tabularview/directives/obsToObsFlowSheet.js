'use strict';

angular.module('bahmni.common.displaycontrol.obsVsObsFlowSheet').directive('obsToObsFlowSheet', ['$translate', 'spinner', 'observationsService', 'conceptSetService', '$q', 'conceptSetUiConfigService',
    function ($translate, spinner, observationsService, conceptSetService, $q, conceptSetUiConfigService) {
        var link = function ($scope, element) {
            $scope.config = $scope.isOnDashboard ? $scope.section.dashboardConfig : $scope.section.expandedViewConfig;
            $scope.isEditable = $scope.config.isEditable;
            var patient = $scope.patient;

            var getTemplateDisplayName = function () {
                return conceptSetService.getConcept({
                    name: $scope.config.templateName,
                    v: "custom:(uuid,names,displayString)"
                }).then(function (result) {
                    var templateConcept = result && result.data && result.data.results && result.data.results[0];
                    var displayName = templateConcept && templateConcept.displayString;
                    if (templateConcept && templateConcept.names && templateConcept.names.length === 1 && templateConcept.names[0].name != "") {
                        displayName = templateConcept.names[0].name;
                    }
                    else if (templateConcept && templateConcept.names && templateConcept.names.length === 2) {
                        displayName = _.find(templateConcept.names, {conceptNameType: "SHORT"}).name;
                    }
                    $scope.conceptDisplayName = displayName;
                })
            };

            var getObsInFlowSheet = function () {
                return observationsService.getObsInFlowSheet(patient.uuid, $scope.config.templateName,
                    $scope.config.groupByConcept, $scope.config.orderByConcept, $scope.config.conceptNames, $scope.config.numberOfVisits,
                    $scope.config.initialCount, $scope.config.latestCount, $scope.config.type, $scope.section.startDate,
                    $scope.section.endDate, $scope.enrollment).success(function (data) {
                    var obsInFlowSheet = data;
                    var groupByElement = _.find(obsInFlowSheet.headers, function (header) {
                        return header.name === $scope.config.groupByConcept;
                    });
                    obsInFlowSheet.headers = _.without(obsInFlowSheet.headers, groupByElement);
                    obsInFlowSheet.headers.unshift(groupByElement);
                    $scope.obsTable = obsInFlowSheet;
                })
            };

            var init = function () {
                return $q.all([getObsInFlowSheet(), getTemplateDisplayName()]).then(function () {
                });
            };

            $scope.isClickable = function () {
                return $scope.isOnDashboard && $scope.section.expandedViewConfig;
            };

            $scope.dialogData = {
                "patient": $scope.patient,
                "section": $scope.section
            };

            $scope.getEditObsData = function (observation) {
                return {
                    observation: {encounterUuid: observation.encounterUuid, uuid: observation.obsGroupUuid},
                    conceptSetName: $scope.config.templateName,
                    conceptDisplayName: $scope.conceptDisplayName
                }
            };

            $scope.getPivotOn = function () {
                return $scope.config.pivotOn;
            };

            $scope.getHeaderName = function (header) {
                var abbreviation = getSourceCode(header, $scope.section.headingConceptSource);
                var headerName = abbreviation || header.shortName || header.name;
                if (header.units) {
                    headerName = headerName +  " (" + header.units + ")";
                }
                return headerName;
            };

            var getSourceCode = function (concept, conceptSource) {
                var result;
                if (concept && concept.mappings && concept.mappings.length > 0) {
                    result = _.result(_.find(concept.mappings, {"source": conceptSource}), "code");
                    result = $translate.instant(result);
                }

                return result;
            };

            var getName = function (obs) {
                return getSourceCode(obs.value, $scope.section.dataConceptSource) || (obs && obs.value && obs.value.shortName) || (obs && obs.value && obs.value.name) || obs.value;
            };

            $scope.commafy = function (observations) {
                var list = [];
                var unBoolean = function (boolValue) {
                    return boolValue ? $translate.instant("OBS_BOOLEAN_YES_KEY") : $translate.instant("OBS_BOOLEAN_NO_KEY");
                };

                for (var index in observations) {
                    var name = getName(observations[index]);

                    if (observations[index].concept.dataType === "Boolean") {
                        name = unBoolean(name);
                    }

                    if (observations[index].concept.dataType === "Date") {
                        var conceptName = observations[index].concept.name;
                        if (conceptName && conceptSetUiConfigService.getConfig()[conceptName] && conceptSetUiConfigService.getConfig()[conceptName].displayMonthAndYear == true) {
                            name = Bahmni.Common.Util.DateUtil.getDateInMonthsAndYears(name);
                        }
                        else {
                            name = Bahmni.Common.Util.DateUtil.formatDateWithoutTime(name);
                        }

                    }

                    list.push(name);
                }

                return list.join(', ');
            };

            $scope.isMonthAvailable = function () {
                return $scope.obsTable.rows[0].columns['Month'] != null
            };

            spinner.forPromise(init(), element);
        };
        return {
            restrict: 'E',
            link: link,
            scope: {
                patient: "=",
                section: "=",
                visitSummary: "=",
                isOnDashboard: "=",
                enrollment: "=",
                startDate: "=",
                endDate: "="
            },
            templateUrl: "../common/displaycontrols/tabularview/views/obsToObsFlowSheet.html"
        };
    }]);
