(function(angular, undefined) {
	'use strict';

	/*
	 * Home Controller
	 */
	angular
		.module('app')
		.controller('HomeController', HomeController);

	function HomeController($scope, $location, $window, focus, Geocoder, Map) {

		var map_marker = '/img/target.png';

		function _init() {

			$scope.year 		 = (new Date()).getFullYear();
			$scope.zoom 		 = 1;
			$scope.zooms 		 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
			$scope.latitude  = 0;
			$scope.longitude = 0;
			$scope.startLonlat = { lon: 0, lat: 0 };

			$scope.baselayer  = 1;
			$scope.separator  = 'comma';
			$scope.projection = 'EPSG:4326';
			$scope.defaultProjection = 'EPSG:4326';

			Map.init({
				id: 'map',
				startZoom: $scope.zoom,
				startLonlat: $scope.startLonlat
			});

			Map.getActualZoom(function(zoom) {
				$scope.zoom = zoom;
				_apply();
			});

			Map.enableDragPoint(function(point) {
				_updateValues(point);
			});

			$scope.dropMarker();
			Map.showPopup($scope.startLonlat, 'Drag me to update the values');

			focus('queryPlace');
		}

		function _apply() {
			if(!$scope.$$phase) $scope.$apply();
		}

		function _separator() {

			switch($scope.separator) {
				case 'space': return ' ';
				case 'comma': return ', ';
			}
		}

		function _updateValues(point) {

			$scope.actualPoint = point;

			point = Map.transform(point, 'EPSG:900913', $scope.defaultProjection);

			if($scope.projection !== $scope.defaultProjection) {
				point = Map.transform(point, $scope.defaultProjection, $scope.projection);
			}

			var s = _separator();

			$scope.longitude = point.lon;
			$scope.latitude  = point.lat;
			$scope.latlon = point.lat + s + point.lon;
			$scope.lonlat = point.lon + s + point.lat;


			var content = '<small>Longitude' + s + 'Latitude</small><br><b>' + point.lon + s + point.lat + '</b>';
			Map.showPopup($scope.actualPoint, content);

			_apply();
		}

		function _addMarker(point, opts) {

			opts = opts || {};
			point.icon = map_marker;

			Map.addPoint(point, { layer: 'position' });

			if(opts.hasOwnProperty('center') && opts.center) {
				Map.setCenterMap(point, opts.zoom);
			}

			_updateValues(point);
		}

		$scope.goto = function(to) {
			$location.path(to);
		};

		$scope.dropMarker = function(lonlat) {
			lonlat = lonlat || Map.getCenter();
			_addMarker(lonlat);
		};

		$scope.getPosition = function() {
			$scope.gettingPosition = true;

			Map.getPosition(function(point) {
				_addMarker(point, { center: true, zoom: 14 });
			}, function(errorMessage) {
				window.alert(errorMessage);
			}, function() {
				// always execute after success and error
				$scope.gettingPosition = false;
			});
		};

		$scope.updateValues = function() {
			_updateValues($scope.actualPoint);
		};

		$scope.searchPlace = function(query) {
			$scope.searchingPlaces = true;

			Geocoder.searchPlace(query)
				.success(function(response) {
					$scope.places = response.results;
					$scope.searchingPlaces = false;
					_apply();
				});
		};

		$scope.selectPlace = function(place) {
			$scope.places 		= [];
			$scope.queryPlace	= '';

			var point = {
				lon: place.geometry.location.lng,
				lat: place.geometry.location.lat
			};
			point = Map.transform(point, $scope.defaultProjection, 'EPSG:900913');

			_addMarker(point, { center: true, zoom: 13 });
		};

		$scope.changeZoom = function(zoom) {
			Map.setZoom(zoom);
		};

		$scope.zoomIn = function() {
			Map.zoomIn();
		};

		$scope.zoomOut = function() {
			Map.zoomOut();
		};

		$scope.changeBaselayer = function(baselayer) {
			Map.setBaseLayer(baselayer);
		};

		_init();
	}

})(window.angular);
