/**
 * Thrown when Appium tried to proxy a command using a driver's `proxyCommand` method but the
 * method did not exist
 */
export class NoDriverProxyCommandError extends Error {
    constructor();
    /**
     * @type {Readonly<string>}
     */
    code: Readonly<string>;
}
export type AppiumDriverConstraints = typeof desiredCapabilityConstraints;
export type ExternalDriver = import('@appium/types').ExternalDriver;
export type Driver = import('@appium/types').Driver;
export type DriverClass = import('@appium/types').DriverClass;
export type DriverData = import('@appium/types').DriverData;
export type DriverOpts = import('@appium/types').ServerArgs;
export type Constraints = import('@appium/types').Constraints;
export type AppiumServer = import('@appium/types').AppiumServer;
export type ExtensionType = import('@appium/types').ExtensionType;
export type DriverConfig = import('./extension/driver-config').DriverConfig;
export type Plugin = import('@appium/types').Plugin;
export type PluginClass = import('@appium/types').PluginClass;
export type PluginType = import('@appium/types').PluginType;
export type DriverType = import('@appium/types').DriverType;
export type StringRecord = import('@appium/types').StringRecord;
export type SessionHandler = import('@appium/types').SessionHandler<SessionHandlerResult<any[]>, SessionHandlerResult<void>>;
/**
 * Used by {@linkcode AppiumDriver.createSession } and {@linkcode AppiumDriver.deleteSession } to describe
 * result.
 */
export type SessionHandlerResult<V> = {
    value?: V | undefined;
    error?: Error | undefined;
    protocol?: string | undefined;
};
export type W3CCapabilities<C extends Readonly<Record<string, import("@appium/types").Constraint>>> = import('@appium/types').W3CCapabilities<C>;
export type Capabilities<C extends Readonly<Record<string, import("@appium/types").Constraint>>> = import('@appium/types').Capabilities<C>;
/**
 * @implements {SessionHandler}
 */
export class AppiumDriver extends DriverCore<{
    readonly platformName: {
        readonly presence: true;
        readonly isString: true;
    };
    readonly app: {
        readonly isString: true;
    };
    readonly deviceName: {
        readonly isString: true;
    };
    readonly platformVersion: {
        readonly isString: true;
    };
    readonly newCommandTimeout: {
        readonly isNumber: true;
    };
    readonly automationName: {
        readonly isString: true;
    };
    readonly autoLaunch: {
        readonly isBoolean: true;
    };
    readonly udid: {
        readonly isString: true;
    };
    readonly orientation: {
        readonly inclusion: readonly ["LANDSCAPE", "PORTRAIT"];
    };
    readonly autoWebview: {
        readonly isBoolean: true;
    };
    readonly noReset: {
        readonly isBoolean: true;
    };
    readonly fullReset: {
        readonly isBoolean: true;
    };
    readonly language: {
        readonly isString: true;
    };
    readonly locale: {
        readonly isString: true;
    };
    readonly eventTimings: {
        readonly isBoolean: true;
    };
    readonly printPageSourceOnFindFailure: {
        readonly isBoolean: true;
    };
}> implements SessionHandler {
    /**
     * @param {DriverOpts} opts
     */
    constructor(opts: DriverOpts);
    /**
     * Access to sessions list must be guarded with a Semaphore, because
     * it might be changed by other async calls at any time
     * It is not recommended to access this property directly from the outside
     * @type {Record<string,ExternalDriver>}
     */
    sessions: Record<string, ExternalDriver>;
    /**
     * Access to pending drivers list must be guarded with a Semaphore, because
     * it might be changed by other async calls at any time
     * It is not recommended to access this property directly from the outside
     * @type {Record<string,ExternalDriver[]>}
     */
    pendingDrivers: Record<string, ExternalDriver[]>;
    /**
     * List of active plugins
     * @type {Map<PluginClass,string>}
     */
    pluginClasses: Map<PluginClass, string>;
    /**
     * map of sessions to actual plugin instances per session
     * @type {Record<string,InstanceType<PluginClass>[]>}
     */
    sessionPlugins: Record<string, InstanceType<PluginClass>[]>;
    /**
     * some commands are sessionless, so we need a set of plugins for them
     * @type {InstanceType<PluginClass>[]}
     */
    sessionlessPlugins: InstanceType<PluginClass>[];
    /** @type {DriverConfig} */
    driverConfig: DriverConfig;
    /** @type {AppiumServer} */
    server: AppiumServer;
    desiredCapConstraints: {
        readonly automationName: {
            readonly presence: true;
            readonly isString: true;
        };
        readonly platformName: {
            readonly presence: true;
            readonly isString: true;
        };
    };
    /** @type {DriverOpts} */
    args: DriverOpts;
    sessionExists(sessionId: any): boolean;
    driverForSession(sessionId: any): import("@appium/types").ExternalDriver;
    getStatus(): Promise<{
        build: import("../types").BuildInfo;
    }>;
    getSessions(): Promise<{
        id: string;
        capabilities: Partial<import("@appium/types").ConstraintsToCaps<{
            readonly platformName: {
                readonly presence: true;
                readonly isString: true;
            };
            readonly app: {
                readonly isString: true;
            };
            readonly deviceName: {
                readonly isString: true;
            };
            readonly platformVersion: {
                readonly isString: true;
            };
            readonly newCommandTimeout: {
                readonly isNumber: true;
            };
            readonly automationName: {
                readonly isString: true;
            };
            readonly autoLaunch: {
                readonly isBoolean: true;
            };
            readonly udid: {
                readonly isString: true;
            };
            readonly orientation: {
                readonly inclusion: readonly ["LANDSCAPE", "PORTRAIT"];
            };
            readonly autoWebview: {
                readonly isBoolean: true;
            };
            readonly noReset: {
                readonly isBoolean: true;
            };
            readonly fullReset: {
                readonly isBoolean: true;
            };
            readonly language: {
                readonly isString: true;
            };
            readonly locale: {
                readonly isString: true;
            };
            readonly eventTimings: {
                readonly isBoolean: true;
            };
            readonly printPageSourceOnFindFailure: {
                readonly isBoolean: true;
            };
        }> & void> | undefined;
    }[]>;
    printNewSessionAnnouncement(driverName: any, driverVersion: any, driverBaseVersion: any): void;
    /**
     * Retrieves all CLI arguments for a specific plugin.
     * @param {string} extName - Plugin name
     * @returns {StringRecord} Arguments object. If none, an empty object.
     */
    getCliArgsForPlugin(extName: string): StringRecord;
    /**
     * Retrieves CLI args for a specific driver.
     *
     * _Any arg which is equal to its default value will not be present in the returned object._
     *
     * _Note that this behavior currently (May 18 2022) differs from how plugins are handled_ (see {@linkcode AppiumDriver.getCliArgsForPlugin}).
     * @param {string} extName - Driver name
     * @returns {StringRecord|undefined} Arguments object. If none, `undefined`
     */
    getCliArgsForDriver(extName: string): StringRecord | undefined;
    /**
     * Create a new session
     * @param {W3CCapabilities<AppiumDriverConstraints>} jsonwpCaps JSONWP formatted desired capabilities
     * @param {W3CCapabilities<AppiumDriverConstraints>} reqCaps Required capabilities (JSONWP standard)
     * @param {W3CCapabilities<AppiumDriverConstraints>} w3cCapabilities W3C capabilities
     * @param {DriverData[]} [driverData]
     */
    createSession(jsonwpCaps: W3CCapabilities<AppiumDriverConstraints>, reqCaps: W3CCapabilities<AppiumDriverConstraints>, w3cCapabilities: W3CCapabilities<AppiumDriverConstraints>, driverData?: import("@appium/types").DriverData[] | undefined): Promise<{
        protocol: string | undefined;
        error: any;
        value?: undefined;
    } | {
        protocol: string | undefined;
        value: any[];
        error?: undefined;
    }>;
    /**
     *
     * @param {Driver} driver
     * @param {string} innerSessionId
     */
    attachUnexpectedShutdownHandler(driver: Driver, innerSessionId: string): void;
    /**
     *
     * @param {DriverClass} InnerDriver
     * @returns {Promise<DriverData[]>}}
     */
    curSessionDataForDriver(InnerDriver: DriverClass): Promise<DriverData[]>;
    /**
     * @param {string} sessionId
     */
    deleteSession(sessionId: string): Promise<{
        protocol: undefined;
        value: void;
        error?: undefined;
    } | {
        protocol: undefined;
        error: any;
        value?: undefined;
    }>;
    deleteAllSessions(opts?: {}): Promise<void>;
    /**
     * Get the appropriate plugins for a session (or sessionless plugins)
     *
     * @param {?string} sessionId - the sessionId (or null) to use to find plugins
     * @returns {Array} - array of plugin instances
     */
    pluginsForSession(sessionId?: string | null): any[];
    /**
     * To get plugins for a command, we either get the plugin instances associated with the
     * particular command's session, or in the case of sessionless plugins, pull from the set of
     * plugin instances reserved for sessionless commands (and we lazily create plugin instances on
     * first use)
     *
     * @param {string} cmd - the name of the command to find a plugin to handle
     * @param {?string} sessionId - the particular session for which to find a plugin, or null if
     * sessionless
     */
    pluginsToHandleCmd(cmd: string, sessionId?: string | null): any[];
    /**
     * Creates instances of all of the enabled Plugin classes
     * @returns {Plugin[]}
     */
    createPluginInstances(): Plugin[];
    /**
     *
     * @param {string} cmd
     * @param  {...any} args
     * @returns {Promise<{value: any, error?: Error, protocol: string} | import('type-fest').AsyncReturnType<Driver['executeCommand']>>}
     */
    executeCommand(cmd: string, ...args: any[]): Promise<any>;
    wrapCommandWithPlugins({ driver, cmd, args, next, cmdHandledBy, plugins }: {
        driver: any;
        cmd: any;
        args: any;
        next: any;
        cmdHandledBy: any;
        plugins: any;
    }): any;
    logPluginHandlerReport(plugins: any, { cmd, cmdHandledBy }: {
        cmd: any;
        cmdHandledBy: any;
    }): void;
    executeWrappedCommand({ wrappedCmd, protocol }: {
        wrappedCmd: any;
        protocol: any;
    }): Promise<{
        value: any;
        error: any;
        protocol: any;
    }>;
    proxyActive(sessionId: any): boolean;
    canProxy(sessionId: any): boolean;
}
declare namespace desiredCapabilityConstraints {
    namespace automationName {
        const presence: true;
        const isString: true;
    }
    namespace platformName {
        const presence_1: true;
        export { presence_1 as presence };
        const isString_1: true;
        export { isString_1 as isString };
    }
}
import { DriverCore } from "@appium/base-driver";
export {};
//# sourceMappingURL=appium.d.ts.map