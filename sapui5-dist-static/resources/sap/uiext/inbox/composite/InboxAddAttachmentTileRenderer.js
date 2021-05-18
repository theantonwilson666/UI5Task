/*!
 * SAPUI5

(c) Copyright 2009-2021 SAP SE. All rights reserved
 */
jQuery.sap.declare("sap.uiext.inbox.composite.InboxAddAttachmentTileRenderer");sap.uiext.inbox.composite.InboxAddAttachmentTileRenderer={};
sap.uiext.inbox.composite.InboxAddAttachmentTileRenderer.render=function(r,c){r.write("<span");r.writeControlData(c);r.addClass("sapUiExtInboxAddAttachmentTileLayout");r.writeClasses();r.write(">");r.write("<span>");var C=[];var a={};C.push("sapUiExtInboxAttachmentIcon");r.writeIcon(sap.ui.core.IconPool.getIconURI("add"),C);r.write("</span>");r.write("<span");r.addClass("sapUiExtInboxAddAttachmentText");r.writeClasses();r.write(">");r.write('<a');r.addClass("sapUiExtInboxAttachmentAddLink");r.writeClasses();r.writeAttribute('id',c.getId()+"_textAddAttachment");r.writeAttribute('title',c._oBundle.getText("INBOX_ADD_ATTACHMENT_TOOLTIP"));r.write('>');r.writeEscaped(c._oBundle.getText("INBOX_ADD_ATTACHMENT"));r.write('</a> ');r.write("</span>");r.write("</span>");};
