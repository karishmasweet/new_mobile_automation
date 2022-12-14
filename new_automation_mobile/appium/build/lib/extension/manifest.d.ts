/**
 * Handles reading & writing of extension config files.
 *
 * Only one instance of this class exists per value of `APPIUM_HOME`.
 */
export class Manifest {
    /**
     * Returns a new or existing {@link Manifest} instance, based on the value of `appiumHome`.
     *
     * Maintains one instance per value of `appiumHome`.
     * @param {string} appiumHome - Path to `APPIUM_HOME`
     * @returns {Manifest}
     */
    static getInstance: ((appiumHome: any) => Manifest) & _.MemoizedFunction;
    /**
     * Sets internal data to a fresh clone of {@link INITIAL_MANIFEST_DATA}
     *
     * Use {@link Manifest.getInstance} instead.
     * @param {string} appiumHome
     * @private
     */
    private constructor();
    /**
     * The entire contents of a parsed YAML extension config file.
     *
     * Contains proxies for automatic persistence on disk
     * @type {ManifestData}
     * @private
     */
    private _data;
    /**
     * Path to `APPIUM_HOME`.
     * @private
     * @type {Readonly<string>}
     */
    private _appiumHome;
    /**
     * Path to `extensions.yaml`
     * @type {string}
     * Not set until {@link Manifest.read} is called.
     */
    _manifestPath: string;
    /**
     * Helps avoid writing multiple times.
     *
     * If this is `undefined`, calling {@link Manifest.write} will cause it to be
     * set to a `Promise`. When the call to `write()` is complete, the `Promise`
     * will resolve and then this value will be set to `undefined`.  Concurrent calls
     * made while this value is a `Promise` will return the `Promise` itself.
     * @private
     * @type {Promise<boolean>|undefined}
     */
    private _writing;
    /**
     * Helps avoid reading multiple times.
     *
     * If this is `undefined`, calling {@link Manifest.read} will cause it to be
     * set to a `Promise`. When the call to `read()` is complete, the `Promise`
     * will resolve and then this value will be set to `undefined`.  Concurrent calls
     * made while this value is a `Promise` will return the `Promise` itself.
     * @private
     * @type {Promise<void>|undefined}
     */
    private _reading;
    /**
     * Searches `APPIUM_HOME` for installed extensions and adds them to the manifest.
     * @returns {Promise<boolean>} `true` if any extensions were added, `false` otherwise.
     */
    syncWithInstalledExtensions(): Promise<boolean>;
    /**
     * Returns `true` if driver with name `name` is registered.
     * @param {string} name - Driver name
     * @returns {boolean}
     */
    hasDriver(name: string): boolean;
    /**
     * Returns `true` if plugin with name `name` is registered.
     * @param {string} name - Plugin name
     * @returns {boolean}
     */
    hasPlugin(name: string): boolean;
    /**
     * Given a path to a `package.json`, add it as either a driver or plugin to the manifest.
     *
     * Will _not_ overwrite existing entries.
     * @template {ExtensionType} ExtType
     * @param {ExtPackageJson<ExtType>} pkgJson
     * @param {string} pkgPath
     * @returns {boolean} - `true` upon success, `false` if the extension is already registered.
     */
    addExtensionFromPackage<ExtType extends import("@appium/types").ExtensionType>(pkgJson: ExtPackageJson<ExtType>, pkgPath: string): boolean;
    /**
     * Adds an extension to the manifest as was installed by the `appium` CLI.  The
     * `extData`, `extType`, and `extName` have already been determined.
     *
     * See {@link Manifest.addExtensionFromPackage} for adding an extension from an on-disk package.
     * @template {ExtensionType} ExtType
     * @param {ExtType} extType - `driver` or `plugin`
     * @param {string} extName - Name of extension
     * @param {ExtManifest<ExtType>} extData - Extension metadata
     * @returns {ExtManifest<ExtType>} A clone of `extData`, potentially with a mutated `appiumVersion` field
     */
    addExtension<ExtType_1 extends import("@appium/types").ExtensionType>(extType: ExtType_1, extName: string, extData: ExtManifest<ExtType_1>): ExtManifest<ExtType_1>;
    /**
     * Returns the APPIUM_HOME path
     */
    get appiumHome(): string;
    /**
     * Returns the path to the manifest file
     */
    get manifestPath(): string;
    /**
     * Returns extension data for a particular type.
     *
     * @template {ExtensionType} ExtType
     * @param {ExtType} extType
     * @returns {ExtRecord<ExtType>}
     */
    getExtensionData<ExtType_2 extends import("@appium/types").ExtensionType>(extType: ExtType_2): ExtRecord<ExtType_2>;
    /**
     * Reads manifest from disk and _overwrites_ the internal data.
     *
     * If the manifest does not exist on disk, an {@link INITIAL_MANIFEST_DATA "empty"} manifest file will be created.
     *
     * If `APPIUM_HOME` contains a `package.json` with an `appium` dependency, then a hash of the `package.json` will be taken. If this hash differs from the last hash, the contents of `APPIUM_HOME/node_modules` will be scanned for extensions that may have been installed outside of the `appium` CLI.  Any found extensions will be added to the manifest file, and if so, the manifest file will be written to disk.
     *
     * Only one read operation should happen at a time.  This is controlled via the {@link Manifest._reading} property.
     * @returns {Promise<ManifestData>} The data
     */
    read(): Promise<ManifestData>;
    /**
     * Ensures {@link Manifest._manifestPath} is set.
     *
     * Creates the directory if necessary.
     * @private
     * @returns {Promise<string>}
     */
    private _setManifestPath;
    /**
     * Writes the data if it need s writing.
     *
     * If the `schemaRev` prop needs updating, the file will be written.
     *
     * @todo If this becomes too much of a bottleneck, throttle it.
     * @returns {Promise<boolean>} Whether the data was written
     */
    write(): Promise<boolean>;
}
/**
 * Type of the string referring to a driver (typically as a key or type string)
 */
export type DriverType = import('@appium/types').DriverType;
/**
 * Type of the string referring to a plugin (typically as a key or type string)
 */
export type PluginType = import('@appium/types').PluginType;
export type SyncWithInstalledExtensionsOpts = {
    /**
     * - Maximum depth to recurse into subdirectories
     */
    depthLimit?: number | undefined;
};
export type ManifestData = import('appium/types').ManifestData;
export type InternalMetadata = import('appium/types').InternalMetadata;
export type ExtPackageJson<T> = import('appium/types').ExtPackageJson<T>;
export type ExtManifest<T> = import('appium/types').ExtManifest<T>;
export type ExtRecord<T> = import('appium/types').ExtRecord<T>;
/**
 * Either `driver` or `plugin` rn
 */
export type ExtensionType = import('@appium/types').ExtensionType;
import _ from "lodash";
//# sourceMappingURL=manifest.d.ts.map