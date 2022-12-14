/**
 * This class is abstract. It should not be instantiated directly.
 *
 * Subclasses should provide the generic parameter to implement.
 * @template {ExtensionType} ExtType
 */
export class ExtensionConfig<ExtType extends import("@appium/types").ExtensionType> {
    /**
     * Intended to be called by corresponding instance methods of subclass.
     * @private
     * @template {ExtensionType} ExtType
     * @param {string} appiumHome
     * @param {ExtType} extType
     * @param {ExtName<ExtType>} extName - Extension name (unique to its type)
     * @param {ExtManifestWithSchema<ExtType>} extManifest - Extension config
     * @returns {import('ajv').SchemaObject|undefined}
     */
    private static _readExtensionSchema;
    /**
     * Returns `true` if a specific {@link ExtManifest} object has a `schema` prop.
     * The {@link ExtManifest} object becomes a {@link ExtManifestWithSchema} object.
     * @template {ExtensionType} ExtType
     * @param {ExtManifest<ExtType>} extManifest
     * @returns {extManifest is ExtManifestWithSchema<ExtType>}
     */
    static extDataHasSchema<ExtType_1 extends import("@appium/types").ExtensionType>(extManifest: ExtManifest<ExtType_1>): extManifest is ExtManifestWithSchema<ExtType_1>;
    /**
     * @protected
     * @param {ExtType} extensionType - Type of extension
     * @param {Manifest} manifest - `Manifest` instance
     */
    protected constructor();
    /** @type {ExtType} */
    extensionType: ExtType;
    /** @type {`${ExtType}s`} */
    configKey: `${ExtType}s`;
    /** @type {ExtRecord<ExtType>} */
    installedExtensions: ExtRecord<ExtType>;
    /** @type {import('@appium/types').AppiumLogger} */
    log: import('@appium/types').AppiumLogger;
    /** @type {Manifest} */
    manifest: Manifest;
    /**
     * @type {ExtensionListData}
     */
    _listDataCache: ExtensionListData;
    get manifestPath(): string;
    get appiumHome(): string;
    /**
     * Returns a list of errors for a given extension.
     *
     * @param {ExtName<ExtType>} extName
     * @param {ExtManifest<ExtType>} extManifest
     * @returns {ExtManifestProblem[]}
     */
    getProblems(extName: ExtName<ExtType>, extManifest: ExtManifest<ExtType>): ExtManifestProblem[];
    /**
     * Returns a list of warnings for a given extension.
     *
     * @param {ExtName<ExtType>} extName
     * @param {ExtManifest<ExtType>} extManifest
     * @returns {Promise<string[]>}
     */
    getWarnings(extName: ExtName<ExtType>, extManifest: ExtManifest<ExtType>): Promise<string[]>;
    /**
     * Returns a list of extension-type-specific issues. To be implemented by subclasses.
     * @abstract
     * @param {ExtManifest<ExtType>} extManifest
     * @param {ExtName<ExtType>} extName
     * @returns {Promise<string[]>}
     */
    getConfigWarnings(extManifest: ExtManifest<ExtType>, extName: ExtName<ExtType>): Promise<string[]>;
    /**
     *
     * @param {Map<ExtName<ExtType>,ExtManifestProblem[]>} [errorMap]
     * @param {Map<ExtName<ExtType>,string[]>} [warningMap]
     */
    getValidationResultSummaries(errorMap?: Map<string, ExtManifestProblem[]> | undefined, warningMap?: Map<string, string[]> | undefined): {
        errorSummaries: string[];
        warningSummaries: string[];
    };
    /**
     * Checks extensions for problems.  To be called by subclasses' `validate` method.
     *
     * Errors and warnings will be displayed to the user.
     *
     * This method mutates `exts`.
     *
     * @protected
     * @param {ExtRecord<ExtType>} exts - Lookup of extension names to {@linkcode ExtManifest} objects
     * @returns {Promise<ExtRecord<ExtType>>} The same lookup, but picking only error-free extensions
     */
    protected _validate(exts: ExtRecord<ExtType>): Promise<ExtRecord<ExtType>>;
    /**
     * Retrieves listing data for extensions via command class.
     * Caches the result in {@linkcode ExtensionConfig._listDataCache}
     * @protected
     * @returns {Promise<ExtensionListData>}
     */
    protected getListData(): Promise<ExtensionListData>;
    /**
     * Returns a list of warnings for a particular extension.
     *
     * By definition, a non-empty list of warnings does _not_ imply the extension cannot be loaded,
     * but it may not work as expected or otherwise throw an exception at runtime.
     *
     * @param {ExtManifest<ExtType>} extManifest
     * @param {ExtName<ExtType>} extName
     * @returns {Promise<string[]>}
     */
    getGenericConfigWarnings(extManifest: ExtManifest<ExtType>, extName: ExtName<ExtType>): Promise<string[]>;
    /**
     * Returns list of unrecoverable errors (if any) for the given extension _if_ it has a `schema` property.
     *
     * @param {ExtManifest<ExtType>} extManifest - Extension data (from manifest)
     * @param {ExtName<ExtType>} extName - Extension name (from manifest)
     * @returns {ExtManifestProblem[]}
     */
    getSchemaProblems(extManifest: ExtManifest<ExtType>, extName: ExtName<ExtType>): ExtManifestProblem[];
    /**
     * Return a list of generic unrecoverable errors for the given extension
     * @param {ExtManifest<ExtType>} extManifest - Extension data (from manifest)
     * @param {ExtName<ExtType>} extName - Extension name (from manifest)
     * @returns {ExtManifestProblem[]}
     */
    getGenericConfigProblems(extManifest: ExtManifest<ExtType>, extName: ExtName<ExtType>): ExtManifestProblem[];
    /**
     * @abstract
     * @param {ExtManifest<ExtType>} extManifest
     * @param {ExtName<ExtType>} extName
     * @returns {ExtManifestProblem[]}
     */
    getConfigProblems(extManifest: ExtManifest<ExtType>, extName: ExtName<ExtType>): ExtManifestProblem[];
    /**
     * @param {string} extName
     * @param {ExtManifest<ExtType>} extManifest
     * @param {ExtensionConfigMutationOpts} [opts]
     * @returns {Promise<void>}
     */
    addExtension(extName: string, extManifest: ExtManifest<ExtType>, { write }?: ExtensionConfigMutationOpts | undefined): Promise<void>;
    /**
     * @param {ExtName<ExtType>} extName
     * @param {ExtManifest<ExtType>|import('../cli/extension-command').ExtensionFields<ExtType>} extManifest
     * @param {ExtensionConfigMutationOpts} [opts]
     * @returns {Promise<void>}
     */
    updateExtension(extName: ExtName<ExtType>, extManifest: ExtManifest<ExtType> | import('../cli/extension-command').ExtensionFields<ExtType>, { write }?: ExtensionConfigMutationOpts | undefined): Promise<void>;
    /**
     * Remove an extension from the list of installed extensions, and optionally avoid a write to the manifest file.
     *
     * @param {ExtName<ExtType>} extName
     * @param {ExtensionConfigMutationOpts} [opts]
     * @returns {Promise<void>}
     */
    removeExtension(extName: ExtName<ExtType>, { write }?: ExtensionConfigMutationOpts | undefined): Promise<void>;
    /**
     * @param {ExtName<ExtType>[]} [activeNames]
     * @returns {void}
     */
    print(activeNames?: string[] | undefined): void;
    /**
     * Returns a string describing the extension. Subclasses must implement.
     * @param {ExtName<ExtType>} extName - Extension name
     * @param {ExtManifest<ExtType>} extManifest - Extension data
     * @returns {string}
     * @abstract
     */
    extensionDesc(extName: ExtName<ExtType>, extManifest: ExtManifest<ExtType>): string;
    /**
     * @param {string} extName
     * @returns {string}
     */
    getInstallPath(extName: string): string;
    /**
     * Loads extension and returns its main class (constructor)
     * @param {ExtName<ExtType>} extName
     * @returns {ExtClass<ExtType>}
     */
    require(extName: ExtName<ExtType>): ExtClass<ExtType>;
    /**
     * @param {string} extName
     * @returns {boolean}
     */
    isInstalled(extName: string): boolean;
    /**
     * If an extension provides a schema, this will load the schema and attempt to
     * register it with the schema registrar.
     * @param {ExtName<ExtType>} extName - Name of extension
     * @param {ExtManifestWithSchema<ExtType>} extManifest - Extension data
     * @returns {import('ajv').SchemaObject|undefined}
     */
    readExtensionSchema(extName: ExtName<ExtType>, extManifest: ExtManifestWithSchema<ExtType>): import('ajv').SchemaObject | undefined;
}
/**
 * An issue with the {@linkcode ExtManifest } for a particular extension.
 *
 * The existance of such an object implies that the extension cannot be loaded.
 */
export type ExtManifestProblem = {
    /**
     * - Error message
     */
    err: string;
    /**
     * - Associated value
     */
    val: any;
};
/**
 * An optional logging function provided to an {@link ExtensionConfig } subclass.
 */
export type ExtensionLogFn = (...args: any[]) => void;
export type ExtensionType = import('@appium/types').ExtensionType;
export type Manifest = import('./manifest').Manifest;
export type ExtManifest<T> = import('appium/types').ExtManifest<T>;
export type ExtManifestWithSchema<T> = import('appium/types').ExtManifestWithSchema<T>;
export type ExtName<T> = import('appium/types').ExtName<T>;
export type ExtClass<T> = import('appium/types').ExtClass<T>;
export type ExtRecord<T> = import('appium/types').ExtRecord<T>;
export type ExtCommand<T> = import('../cli/extension').ExtCommand<T>;
/**
 * Options for various methods in {@link ExtensionConfig }
 */
export type ExtensionConfigMutationOpts = {
    /**
     * Whether or not to write the manifest to disk after a mutation operation
     */
    write?: boolean | undefined;
};
/**
 * A valid install type
 */
export type InstallType = typeof INSTALL_TYPE_NPM | typeof INSTALL_TYPE_GIT | typeof INSTALL_TYPE_LOCAL | typeof INSTALL_TYPE_GITHUB;
export type ExtensionListData = import('../cli/extension-command').ExtensionListData;
export type InstalledExtensionListData = import('../cli/extension-command').InstalledExtensionListData;
export const INSTALL_TYPE_NPM: "npm";
export const INSTALL_TYPE_GIT: "git";
export const INSTALL_TYPE_LOCAL: "local";
export const INSTALL_TYPE_GITHUB: "github";
/** @type {Set<InstallType>} */
export const INSTALL_TYPES: Set<InstallType>;
//# sourceMappingURL=extension-config.d.ts.map