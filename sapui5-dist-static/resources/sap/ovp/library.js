/*!
 * Copyright (c) 2009-2014 SAP SE, All Rights Reserved
 */
sap.ui.define(["sap/ui/core/library","sap/ui/layout/library","sap/ui/generic/app/library","sap/m/library","sap/f/library","sap/ui/comp/library","sap/ui/rta/library","sap/suite/ui/microchart/library","sap/viz/library"],function(){'use strict';sap.ui.getCore().initLibrary({name:"sap.ovp",dependencies:["sap.ui.core","sap.ui.layout","sap.ui.generic.app","sap.m","sap.f","sap.ui.comp","sap.ui.rta","sap.suite.ui.microchart","sap.viz"],types:[],interfaces:[],controls:[],elements:[],version:"1.88.0",extensions:{flChangeHandlers:{"sap.ovp.ui.EasyScanLayout":"sap/ovp/flexibility/EasyScanLayout","sap.ovp.ui.DashboardLayout":"sap/ovp/flexibility/DashboardLayout"},"sap.ui.support":{diagnosticPlugins:["sap/ovp/support/DiagnosticsTool/DiagnosticsTool"]}}});var t=sap.ovp;return t;});