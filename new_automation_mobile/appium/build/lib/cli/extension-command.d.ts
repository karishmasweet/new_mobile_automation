export default ExtensionCommand;
/**
 * Options for the {@linkcode ExtensionCommand } constructor
 */
export type ExtensionCommandOptions<ExtType extends import("@appium/types").ExtensionType> = {
    /**
     * - the `DriverConfig` or `PluginConfig` instance used for this command
     */
    config: ExtensionConfig<ExtType>;
    /**
     * - whether the output of this command should be JSON or text
     */
    json: boolean;
};
/**
 * Extra stuff about extensions; used indirectly by {@linkcode ExtensionCommand.list }.
 */
export type ExtensionMetadata = {
    /**
     * - If `true`, the extension is installed
     */
    installed: boolean;
    /**
     * - If the extension is installed, the version it can be updated to
     */
    updateVersion: string | null;
    /**
     * - Same as above, but a major version bump
     */
    unsafeUpdateVersion: string | null;
    /**
     * - If the extension is installed and the latest
     */
    upToDate: boolean;
};
export type ExtensionType = import('@appium/types').ExtensionType;
export type DriverType = import('@appium/types').DriverType;
export type PluginType = import('@appium/types').PluginType;
export type ExtRecord<ExtType extends import("@appium/types").ExtensionType> = import('appium/types').ExtRecord<ExtType>;
export type ExtensionConfig<ExtType extends import("@appium/types").ExtensionType> = import('../extension/extension-config').ExtensionConfig<ExtType>;
export type ExtMetadata<ExtType extends import("@appium/types").ExtensionType> = import('appium/types').ExtMetadata<ExtType>;
export type ExtManifest<ExtType extends import("@appium/types").ExtensionType> = import('appium/types').ExtManifest<ExtType>;
export type ExtPackageJson<ExtType extends import("@appium/types").ExtensionType> = import('appium/types').ExtPackageJson<ExtType>;
/**
 * Possible return value for {@linkcode ExtensionCommand.list }
 */
export type UninstalledExtensionListData = {
    pkgName: string;
    installed: false;
};
/**
 * Possible return value for {@linkcode ExtensionCommand.list }
 */
export type InstalledExtensionListData = import('appium/types').InternalMetadata & ExtensionMetadata;
/**
 * Return value of {@linkcode ExtensionCommand.list }.
 */
export type ExtensionListData = Record<string, InstalledExtensionListData | UninstalledExtensionListData>;
/**
 * Options for {@linkcode ExtensionCommand._run }.
 */
export type RunOptions = {
    /**
     * - name of the extension to run a script from
     */
    installSpec: string;
    /**
     * - name of the script to run
     */
    scriptName: string;
    /**
     * - arguments to pass to the script
     */
    extraArgs?: string[] | undefined;
};
/**
 * Return value of {@linkcode ExtensionCommand._run }
 */
export type RunOutput = {
    /**
     * - error message if script ran unsuccessfully, otherwise undefined
     */
    error?: string | undefined;
    /**
     * - script output
     */
    output: string[];
};
/**
 * Options for {@linkcode ExtensionCommand._update }.
 */
export type ExtensionUpdateOpts = {
    /**
     * - the name of the extension to update
     */
    installSpec: string;
    /**
     * - if true, will perform unsafe updates past major revision boundaries
     */
    unsafe: boolean;
};
/**
 * Return value of {@linkcode ExtensionCommand._update }.
 */
export type ExtensionUpdateResult = {
    /**
     * - map of ext names to error objects
     */
    errors: Record<string, Error>;
    /**
     * - map of ext names to {@linkcode UpdateReport }s
     */
    updates: Record<string, UpdateReport>;
};
/**
 * Part of result of {@linkcode ExtensionCommand._update }.
 */
export type UpdateReport = {
    /**
     * - version the extension was updated from
     */
    from: string;
    /**
     * - version the extension was updated to
     */
    to: string;
};
/**
 * Options for {@linkcode ExtensionCommand._uninstall }.
 */
export type UninstallOpts = {
    /**
     * - the name or spec of an extension to uninstall
     */
    installSpec: string;
};
/**
 * Used by {@linkcode ExtensionCommand.getPostInstallText }
 */
export type ExtensionArgs = {
    /**
     * - the name of an extension
     */
    extName: string;
    /**
     * - the data for an installed extension
     */
    extData: object;
};
/**
 * Options for {@linkcode ExtensionCommand.installViaNpm }
 */
export type InstallViaNpmArgs = {
    /**
     * - the name or spec of an extension to install
     */
    installSpec: string;
    /**
     * - the NPM package name of the extension
     */
    pkgName: string;
    /**
     * - the specific version of the NPM package
     */
    pkgVer?: string | undefined;
};
/**
 * Object returned by {@linkcode ExtensionCommand.checkForExtensionUpdate }
 */
export type PossibleUpdates = {
    /**
     * - current version
     */
    current: string;
    /**
     * - version we can safely update to if it exists, or null
     */
    safeUpdate: string | null;
    /**
     * - version we can unsafely update to if it exists, or null
     */
    unsafeUpdate: string | null;
};
/**
 * Options for {@linkcode ExtensionCommand._install }
 */
export type InstallArgs = {
    /**
     * - the name or spec of an extension to install
     */
    installSpec: string;
    /**
     * - how to install this extension. One of the INSTALL_TYPES
     */
    installType: import('appium/types').InstallType;
    /**
     * - for git/github installs, the extension node package name
     */
    packageName?: string | undefined;
};
/**
 * Returned by {@linkcode ExtensionCommand.getExtensionFields }
 */
export type ExtensionFields<ExtType extends import("@appium/types").ExtensionType> = ExtMetadata<ExtType> & {
    pkgName: string;
    version: string;
    appiumVersion: string;
} & import('appium/types').CommonExtMetadata;
export type KnownExtensions<ExtType extends import("@appium/types").ExtensionType> = ExtType extends DriverType ? typeof import('../constants').KNOWN_DRIVERS : ExtType extends PluginType ? typeof import('../constants').KNOWN_PLUGINS : never;
export type ListOptions = {
    /**
     * - whether should show only installed extensions
     */
    showInstalled: boolean;
    /**
     * - whether should show available updates
     */
    showUpdates: boolean;
};
/**
 * @template {ExtensionType} ExtType
 */
export class ExtensionCommand<ExtType extends import("@appium/types").ExtensionType> {
    /**
     * Build an ExtensionCommand
     * @param {ExtensionCommandOptions<ExtType>} opts
     */
    constructor({ config, json }: ExtensionCommandOptions<ExtType>);
    /**
     * This is the `DriverConfig` or `PluginConfig`, depending on `ExtType`.
     * @type {ExtensionConfig<ExtType>}
     */
    config: ExtensionConfig<ExtType>;
    /**
     * {@linkcode Record} of official plugins or drivers.
     * @type {KnownExtensions<ExtType>}
     */
    knownExtensions: KnownExtensions<ExtType>;
    /**
     * If `true`, command output has been requested as JSON.
     * @type {boolean}
     */
    isJsonOutput: boolean;
    log: console.CliConsole;
    /**
     * `driver` or `plugin`, depending on the `ExtensionConfig`.
     */
    get type(): ExtType;
    /**
     * Logs a message and returns an {@linkcode Error} to throw.
     *
     * For TS to understand that a function throws an exception, it must actually throw an exception--
     * in other words, _calling_ a function which is guaranteed to throw an exception is not enough--
     * nor is something like `@returns {never}` which does not imply a thrown exception.
     * @param {string} message
     * @protected
     * @returns {Error}
     */
    protected _createFatalError(message: string): Error;
    /**
     * Take a CLI parse and run an extension command based on its type
     *
     * @param {object} args - a key/value object with CLI flags and values
     * @return {Promise<object>} the result of the specific command which is executed
     */
    execute(args: object): Promise<object>;
    /**
     * List extensions
     *
     * @param {ListOptions} opts
     * @return {Promise<ExtensionListData>} map of extension names to extension data
     */
    list({ showInstalled, showUpdates }: ListOptions): Promise<ExtensionListData>;
    /**
     * Install an extension
     *
     * @param {InstallArgs} args
     * @return {Promise<ExtRecord<ExtType>>} map of all installed extension names to extension data
     */
    _install({ installSpec, installType, packageName }: InstallArgs): Promise<ExtRecord<ExtType>>;
    /**
     * Install an extension via NPM
     *
     * @param {InstallViaNpmArgs} args
     */
    installViaNpm({ installSpec, pkgName, pkgVer }: InstallViaNpmArgs): Promise<ExtensionFields<ExtType>>;
    /**
     * Get the text which should be displayed to the user after an extension has been installed. This
     * is designed to be overridden by drivers/plugins with their own particular text.
     *
     * @param {ExtensionArgs} args
     * @returns {string}
     */
    getPostInstallText(args: ExtensionArgs): string;
    /**
     * Take an NPM module's package.json and extract Appium driver information from a special
     * 'appium' field in the JSON data. We need this information to e.g. determine which class to
     * load as the main driver class, or to be able to detect incompatibilities between driver and
     * appium versions.
     *
     * @param {ExtPackageJson<ExtType>} pkgJson - the package.json data for a driver module, as if it had been straightforwardly 'require'd
     * @returns {ExtensionFields<ExtType>}
     */
    getExtensionFields(pkgJson: ExtPackageJson<ExtType>): ExtensionFields<ExtType>;
    /**
     * Validates the _required_ root fields of an extension's `package.json` file.
     *
     * These required fields are:
     * - `name`
     * - `version`
     * - `appium`
     * @param {import('type-fest').PackageJson} pkgJson - `package.json` of extension
     * @param {string} installSpec - Extension name/spec
     * @throws {ReferenceError} If `package.json` has a missing or invalid field
     * @returns {pkgJson is ExtPackageJson<ExtType>}
     */
    validatePackageJson(pkgJson: import('type-fest').PackageJson, installSpec: string): pkgJson is ExtPackageJson<ExtType>;
    /**
     * For any `package.json` fields which a particular type of extension requires, validate the
     * presence and form of those fields on the `package.json` data, throwing an error if anything is
     * amiss.
     *
     * @param {ExtMetadata<ExtType>} extMetadata - the data in the "appium" field of `package.json` for an extension
     * @param {string} installSpec - Extension name/spec
     */
    validateExtensionFields(extMetadata: ExtMetadata<ExtType>, installSpec: string): void;
    /**
     * Uninstall an extension.
     *
     * First tries to do this via `npm uninstall`, but if that fails, just `rm -rf`'s the extension dir.
     *
     * Will only remove the extension from the manifest if it has been successfully removed.
     *
     * @param {UninstallOpts} opts
     * @return {Promise<ExtRecord<ExtType>>} map of all installed extension names to extension data (without the extension just uninstalled)
     */
    _uninstall({ installSpec }: UninstallOpts): Promise<ExtRecord<ExtType>>;
    /**
     * Attempt to update one or more drivers using NPM
     *
     * @param {ExtensionUpdateOpts} updateSpec
     * @return {Promise<ExtensionUpdateResult>}
     */
    _update({ installSpec, unsafe }: ExtensionUpdateOpts): Promise<ExtensionUpdateResult>;
    /**
     * Given an extension name, figure out what its highest possible version upgrade is, and also the
     * highest possible safe upgrade.
     *
     * @param {string} ext - name of extension
     * @return {Promise<PossibleUpdates>}
     */
    checkForExtensionUpdate(ext: string): Promise<PossibleUpdates>;
    /**
     * Actually update an extension installed by NPM, using the NPM cli. And update the installation
     * manifest.
     *
     * @param {string} installSpec - name of extension to update
     * @param {string} version - version string identifier to update extension to
     * @returns {Promise<void>}
     */
    updateExtension(installSpec: string, version: string): Promise<void>;
    /**
     * Runs a script cached inside the "scripts" field under "appium"
     * inside of the driver/plugins "package.json" file. Will throw
     * an error if the driver/plugin does not contain a "scripts" field
     * underneath the "appium" field in its package.json, if the
     * "scripts" field is not a plain object, or if the scriptName is
     * not found within "scripts" object.
     *
     * @param {RunOptions} opts
     * @return {Promise<RunOutput>}
     */
    _run({ installSpec, scriptName, extraArgs }: RunOptions): Promise<RunOutput>;
}
import { console } from "@appium/support";
//# sourceMappingURL=extension-command.d.ts.map