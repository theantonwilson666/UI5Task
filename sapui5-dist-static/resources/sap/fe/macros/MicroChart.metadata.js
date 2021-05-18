/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2017 SAP SE. All rights reserved
    
 */
sap.ui.define(["./MacroMetadata"],function(M){"use strict";var a=M.extend("sap.fe.macros.MicroChart",{name:"MicroChart",namespace:"sap.fe.macros",fragment:"sap.fe.macros.MicroChart",metadata:{stereotype:"xmlmacro",designtime:"sap/fe/macros/MicroChart.designtime",properties:{collection:{type:"sap.ui.model.Context",required:true,$kind:["EntitySet","NavigationProperty"]},chartAnnotation:{type:"sap.ui.model.Context",required:true},id:{type:"string"},renderLabels:{type:"boolean",defaultValue:true},groupId:{type:"string",defaultValue:""},title:{type:"string",defaultValue:""},hideOnNoData:{type:"boolean",defaultValue:false},description:{type:"string",defaultValue:""},navigationType:{type:"sap.fe.macros.NavigationType",defaultValue:"None"},onTitlePressed:{type:"string"},chartTitleDescribedBy:{type:"string"},size:{type:"string"},isAnalytics:{type:"boolean",defaultValue:false}},events:{}}});return a;});
