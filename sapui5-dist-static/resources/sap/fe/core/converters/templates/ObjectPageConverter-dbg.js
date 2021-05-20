sap.ui.define(["../controls/ObjectPage/SubSection", "../controls/ObjectPage/HeaderFacet", "./BaseConverter", "../helpers/ID", "../helpers/ConfigurableObject", "sap/fe/core/converters/controls/Common/Action", "sap/fe/core/converters/objectPage/HeaderAndFooterAction", "sap/fe/core/helpers/BindingExpression"], function (SubSection, HeaderFacet, BaseConverter, ID, ConfigurableObject, Action, HeaderAndFooterAction, BindingExpression) {
  "use strict";

  var _exports = {};
  var not = BindingExpression.not;
  var equal = BindingExpression.equal;
  var compileBinding = BindingExpression.compileBinding;
  var annotationExpression = BindingExpression.annotationExpression;
  var getHiddenHeaderActions = HeaderAndFooterAction.getHiddenHeaderActions;
  var getFooterDefaultActions = HeaderAndFooterAction.getFooterDefaultActions;
  var getHeaderDefaultActions = HeaderAndFooterAction.getHeaderDefaultActions;
  var removeDuplicateActions = Action.removeDuplicateActions;
  var getActionsFromManifest = Action.getActionsFromManifest;
  var Placement = ConfigurableObject.Placement;
  var insertCustomElements = ConfigurableObject.insertCustomElements;
  var SectionID = ID.SectionID;
  var EditableHeaderSectionID = ID.EditableHeaderSectionID;
  var CustomSectionID = ID.CustomSectionID;
  var TemplateType = BaseConverter.TemplateType;
  var getHeaderFacetsFromManifest = HeaderFacet.getHeaderFacetsFromManifest;
  var getHeaderFacetsFromAnnotations = HeaderFacet.getHeaderFacetsFromAnnotations;
  var createSubSections = SubSection.createSubSections;
  var createCustomSubSections = SubSection.createCustomSubSections;

  function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

  function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  var getSectionKey = function (facetDefinition, fallback) {
    var _facetDefinition$ID, _facetDefinition$Labe;

    return ((_facetDefinition$ID = facetDefinition.ID) === null || _facetDefinition$ID === void 0 ? void 0 : _facetDefinition$ID.toString()) || ((_facetDefinition$Labe = facetDefinition.Label) === null || _facetDefinition$Labe === void 0 ? void 0 : _facetDefinition$Labe.toString()) || fallback;
  };
  /**
   * Create a section that represents the editable header part, it is only visible in edit mode.
   *
   * @param converterContext
   * @param headerFacets
   * @returns {ObjectPageSection} the section representing the editable header parts
   */


  function createEditableHeaderSection(converterContext, headerFacets) {
    var editableHeaderSectionID = EditableHeaderSectionID();
    var headerSection = {
      id: editableHeaderSectionID,
      key: "EditableHeaderContent",
      title: "{sap.fe.i18n>T_COMMON_OBJECT_PAGE_HEADER_SECTION}",
      visible: "{= ${ui>/editMode} === 'Editable' }",
      subSections: headerFacets ? createSubSections(headerFacets, converterContext) : []
    };
    return headerSection;
  }
  /*
   function createEditableHeaderSection(headerFacets: HeaderFacets, converterContext: ConverterContext): ObjectPageSection {
  	const editableHeaderSectionID = EditableHeaderSectionID();
  	// treat UI.HeaderFacets as CollectionFacet to generate one Form with n FormContainers (instead of n Forms with one FormContainer each)
  	// alternative: define specific ObjectPageEditableHeaderSection type to be used instead of ObjectPageSection
  	const headerFacetWrapper = {
  		$Type: UIAnnotationTypes.CollectionFacet,
  		Facets: headerFacets
  	} as CollectionFacetTypes;
  	const headerSection: ObjectPageSection = {
  		id: editableHeaderSectionID,
  		key: "EditableHeaderContent",
  		title: "{sap.fe.i18n>T_COMMON_OBJECT_PAGE_HEADER_SECTION}",
  		visible: "{= ${ui>/editMode} === 'Editable' }",
  		subSections: createSubSections([headerFacetWrapper], converterContext)
  	};
  	return headerSection;
  }
  */

  /**
   * Creates section definition based on Facet annotation.
   *
   * @param converterContext the converter context
   * @returns {ObjectPageSection[]} all sections
   */


  function getSectionsFromAnnotation(converterContext) {
    var _entityType$annotatio, _entityType$annotatio2, _entityType$annotatio3;

    var entityType = converterContext.getEntityType();
    var objectPageSections = ((_entityType$annotatio = entityType.annotations) === null || _entityType$annotatio === void 0 ? void 0 : (_entityType$annotatio2 = _entityType$annotatio.UI) === null || _entityType$annotatio2 === void 0 ? void 0 : (_entityType$annotatio3 = _entityType$annotatio2.Facets) === null || _entityType$annotatio3 === void 0 ? void 0 : _entityType$annotatio3.map(function (facetDefinition) {
      return getSectionFromAnnotation(facetDefinition, converterContext);
    })) || [];
    return objectPageSections;
  }
  /**
   * Create an annotation based section.
   *
   * @param facet
   * @param converterContext
   * @returns {ObjectPageSection} the current section
   */


  function getSectionFromAnnotation(facet, converterContext) {
    var _facet$annotations, _facet$annotations$UI, _facet$annotations$UI2;

    var sectionID = SectionID({
      Facet: facet
    });
    var section = {
      id: sectionID,
      key: getSectionKey(facet, sectionID),
      title: compileBinding(annotationExpression(facet.Label)),
      showTitle: !!facet.Label,
      visible: compileBinding(not(equal(annotationExpression((_facet$annotations = facet.annotations) === null || _facet$annotations === void 0 ? void 0 : (_facet$annotations$UI = _facet$annotations.UI) === null || _facet$annotations$UI === void 0 ? void 0 : (_facet$annotations$UI2 = _facet$annotations$UI.Hidden) === null || _facet$annotations$UI2 === void 0 ? void 0 : _facet$annotations$UI2.valueOf()), true))),
      subSections: createSubSections([facet], converterContext)
    };
    return section;
  }
  /**
   * Creates section definition based on manifest definition.
   * @param manifestSections the manifest defined sections
   * @param converterContext
   * @returns {Record<string, CustomObjectPageSection>} the manifest defined sections
   */


  function getSectionsFromManifest(manifestSections, converterContext) {
    var sections = {};
    Object.keys(manifestSections).forEach(function (manifestSectionKey) {
      sections[manifestSectionKey] = getSectionFromManifest(manifestSections[manifestSectionKey], manifestSectionKey, converterContext);
    });
    return sections;
  }
  /**
   * Create a manifest based custom section.
   * @param customSectionDefinition
   * @param sectionKey
   * @param converterContext
   * @returns {CustomObjectPageSection} the current custom section
   */


  function getSectionFromManifest(customSectionDefinition, sectionKey, converterContext) {
    var customSectionID = customSectionDefinition.id || CustomSectionID(sectionKey);
    var position = customSectionDefinition.position;

    if (!position) {
      position = {
        placement: Placement.After
      };
    }

    var manifestSubSections;

    if (!customSectionDefinition.subSections) {
      // If there is no subSection defined, we add the content of the custom section as subsections
      // and make sure to set the visibility to 'true', as the actual visibility is handled by the section itself
      manifestSubSections = _defineProperty({}, sectionKey, _objectSpread({}, customSectionDefinition, {
        position: undefined,
        visible: true
      }));
    } else {
      manifestSubSections = customSectionDefinition.subSections;
    }

    var subSections = createCustomSubSections(manifestSubSections, converterContext);
    var customSection = {
      id: customSectionID,
      key: sectionKey,
      title: customSectionDefinition.title,
      showTitle: !!customSectionDefinition.title,
      visible: customSectionDefinition.visible !== undefined ? customSectionDefinition.visible : true,
      position: position,
      subSections: insertCustomElements([], subSections, {
        "title": "overwrite",
        "actions": "merge"
      })
    };
    return customSection;
  }

  var convertPage = function (converterContext) {
    var _entityType$annotatio4, _entityType$annotatio5;

    var manifestWrapper = converterContext.getManifestWrapper();
    var headerSection;
    var entityType = converterContext.getEntityType(); // Retrieve all header facets (from annotations & custom)

    var headerFacets = insertCustomElements(getHeaderFacetsFromAnnotations(converterContext), getHeaderFacetsFromManifest(manifestWrapper.getHeaderFacets()));
    var aAnnotationHeaderActions = getHeaderDefaultActions(converterContext); // Retrieve the page header actions

    var headerActions = insertCustomElements(aAnnotationHeaderActions, getActionsFromManifest(manifestWrapper.getHeaderActions(), converterContext, aAnnotationHeaderActions, undefined, undefined, getHiddenHeaderActions(converterContext)), {
      isNavigable: "overwrite",
      enabled: "overwrite"
    });
    var aAnnotationFooterActions = getFooterDefaultActions(manifestWrapper.getViewLevel(), converterContext); // Retrieve the page footer actions

    var footerActions = insertCustomElements(aAnnotationFooterActions, getActionsFromManifest(manifestWrapper.getFooterActions(), converterContext, aAnnotationFooterActions), {
      isNavigable: "overwrite",
      enabled: "overwrite"
    });

    if (manifestWrapper.isHeaderEditable() && (((_entityType$annotatio4 = entityType.annotations.UI) === null || _entityType$annotatio4 === void 0 ? void 0 : _entityType$annotatio4.HeaderFacets) || ((_entityType$annotatio5 = entityType.annotations.UI) === null || _entityType$annotatio5 === void 0 ? void 0 : _entityType$annotatio5.HeaderInfo))) {
      var _entityType$annotatio6;

      headerSection = createEditableHeaderSection(converterContext, (_entityType$annotatio6 = entityType.annotations.UI) === null || _entityType$annotatio6 === void 0 ? void 0 : _entityType$annotatio6.HeaderFacets);
    }

    var sections = insertCustomElements(getSectionsFromAnnotation(converterContext), getSectionsFromManifest(manifestWrapper.getSections(), converterContext), {
      "title": "overwrite",
      "visible": "overwrite",
      "subSections": {
        "actions": "merge",
        "title": "overwrite",
        "sideContent": "overwrite"
      }
    });
    return {
      template: TemplateType.ObjectPage,
      headerFacets: headerFacets,
      headerSection: headerSection,
      headerActions: removeDuplicateActions(headerActions),
      sections: sections,
      footerActions: footerActions,
      showHeader: manifestWrapper.getShowObjectPageHeader(),
      showAnchorBar: manifestWrapper.getShowAnchorBar(),
      useIconTabBar: manifestWrapper.useIconTabBar()
    };
  };

  _exports.convertPage = convertPage;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk9iamVjdFBhZ2VDb252ZXJ0ZXIudHMiXSwibmFtZXMiOlsiZ2V0U2VjdGlvbktleSIsImZhY2V0RGVmaW5pdGlvbiIsImZhbGxiYWNrIiwiSUQiLCJ0b1N0cmluZyIsIkxhYmVsIiwiY3JlYXRlRWRpdGFibGVIZWFkZXJTZWN0aW9uIiwiY29udmVydGVyQ29udGV4dCIsImhlYWRlckZhY2V0cyIsImVkaXRhYmxlSGVhZGVyU2VjdGlvbklEIiwiRWRpdGFibGVIZWFkZXJTZWN0aW9uSUQiLCJoZWFkZXJTZWN0aW9uIiwiaWQiLCJrZXkiLCJ0aXRsZSIsInZpc2libGUiLCJzdWJTZWN0aW9ucyIsImNyZWF0ZVN1YlNlY3Rpb25zIiwiZ2V0U2VjdGlvbnNGcm9tQW5ub3RhdGlvbiIsImVudGl0eVR5cGUiLCJnZXRFbnRpdHlUeXBlIiwib2JqZWN0UGFnZVNlY3Rpb25zIiwiYW5ub3RhdGlvbnMiLCJVSSIsIkZhY2V0cyIsIm1hcCIsImdldFNlY3Rpb25Gcm9tQW5ub3RhdGlvbiIsImZhY2V0Iiwic2VjdGlvbklEIiwiU2VjdGlvbklEIiwiRmFjZXQiLCJzZWN0aW9uIiwiY29tcGlsZUJpbmRpbmciLCJhbm5vdGF0aW9uRXhwcmVzc2lvbiIsInNob3dUaXRsZSIsIm5vdCIsImVxdWFsIiwiSGlkZGVuIiwidmFsdWVPZiIsImdldFNlY3Rpb25zRnJvbU1hbmlmZXN0IiwibWFuaWZlc3RTZWN0aW9ucyIsInNlY3Rpb25zIiwiT2JqZWN0Iiwia2V5cyIsImZvckVhY2giLCJtYW5pZmVzdFNlY3Rpb25LZXkiLCJnZXRTZWN0aW9uRnJvbU1hbmlmZXN0IiwiY3VzdG9tU2VjdGlvbkRlZmluaXRpb24iLCJzZWN0aW9uS2V5IiwiY3VzdG9tU2VjdGlvbklEIiwiQ3VzdG9tU2VjdGlvbklEIiwicG9zaXRpb24iLCJwbGFjZW1lbnQiLCJQbGFjZW1lbnQiLCJBZnRlciIsIm1hbmlmZXN0U3ViU2VjdGlvbnMiLCJ1bmRlZmluZWQiLCJjcmVhdGVDdXN0b21TdWJTZWN0aW9ucyIsImN1c3RvbVNlY3Rpb24iLCJpbnNlcnRDdXN0b21FbGVtZW50cyIsImNvbnZlcnRQYWdlIiwibWFuaWZlc3RXcmFwcGVyIiwiZ2V0TWFuaWZlc3RXcmFwcGVyIiwiZ2V0SGVhZGVyRmFjZXRzRnJvbUFubm90YXRpb25zIiwiZ2V0SGVhZGVyRmFjZXRzRnJvbU1hbmlmZXN0IiwiZ2V0SGVhZGVyRmFjZXRzIiwiYUFubm90YXRpb25IZWFkZXJBY3Rpb25zIiwiZ2V0SGVhZGVyRGVmYXVsdEFjdGlvbnMiLCJoZWFkZXJBY3Rpb25zIiwiZ2V0QWN0aW9uc0Zyb21NYW5pZmVzdCIsImdldEhlYWRlckFjdGlvbnMiLCJnZXRIaWRkZW5IZWFkZXJBY3Rpb25zIiwiaXNOYXZpZ2FibGUiLCJlbmFibGVkIiwiYUFubm90YXRpb25Gb290ZXJBY3Rpb25zIiwiZ2V0Rm9vdGVyRGVmYXVsdEFjdGlvbnMiLCJnZXRWaWV3TGV2ZWwiLCJmb290ZXJBY3Rpb25zIiwiZ2V0Rm9vdGVyQWN0aW9ucyIsImlzSGVhZGVyRWRpdGFibGUiLCJIZWFkZXJGYWNldHMiLCJIZWFkZXJJbmZvIiwiZ2V0U2VjdGlvbnMiLCJ0ZW1wbGF0ZSIsIlRlbXBsYXRlVHlwZSIsIk9iamVjdFBhZ2UiLCJyZW1vdmVEdXBsaWNhdGVBY3Rpb25zIiwic2hvd0hlYWRlciIsImdldFNob3dPYmplY3RQYWdlSGVhZGVyIiwic2hvd0FuY2hvckJhciIsImdldFNob3dBbmNob3JCYXIiLCJ1c2VJY29uVGFiQmFyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUE0QkEsTUFBTUEsYUFBYSxHQUFHLFVBQUNDLGVBQUQsRUFBOEJDLFFBQTlCLEVBQTJEO0FBQUE7O0FBQ2hGLFdBQU8sd0JBQUFELGVBQWUsQ0FBQ0UsRUFBaEIsNEVBQW9CQyxRQUFwQixpQ0FBa0NILGVBQWUsQ0FBQ0ksS0FBbEQsMERBQWtDLHNCQUF1QkQsUUFBdkIsRUFBbEMsS0FBdUVGLFFBQTlFO0FBQ0EsR0FGRDtBQUlBOzs7Ozs7Ozs7QUFPQSxX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LEdBaEVNIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBGYWNldFR5cGVzLCBIZWFkZXJGYWNldHMgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXNcIjtcbmltcG9ydCB7IE1hbmlmZXN0U2VjdGlvbiwgTWFuaWZlc3RTdWJTZWN0aW9uIH0gZnJvbSBcIi4uL01hbmlmZXN0U2V0dGluZ3NcIjtcbmltcG9ydCB7IFBhZ2VEZWZpbml0aW9uIH0gZnJvbSBcIi4uL1RlbXBsYXRlQ29udmVydGVyXCI7XG5pbXBvcnQgeyBFbnRpdHlUeXBlIH0gZnJvbSBcIkBzYXAtdXgvYW5ub3RhdGlvbi1jb252ZXJ0ZXJcIjtcbmltcG9ydCB7IGNyZWF0ZUN1c3RvbVN1YlNlY3Rpb25zLCBjcmVhdGVTdWJTZWN0aW9ucywgQ3VzdG9tT2JqZWN0UGFnZVNlY3Rpb24sIE9iamVjdFBhZ2VTZWN0aW9uIH0gZnJvbSBcIi4uL2NvbnRyb2xzL09iamVjdFBhZ2UvU3ViU2VjdGlvblwiO1xuaW1wb3J0IHsgZ2V0SGVhZGVyRmFjZXRzRnJvbUFubm90YXRpb25zLCBnZXRIZWFkZXJGYWNldHNGcm9tTWFuaWZlc3QsIE9iamVjdFBhZ2VIZWFkZXJGYWNldCB9IGZyb20gXCIuLi9jb250cm9scy9PYmplY3RQYWdlL0hlYWRlckZhY2V0XCI7XG5pbXBvcnQgeyBDb252ZXJ0ZXJDb250ZXh0LCBUZW1wbGF0ZVR5cGUgfSBmcm9tIFwiLi9CYXNlQ29udmVydGVyXCI7XG5pbXBvcnQgeyBDdXN0b21TZWN0aW9uSUQsIEVkaXRhYmxlSGVhZGVyU2VjdGlvbklELCBTZWN0aW9uSUQgfSBmcm9tIFwiLi4vaGVscGVycy9JRFwiO1xuaW1wb3J0IHsgQ29uZmlndXJhYmxlUmVjb3JkLCBpbnNlcnRDdXN0b21FbGVtZW50cywgUGxhY2VtZW50LCBQb3NpdGlvbiB9IGZyb20gXCIuLi9oZWxwZXJzL0NvbmZpZ3VyYWJsZU9iamVjdFwiO1xuaW1wb3J0IHsgQmFzZUFjdGlvbiwgZ2V0QWN0aW9uc0Zyb21NYW5pZmVzdCwgcmVtb3ZlRHVwbGljYXRlQWN0aW9ucyB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2NvbnRyb2xzL0NvbW1vbi9BY3Rpb25cIjtcbmltcG9ydCB7XG5cdGdldEhlYWRlckRlZmF1bHRBY3Rpb25zLFxuXHRnZXRGb290ZXJEZWZhdWx0QWN0aW9ucyxcblx0Z2V0SGlkZGVuSGVhZGVyQWN0aW9uc1xufSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9vYmplY3RQYWdlL0hlYWRlckFuZEZvb3RlckFjdGlvblwiO1xuaW1wb3J0IHsgYW5ub3RhdGlvbkV4cHJlc3Npb24sIGNvbXBpbGVCaW5kaW5nLCBlcXVhbCwgbm90IH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQmluZGluZ0V4cHJlc3Npb25cIjtcblxuZXhwb3J0IHR5cGUgT2JqZWN0UGFnZURlZmluaXRpb24gPSBQYWdlRGVmaW5pdGlvbiAmIHtcblx0aGVhZGVyRmFjZXRzOiBPYmplY3RQYWdlSGVhZGVyRmFjZXRbXTtcblx0aGVhZGVyU2VjdGlvbj86IE9iamVjdFBhZ2VTZWN0aW9uO1xuXHRoZWFkZXJBY3Rpb25zOiBCYXNlQWN0aW9uW107XG5cdHNlY3Rpb25zOiBPYmplY3RQYWdlU2VjdGlvbltdO1xuXHRmb290ZXJBY3Rpb25zOiBCYXNlQWN0aW9uW107XG5cdHNob3dIZWFkZXI6IGJvb2xlYW47XG5cdHNob3dBbmNob3JCYXI6IGJvb2xlYW47XG5cdHVzZUljb25UYWJCYXI6IGJvb2xlYW47XG59O1xuXG5jb25zdCBnZXRTZWN0aW9uS2V5ID0gKGZhY2V0RGVmaW5pdGlvbjogRmFjZXRUeXBlcywgZmFsbGJhY2s6IHN0cmluZyk6IHN0cmluZyA9PiB7XG5cdHJldHVybiBmYWNldERlZmluaXRpb24uSUQ/LnRvU3RyaW5nKCkgfHwgZmFjZXREZWZpbml0aW9uLkxhYmVsPy50b1N0cmluZygpIHx8IGZhbGxiYWNrO1xufTtcblxuLyoqXG4gKiBDcmVhdGUgYSBzZWN0aW9uIHRoYXQgcmVwcmVzZW50cyB0aGUgZWRpdGFibGUgaGVhZGVyIHBhcnQsIGl0IGlzIG9ubHkgdmlzaWJsZSBpbiBlZGl0IG1vZGUuXG4gKlxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHRcbiAqIEBwYXJhbSBoZWFkZXJGYWNldHNcbiAqIEByZXR1cm5zIHtPYmplY3RQYWdlU2VjdGlvbn0gdGhlIHNlY3Rpb24gcmVwcmVzZW50aW5nIHRoZSBlZGl0YWJsZSBoZWFkZXIgcGFydHNcbiAqL1xuZnVuY3Rpb24gY3JlYXRlRWRpdGFibGVIZWFkZXJTZWN0aW9uKGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsIGhlYWRlckZhY2V0cz86IEhlYWRlckZhY2V0cyk6IE9iamVjdFBhZ2VTZWN0aW9uIHtcblx0Y29uc3QgZWRpdGFibGVIZWFkZXJTZWN0aW9uSUQgPSBFZGl0YWJsZUhlYWRlclNlY3Rpb25JRCgpO1xuXHRjb25zdCBoZWFkZXJTZWN0aW9uOiBPYmplY3RQYWdlU2VjdGlvbiA9IHtcblx0XHRpZDogZWRpdGFibGVIZWFkZXJTZWN0aW9uSUQsXG5cdFx0a2V5OiBcIkVkaXRhYmxlSGVhZGVyQ29udGVudFwiLFxuXHRcdHRpdGxlOiBcIntzYXAuZmUuaTE4bj5UX0NPTU1PTl9PQkpFQ1RfUEFHRV9IRUFERVJfU0VDVElPTn1cIixcblx0XHR2aXNpYmxlOiBcIns9ICR7dWk+L2VkaXRNb2RlfSA9PT0gJ0VkaXRhYmxlJyB9XCIsXG5cdFx0c3ViU2VjdGlvbnM6IGhlYWRlckZhY2V0cyA/IGNyZWF0ZVN1YlNlY3Rpb25zKGhlYWRlckZhY2V0cywgY29udmVydGVyQ29udGV4dCkgOiBbXVxuXHR9O1xuXHRyZXR1cm4gaGVhZGVyU2VjdGlvbjtcbn1cbi8qXG4gZnVuY3Rpb24gY3JlYXRlRWRpdGFibGVIZWFkZXJTZWN0aW9uKGhlYWRlckZhY2V0czogSGVhZGVyRmFjZXRzLCBjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0KTogT2JqZWN0UGFnZVNlY3Rpb24ge1xuXHRjb25zdCBlZGl0YWJsZUhlYWRlclNlY3Rpb25JRCA9IEVkaXRhYmxlSGVhZGVyU2VjdGlvbklEKCk7XG5cdC8vIHRyZWF0IFVJLkhlYWRlckZhY2V0cyBhcyBDb2xsZWN0aW9uRmFjZXQgdG8gZ2VuZXJhdGUgb25lIEZvcm0gd2l0aCBuIEZvcm1Db250YWluZXJzIChpbnN0ZWFkIG9mIG4gRm9ybXMgd2l0aCBvbmUgRm9ybUNvbnRhaW5lciBlYWNoKVxuXHQvLyBhbHRlcm5hdGl2ZTogZGVmaW5lIHNwZWNpZmljIE9iamVjdFBhZ2VFZGl0YWJsZUhlYWRlclNlY3Rpb24gdHlwZSB0byBiZSB1c2VkIGluc3RlYWQgb2YgT2JqZWN0UGFnZVNlY3Rpb25cblx0Y29uc3QgaGVhZGVyRmFjZXRXcmFwcGVyID0ge1xuXHRcdCRUeXBlOiBVSUFubm90YXRpb25UeXBlcy5Db2xsZWN0aW9uRmFjZXQsXG5cdFx0RmFjZXRzOiBoZWFkZXJGYWNldHNcblx0fSBhcyBDb2xsZWN0aW9uRmFjZXRUeXBlcztcblx0Y29uc3QgaGVhZGVyU2VjdGlvbjogT2JqZWN0UGFnZVNlY3Rpb24gPSB7XG5cdFx0aWQ6IGVkaXRhYmxlSGVhZGVyU2VjdGlvbklELFxuXHRcdGtleTogXCJFZGl0YWJsZUhlYWRlckNvbnRlbnRcIixcblx0XHR0aXRsZTogXCJ7c2FwLmZlLmkxOG4+VF9DT01NT05fT0JKRUNUX1BBR0VfSEVBREVSX1NFQ1RJT059XCIsXG5cdFx0dmlzaWJsZTogXCJ7PSAke3VpPi9lZGl0TW9kZX0gPT09ICdFZGl0YWJsZScgfVwiLFxuXHRcdHN1YlNlY3Rpb25zOiBjcmVhdGVTdWJTZWN0aW9ucyhbaGVhZGVyRmFjZXRXcmFwcGVyXSwgY29udmVydGVyQ29udGV4dClcblx0fTtcblx0cmV0dXJuIGhlYWRlclNlY3Rpb247XG59XG4qL1xuXG4vKipcbiAqIENyZWF0ZXMgc2VjdGlvbiBkZWZpbml0aW9uIGJhc2VkIG9uIEZhY2V0IGFubm90YXRpb24uXG4gKlxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHQgdGhlIGNvbnZlcnRlciBjb250ZXh0XG4gKiBAcmV0dXJucyB7T2JqZWN0UGFnZVNlY3Rpb25bXX0gYWxsIHNlY3Rpb25zXG4gKi9cbmZ1bmN0aW9uIGdldFNlY3Rpb25zRnJvbUFubm90YXRpb24oY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCk6IE9iamVjdFBhZ2VTZWN0aW9uW10ge1xuXHRjb25zdCBlbnRpdHlUeXBlID0gY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlKCk7XG5cdGNvbnN0IG9iamVjdFBhZ2VTZWN0aW9uczogT2JqZWN0UGFnZVNlY3Rpb25bXSA9XG5cdFx0ZW50aXR5VHlwZS5hbm5vdGF0aW9ucz8uVUk/LkZhY2V0cz8ubWFwKChmYWNldERlZmluaXRpb246IEZhY2V0VHlwZXMpID0+XG5cdFx0XHRnZXRTZWN0aW9uRnJvbUFubm90YXRpb24oZmFjZXREZWZpbml0aW9uLCBjb252ZXJ0ZXJDb250ZXh0KVxuXHRcdCkgfHwgW107XG5cdHJldHVybiBvYmplY3RQYWdlU2VjdGlvbnM7XG59XG5cbi8qKlxuICogQ3JlYXRlIGFuIGFubm90YXRpb24gYmFzZWQgc2VjdGlvbi5cbiAqXG4gKiBAcGFyYW0gZmFjZXRcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0XG4gKiBAcmV0dXJucyB7T2JqZWN0UGFnZVNlY3Rpb259IHRoZSBjdXJyZW50IHNlY3Rpb25cbiAqL1xuZnVuY3Rpb24gZ2V0U2VjdGlvbkZyb21Bbm5vdGF0aW9uKGZhY2V0OiBGYWNldFR5cGVzLCBjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0KTogT2JqZWN0UGFnZVNlY3Rpb24ge1xuXHRjb25zdCBzZWN0aW9uSUQgPSBTZWN0aW9uSUQoeyBGYWNldDogZmFjZXQgfSk7XG5cdGNvbnN0IHNlY3Rpb246IE9iamVjdFBhZ2VTZWN0aW9uID0ge1xuXHRcdGlkOiBzZWN0aW9uSUQsXG5cdFx0a2V5OiBnZXRTZWN0aW9uS2V5KGZhY2V0LCBzZWN0aW9uSUQpLFxuXHRcdHRpdGxlOiBjb21waWxlQmluZGluZyhhbm5vdGF0aW9uRXhwcmVzc2lvbihmYWNldC5MYWJlbCkpLFxuXHRcdHNob3dUaXRsZTogISFmYWNldC5MYWJlbCxcblx0XHR2aXNpYmxlOiBjb21waWxlQmluZGluZyhub3QoZXF1YWwoYW5ub3RhdGlvbkV4cHJlc3Npb24oZmFjZXQuYW5ub3RhdGlvbnM/LlVJPy5IaWRkZW4/LnZhbHVlT2YoKSksIHRydWUpKSksXG5cdFx0c3ViU2VjdGlvbnM6IGNyZWF0ZVN1YlNlY3Rpb25zKFtmYWNldF0sIGNvbnZlcnRlckNvbnRleHQpXG5cdH07XG5cdHJldHVybiBzZWN0aW9uO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgc2VjdGlvbiBkZWZpbml0aW9uIGJhc2VkIG9uIG1hbmlmZXN0IGRlZmluaXRpb24uXG4gKiBAcGFyYW0gbWFuaWZlc3RTZWN0aW9ucyB0aGUgbWFuaWZlc3QgZGVmaW5lZCBzZWN0aW9uc1xuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHRcbiAqIEByZXR1cm5zIHtSZWNvcmQ8c3RyaW5nLCBDdXN0b21PYmplY3RQYWdlU2VjdGlvbj59IHRoZSBtYW5pZmVzdCBkZWZpbmVkIHNlY3Rpb25zXG4gKi9cbmZ1bmN0aW9uIGdldFNlY3Rpb25zRnJvbU1hbmlmZXN0KFxuXHRtYW5pZmVzdFNlY3Rpb25zOiBDb25maWd1cmFibGVSZWNvcmQ8TWFuaWZlc3RTZWN0aW9uPixcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dFxuKTogUmVjb3JkPHN0cmluZywgQ3VzdG9tT2JqZWN0UGFnZVNlY3Rpb24+IHtcblx0Y29uc3Qgc2VjdGlvbnM6IFJlY29yZDxzdHJpbmcsIEN1c3RvbU9iamVjdFBhZ2VTZWN0aW9uPiA9IHt9O1xuXHRPYmplY3Qua2V5cyhtYW5pZmVzdFNlY3Rpb25zKS5mb3JFYWNoKG1hbmlmZXN0U2VjdGlvbktleSA9PiB7XG5cdFx0c2VjdGlvbnNbbWFuaWZlc3RTZWN0aW9uS2V5XSA9IGdldFNlY3Rpb25Gcm9tTWFuaWZlc3QobWFuaWZlc3RTZWN0aW9uc1ttYW5pZmVzdFNlY3Rpb25LZXldLCBtYW5pZmVzdFNlY3Rpb25LZXksIGNvbnZlcnRlckNvbnRleHQpO1xuXHR9KTtcblx0cmV0dXJuIHNlY3Rpb25zO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhIG1hbmlmZXN0IGJhc2VkIGN1c3RvbSBzZWN0aW9uLlxuICogQHBhcmFtIGN1c3RvbVNlY3Rpb25EZWZpbml0aW9uXG4gKiBAcGFyYW0gc2VjdGlvbktleVxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHRcbiAqIEByZXR1cm5zIHtDdXN0b21PYmplY3RQYWdlU2VjdGlvbn0gdGhlIGN1cnJlbnQgY3VzdG9tIHNlY3Rpb25cbiAqL1xuZnVuY3Rpb24gZ2V0U2VjdGlvbkZyb21NYW5pZmVzdChcblx0Y3VzdG9tU2VjdGlvbkRlZmluaXRpb246IE1hbmlmZXN0U2VjdGlvbixcblx0c2VjdGlvbktleTogc3RyaW5nLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0XG4pOiBDdXN0b21PYmplY3RQYWdlU2VjdGlvbiB7XG5cdGNvbnN0IGN1c3RvbVNlY3Rpb25JRCA9IGN1c3RvbVNlY3Rpb25EZWZpbml0aW9uLmlkIHx8IEN1c3RvbVNlY3Rpb25JRChzZWN0aW9uS2V5KTtcblx0bGV0IHBvc2l0aW9uOiBQb3NpdGlvbiB8IHVuZGVmaW5lZCA9IGN1c3RvbVNlY3Rpb25EZWZpbml0aW9uLnBvc2l0aW9uO1xuXHRpZiAoIXBvc2l0aW9uKSB7XG5cdFx0cG9zaXRpb24gPSB7XG5cdFx0XHRwbGFjZW1lbnQ6IFBsYWNlbWVudC5BZnRlclxuXHRcdH07XG5cdH1cblx0bGV0IG1hbmlmZXN0U3ViU2VjdGlvbnM6IFJlY29yZDxzdHJpbmcsIE1hbmlmZXN0U3ViU2VjdGlvbj47XG5cdGlmICghY3VzdG9tU2VjdGlvbkRlZmluaXRpb24uc3ViU2VjdGlvbnMpIHtcblx0XHQvLyBJZiB0aGVyZSBpcyBubyBzdWJTZWN0aW9uIGRlZmluZWQsIHdlIGFkZCB0aGUgY29udGVudCBvZiB0aGUgY3VzdG9tIHNlY3Rpb24gYXMgc3Vic2VjdGlvbnNcblx0XHQvLyBhbmQgbWFrZSBzdXJlIHRvIHNldCB0aGUgdmlzaWJpbGl0eSB0byAndHJ1ZScsIGFzIHRoZSBhY3R1YWwgdmlzaWJpbGl0eSBpcyBoYW5kbGVkIGJ5IHRoZSBzZWN0aW9uIGl0c2VsZlxuXHRcdG1hbmlmZXN0U3ViU2VjdGlvbnMgPSB7XG5cdFx0XHRbc2VjdGlvbktleV06IHtcblx0XHRcdFx0Li4uY3VzdG9tU2VjdGlvbkRlZmluaXRpb24sXG5cdFx0XHRcdHBvc2l0aW9uOiB1bmRlZmluZWQsXG5cdFx0XHRcdHZpc2libGU6IHRydWVcblx0XHRcdH1cblx0XHR9O1xuXHR9IGVsc2Uge1xuXHRcdG1hbmlmZXN0U3ViU2VjdGlvbnMgPSBjdXN0b21TZWN0aW9uRGVmaW5pdGlvbi5zdWJTZWN0aW9ucztcblx0fVxuXHRjb25zdCBzdWJTZWN0aW9ucyA9IGNyZWF0ZUN1c3RvbVN1YlNlY3Rpb25zKG1hbmlmZXN0U3ViU2VjdGlvbnMsIGNvbnZlcnRlckNvbnRleHQpO1xuXG5cdGNvbnN0IGN1c3RvbVNlY3Rpb246IEN1c3RvbU9iamVjdFBhZ2VTZWN0aW9uID0ge1xuXHRcdGlkOiBjdXN0b21TZWN0aW9uSUQsXG5cdFx0a2V5OiBzZWN0aW9uS2V5LFxuXHRcdHRpdGxlOiBjdXN0b21TZWN0aW9uRGVmaW5pdGlvbi50aXRsZSxcblx0XHRzaG93VGl0bGU6ICEhY3VzdG9tU2VjdGlvbkRlZmluaXRpb24udGl0bGUsXG5cdFx0dmlzaWJsZTogY3VzdG9tU2VjdGlvbkRlZmluaXRpb24udmlzaWJsZSAhPT0gdW5kZWZpbmVkID8gY3VzdG9tU2VjdGlvbkRlZmluaXRpb24udmlzaWJsZSA6IHRydWUsXG5cdFx0cG9zaXRpb246IHBvc2l0aW9uLFxuXHRcdHN1YlNlY3Rpb25zOiBpbnNlcnRDdXN0b21FbGVtZW50cyhbXSwgc3ViU2VjdGlvbnMsIHsgXCJ0aXRsZVwiOiBcIm92ZXJ3cml0ZVwiLCBcImFjdGlvbnNcIjogXCJtZXJnZVwiIH0pXG5cdH07XG5cdHJldHVybiBjdXN0b21TZWN0aW9uO1xufVxuZXhwb3J0IGNvbnN0IGNvbnZlcnRQYWdlID0gZnVuY3Rpb24oY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCk6IE9iamVjdFBhZ2VEZWZpbml0aW9uIHtcblx0Y29uc3QgbWFuaWZlc3RXcmFwcGVyID0gY29udmVydGVyQ29udGV4dC5nZXRNYW5pZmVzdFdyYXBwZXIoKTtcblx0bGV0IGhlYWRlclNlY3Rpb246IE9iamVjdFBhZ2VTZWN0aW9uIHwgdW5kZWZpbmVkO1xuXHRjb25zdCBlbnRpdHlUeXBlOiBFbnRpdHlUeXBlID0gY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlKCk7XG5cdC8vIFJldHJpZXZlIGFsbCBoZWFkZXIgZmFjZXRzIChmcm9tIGFubm90YXRpb25zICYgY3VzdG9tKVxuXHRjb25zdCBoZWFkZXJGYWNldHMgPSBpbnNlcnRDdXN0b21FbGVtZW50cyhcblx0XHRnZXRIZWFkZXJGYWNldHNGcm9tQW5ub3RhdGlvbnMoY29udmVydGVyQ29udGV4dCksXG5cdFx0Z2V0SGVhZGVyRmFjZXRzRnJvbU1hbmlmZXN0KG1hbmlmZXN0V3JhcHBlci5nZXRIZWFkZXJGYWNldHMoKSlcblx0KTtcblxuXHRjb25zdCBhQW5ub3RhdGlvbkhlYWRlckFjdGlvbnM6IEJhc2VBY3Rpb25bXSA9IGdldEhlYWRlckRlZmF1bHRBY3Rpb25zKGNvbnZlcnRlckNvbnRleHQpO1xuXG5cdC8vIFJldHJpZXZlIHRoZSBwYWdlIGhlYWRlciBhY3Rpb25zXG5cdGNvbnN0IGhlYWRlckFjdGlvbnMgPSBpbnNlcnRDdXN0b21FbGVtZW50cyhcblx0XHRhQW5ub3RhdGlvbkhlYWRlckFjdGlvbnMsXG5cdFx0Z2V0QWN0aW9uc0Zyb21NYW5pZmVzdChcblx0XHRcdG1hbmlmZXN0V3JhcHBlci5nZXRIZWFkZXJBY3Rpb25zKCksXG5cdFx0XHRjb252ZXJ0ZXJDb250ZXh0LFxuXHRcdFx0YUFubm90YXRpb25IZWFkZXJBY3Rpb25zLFxuXHRcdFx0dW5kZWZpbmVkLFxuXHRcdFx0dW5kZWZpbmVkLFxuXHRcdFx0Z2V0SGlkZGVuSGVhZGVyQWN0aW9ucyhjb252ZXJ0ZXJDb250ZXh0KVxuXHRcdCksXG5cdFx0eyBpc05hdmlnYWJsZTogXCJvdmVyd3JpdGVcIiwgZW5hYmxlZDogXCJvdmVyd3JpdGVcIiB9XG5cdCk7XG5cblx0Y29uc3QgYUFubm90YXRpb25Gb290ZXJBY3Rpb25zOiBCYXNlQWN0aW9uW10gPSBnZXRGb290ZXJEZWZhdWx0QWN0aW9ucyhtYW5pZmVzdFdyYXBwZXIuZ2V0Vmlld0xldmVsKCksIGNvbnZlcnRlckNvbnRleHQpO1xuXG5cdC8vIFJldHJpZXZlIHRoZSBwYWdlIGZvb3RlciBhY3Rpb25zXG5cdGNvbnN0IGZvb3RlckFjdGlvbnMgPSBpbnNlcnRDdXN0b21FbGVtZW50cyhcblx0XHRhQW5ub3RhdGlvbkZvb3RlckFjdGlvbnMsXG5cdFx0Z2V0QWN0aW9uc0Zyb21NYW5pZmVzdChtYW5pZmVzdFdyYXBwZXIuZ2V0Rm9vdGVyQWN0aW9ucygpLCBjb252ZXJ0ZXJDb250ZXh0LCBhQW5ub3RhdGlvbkZvb3RlckFjdGlvbnMpLFxuXHRcdHsgaXNOYXZpZ2FibGU6IFwib3ZlcndyaXRlXCIsIGVuYWJsZWQ6IFwib3ZlcndyaXRlXCIgfVxuXHQpO1xuXG5cdGlmIChtYW5pZmVzdFdyYXBwZXIuaXNIZWFkZXJFZGl0YWJsZSgpICYmIChlbnRpdHlUeXBlLmFubm90YXRpb25zLlVJPy5IZWFkZXJGYWNldHMgfHwgZW50aXR5VHlwZS5hbm5vdGF0aW9ucy5VST8uSGVhZGVySW5mbykpIHtcblx0XHRoZWFkZXJTZWN0aW9uID0gY3JlYXRlRWRpdGFibGVIZWFkZXJTZWN0aW9uKGNvbnZlcnRlckNvbnRleHQsIGVudGl0eVR5cGUuYW5ub3RhdGlvbnMuVUk/LkhlYWRlckZhY2V0cyk7XG5cdH1cblxuXHRjb25zdCBzZWN0aW9ucyA9IGluc2VydEN1c3RvbUVsZW1lbnRzKFxuXHRcdGdldFNlY3Rpb25zRnJvbUFubm90YXRpb24oY29udmVydGVyQ29udGV4dCksXG5cdFx0Z2V0U2VjdGlvbnNGcm9tTWFuaWZlc3QobWFuaWZlc3RXcmFwcGVyLmdldFNlY3Rpb25zKCksIGNvbnZlcnRlckNvbnRleHQpLFxuXHRcdHtcblx0XHRcdFwidGl0bGVcIjogXCJvdmVyd3JpdGVcIixcblx0XHRcdFwidmlzaWJsZVwiOiBcIm92ZXJ3cml0ZVwiLFxuXHRcdFx0XCJzdWJTZWN0aW9uc1wiOiB7XG5cdFx0XHRcdFwiYWN0aW9uc1wiOiBcIm1lcmdlXCIsXG5cdFx0XHRcdFwidGl0bGVcIjogXCJvdmVyd3JpdGVcIixcblx0XHRcdFx0XCJzaWRlQ29udGVudFwiOiBcIm92ZXJ3cml0ZVwiXG5cdFx0XHR9XG5cdFx0fVxuXHQpO1xuXG5cdHJldHVybiB7XG5cdFx0dGVtcGxhdGU6IFRlbXBsYXRlVHlwZS5PYmplY3RQYWdlLFxuXHRcdGhlYWRlckZhY2V0czogaGVhZGVyRmFjZXRzLFxuXHRcdGhlYWRlclNlY3Rpb246IGhlYWRlclNlY3Rpb24sXG5cdFx0aGVhZGVyQWN0aW9uczogcmVtb3ZlRHVwbGljYXRlQWN0aW9ucyhoZWFkZXJBY3Rpb25zKSxcblx0XHRzZWN0aW9uczogc2VjdGlvbnMsXG5cdFx0Zm9vdGVyQWN0aW9uczogZm9vdGVyQWN0aW9ucyxcblx0XHRzaG93SGVhZGVyOiBtYW5pZmVzdFdyYXBwZXIuZ2V0U2hvd09iamVjdFBhZ2VIZWFkZXIoKSxcblx0XHRzaG93QW5jaG9yQmFyOiBtYW5pZmVzdFdyYXBwZXIuZ2V0U2hvd0FuY2hvckJhcigpLFxuXHRcdHVzZUljb25UYWJCYXI6IG1hbmlmZXN0V3JhcHBlci51c2VJY29uVGFiQmFyKClcblx0fTtcbn07XG4iXX0=