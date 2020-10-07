"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var request = require('request');
var proj4 = require("proj4");
var boolean_point_in_polygon_1 = require("@turf/boolean-point-in-polygon");
var turf = require("@turf/helpers");
var Covid19RegionsController = /** @class */ (function () {
    function Covid19RegionsController() {
    }
    Covid19RegionsController.prototype.getOneLocation = function (locationId) {
        return __awaiter(this, void 0, void 0, function () {
            var url_1;
            return __generator(this, function (_a) {
                try {
                    url_1 = "https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_Landkreisdaten/FeatureServer/0/query?where=RS=" + locationId + "&outFields=last_update,cases7_per_100k,RS,cases,deaths,EWZ,GEN&f=json";
                    return [2 /*return*/, new Promise((function (resolve, reject) { return request(url_1, { json: true }, function (err, res, body) {
                            if (err) {
                                reject(err);
                            }
                            resolve({
                                id: body.features[0].attributes.RS,
                                last_update: body.features[0].attributes.last_update,
                                cases: body.features[0].attributes.cases,
                                cases7_per_100k: Covid19RegionsController.round(body.features[0].attributes.cases7_per_100k),
                                deaths: body.features[0].attributes.deaths,
                                einwohner: body.features[0].attributes.EWZ,
                                name: body.features[0].attributes.GEN,
                            });
                        }); }))];
                }
                catch (err) {
                    console.error('Caught error', err);
                }
                return [2 /*return*/];
            });
        });
    };
    Covid19RegionsController.prototype.getAllLocations = function () {
        return __awaiter(this, void 0, void 0, function () {
            var url;
            return __generator(this, function (_a) {
                url = "https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_Landkreisdaten/FeatureServer/0/query?where=1%3D1&outFields=RS,GEN,BL,BL_ID,county&f=json&geometryType=esriGeometryPolygon";
                return [2 /*return*/, new Promise((function (resolve, reject) { return request(url, { json: true }, function (err, res, body) {
                        if (err) {
                            reject(err);
                        }
                        var regions = body.features.map(function (item) {
                            return {
                                bundesland: item.attributes.BL,
                                bundeslandId: item.attributes.BL_ID,
                                county: item.attributes.country,
                                name: item.attributes.GEN,
                                id: item.attributes.RS,
                                geometry: [item.geometry.rings[0].map(function (wgs84Point) {
                                        return proj4("+proj=utm +zone=32", "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs", wgs84Point);
                                    })]
                            };
                        });
                        resolve(regions);
                    }); }))];
            });
        });
    };
    Covid19RegionsController.prototype.findLocationForPoint = function (point) {
        if (point === void 0) { point = [
            8.469085693359375,
            49.48775429690567
        ]; }
        return __awaiter(this, void 0, void 0, function () {
            var regions, location;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAllLocations()];
                    case 1:
                        regions = _a.sent();
                        location = regions.find(function (region) {
                            return boolean_point_in_polygon_1.default(point, turf.polygon(region.geometry));
                        });
                        if (!location) {
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/, { bundeslandId: location.bundeslandId, id: location.id, name: location.name, }];
                }
            });
        });
    };
    Covid19RegionsController.round = function (num) {
        return Math.round((num + Number.EPSILON) * 100) / 100;
    };
    return Covid19RegionsController;
}());
exports.Covid19RegionsController = Covid19RegionsController;
