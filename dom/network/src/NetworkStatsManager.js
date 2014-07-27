/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const DEBUG = false;
function debug(s) { dump("-*- NetworkStatsManager: " + s + "\n"); }

const {classes: Cc, interfaces: Ci, utils: Cu, results: Cr} = Components;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/DOMRequestHelper.jsm");

// Ensure NetworkStatsService and NetworkStatsDB are loaded in the parent process
// to receive messages from the child processes.
let appInfo = Cc["@mozilla.org/xre/app-info;1"];
let isParentProcess = !appInfo || appInfo.getService(Ci.nsIXULRuntime)
                        .processType == Ci.nsIXULRuntime.PROCESS_TYPE_DEFAULT;
if (isParentProcess) {
  Cu.import("resource://gre/modules/NetworkStatsService.jsm");
}

XPCOMUtils.defineLazyServiceGetter(this, "cpmm",
                                   "@mozilla.org/childprocessmessagemanager;1",
                                   "nsISyncMessageSender");

// NetworkStatsData
const nsIClassInfo         = Ci.nsIClassInfo;
const NETWORKSTATSDATA_CID = Components.ID("{3b16fe17-5583-483a-b486-b64a3243221c}");

function NetworkStatsData(aWindow, aData) {
  this.rxBytes = aData.rxBytes;
  this.txBytes = aData.txBytes;
  this.date = new aWindow.Date(aData.timestamp);
}

NetworkStatsData.prototype = {
  classID : NETWORKSTATSDATA_CID,

  QueryInterface : XPCOMUtils.generateQI([])
};

// NetworkStatsInterface
const NETWORKSTATSINTERFACE_CONTRACTID = "@mozilla.org/networkstatsinterface;1";
const NETWORKSTATSINTERFACE_CID = Components.ID("{f540615b-d803-43ff-8200-2a9d145a5645}");

function NetworkStatsInterface() {
  if (DEBUG) {
    debug("NetworkStatsInterface Constructor");
  }
}

NetworkStatsInterface.prototype = {
  __init: function(aNetwork) {
    this.type = aNetwork.type;
    this.id = aNetwork.id;
  },

  classID : NETWORKSTATSINTERFACE_CID,

  contractID: NETWORKSTATSINTERFACE_CONTRACTID,
  QueryInterface : XPCOMUtils.generateQI([])
}

// NetworkStats
const NETWORKSTATS_CID = Components.ID("{28904f59-8497-4ac0-904f-2af14b7fd3de}");

function NetworkStats(aWindow, aStats) {
  if (DEBUG) {
    debug("NetworkStats Constructor");
  }
  this.appManifestURL = aStats.manifestURL || null;
  this.serviceType = aStats.serviceType || null;
  this.network = new aWindow.MozNetworkStatsInterface(aStats.network);
  this.start = new aWindow.Date(aStats.startTimestamp);
  this.end = new aWindow.Date(aStats.endTimestamp);

  let samples = this.data = new aWindow.Array();
  for (let i = 0; i < aStats.data.length; i++) {
    samples.push(aWindow.MozNetworkStatsData._create(
      aWindow, new NetworkStatsData(aWindow, aStats.data[i])));
  }
}

NetworkStats.prototype = {
  classID : NETWORKSTATS_CID,

  QueryInterface : XPCOMUtils.generateQI()
}

// NetworkStatsAlarm
const NETWORKSTATSALARM_CID = Components.ID("{a93ea13e-409c-4189-9b1e-95fff220be55}");

function NetworkStatsAlarm(aWindow, aAlarm) {
  this.alarmId = aAlarm.id;
  this.network = new aWindow.MozNetworkStatsInterface(aAlarm.network);
  this.threshold = aAlarm.threshold;
  this.data = aAlarm.data;
}

NetworkStatsAlarm.prototype = {
  classID : NETWORKSTATSALARM_CID,

  QueryInterface : XPCOMUtils.generateQI([])
};

// NetworkStatsManager

const NETWORKSTATSMANAGER_CONTRACTID = "@mozilla.org/networkStatsManager;1";
const NETWORKSTATSMANAGER_CID        = Components.ID("{ceb874cd-cc1a-4e65-b404-cc2d3e42425f}");

function NetworkStatsManager() {
  if (DEBUG) {
    debug("Constructor");
  }
}

NetworkStatsManager.prototype = {
  __proto__: DOMRequestIpcHelper.prototype,

  getSamples: function(aNetwork, aStartDate, aEndDate, aOptions) {
    if (aStartDate > aEndDate) {
      throw Components.results.NS_ERROR_INVALID_ARG;
    }

    let manifestURL = null;
    let serviceType = null;
    if (aOptions) {
      if (aOptions.appManifestURL && aOptions.serviceType) {
        throw Components.results.NS_ERROR_NOT_IMPLEMENTED;
      }
      manifestURL = aOptions.manifestURL;
      serviceType = aOptions.serviceType;
    }

    let request = this.createRequest();
    cpmm.sendAsyncMessage("NetworkStats:Get", {
      id: this.getRequestId(request),
      network: aNetwork.toJSON(),
      startTimestamp: aStartDate.getTime(),
      endTimestamp: aEndDate.getTime(),
      manifestURL: manifestURL,
      serviceType: serviceType,
    });

    return request;
  },

  clearStats: function(aNetwork) {
    let request = this.createRequest();
    cpmm.sendAsyncMessage("NetworkStats:Clear", {
      id: this.getRequestId(request),
      network: aNetwork.toJSON(),
    });
    return request;
  },

  clearAllStats: function() {
    let request = this.createRequest();
    cpmm.sendAsyncMessage("NetworkStats:ClearAll", {
      id: this.getRequestId(request),
    });
    return request;
  },

  addAlarm: function(aNetwork, aThreshold, aOptions) {
    if (!aOptions) {
      aOptions = {};
    }

    let request = this.createRequest();
    cpmm.sendAsyncMessage("NetworkStats:SetAlarm",
                          {id: this.getRequestId(request),
                           data: {network: aNetwork.toJSON(),
                                  threshold: aThreshold,
                                  startTimestamp: aOptions.startTime,
                                  data: aOptions.data,
                                  manifestURL: this._manifestURL,
                                  pageURL: this._pageURL}});
    return request;
  },

  getAllAlarms: function(aNetwork) {
    let network = null;
    if (aNetwork) {
      network = aNetwork.toJSON();
    }

    let request = this.createRequest();
    cpmm.sendAsyncMessage("NetworkStats:GetAlarms",
                          {id: this.getRequestId(request),
                           data: {network: network,
                                  manifestURL: this._manifestURL}});
    return request;
  },

  removeAlarms: function(aAlarmId) {
    if (aAlarmId == 0) {
      aAlarmId = -1;
    }

    let request = this.createRequest();
    cpmm.sendAsyncMessage("NetworkStats:RemoveAlarms",
                          {id: this.getRequestId(request),
                           data: {alarmId: aAlarmId,
                                  manifestURL: this._manifestURL}});

    return request;
  },

  getAvailableNetworks: function() {
    let request = this.createRequest();
    cpmm.sendAsyncMessage("NetworkStats:GetAvailableNetworks", {
      id: this.getRequestId(request),
    });
    return request;
  },

  getAvailableServiceTypes: function() {
    let request = this.createRequest();
    cpmm.sendAsyncMessage("NetworkStats:GetAvailableServiceTypes", {
      id: this.getRequestId(request),
    });
    return request;
  },

  get sampleRate() {
    return cpmm.sendSyncMessage("NetworkStats:SampleRate")[0];
  },

  get maxStorageAge() {
    return cpmm.sendSyncMessage("NetworkStats:MaxStorageAge")[0];
  },

  receiveMessage: function(aMessage) {
    if (DEBUG) {
      debug("NetworkStatsmanager::receiveMessage: " + aMessage.name);
    }

    let msg = aMessage.json;
    let req = this.takeRequest(msg.id);
    if (!req) {
      if (DEBUG) {
        debug("No request stored with id " + msg.id);
      }
      return;
    }

    switch (aMessage.name) {
      case "NetworkStats:Get:Return":
        if (msg.error) {
          Services.DOMRequest.fireError(req, msg.error);
          return;
        }

        let result = this._window.MozNetworkStats._create(
          this._window, new NetworkStats(this._window, msg.result));
        if (DEBUG) {
          debug("result: " + JSON.stringify(result));
        }
        Services.DOMRequest.fireSuccess(req, result);
        break;

      case "NetworkStats:GetAvailableNetworks:Return":
        if (msg.error) {
          Services.DOMRequest.fireError(req, msg.error);
          return;
        }

        let networks = new this._window.Array();
        for (let i = 0; i < msg.result.length; i++) {
          let network = new this._window.MozNetworkStatsInterface(msg.result[i]);
          networks.push(network);
        }

        Services.DOMRequest.fireSuccess(req, networks);
        break;

      case "NetworkStats:GetAvailableServiceTypes:Return":
        if (msg.error) {
          Services.DOMRequest.fireError(req, msg.error);
          return;
        }

        let serviceTypes = new this._window.Array();
        for (let i = 0; i < msg.result.length; i++) {
          serviceTypes.push(msg.result[i]);
        }

        Services.DOMRequest.fireSuccess(req, serviceTypes);
        break;

      case "NetworkStats:Clear:Return":
      case "NetworkStats:ClearAll:Return":
        if (msg.error) {
          Services.DOMRequest.fireError(req, msg.error);
          return;
        }

        Services.DOMRequest.fireSuccess(req, true);
        break;

      case "NetworkStats:SetAlarm:Return":
      case "NetworkStats:RemoveAlarms:Return":
        if (msg.error) {
          Services.DOMRequest.fireError(req, msg.error);
          return;
        }

        Services.DOMRequest.fireSuccess(req, msg.result);
        break;

      case "NetworkStats:GetAlarms:Return":
        if (msg.error) {
          Services.DOMRequest.fireError(req, msg.error);
          return;
        }

        let alarms = new this._window.Array();
        for (let i = 0; i < msg.result.length; i++) {
          // The WebIDL type of data is any, so we should manually clone it
          // into the content window.
          if ("data" in msg.result[i]) {
            msg.result[i].data = Cu.cloneInto(msg.result[i].data, this._window);
          }
          let alarm = new NetworkStatsAlarm(this._window, msg.result[i]);
          alarms.push(this._window.MozNetworkStatsAlarm._create(this._window, alarm));
        }

        Services.DOMRequest.fireSuccess(req, alarms);
        break;

      default:
        if (DEBUG) {
          debug("Wrong message: " + aMessage.name);
        }
    }
  },

  init: function(aWindow) {
    this.initDOMRequestHelper(aWindow, ["NetworkStats:Get:Return",
                                        "NetworkStats:GetAvailableNetworks:Return",
                                        "NetworkStats:GetAvailableServiceTypes:Return",
                                        "NetworkStats:Clear:Return",
                                        "NetworkStats:ClearAll:Return",
                                        "NetworkStats:SetAlarm:Return",
                                        "NetworkStats:GetAlarms:Return",
                                        "NetworkStats:RemoveAlarms:Return"]);

    // Init app properties.
    let principal = aWindow.document.nodePrincipal;
    let appsService = Cc["@mozilla.org/AppsService;1"]
                        .getService(Ci.nsIAppsService);

    this._manifestURL = appsService.getManifestURLByLocalId(principal.appId);

    let isApp = !!this._manifestURL.length;
    if (isApp) {
      this._pageURL = principal.URI.spec;
    }
  },

  // Called from DOMRequestIpcHelper
  uninit: function() {
    if (DEBUG) {
      debug("uninit call");
    }
  },

  classID : NETWORKSTATSMANAGER_CID,
  contractID: NETWORKSTATSMANAGER_CONTRACTID,
  QueryInterface : XPCOMUtils.generateQI([Ci.nsIDOMGlobalPropertyInitializer,
                                          Ci.nsISupportsWeakReference,
                                          Ci.nsIObserver]),
}

this.NSGetFactory = XPCOMUtils.generateNSGetFactory([NetworkStatsAlarm,
                                                     NetworkStatsData,
                                                     NetworkStatsInterface,
                                                     NetworkStats,
                                                     NetworkStatsManager]);
