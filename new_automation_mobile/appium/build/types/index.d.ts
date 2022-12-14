/// <reference types="node" />
import { ExtensionType, DriverType, DriverClass, PluginType, PluginClass } from '@appium/types';
export * from './appium-manifest';
export * from './extension-manifest';
export * from './cli';
/**
 * Known environment variables concerning Appium
 */
export interface AppiumEnv extends NodeJS.ProcessEnv {
    APPIUM_HOME?: string;
}
/**
 * Generic to get at the class of an extension.
 */
export declare type ExtClass<ExtType extends ExtensionType> = ExtType extends DriverType ? DriverClass : ExtType extends PluginType ? PluginClass : never;
//# sourceMappingURL=index.d.ts.map