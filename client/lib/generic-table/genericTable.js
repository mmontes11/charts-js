(function(window, angular, undefined) {

'use strict';

var MAX_SIZE = 5;
var COL_IDENTIFIER = 0;
var TABLE_ID = 0;
var NUM_ELEMENTS_PER_PAGE = 5;

function matchNumElementsPerPage (scope) {
	if (!_.isUndefined(scope.tabledata.pagination)) {
		if (!_.isNumber(scope.tabledata.pagination.numElementsPerPage)) {
			if ((_.isUndefined(scope.tabledata.pagination.numbering) || !scope.tabledata.pagination.numbering) && 
					(_.isUndefined(scope.tabledata.pagination.prenext) || !scope.tabledata.pagination.prenext)) {
				scope.tabledata.pagination.error = true;
			}
			scope.tabledata.pagination.numElementsPerPage = NUM_ELEMENTS_PER_PAGE;
		}

		if (!_.isNumber(scope.tabledata.pagination.maxSize)) {
			scope.tabledata.pagination.maxSize = MAX_SIZE;
		}
	} else {
		scope.tabledata.pagination = {numElementsPerPage: NUM_ELEMENTS_PER_PAGE,
																	maxSize: MAX_SIZE,
																	error : true};
	}
};

function objectValid (object) {
	return !angular.equals({}, object) && object != undefined && object != null && object != "";
};

angular.module('generictable', []).

directive('genericTable', ['$sce', '$filter', function ($sce, $filter) {
	return {
		restrict: 'AEC',
		scope: {
			tabledata: '=?'
		},
		templateUrl: 'lib/generic-table/views/generictable.html',
		replace: true,
		link: {
			pre: function(scope) {

				//				-------- CONSTANTS --------------------------------------------------------------------				

				scope.intRegex = /[1-9]\d*/;
				scope.phoneRegex = /[69](\d{8})$/;
				scope.emailRegex = /((([a-zA-Z0-9_.+-]+@[a-zA-Z_]+?\.[a-zA-Z]{2,4}))+((,|;{1})( ?)+)?)+$/;
				scope.floatRegex = /^[-+]?[0-9]*\,|.?[0-9]+$/;

				//				-- Initialiing variables ---------------

				scope.editionMode = false;
				scope.rowToEditObject = {};
				scope.rowToEdit = '';
				scope.searchActive = {};
				scope.order = undefined;

				scope.reverseSort = false;
				scope.currentPage = 1;

				scope.isUpdatedTable = false;

				var recentEmit = false;

				//					-- Error control on the data format ------
				//						-- Matches necesary parameters to found the directive --------

				scope.$watch ('tabledata', function () {

					if (_.isUndefined(scope.tabledata)) {
						scope.tabledata = {};
					}

					if (_.isUndefined(scope.tabledata.headerColumns)) {
						scope.tabledata.headerColumns = {empty:true};
					}

					if (_.isUndefined(scope.tabledata.searchText)) {
						scope.tabledata.searchText = {};
					}

					matchNumElementsPerPage(scope);

					if (_.isUndefined(scope.tabledata.colIdentifier)) {
						if (!scope.tabledata.headerColumns.empty) {
							scope.tabledata.colIdentifier = _.keys(scope.tabledata.headerColumns)[0];
						} else {
							scope.tabledata.colIdentifier = COL_IDENTIFIER;
						}
					}

					if (_.isUndefined(scope.tabledata.tableId)) {
						scope.tabledata.tableId = TABLE_ID;
					}

					if (scope.tabledata.checkboxColumn) {
						if (!scope.tabledata.checkboxColumn.position) {
							_.extend(scope.tabledata.checkboxColumn, {position: 'first'});
						}					
					}

					if (_.isUndefined(scope.tabledata.dataArray)) {
						scope.tabledata.dataArray = [];
					}
				});
			},
			post: function (scope) {

				//				-------- CONSTANTS --------------------------------------------------------------------

				//				-- Initialiing variables ---------------

				var recentEmit = undefined; //Variable to controller the changes on the table, to evit restart it if 
				//the directive emit changes that it know.
				var manualFilterOutside = false; //Flag that control if the manual filter has been clicked.
				var ids = [];

				//				-------- External necesary elements to use this directive -----------------------------

				//					Header column type select, pendiente de implementación

				//					-- Especification of the estructure of data on the table -----------
				//					$scope.??tableDataName?? = {[tableId: ??identifier to the table??,]
				//										headerColumns:{
				//											??identifier??:{
				//											   title:'??The translate identifier??',
				//											   [searchable: true/false,]
				//											   [sortable: true/false,]
				//											   [editable: true/false,]
				//											   [typeEdition: '' | 'default' | 'text' | 'select' | 'number' | 
				//																'password' | 'email' | 'file',]
				//											   [type: '' | 'threshold' | 'checkbox' |'date (format: 'dd/MM/yyyy H:mm')' | 'color',
				//														'select', 'boolean']
				//											   [options: [??ArrayOfOptions??],]
				//											   [validationPattern:'' | 'floatRegex' | 'intRegex' | 'phoneRegex' | 'emailRegex',
				//											   [validationMessage:'??translate identifier of the message',]
				//											   [notNull:true/false,]
				//											   [scrolling:true/false,]
				//											   [maxHeight:'??px??',]
				//											   [maxWidth:'??px??',]
				//											   [align:'center' | 'right' | 'left',]
				//										   }
				//										},
				//										[checkboxColumn: {
				//											title: '??The translate identifier??',
				//											position: ['first' (default) | 'last']
				//											sortable:true,
				//											tooltip: '??The translate message to the tooltip??'
				//										},]
				//										[headerIcons:{
				//											[editable:'',]
				//											[removable:'',]
				//											[configuration:'',]
				//											[readings:'',]
				//											[writings:'',]
				//											[email:'',]
				//											[telephone:'',]
				//											[detail:'']
				//										},]
				//										[pagination:{[numElementsPerPage:??NumberOfElementsPerPAge??],
				//											[scrolling:true/false,]
				//											[numbering:true/false,]
				//											[prenext:true/false,]
				//											[maxSize:??If numbering, the number of pages that show on the selector page??,]
				//											[maxHeight:??If scrolling, the height of the table to scroll??,]
				//											[maxWidth:'??px??',]
				//											[lengthArray:??Number of rows in the data Array??]
				//									    },]
				//										[colIdentifier:?? ??,]
				//										[editableInside:true/false,]
				//										[rowClickable: true/false,]
				//										[sortableOutside:true/false,]
				//										[searchableOutside:true/false,]
				//										[emitIdsFiltered:true/false,]
				//										[knowFilterOutside:true/false,]
				//										[emitFilter: {
				//															label:'??The translate identifier??',
				//															value: true/false
				//										},]
				//					};

				//					Important rule: If the 'emit' of ids filtered is enabled, you need to know that if there aren't any filter done
				//					the ids array will be null, otherwise this ids array content will be the set of ids that matches the filters 
				//					that are did it.

				//					-- Note: the threshold column can't be searchable and sortable in this moment.
				//					-- Parse the real array of data to the generic table data array ---------
				//					-- Note: The dataArray.icons options are the same that the headerIcons and the same position.
				//					-- Note: All the values on the data param that exced the number of elements on headerColumns will be ignored
				//					$scope.$watch('??realDataArray or realObjectThatContainsTheDataArray??', function() {
				//						if ($scope.??realDataArray?? != undefined) {
				//							$scope.??tableDataName??.dataArray = [];
				//							var tempArray = [];
				//							for (var i=0; i<$scope.??realDataArray??.length; i++) {
				//								tempArray.push({data:{??identifier??:$scope.??realDataArray??[i].??firstColumnLabel??,
				//														??identifier??:$scope.??realDataArray??[i].??secondColumnLabel??,
				//														??identifier??:$scope.??realDataArray??[i].??thirdColumnLabel??},
				//												   icons:{0:'editable', 1:'removable'},
				//													[checkbox: true/false,]
				//													[mail:{data:??formatReponseMail??, error:??checkMail??},]
				//								  					[telephone:{data:??formatReponsePhone??, error:??checkPhone??},]
				//												});
				//							}
				//							$scope.??tableDataName??.dataArray = tempArray;
				//						}
				//					}, true);

				//					-- Note: If you want omit any icon in a row, you need put the position of the icon on the array 
				//							 with a empty string.

				//				----- Received functions -------------------------------------------------------

				scope.$on('getIdsGenericTable', function (event, tableId) {
					if (tableId === scope.tabledata.tableId) {
						manualFilterOutside = true;
						colIdsFilteredOutside();
						manualFilterOutside = false;
					}
				});


				//				----- Emit functions -------------------------------------------------------

				//				The 'on' recept on the controller:
				//					$scope.$on('editGenericTable', function(event, args){
				//						var ??elementSearched?? = _.findWhere(??list??, 
				//										{??identifierLabel??: args.data[$scope.??tableDataName??.colIdentifier]}); 
				//					});
				//				Parameters:
				//					event: the emit event;
				//					args: JSON Object with:
				//							data: the data value on the row which we are going to edit;
				//							tableId: the tableId to identify the correct directive that emit the message, because a 
				//										controller can has more than one directives of generic table.
				scope.edit = function(data) {
					scope.$emit('editGenericTable', {data:data, tableId:scope.tabledata.tableId});
					recentEmit = true;
				}

				//				The 'on' recept on the controller:
				//					$scope.$on('editedGenericTable', function(event, args){
				//						The next instruction will be repeat with all the parameters os the object.
				//						var element = _.findWhere(??list??, 
				//										{??identifierLabel??: args.oldIdentifier});
				//						element.??parameterToUpdate?? = $scope.args.data[??iterator??];
				//					});
				//				Parameters:
				//					event: the emit event;
				//					args: JSON Object with:
				//							data: the data value on the row which we have edited;
				//							oldIdentifier: is the value of the column that we edited previous the edition.
				//							tableId: the tableId to identify the correct directive that emit the message, because a 
				//										controller can has more than one directives of generic table.
				scope.finishEdition = function(data) {

					angular.forEach (scope.rowToEditObject, function (row, key) {
						data[key] = row.value;
					});

					scope.editionMode = false;
					scope.$emit('editedGenericTable', {data:data, 
																						 oldIdentifier:scope.rowToEditObject[scope.tabledata.colIdentifier].oldValue, 
																						 tableId:scope.tabledata.tableId});
					scope.rowToEditObject = {};

					recentEmit = true;
				}

				//				The 'on' recept on the controller:
				//					$scope.$on('removeGenericTable', function(event, args){
				//						$scope.??list?? = _.without(??list??, 
				//										_.findWhere(??list??, 
				//												{??identifierLabel??: args.data[$scope.??tableDataName??.colIdentifier]}));
				//					});
				//				Parameters:
				//					event: the emit event;
				//					args: JSON Object with:
				//							data: the data value on the row which we are going to remove;
				//							tableId: the tableId to identify the correct directive that emit the message, because a 
				//										controller can has more than one directives of generic table.
				scope.remove = function(data) {
					scope.$emit('removeGenericTable', {data:data, tableId:scope.tabledata.tableId});

					recentEmit = true;
				}

				//				The 'on' recept on the controller:
				//					$scope.$on('setConfigurationGenericTable', function(event, args){
				//					});
				//				Parameters:
				//					event: the emit event;
				//					args: JSON Object with:
				//							data: the value of the identifier in the row that we are going to edit his configuration;
				//							tableId: the tableId to identify the correct directive that emit the message, because a 
				//										controller can has more than one directives of generic table.
				scope.setConfiguration = function(data) {
					scope.$emit('setConfigurationGenericTable', {data:data[scope.tabledata.colIdentifier], 
																											 tableId:scope.tabledata.tableId});

					recentEmit = true;
				}

				//				The 'on' recept on the controller:
				//					$scope.$on('detailDataGenericTable', function(event, args){
				//					});
				//				Parameters:
				//					event: the emit event;
				//					args: JSON Object with:
				//							data: the value of the identifier in the row that we are going to edit his configuration;
				//							tableId: the tableId to identify the correct directive that emit the message, because a 
				//										controller can has more than one directives of generic table.
				scope.detailData = function(data) {
					scope.$emit('detailDataGenericTable', {data:data[scope.tabledata.colIdentifier], 
																								 tableId:scope.tabledata.tableId});

					recentEmit = true;
				}

				//				The 'on' recept on the controller:
				//					$scope.$on('readingsGenericTable', function(event, args){
				//					});
				//				Parameters:
				//					event: the emit event;
				//					args: JSON Object with:
				//							data: the value of the identifier in the row that we are going to edit his reading permissions;
				//							tableId: the tableId to identify the correct directive that emit the message, because a 
				//										controller can has more than one directives of generic table.
				scope.readings = function(data) {
					scope.$emit('readingsGenericTable', {data:data[scope.tabledata.colIdentifier], 
																							 tableId:scope.tabledata.tableId});

					recentEmit = true;
				}

				//				The 'on' recept on the controller:
				//					$scope.$on('writingsGenericTable', function(event, args){
				//					});
				//				Parameters:
				//					event: the emit event;
				//					args: JSON Object with:
				//							data: the value of the identifier in the row that we are going to edit his writing permissions;
				//							tableId: the tableId to identify the correct directive that emit the message, because a 
				//										controller can has more than one directives of generic table.
				scope.writings = function(data) {
					scope.$emit('writingsGenericTable', {data:data[scope.tabledata.colIdentifier], 
																							 tableId:scope.tabledata.tableId});

					recentEmit = true;
				}

				//				The 'on' recept on the controller:
				//					$scope.$on('checkboxChangeGenericTable', function(event, args){
				//					});
				//				Parameters:
				//					event: the emit event;
				//					args: JSON Object with:
				//							data: the row completely with new value of the checkbox;
				//							columnKey: the key of column because the row has one more checkbox on it, this could be null/undefined 
				//										if it's the extern data checkbox;
				//							tableId: the tableId to identify the correct directive that emit the message, because a 
				//										controller can has more than one directives of generic table.
				scope.checkboxChange = function(data, key) {
					scope.$emit('checkboxChangeGenericTable', {data:data, 
																										 key: key,
																										 tableId:scope.tabledata.tableId});

					recentEmit = true;
				}

				//				The 'on' recept on the controller:
				//					$scope.$on('clickRowGenericTable', function(event, args){
				//					});
				//				Parameters:
				//					event: the emit event;
				//					args: JSON Object with:
				//							data: the row data that we have already clicked;
				//							tableId: the tableId to identify the correct directive that emit the message, because a 
				//										controller can has more than one directives of generic table.				
				scope.clickRow = function (rowData) {
					scope.$emit('clickRowGenericTable', {data: rowData, tableId:scope.tabledata.tableId});

					recentEmit = true;
				}

				//					-- Changes on the functionality of the table (search, sort or pagination) ----------

				//					-- Pagination --------
				scope.$watch("currentPage", function () {
					if (!_.isUndefined(recentEmit) && !_.isUndefined(scope.tabledata.pagination.lengthArray)) {
						emitChangeTable();
					}
				});

				//					-- Order --------
				scope.changeSort = function(column, type) {
					if (column.toString() === scope.order) {
						scope.reverseSort = !scope.reverseSort;
					} else {
						scope.order = column.toString();
						scope.reverseSort = type === 'date'? true : false;
					}
					if (!_.isUndefined(recentEmit) && scope.tabledata.sortableOutside) {
						emitChangeTable();
					}

					filterArray(); //Recarga del array de datos que se muestra en la tabla
				}

				//					-- Search ---------
				scope.searchChange = function (keyChange) {
					if(scope.tabledata.knowFilterOutside) {
						console.log("Enviamos los cambios en el filtro automatico");
						emitChangeSearch();
					}

					if (!_.isUndefined(recentEmit) && scope.tabledata.sortableOutside) {
						emitChangeTable();
					}
					filterArray(); //Recarga del array de datos que se muestra en la tabla
				}

				//					-- Search ---------
				scope.searchChangeManual = function (keyChange) {
					if(scope.tabledata.knowFilterOutside) {
						emitChangeSearch();
					}

					if(scope.tabledata.emitFilter && scope.tabledata.emitFilter.value) {
						manualFilterOutside = true;
						emitFilterChange();
					}

					if (!_.isUndefined(recentEmit) && scope.tabledata.sortableOutside) {
						emitChangeTable();
					}
					filterArray(); //Recarga del array de datos que se muestra en la tabla
				}

				//				The 'on' recept on the controller:
				//					$scope.$on('changeVisualizationGenericTable', function(event, args){
				//					});
				//				Parameters:
				//					event: the emit event;
				//					args: JSON Object with:
				//							data: recopile the new page on the pagination (currentPage), the key which is ordering the table 
				//									and his direction (keyOrder, reverse), and finally the keywords that introduce the user (keywords),
				//									this is the actual searchText;
				//							tableId: the tableId to identify the correct directive that emit the message, because a 
				//										controller can has more than one directives of generic table.
				function emitChangeTable () {
					scope.$emit('changeVisualizationGenericTable', {
						data:{currentPage: scope.currentPage, keyOrder: scope.order, 
									reverse: scope.orderTypeColumn() === 1? !scope.reverseSort : scope.reverseSort,
									keywords: scope.tabledata.searchText}, 
						tableId: scope.tabledata.tableId}
										 );
					recentEmit = true;
				}

				//				The 'on' recept on the controller:
				//					$scope.$on('changeFilterGenericTable', function(event, args){
				//					});
				//				Parameters:
				//					event: the emit event;
				//					args: JSON Object with:
				//							data: recopile the keywords that introduce the user (keywords),
				//									this is the actual searchText;
				//							tableId: the tableId to identify the correct directive that emit the message, because a 
				//										controller can has more than one directives of generic table.
				function emitChangeSearch () {
					scope.$emit('changeFilterGenericTable',{data: scope.tabledata.searchText, 
																									tableId: scope.tabledata.tableId
																								 }
										 );
				}

				//				The 'on' recept on the controller:
				//					$scope.$on('changeFilterManualGenericTable', function(event, args){
				//					});
				//				Parameters:
				//					event: the emit event;
				//					args: JSON Object with:
				//							data: recopile the keywords that introduce the user (keywords),
				//									this is the actual searchText;
				//							tableId: the tableId to identify the correct directive that emit the message, because a 
				//										controller can has more than one directives of generic table.
				function emitFilterChange () {
					scope.$emit('changeFilterManualGenericTable',{data: scope.tabledata.searchText, 
																												tableId: scope.tabledata.tableId
																											 }
										 );
				}


				//				The 'on' recept on the controller:
				//					$scope.$on('idsTableFilteredGenericTable', function(event, args){
				//					});
				//				Parameters:
				//					event: the emit event;
				//					args: JSON Object with:
				//							data: list of ids current filtered;
				//							tableId: the tableId to identify the correct directive that emit the message, because a 
				//										controller can has more than one directives of generic table.
				function colIdsFilteredOutside () {
					if((scope.tabledata.knowFilterOutside || manualFilterOutside)) {
						scope.$emit("idsTableFilteredGenericTable", {data: ids, 
																												 tableId: scope.tabledata.tableId
																												});
					}
				}

				//				-------- Internal functions ------------------------------------------------------------

				//					-- Initializing of variable ---------

				scope.lengthObject = function (obj) {
					return _.size(obj);
				}

				scope.orderTypeColumn = function () {
					if (scope.order === '-1') {
						return 2;
					}

					if (!_.isUndefined(scope.tabledata.headerColumns[scope.order]) &&
							scope.tabledata.headerColumns[scope.order].type) {
						switch (scope.tabledata.headerColumns[scope.order].type.toLowerCase()) {
							case 'date': 
								return 1;
							default: return 0;
						};
					} else {
						return 0;
					}
				}

				//				Recarga del array de datos que se muestra en la tabla. Se llama cuando: hay cambio de pagina, cambio en la 
				//					ordenacion, cambio en la búsqueda, cuando se carga la página desde el principio y cuando se modifica el 
				//					numero de elementos por pagina para el tema de scroll infinito.
				function filterArray () {
					for (var i in scope.tabledata.searchText) {
						if (!objectValid(scope.tabledata.searchText[i])) {
							delete scope.tabledata.searchText[i];
						}
					}
					if (scope.tabledata.dataArray.length > 0 && scope.order != undefined) {
						console.log('Array NO vacio');
						$filter('as')(
							$filter('orderSpecialBy')(
								$filter('specialSearch')(scope.tabledata.dataArray,
																				 scope.tabledata.searchText, !scope.tabledata.searchableOutside, scope.$eval), 
								scope.order, (scope.orderTypeColumn === 1? !scope.reverseSort : 
															scope.reverseSort), scope.orderTypeColumn(),
								(scope.tabledata.sortableOutside? !scope.tabledata.sortableOutside :
								 (scope.order === '-1'? scope.tabledata.checkboxColumn.sortable :
									scope.tabledata.headerColumns[scope.order].sortable))),
							'tablefiltered', true, scope);
						//						}
					} else {
						scope.tablefiltered = scope.tabledata.dataArray;
					}
					if (scope.tabledata.emitIdsFiltered) {
						if (objectValid(scope.tabledata.searchText)) {
							ids = [];
							angular.forEach(scope.tablefiltered, function (data) {
								ids.push(data.data[scope.tabledata.colIdentifier]);
							});
							colIdsFilteredOutside();
							manualFilterOutside = false;
						} else {
							ids = null;
							colIdsFilteredOutside();
							manualFilterOutside = false;
						}
					}
				}

				//					-- Edit Inside ----------

				scope.startEdition = function(row, index) {
					scope.editionMode = true;

					//The next variable save the identifier of the row that the user is editing.
					scope.rowToEdit = row[scope.tabledata.colIdentifier];

					angular.forEach(row, function (item , key) {
						scope.rowToEditObject[key] = {value: item, oldValue: item}; 
					});
				};

				scope.cancelEdition = function(row) {
					scope.editionMode = false;
					scope.rowToEditObject = {};
				};

				scope.undoEditData = function (field) {
					scope.rowToEditObject[field].value = scope.rowToEditObject[field].oldValue;
				};

				//				Este método se encarga de encontrar código propio de html y traducirlo para su correcta visualización.
				scope.to_trusted = function(html_code) {
					return $sce.trustAsHtml(html_code);
				};

				//				------- Watch functions ----------------------------------------------------

				//				Function that restart the basic parameters on the table when the table is updated.
				scope.$watchCollection('tabledata.dataArray', function () {
					if (scope.tabledata.dataArray != undefined) {
						scope.editionMode = false;
						scope.rowToEditObject = {};
						scope.rowToEdit = '';
						if (!recentEmit) {
							scope.searchActive = {};
							scope.order = undefined;
							scope.tabledata.searchText = {};

							console.log("La tabla ha cambiado");

							if (!scope.tabledata.headerColumns.empty) {
								for (var key in scope.tabledata.headerColumns) {
									if (scope.order === undefined && scope.tabledata.headerColumns[key].sortable){
										scope.order = key.toString();
										break;
									}
								}
							} else {
								scope.order = 0;
							}
							scope.reverseSort = false;
							recentEmit = false;
							matchNumElementsPerPage(scope);
						}
						if (!scope.isUpdatedTable) {
							scope.isUpdatedTable = true;
						}
						filterArray(); //Recarga del array de datos que se muestra en la tabla
					}
				});

				scope.$on('$destroy', function () {
					scope.tabledata.dataArray = [];
					scope.tableFiltered = [];
					scope.tabledata = {};
					scope.tableDestroy = true;
					scope.$parent.$digest;
					scope = undefined;
				});
			}
		}
	}
}]).

directive('ngAssignVariables', ['$parse', function ($parse) {
	return {
		restrict: 'AE',
		link: function ($scope, element, $attrs) {
			var vars = $attrs.ngAssignVariables.split(',');
			if (vars.length >= 2) {
				for (var i = 0; i < (vars.length - 1); i = i + 2) {
					$parse(vars[i].replace(/\s+/g, '')).assign($scope, $scope.$eval(vars[i+1]));
				}
			}
		}
	}
}]).

directive('focusOn', function($timeout) {
	return {
		scope: { trigger: '=focusOn' },
		link: function(scope, element) {
			scope.$watch('trigger', function(value) {
				if(value === "true" || value) { 
					element[0].focus();
				}
			});
		}	
	};
}).

directive('ngScrolling', [ function () {
	//		Funtionality: Directive that add scroll bar with a specific height in a specific element and evaluating a condition previously.

	//		Format: ng-scrolling="scroll:??true/false??, height:??String with the px of height??, width:??String with the px of width??"
	//				The order of the params isn't strict

	//		$attrs: String with all the params on the directive

	function restartElementsPage (element, heightTest, numRows) {

		if (!_.isUndefined(heightTest)) {
			var mHeight = heightTest === true? parseFloat(element[0].style.maxHeight.split('px')[0]) : 
			parseFloat(heightTest.split('px')[0]); //Tamaño máximo de la tabla visualmente
			var hHeight = element.find('#headTable')[0].scrollHeight; //Altura cabecera

			var scrollTop = element[0].scrollTop; //Distancia e pixeles a la parte superior de la tabla

			var rHeight; //Tamaño medio de las filas de la tabla
			if (element.find('#bodyTable')[0].childElementCount > 0) {
				rHeight = element.find('#bodyTable')[0].children[0].clientHeight;
			}

			var numElements;
			if (scrollTop < (hHeight/4)) {
				numElements = ((mHeight - hHeight) / rHeight) * 1.05;
			} else {
				numElements = (scrollTop/rHeight) + ((mHeight / rHeight) * 1.05);
			}

			//				console.log(numRows);
			//				console.log(numElements);

			if (!_.isNaN(numElements)) {
				if (numRows > numElements) {
					return parseInt(numElements) + 1;
				} else {
					return numRows;
				}
			}
		}
		return false;
	}

	return {		
		link:			
		function ($scope, element, $attrs) {
			var MAXHEIGHT = '200px';

			var height, width;

			try {
				if (!_.isUndefined($attrs.height)) {
					height = $scope.$eval($attrs.height);
				} else {
					height = undefined;
				}
			} catch (e) {
				height = $scope.$eval('"' + $attrs.height + '"');
			}

			try {
				if (!_.isUndefined($attrs.width)) {
					width = $scope.$eval($attrs.width);
				} else {
					width = undefined;
				}
			} catch (e) {
				width = $scope.$eval('"' + $attrs.width + '"');
			}

			if (_.isUndefined($attrs.scroll) || $scope.$eval($attrs.scroll)) {

				if (!_.isUndefined(width)) {;
																		element.context.style.maxWidth = width;
																	 }

				if (!_.isUndefined(height)) {
					element.context.style.maxHeight = height;
				} else {
					element.context.style.maxHeight = MAXHEIGHT;
				}

				element.context.style.overflowY = 'auto';
				element.context.style.overflowX = 'auto';

				if ($attrs.tgPagination != undefined) {
					if (!$scope.refreshScrolling) {
						$scope.$watch(function() { return element[0].clientHeight; }, function (newValue, oldValue) {
							//								console.log("Element");
							if ($scope.tabledata.dataArray != undefined && $scope.tabledata.dataArray.length > 0) {
								var els = restartElementsPage(element, true,
																							$scope.tabledata.dataArray.length);

								if (els != false) {
									$scope.tabledata.pagination.numElementsPerPage = els;
								}
							}
						});

						$scope.$watch('tabledata.dataArray', function (newValue, oldValue) {
							if ($scope.tabledata.dataArray != undefined && $scope.tabledata.dataArray.length > 0 
									&& element[0].clientHeight != 0) {
								element[0].scrollTop = 0;
								var els = restartElementsPage(element, true,
																							$scope.tabledata.dataArray.length);

								if (els != false) {
									$scope.tabledata.pagination.numElementsPerPage = els;
								}
							}
						});

						element.context.onscroll = function (event, anyMore) {
							//								console.log("Scroll");

							var els = restartElementsPage(element, true, $scope.tabledata.dataArray.length);

							if (els != false) {
								$scope.tabledata.pagination.numElementsPerPage = els;
								$scope.$digest();
							}
						}
					}
				} else {
					$scope.$watch('tabledata.dataArray', function (newValue, oldValue) {
						if (!_.isUndefined($scope.tabledata) && !_.isUndefined($scope.tabledata.dataArray)) {
							$scope.tabledata.pagination.numElementsPerPage = $scope.tabledata.dataArray.length;
						}
					});
				}
			} else {
				element.context.style.overflowX = 'visible';
				element.context.style.overflowY = 'visible';
			}
		}
	}
}]).

directive('popup', function() {
	return function(scope, element, attrs) {
		element.find("a[rel=popover]").popover({ placement: 'bottom', html: 'true'});
		element.find("span[rel=popover]").popover({ placement: 'bottom', html: 'true'});
	};
}).

//---------------------------------------------------------------------------------------------------------
//---------------------------------------------  FILTROS  -------------------------------------------------
//---------------------------------------------------------------------------------------------------------

filter('as', ['$parse', function ($parse) {

	//		To assign the actual list on the repeat to the variable

	return function(list, path, isNeeded, $scope) {			
		if (isNeeded) {
			return $parse(path).assign($scope === undefined? this : $scope, list);
		} else {
			return list;
		}
	};
}]).

filter('objectToArray', function () {		
	return function (items, wantKey) {
		var filtered = [];
		if (!_.isUndefined(items) && _.isObject(items)) {
			angular.forEach(items, function(item, key) {
				if (key !== undefined && key != null) {
					if (!_.isObject(item)) {
						if (wantKey) {
							console.log('Error: wrong format of data object');
							return items;
						}
					} else {
						_.extend(item, {_$key:key});
					}
					filtered.push(item);
				}
			});
		} else {
			return items;
		}
		return filtered;
	}
}).

filter('orderSpecialBy', function () {

	//		Filter to order the generic table, the special variable is a flag that say which is the special order to do 
	//						(0- normal, 1- date (format: 'dd/MM/yyyy H:mm'), 2- checkbox (true/false)).

	function isDate(value) {
		return toString.call(value) === '[object Date]';
	}

	function compare (v1, v2) {
		var t1 = typeof v1;
		var t2 = typeof v2;
		if (t1 == t2) {
			if (isDate(v1) && isDate(v2)) {
				v1 = v1.valueOf();
				v2 = v2.valueOf();
			}
			if (t1 == "string") {
				v1 = v1.toLowerCase();
				v2 = v2.toLowerCase();
			}
			if (v1 === v2) {
				return 0;
			}
			return v1 < v2 ? -1 : 1;
		} else {
			return t1 < t2 ? -1 : 1;
		}
	}

	return function (items, parameter, reverse, special, isNeeded) {			
		var tempArray = [];

		if (parameter == undefined || !isNeeded){
			return items;
		}

		if (!_.isUndefined(items)) {							
			if (_.isArray(items) ) {
				var aDate, aHourYear, aHours, bDate, bHourYear, bHours;
				tempArray = items;
				tempArray.sort(function (a, b) {
					switch (special) {
						case 1:
							aDate = a.data[parameter].split('/'); //([dd, MM, yyyy H:mm])
							aHourYear = aDate[2].split(' '); //([yyyy, H:mm])
							aHours = aHourYear[1].split(':'); //([H, mm])

							aHours[0] = aHours[0].length == 1? '0' + aHours[0]: aHours[0];

							bDate = b.data[parameter].split('/'); //([dd, MM, yyyy H:mm])
							bHourYear = bDate[2].split(' '); //([yyyy, H:mm])
							bHours = bHourYear[1].split(':'); //([H, mm])

							bHours[0] = bHours[0].length == 1? '0' + bHours[0]: bHours[0];

							return (aHourYear[0].toLowerCase() > bHourYear[0].toLowerCase() ? -1 : 
											aHourYear[0].toLowerCase() < bHourYear[0].toLowerCase() ? 1 : 
											aDate[1].toLowerCase() > bDate[1].toLowerCase() ? -1 : 
											aDate[1].toLowerCase() < bDate[1].toLowerCase() ? 1 : 
											aDate[0].toLowerCase() > bDate[0].toLowerCase() ? -1 : 
											aDate[0].toLowerCase() < bDate[0].toLowerCase() ? 1 : 
											aHours[0].toLowerCase() > bHours[0].toLowerCase() ? -1 : 
											aHours[0].toLowerCase() < bHours[0].toLowerCase() ? 1 : 
											aHours[1].toLowerCase() > bHours[1].toLowerCase() ? -1 : 
											aHours[1].toLowerCase() < bHours[1].toLowerCase() ? 1 :
											aHours[2].toLowerCase() > bHours[2].toLowerCase() ? -1 : 1);

						case 2:
							return compare(a.checkbox, b.checkbox);
						default:
							return compare(a.data[parameter], b.data[parameter]);
					}
				});
			} else {
				console.log("Error: the element to sort isn't a array");
			}
			if(reverse) {
				tempArray.reverse();
			}
		} else {
			console.log("Error: the element to sort is not defined");
		}
		return tempArray;
	};
}).

filter('specialSearch', function () {

	//		Filter to select the rows on the generic table that the user want, searching by text

	function isDate(value) {
		return toString.call(value) === '[object Date]';
	}

	function isComparator (value) {			
		if (value.length > 1 && (value[0] === '<' || value[0] === '>' || value[0] === '=')) {
			if (value.length == 2 && (value[1] === '=')) {
				return false;
			} else {
				return true;
			}
		} else {
			return false;
		}
	}

	function dateCompare (a, b) {
		var aDate = a.split('/'); //([dd, MM, yyyy H:mm])
		var aHourYear = aDate[2].split(' '); //([yyyy, H:mm])
		var aHours = aHourYear[1].split(':'); //([H, mm])

		aHours[0] = aHours[0].length == 1? '0' + aHours[0]: aHours[0];

		var bDate = b.split('/'); //([dd, MM, yyyy H:mm])
		var bHourYear = bDate[2].split(' '); //([yyyy, H:mm])
		var bHours = bHourYear[1].split(':'); //([H, mm])

		bHours[0] = bHours[0].length == 1? '0' + bHours[0]: bHours[0];

		return (aHourYear[0] > bHourYear[0] ? -1 : 
						aHourYear[0] < bHourYear[0] ? 1 : 
						aDate[1] > bDate[1] ? -1 : 
						aDate[1] < bDate[1] ? 1 : 
						aDate[0] > bDate[0] ? -1 : 
						aDate[0] < bDate[0] ? 1 : 
						aHours[0] > bHours[0] ? -1 : 
						aHours[0] < bHours[0] ? 1 : 
						aHours[1] > bHours[1] ? -1 : 
						aHours[1] < bHours[1] ? 1 :
						aHours[2] > bHours[2] ? -1 : 0);
	}

	function contains ($eval, item, search) {
		var t1, t2, t3;
		var v1, v2, v3;
		var contains = true;
		var date = false;
		angular.forEach(item, function(value, key) {
			v1 = value;
			v2 = search[key];
			t1 = typeof v1;
			t2 = typeof v2;

			if (t2 == "object") {
				v2 = search[key].startDate;
				t2 = typeof v2;
				v3 = search[key].endDate;
				t3 = typeof v3;
				date = true;
			}

			if (isDate(v1)){
				v1 = v1.valueOf();
			}
			if (isDate(v2)){
				v2 = v2.valueOf();
			}
			if (isDate(v3)){
				v3 = v3.valueOf();
			}

			if (t1 == "string") {
				v1 = v1.toLowerCase();
			} else {
				if (t1 == "undefined" || v1 == null) {
					v1 = "";
				} else {
					v1 = v1.toString();
				}
			}
			if (t2 == "string") {
				v2 = v2.toLowerCase();
			} else {			
				if (t2 == "undefined" || v2 == null) {
					v2 = '';
				} else {
					v2 = v2.toString();
				}
			}

			if (t3 == "string") {
				v3 = v3.toLowerCase();
			} else {			
				if (t3 == "undefined" || v3 == null) {
					v3 = '';
				} else {
					v3 = v3.toString();
				}
			}

			if (isComparator(v2)) {
				if (v2[0] === '=' && !(v2[1] === '=')) {
					v2 = '=' + v2;
				}
				try {
					contains = $eval(v1+v2);
				} catch (e) {
					contains = false;
				}
			} else {
				if (date) {
					if (!(v3 === '')  && !(v2 === '')) {
						contains = (dateCompare(v1, v2) != 1) && (dateCompare(v1, v3) != -1);
					} else {
						if (!(v2 === '')) {
							contains = dateCompare(v1, v2) != 1;
						}

						if (!(v3 === '')) {
							contains = dateCompare(v1, v3) != -1;
						}
					}
				} else {
					if (v1.indexOf(v2) < 0) {
						contains = false;
					}
				}
			}
			date = false;
			v3, t3 = undefined;
		});
		return contains;
	}

	return function (items, searchText, isNeeded, $eval) {

		var filtered = [];		

		if (_.isUndefined(searchText) || !isNeeded){ 
			return items;
		}

		angular.forEach(items, function(item) {
			if (contains($eval === undefined? this.$eval : $eval, item.data, searchText)) {
				filtered.push(item);
			}
		});

		return filtered;
	};
}).

filter('startFrom', function () {
	return function (input, start, isNeeded) {
		if (input && isNeeded){
			start = +start; //parse to int
			return input.slice(start);
		} else {
			return input;
		}
	};
});

})(window,window.angular)