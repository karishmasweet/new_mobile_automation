/**
 * @extends {ExtensionCommand<PluginType>}
 */
export default class PluginCommand extends ExtensionCommand<"plugin"> {
    /**
     *
     * @param {import('./extension-command').ExtensionCommandOptions<PluginType>} opts
     */
    constructor({ config, json }: import('./extension-command').ExtensionCommandOptions<PluginType>);
    install({ plugin, installType, packageName }: {
        plugin: any;
        installType: any;
        packageName: any;
    }): Promise<import("./extension-command").ExtRecord<"plugin">>;
    uninstall({ plugin }: {
        plugin: any;
    }): Promise<import("./extension-command").ExtRecord<"plugin">>;
    update({ plugin, unsafe }: {
        plugin: any;
        unsafe: any;
    }): Promise<import("./extension-command").ExtensionUpdateResult>;
    run({ plugin, scriptName, extraArgs }: {
        plugin: any;
        scriptName: any;
        extraArgs: any;
    }): Promise<import("./extension-command").RunOutput>;
    getPostInstallText({ extName, extData }: {
        extName: any;
        extData: any;
    }): string;
}
export type PluginType = import('@appium/types').PluginType;
import ExtensionCommand from "./extension-command";
//# sourceMappingURL=plugin-command.d.ts.map