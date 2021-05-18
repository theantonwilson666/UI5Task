import { ConfigurableRecord, Position, Positionable } from "./helpers/ConfigurableObject";
import { FlexSettings, HeaderFacetType } from "sap/fe/core/converters/controls/ObjectPage/HeaderFacet";
import { BindingExpression } from "sap/fe/core/helpers/BindingExpression";
import { TableType } from "./controls/Common/Table";

export enum ActionType {
	DataFieldForAction = "ForAction",
	DataFieldForIntentBasedNavigation = "ForNavigation",
	Default = "Default",
	Primary = "Primary",
	Secondary = "Secondary",
	DefaultApply = "DefaultApply",
	Menu = "Menu"
}

export type ManifestSideContent = {
	template: string;
};

export enum VisualizationType {
	Table = "Table",
	Chart = "Chart"
}

export enum VariantManagementType {
	Page = "Page",
	Control = "Control",
	None = "None"
}

export type ContentDensitiesType = {
	compact?: boolean;
	cozy?: boolean;
};

export enum CreationMode {
	NewPage = "NewPage",
	Inline = "Inline",
	CreationRow = "CreationRow"
}

export enum AvailabilityType {
	Default = "Default",
	Adaptation = "Adaptation",
	Hidden = "Hidden"
}

export enum HorizontalAlign {
	End = "End",
	Begin = "Begin",
	Center = "Center"
}

export type TableColumnSettings = {
	microChartSize?: string;
	showMicroChartLabel?: boolean;
};

export type FormatOptionsType = {
	textLinesDisplay?: number;
	textLinesEdit?: number;
};

/**
 * @typedef BaseManifestSettings
 */
export type BaseManifestSettings = {
	content?: {
		header?: {
			facets?: ConfigurableRecord<ManifestHeaderFacet>;
			actions?: ConfigurableRecord<ManifestAction>;
		};
		footer?: {
			actions?: ConfigurableRecord<ManifestAction>;
		};
	};
	controlConfiguration?: {
		[annotationPath: string]: ControlManifestConfiguration;
	} & {
		"@com.sap.vocabularies.UI.v1.LineItem"?: TableManifestConfiguration;
		"@com.sap.vocabularies.UI.v1.Facets"?: FacetsControlConfiguration;
		"@com.sap.vocabularies.UI.v1.HeaderFacets"?: HeaderFacetsControlConfiguration;
	};
	entitySet: string;
	navigation?: {
		[navigationPath: string]: NavigationSettingsConfiguration;
	};
	viewLevel?: number;
	fclEnabled?: boolean;
	variantManagement?: VariantManagementType;
	defaultTemplateAnnotationPath?: string;
	contentDensities?: ContentDensitiesType;
	isDesktop: boolean;
};

export type NavigationTargetConfiguration = {
	outbound?: string;
	outboundDetail?: {
		semanticObject: string;
		action: string;
		parameters?: any;
	};
	route?: string;
};

/**
 * @typedef NavigationSettingsConfiguration
 */
export type NavigationSettingsConfiguration = {
	create?: NavigationTargetConfiguration;
	detail?: NavigationTargetConfiguration;
	display?: {
		outbound?: string;
		target?: string; // for compatibility
		route?: string;
	};
};

type HeaderFacetsControlConfiguration = {
	facets: ConfigurableRecord<ManifestHeaderFacet>;
};

type FacetsControlConfiguration = {
	sections: ConfigurableRecord<ManifestSection>;
};

type ManifestFormElement = Positionable & {
	template: string;
	label?: string;
	formatOptions?: FormatOptionsType;
};

export type FormManifestConfiguration = {
	fields: ConfigurableRecord<ManifestFormElement>;
};

export type ControlManifestConfiguration =
	| TableManifestConfiguration
	| ChartManifestConfiguration
	| FacetsControlConfiguration
	| HeaderFacetsControlConfiguration
	| FormManifestConfiguration;

/** Object Page **/

export type ObjectPageManifestSettings = BaseManifestSettings & {
	content?: {
		header?: {
			visible?: boolean;
			anchorBarVisible?: boolean;
			facets?: ConfigurableRecord<ManifestHeaderFacet>;
		};
		body?: {
			sections?: ConfigurableRecord<ManifestSection>;
		};
	};
	editableHeaderContent: boolean;
	sectionLayout: "Tabs" | "Page";
};

/**
 * @typedef ManifestHeaderFacet
 */
export type ManifestHeaderFacet = {
	type: HeaderFacetType;
	name: string;
	position?: Position;
	visible?: BindingExpression<boolean>;
	title?: string;
	subTitle?: string;
	stashed?: boolean;
	flexSettings?: FlexSettings;
	requestGroupId?: string;
};

/**
 * @typedef ManifestSection
 */
export type ManifestSection = {
	title: string;
	id?: string;
	name?: string;
	visible?: BindingExpression<boolean>;
	position?: Position;
	subSections?: Record<string, ManifestSubSection>;
	actions?: Record<string, ManifestAction>;
};

export type ManifestSubSection = {
	id?: string;
	name?: string;
	template?: string;
	title: string;
	position?: Position;
	visible?: BindingExpression<boolean>;
	actions?: Record<string, ManifestAction>;
	sideContent?: ManifestSideContent;
};

/** List Report **/

export type ListReportManifestSettings = BaseManifestSettings & {
	initialLoad?: boolean;
	views?: MultipleViewsConfiguration;
};
export type ViewPathConfiguration = {
	keepPreviousPresonalization?: boolean;
	key: string;
	entitySet?: string;
	annotationPath: string;
};

/**
 * @typedef MultipleViewsConfiguration
 */
export type MultipleViewsConfiguration = {
	paths: ViewPathConfiguration[];
	showCounts?: boolean;
};

/** Filter Configuration **/

/** @typedef FilterManifestConfiguration **/
export type FilterManifestConfiguration = {
	filterFields?: Record<string, FilterFieldManifestConfiguration>;
	navigationProperties?: string[];
	useSemanticDateRange?: boolean;
};

export type FilterFieldManifestConfiguration = Positionable & {
	label?: string;
	template?: string;
	availability?: AvailabilityType;
	settings?: FilterSettings;
};

export type OperatorConfiguration = {
	path: string;
	equals: string;
	exclude: boolean;
};

export type FilterSettings = {
	operatorConfiguration?: OperatorConfiguration[];
};

/** Chart Configuration **/

export type ChartPersonalizationManifestSettings =
	| boolean
	| {
			sort: boolean;
			type: boolean;
			item: boolean;
	  };

export type ChartManifestConfiguration = {
	chartSettings: {
		personalization: ChartPersonalizationManifestSettings;
	};
};

export type ActionAfterExecutionConfiguration = {
	navigateToInstance: boolean;
	enableAutoScroll: boolean;
};

/** Table Configuration **/

/**
 * @typedef ManifestAction
 */
export type ManifestAction = {
	menu?: string[];
	visible?: string;
	enabled?: string;
	position?: Position;
	press: string;
	text: string;
	enableOnSelect: string;
	requiresSelection?: boolean;
	afterExecution?: ActionAfterExecutionConfiguration;
};

export type ManifestTableColumn = Positionable & {
	header: string;
	width?: string;
	horizontalAlign?: HorizontalAlign;
	template: string;
	afterExecution?: ActionAfterExecutionConfiguration;
	availability?: AvailabilityType;
	settings?: TableColumnSettings;
	formatOptions?: FormatOptionsType;
	properties?: string[];
};

export type TableManifestConfiguration = {
	tableSettings: TableManifestSettingsConfiguration;
	actions?: Record<string, ManifestAction>;
	columns?: Record<string, ManifestTableColumn>;
};

export enum SelectionMode {
	Auto = "Auto",
	None = "None",
	Multi = "Multi",
	Single = "Single"
}

export type TablePersonalizationConfiguration =
	| boolean
	| {
			sort: boolean;
			column: boolean;
			filter: boolean;
			group: boolean;
			aggregate: boolean;
	  };

export type TableManifestSettingsConfiguration = {
	creationMode?: {
		disableAddRowButtonForEmptyData?: boolean;
		createAtEnd?: boolean;
		name?: CreationMode;
	};
	enableExport?: boolean;
	quickVariantSelection?: {
		paths: [
			{
				annotationPath: string;
			}
		];
		hideTableTitle?: boolean;
		showCounts?: boolean;
	};
	personalization?: TablePersonalizationConfiguration;
	/**
	 * Defines how many items in a table can be selectable. "Auto" defines the selection as "Multi" if there is an action or if it's deletable. If there are no interactions its set to "None" on "Auto". "Multi" let's you select several items, "Single" let's you select one item, None turns of selection.
	 */
	selectionMode?: SelectionMode;
	type?: TableType;
	condensedTableLayout?: boolean;
	selectAll?: boolean;
	selectionLimit?: number;
	enablePaste?: boolean;
	enableFullScreen?: boolean;
};

/**
 * @typedef ManifestWrapper
 */
export type ManifestWrapper = {
	/**
	 * Retrieve the form containers (field groups/identification) defined in the manifest
	 *
	 * @returns {ManifestFormContainer} a set of manifest header facets indexed by an iterable key
	 */
	getFormContainer(facetTarget: string): FormManifestConfiguration;
	/**
	 * Retrieve the headerFacets defined in the manifest
	 *
	 * @returns {ConfigurableRecord<ManifestHeaderFacet>} a set of manifest header facets indexed by an iterable key
	 */
	getHeaderFacets(): ConfigurableRecord<ManifestHeaderFacet>;
	/**
	 * Retrieve the header actions defined in the manifest
	 *
	 * @returns {ConfigurableRecord<ManifestAction>} a set of manifest action indexed by an iterable key
	 */
	getHeaderActions(): ConfigurableRecord<ManifestAction>;

	/**
	 * Retrieve the footer actions defined in the manifest
	 *
	 * @returns {ConfigurableRecord<ManifestAction>} a set of manifest action indexed by an iterable key
	 */
	getFooterActions(): ConfigurableRecord<ManifestAction>;

	/**
	 * Retrieve the variant management as defined in the manifest
	 *
	 * @returns {VariantManagementType} a type of variant management
	 */
	getVariantManagement(): VariantManagementType;

	/**
	 * Retrieve the view level
	 */
	getViewLevel(): number;

	/**
	 * Retrieve the annotation Path for the SPV in the manifest
	 */
	getDefaultTemplateAnnotationPath(): string | undefined;

	/**
	 * Retrieve the contentDensities setting of the application
	 */
	getContentDensities(): ContentDensitiesType;

	/**
	 * Check whether we are in FCL mode or not
	 */
	isFclEnabled(): boolean;

	/**
	 * Retrieve the control configuration as defined in the manifest for a specific annotation path
	 *
	 * @param {string} sAnnotationPath the relative annotation path
	 * @private
	 * @returns {object} the control configuration
	 */
	getControlConfiguration(sAnnotationPath: string | undefined): any;

	/**
	 * Retrieve the configured settings for a given navigation target
	 *
	 * @param {string} navigationOrCollectionName
	 * @returns {NavigationSettingsConfiguration} the navigation settings configuration
	 */
	getNavigationConfiguration(navigationOrCollectionName: string): NavigationSettingsConfiguration;

	// OP Specific
	/**
	 * Returns true of the header of the application is editable and should appear in the
	 *
	 * @returns {boolean}
	 */
	isHeaderEditable(): boolean;

	/**
	 * Returns true if we should show the object page header
	 *
	 * @returns {boolean}
	 */
	getShowObjectPageHeader(): boolean;

	/**
	 * Returns true if we should show the object page header
	 *
	 * @returns {boolean}
	 */
	getShowAnchorBar(): boolean;

	/**
	 * Retrieve the sections defined in the manifest
	 *
	 * @returns {ConfigurableRecord<ManifestSection>} a set of manifest sections indexed by an iterable key
	 */
	getSections(): ConfigurableRecord<ManifestSection>;

	/**
	 * Whether or not the section will be displayed in different tabs
	 *
	 * @returns {boolean}
	 */
	useIconTabBar(): boolean;

	// LR Specific
	/**
	 * Retrieve the multiple view configuration from the manifest
	 *
	 * @returns {MultipleViewsConfiguration} the views that represent the manifest object
	 */
	getViewConfiguration(): MultipleViewsConfiguration | undefined;

	/**
	 * Retrieve the filter configuration form the manifest.
	 *
	 * @returns {FilterManifestConfiguration} the filter configuration from the manifest
	 */
	getFilterConfiguration(): FilterManifestConfiguration;

	/**
	 * Returns true if there are multiple entityset to be displayed
	 *
	 * @returns {boolean} true if there are multiple entitysets
	 */
	hasMultipleEntitySets(): boolean;

	/**
	 * Whether the current environment is a desktop.
	 * @returns {boolean} true if we are on a desktop
	 */
	isDesktop(): boolean;
};

/**
 * Create a wrapper object that ensure consistent return data from the manifest and that will take care of merging the different manifest "sauce".
 *
 * @param {BaseManifestSettings} oManifestSettings the manifest settings for the current page
 * @param {Function} mergeFn
 * @returns {ManifestWrapper} the manifest wrapper object
 */
export function createManifestWrapper(oManifestSettings: BaseManifestSettings, mergeFn: Function): ManifestWrapper {
	return {
		getFormContainer(facetTarget: string): FormManifestConfiguration {
			return oManifestSettings.controlConfiguration?.[facetTarget] as FormManifestConfiguration;
		},
		getHeaderFacets(): ConfigurableRecord<ManifestHeaderFacet> {
			return mergeFn(
				{},
				oManifestSettings.controlConfiguration?.["@com.sap.vocabularies.UI.v1.HeaderFacets"]?.facets,
				(oManifestSettings as ObjectPageManifestSettings).content?.header?.facets
			);
		},
		getHeaderActions(): ConfigurableRecord<ManifestAction> {
			return oManifestSettings.content?.header?.actions || {};
		},
		getFooterActions(): ConfigurableRecord<ManifestAction> {
			return oManifestSettings.content?.footer?.actions || {};
		},

		getVariantManagement(): VariantManagementType {
			return oManifestSettings.variantManagement || VariantManagementType.None;
		},

		getDefaultTemplateAnnotationPath(): string | undefined {
			return oManifestSettings.defaultTemplateAnnotationPath;
		},

		getControlConfiguration(sAnnotationPath: string): any {
			return oManifestSettings?.controlConfiguration?.[sAnnotationPath] || {};
		},
		getNavigationConfiguration(navigationOrCollectionName: string): NavigationSettingsConfiguration {
			return oManifestSettings?.navigation?.[navigationOrCollectionName] || {};
		},

		getSections(): ConfigurableRecord<ManifestSection> {
			return mergeFn(
				{},
				oManifestSettings.controlConfiguration?.["@com.sap.vocabularies.UI.v1.Facets"]?.sections,
				(oManifestSettings as ObjectPageManifestSettings).content?.body?.sections
			);
		},
		isHeaderEditable(): boolean {
			return this.getShowObjectPageHeader() && (oManifestSettings as ObjectPageManifestSettings).editableHeaderContent;
		},

		getViewConfiguration(): MultipleViewsConfiguration | undefined {
			return (oManifestSettings as ListReportManifestSettings).views;
		},

		getViewLevel(): number {
			return oManifestSettings?.viewLevel || -1;
		},

		useIconTabBar(): boolean {
			return this.getShowAnchorBar() && (oManifestSettings as ObjectPageManifestSettings).sectionLayout === "Tabs";
		},

		getContentDensities(): ContentDensitiesType {
			return (
				oManifestSettings?.contentDensities || {
					cozy: false,
					compact: false
				}
			);
		},

		isFclEnabled(): boolean {
			return !!oManifestSettings?.fclEnabled;
		},

		getFilterConfiguration(): FilterManifestConfiguration {
			return this.getControlConfiguration("@com.sap.vocabularies.UI.v1.SelectionFields");
		},

		hasMultipleEntitySets(): boolean {
			const viewConfig = this.getViewConfiguration() || { paths: [] };
			return viewConfig.paths.find(path => path.entitySet && path.entitySet !== oManifestSettings.entitySet) !== undefined;
		},

		getShowAnchorBar(): boolean {
			return (oManifestSettings as ObjectPageManifestSettings).content?.header?.anchorBarVisible !== undefined
				? !!(oManifestSettings as ObjectPageManifestSettings).content?.header?.anchorBarVisible
				: true;
		},
		getShowObjectPageHeader(): boolean {
			return (oManifestSettings as ObjectPageManifestSettings).content?.header?.visible !== undefined
				? !!(oManifestSettings as ObjectPageManifestSettings).content?.header?.visible
				: true;
		},
		isDesktop(): boolean {
			return oManifestSettings.isDesktop;
		}
	};
}
