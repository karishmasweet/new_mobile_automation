"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getExtensionArgs = void 0;
exports.getServerArgs = getServerArgs;

require("source-map-support/register");

var _lodash = _interopRequireDefault(require("lodash"));

var _constants = require("../constants");

var _extensionConfig = require("../extension/extension-config");

var _cliArgs = require("../schema/cli-args");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const DRIVER_EXAMPLE = 'xcuitest';
const PLUGIN_EXAMPLE = 'find_by_image';
const INSTALL_TYPES_ARRAY = [..._extensionConfig.INSTALL_TYPES];
const EXTENSION_TYPES = new Set([_constants.DRIVER_TYPE, _constants.PLUGIN_TYPE]);
const globalExtensionArgs = new Map([[['--json'], {
  required: false,
  default: false,
  action: 'store_true',
  help: 'Use JSON for output format',
  dest: 'json'
}]]);

const getExtensionArgs = _lodash.default.memoize(function getExtensionArgs() {
  const extensionArgs = {};

  for (const type of EXTENSION_TYPES) {
    extensionArgs[type] = {
      [_constants.EXT_SUBCOMMAND_LIST]: makeListArgs(type),
      [_constants.EXT_SUBCOMMAND_INSTALL]: makeInstallArgs(type),
      [_constants.EXT_SUBCOMMAND_UNINSTALL]: makeUninstallArgs(type),
      [_constants.EXT_SUBCOMMAND_UPDATE]: makeUpdateArgs(type),
      [_constants.EXT_SUBCOMMAND_RUN]: makeRunArgs(type)
    };
  }

  return extensionArgs;
});

exports.getExtensionArgs = getExtensionArgs;

function makeListArgs(type) {
  return new Map([...globalExtensionArgs, [['--installed'], {
    required: false,
    default: false,
    action: 'store_true',
    help: `List only installed ${type}s`,
    dest: 'showInstalled'
  }], [['--updates'], {
    required: false,
    default: false,
    action: 'store_true',
    help: 'Show information about newer versions',
    dest: 'showUpdates'
  }]]);
}

function makeInstallArgs(type) {
  return new Map([...globalExtensionArgs, [[type], {
    type: 'str',
    help: `Name of the ${type} to install, for example: ` + type === _constants.DRIVER_TYPE ? DRIVER_EXAMPLE : PLUGIN_EXAMPLE
  }], [['--source'], {
    required: false,
    default: null,
    choices: INSTALL_TYPES_ARRAY,
    help: `Where to look for the ${type} if it is not one of Appium's verified ` + `${type}s. Possible values: ${INSTALL_TYPES_ARRAY.join(', ')}`,
    dest: 'installType'
  }], [['--package'], {
    required: false,
    default: null,
    type: 'str',
    help: `If installing from Git or GitHub, the package name, as defined in the plugin's ` + `package.json file in the "name" field, cannot be determined automatically, and ` + `should be reported here, otherwise the install will probably fail.`,
    dest: 'packageName'
  }]]);
}

function makeUninstallArgs(type) {
  return new Map([...globalExtensionArgs, [[type], {
    type: 'str',
    help: 'Name of the driver to uninstall, for example: ' + type === _constants.DRIVER_TYPE ? DRIVER_EXAMPLE : PLUGIN_EXAMPLE
  }]]);
}

function makeUpdateArgs(type) {
  return new Map([...globalExtensionArgs, [[type], {
    type: 'str',
    help: `Name of the ${type} to update, or the word "installed" to update all installed ` + `${type}s. To see available updates, run "appium ${type} list --installed --updates". ` + 'For example: ' + type === _constants.DRIVER_TYPE ? DRIVER_EXAMPLE : PLUGIN_EXAMPLE
  }], [['--unsafe'], {
    required: false,
    default: false,
    action: 'store_true',
    help: `Include updates that might have a new major revision, and potentially include ` + `breaking changes`
  }]]);
}

function makeRunArgs(type) {
  return new Map([...globalExtensionArgs, [[type], {
    type: 'str',
    help: `Name of the ${type} to run a script from, for example: ` + type === _constants.DRIVER_TYPE ? DRIVER_EXAMPLE : PLUGIN_EXAMPLE
  }], [['scriptName'], {
    default: null,
    type: 'str',
    help: `Name of the script to run from the ${type}. The script name must be a key ` + `inside the "appium.scripts" field inside the ${type}'s "package.json" file`
  }]]);
}

function getServerArgs() {
  return new Map([...(0, _cliArgs.toParserArgs)(), ...serverArgsDisallowedInConfig]);
}

const serverArgsDisallowedInConfig = new Map([[['--shell'], {
  required: false,
  help: 'Enter REPL mode',
  action: 'store_const',
  const: true,
  dest: 'shell'
}], [['--show-build-info'], {
  dest: 'showBuildInfo',
  action: 'store_const',
  const: true,
  required: false,
  help: 'Show info about the Appium build and exit'
}], [['--show-config'], {
  dest: 'showConfig',
  action: 'store_const',
  const: true,
  required: false,
  help: 'Show the current Appium configuration and exit'
}], [['--config'], {
  dest: 'configFile',
  type: 'string',
  required: false,
  help: 'Explicit path to Appium configuration file'
}]]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEUklWRVJfRVhBTVBMRSIsIlBMVUdJTl9FWEFNUExFIiwiSU5TVEFMTF9UWVBFU19BUlJBWSIsIklOU1RBTExfVFlQRVMiLCJFWFRFTlNJT05fVFlQRVMiLCJTZXQiLCJEUklWRVJfVFlQRSIsIlBMVUdJTl9UWVBFIiwiZ2xvYmFsRXh0ZW5zaW9uQXJncyIsIk1hcCIsInJlcXVpcmVkIiwiZGVmYXVsdCIsImFjdGlvbiIsImhlbHAiLCJkZXN0IiwiZ2V0RXh0ZW5zaW9uQXJncyIsIl8iLCJtZW1vaXplIiwiZXh0ZW5zaW9uQXJncyIsInR5cGUiLCJFWFRfU1VCQ09NTUFORF9MSVNUIiwibWFrZUxpc3RBcmdzIiwiRVhUX1NVQkNPTU1BTkRfSU5TVEFMTCIsIm1ha2VJbnN0YWxsQXJncyIsIkVYVF9TVUJDT01NQU5EX1VOSU5TVEFMTCIsIm1ha2VVbmluc3RhbGxBcmdzIiwiRVhUX1NVQkNPTU1BTkRfVVBEQVRFIiwibWFrZVVwZGF0ZUFyZ3MiLCJFWFRfU1VCQ09NTUFORF9SVU4iLCJtYWtlUnVuQXJncyIsImNob2ljZXMiLCJqb2luIiwiZ2V0U2VydmVyQXJncyIsInRvUGFyc2VyQXJncyIsInNlcnZlckFyZ3NEaXNhbGxvd2VkSW5Db25maWciLCJjb25zdCJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9jbGkvYXJncy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IHtcbiAgRFJJVkVSX1RZUEUsXG4gIFBMVUdJTl9UWVBFLFxuICBFWFRfU1VCQ09NTUFORF9JTlNUQUxMLFxuICBFWFRfU1VCQ09NTUFORF9MSVNULFxuICBFWFRfU1VCQ09NTUFORF9SVU4sXG4gIEVYVF9TVUJDT01NQU5EX1VOSU5TVEFMTCxcbiAgRVhUX1NVQkNPTU1BTkRfVVBEQVRFLFxufSBmcm9tICcuLi9jb25zdGFudHMnO1xuaW1wb3J0IHtJTlNUQUxMX1RZUEVTfSBmcm9tICcuLi9leHRlbnNpb24vZXh0ZW5zaW9uLWNvbmZpZyc7XG5pbXBvcnQge3RvUGFyc2VyQXJnc30gZnJvbSAnLi4vc2NoZW1hL2NsaS1hcmdzJztcbmNvbnN0IERSSVZFUl9FWEFNUExFID0gJ3hjdWl0ZXN0JztcbmNvbnN0IFBMVUdJTl9FWEFNUExFID0gJ2ZpbmRfYnlfaW1hZ2UnO1xuXG4vKipcbiAqIFRoaXMgaXMgbmVjZXNzYXJ5IGJlY2F1c2Ugd2UgcGFzcyB0aGUgYXJyYXkgaW50byBgYXJncGFyc2VgLiBgYXJncGFyc2VgIGlzIGJhZCBhbmQgbXV0YXRlcyB0aGluZ3MuIFdlIGRvbid0IHdhbnQgdGhhdC5cbiAqIEJhZCBgYXJncGFyc2VgISBCYWQhXG4gKi9cbmNvbnN0IElOU1RBTExfVFlQRVNfQVJSQVkgPSBbLi4uSU5TVEFMTF9UWVBFU107XG5cbi8qKiBAdHlwZSB7U2V0PEV4dGVuc2lvblR5cGU+fSAqL1xuY29uc3QgRVhURU5TSU9OX1RZUEVTID0gbmV3IFNldChbRFJJVkVSX1RZUEUsIFBMVUdJTl9UWVBFXSk7XG5cbi8vIHRoaXMgc2V0IG9mIGFyZ3Mgd29ya3MgZm9yIGJvdGggZHJpdmVycyBhbmQgcGx1Z2lucyAoJ2V4dGVuc2lvbnMnKVxuLyoqIEB0eXBlIHtBcmd1bWVudERlZmluaXRpb25zfSAqL1xuY29uc3QgZ2xvYmFsRXh0ZW5zaW9uQXJncyA9IG5ldyBNYXAoW1xuICBbXG4gICAgWyctLWpzb24nXSxcbiAgICB7XG4gICAgICByZXF1aXJlZDogZmFsc2UsXG4gICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgIGFjdGlvbjogJ3N0b3JlX3RydWUnLFxuICAgICAgaGVscDogJ1VzZSBKU09OIGZvciBvdXRwdXQgZm9ybWF0JyxcbiAgICAgIGRlc3Q6ICdqc29uJyxcbiAgICB9LFxuICBdLFxuXSk7XG5cbi8qKlxuICogQnVpbGRzIGEgUmVjb3JkIG9mIGV4dGVuc2lvbiB0eXBlcyB0byBhIFJlY29yZCBvZiBzdWJjb21tYW5kcyB0byB0aGVpciBhcmd1bWVudCBkZWZpbml0aW9uc1xuICovXG5jb25zdCBnZXRFeHRlbnNpb25BcmdzID0gXy5tZW1vaXplKGZ1bmN0aW9uIGdldEV4dGVuc2lvbkFyZ3MoKSB7XG4gIGNvbnN0IGV4dGVuc2lvbkFyZ3MgPSB7fTtcbiAgZm9yIChjb25zdCB0eXBlIG9mIEVYVEVOU0lPTl9UWVBFUykge1xuICAgIGV4dGVuc2lvbkFyZ3NbdHlwZV0gPSB7XG4gICAgICBbRVhUX1NVQkNPTU1BTkRfTElTVF06IG1ha2VMaXN0QXJncyh0eXBlKSxcbiAgICAgIFtFWFRfU1VCQ09NTUFORF9JTlNUQUxMXTogbWFrZUluc3RhbGxBcmdzKHR5cGUpLFxuICAgICAgW0VYVF9TVUJDT01NQU5EX1VOSU5TVEFMTF06IG1ha2VVbmluc3RhbGxBcmdzKHR5cGUpLFxuICAgICAgW0VYVF9TVUJDT01NQU5EX1VQREFURV06IG1ha2VVcGRhdGVBcmdzKHR5cGUpLFxuICAgICAgW0VYVF9TVUJDT01NQU5EX1JVTl06IG1ha2VSdW5BcmdzKHR5cGUpLFxuICAgIH07XG4gIH1cbiAgcmV0dXJuIC8qKiBAdHlwZSB7UmVjb3JkPEV4dGVuc2lvblR5cGUsIFJlY29yZDxpbXBvcnQoJ2FwcGl1bS90eXBlcycpLkNsaUV4dGVuc2lvblN1YmNvbW1hbmQsQXJndW1lbnREZWZpbml0aW9ucz4+fSAqLyAoXG4gICAgZXh0ZW5zaW9uQXJnc1xuICApO1xufSk7XG5cbi8qKlxuICogTWFrZXMgdGhlIG9wdHMgZm9yIHRoZSBgbGlzdGAgc3ViY29tbWFuZCBmb3IgZWFjaCBleHRlbnNpb24gdHlwZS5cbiAqIEBwYXJhbSB7RXh0ZW5zaW9uVHlwZX0gdHlwZVxuICogQHJldHVybnMge0FyZ3VtZW50RGVmaW5pdGlvbnN9XG4gKi9cbmZ1bmN0aW9uIG1ha2VMaXN0QXJncyh0eXBlKSB7XG4gIHJldHVybiBuZXcgTWFwKFtcbiAgICAuLi5nbG9iYWxFeHRlbnNpb25BcmdzLFxuICAgIFtcbiAgICAgIFsnLS1pbnN0YWxsZWQnXSxcbiAgICAgIHtcbiAgICAgICAgcmVxdWlyZWQ6IGZhbHNlLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgYWN0aW9uOiAnc3RvcmVfdHJ1ZScsXG4gICAgICAgIGhlbHA6IGBMaXN0IG9ubHkgaW5zdGFsbGVkICR7dHlwZX1zYCxcbiAgICAgICAgZGVzdDogJ3Nob3dJbnN0YWxsZWQnLFxuICAgICAgfSxcbiAgICBdLFxuICAgIFtcbiAgICAgIFsnLS11cGRhdGVzJ10sXG4gICAgICB7XG4gICAgICAgIHJlcXVpcmVkOiBmYWxzZSxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgIGFjdGlvbjogJ3N0b3JlX3RydWUnLFxuICAgICAgICBoZWxwOiAnU2hvdyBpbmZvcm1hdGlvbiBhYm91dCBuZXdlciB2ZXJzaW9ucycsXG4gICAgICAgIGRlc3Q6ICdzaG93VXBkYXRlcycsXG4gICAgICB9LFxuICAgIF0sXG4gIF0pO1xufVxuXG4vKipcbiAqIE1ha2VzIHRoZSBvcHRzIGZvciB0aGUgYGluc3RhbGxgIHN1YmNvbW1hbmQgZm9yIGVhY2ggZXh0ZW5zaW9uIHR5cGVcbiAqIEBwYXJhbSB7RXh0ZW5zaW9uVHlwZX0gdHlwZVxuICogQHJldHVybnMge0FyZ3VtZW50RGVmaW5pdGlvbnN9XG4gKi9cbmZ1bmN0aW9uIG1ha2VJbnN0YWxsQXJncyh0eXBlKSB7XG4gIHJldHVybiBuZXcgTWFwKFtcbiAgICAuLi5nbG9iYWxFeHRlbnNpb25BcmdzLFxuICAgIFtcbiAgICAgIFt0eXBlXSxcbiAgICAgIHtcbiAgICAgICAgdHlwZTogJ3N0cicsXG4gICAgICAgIGhlbHA6XG4gICAgICAgICAgYE5hbWUgb2YgdGhlICR7dHlwZX0gdG8gaW5zdGFsbCwgZm9yIGV4YW1wbGU6IGAgKyB0eXBlID09PSBEUklWRVJfVFlQRVxuICAgICAgICAgICAgPyBEUklWRVJfRVhBTVBMRVxuICAgICAgICAgICAgOiBQTFVHSU5fRVhBTVBMRSxcbiAgICAgIH0sXG4gICAgXSxcbiAgICBbXG4gICAgICBbJy0tc291cmNlJ10sXG4gICAgICB7XG4gICAgICAgIHJlcXVpcmVkOiBmYWxzZSxcbiAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgY2hvaWNlczogSU5TVEFMTF9UWVBFU19BUlJBWSxcbiAgICAgICAgaGVscDpcbiAgICAgICAgICBgV2hlcmUgdG8gbG9vayBmb3IgdGhlICR7dHlwZX0gaWYgaXQgaXMgbm90IG9uZSBvZiBBcHBpdW0ncyB2ZXJpZmllZCBgICtcbiAgICAgICAgICBgJHt0eXBlfXMuIFBvc3NpYmxlIHZhbHVlczogJHtJTlNUQUxMX1RZUEVTX0FSUkFZLmpvaW4oJywgJyl9YCxcbiAgICAgICAgZGVzdDogJ2luc3RhbGxUeXBlJyxcbiAgICAgIH0sXG4gICAgXSxcbiAgICBbXG4gICAgICBbJy0tcGFja2FnZSddLFxuICAgICAge1xuICAgICAgICByZXF1aXJlZDogZmFsc2UsXG4gICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgIHR5cGU6ICdzdHInLFxuICAgICAgICBoZWxwOlxuICAgICAgICAgIGBJZiBpbnN0YWxsaW5nIGZyb20gR2l0IG9yIEdpdEh1YiwgdGhlIHBhY2thZ2UgbmFtZSwgYXMgZGVmaW5lZCBpbiB0aGUgcGx1Z2luJ3MgYCArXG4gICAgICAgICAgYHBhY2thZ2UuanNvbiBmaWxlIGluIHRoZSBcIm5hbWVcIiBmaWVsZCwgY2Fubm90IGJlIGRldGVybWluZWQgYXV0b21hdGljYWxseSwgYW5kIGAgK1xuICAgICAgICAgIGBzaG91bGQgYmUgcmVwb3J0ZWQgaGVyZSwgb3RoZXJ3aXNlIHRoZSBpbnN0YWxsIHdpbGwgcHJvYmFibHkgZmFpbC5gLFxuICAgICAgICBkZXN0OiAncGFja2FnZU5hbWUnLFxuICAgICAgfSxcbiAgICBdLFxuICBdKTtcbn1cblxuLyoqXG4gKiBNYWtlcyB0aGUgb3B0cyBmb3IgdGhlIGB1bmluc3RhbGxgIHN1YmNvbW1hbmQgZm9yIGVhY2ggZXh0ZW5zaW9uIHR5cGVcbiAqIEBwYXJhbSB7RXh0ZW5zaW9uVHlwZX0gdHlwZVxuICogQHJldHVybnMge0FyZ3VtZW50RGVmaW5pdGlvbnN9XG4gKi9cbmZ1bmN0aW9uIG1ha2VVbmluc3RhbGxBcmdzKHR5cGUpIHtcbiAgcmV0dXJuIG5ldyBNYXAoW1xuICAgIC4uLmdsb2JhbEV4dGVuc2lvbkFyZ3MsXG4gICAgW1xuICAgICAgW3R5cGVdLFxuICAgICAge1xuICAgICAgICB0eXBlOiAnc3RyJyxcbiAgICAgICAgaGVscDpcbiAgICAgICAgICAnTmFtZSBvZiB0aGUgZHJpdmVyIHRvIHVuaW5zdGFsbCwgZm9yIGV4YW1wbGU6ICcgKyB0eXBlID09PSBEUklWRVJfVFlQRVxuICAgICAgICAgICAgPyBEUklWRVJfRVhBTVBMRVxuICAgICAgICAgICAgOiBQTFVHSU5fRVhBTVBMRSxcbiAgICAgIH0sXG4gICAgXSxcbiAgXSk7XG59XG5cbi8qKlxuICogTWFrZXMgdGhlIG9wdHMgZm9yIHRoZSBgdXBkYXRlYCBzdWJjb21tYW5kIGZvciBlYWNoIGV4dGVuc2lvbiB0eXBlXG4gKiBAcGFyYW0ge0V4dGVuc2lvblR5cGV9IHR5cGVcbiAqIEByZXR1cm5zIHtBcmd1bWVudERlZmluaXRpb25zfVxuICovXG5mdW5jdGlvbiBtYWtlVXBkYXRlQXJncyh0eXBlKSB7XG4gIHJldHVybiBuZXcgTWFwKFtcbiAgICAuLi5nbG9iYWxFeHRlbnNpb25BcmdzLFxuICAgIFtcbiAgICAgIFt0eXBlXSxcbiAgICAgIHtcbiAgICAgICAgdHlwZTogJ3N0cicsXG4gICAgICAgIGhlbHA6XG4gICAgICAgICAgYE5hbWUgb2YgdGhlICR7dHlwZX0gdG8gdXBkYXRlLCBvciB0aGUgd29yZCBcImluc3RhbGxlZFwiIHRvIHVwZGF0ZSBhbGwgaW5zdGFsbGVkIGAgK1xuICAgICAgICAgICAgYCR7dHlwZX1zLiBUbyBzZWUgYXZhaWxhYmxlIHVwZGF0ZXMsIHJ1biBcImFwcGl1bSAke3R5cGV9IGxpc3QgLS1pbnN0YWxsZWQgLS11cGRhdGVzXCIuIGAgK1xuICAgICAgICAgICAgJ0ZvciBleGFtcGxlOiAnICtcbiAgICAgICAgICAgIHR5cGUgPT09XG4gICAgICAgICAgRFJJVkVSX1RZUEVcbiAgICAgICAgICAgID8gRFJJVkVSX0VYQU1QTEVcbiAgICAgICAgICAgIDogUExVR0lOX0VYQU1QTEUsXG4gICAgICB9LFxuICAgIF0sXG4gICAgW1xuICAgICAgWyctLXVuc2FmZSddLFxuICAgICAge1xuICAgICAgICByZXF1aXJlZDogZmFsc2UsXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICBhY3Rpb246ICdzdG9yZV90cnVlJyxcbiAgICAgICAgaGVscDpcbiAgICAgICAgICBgSW5jbHVkZSB1cGRhdGVzIHRoYXQgbWlnaHQgaGF2ZSBhIG5ldyBtYWpvciByZXZpc2lvbiwgYW5kIHBvdGVudGlhbGx5IGluY2x1ZGUgYCArXG4gICAgICAgICAgYGJyZWFraW5nIGNoYW5nZXNgLFxuICAgICAgfSxcbiAgICBdLFxuICBdKTtcbn1cblxuLyoqXG4gKiBNYWtlcyB0aGUgb3B0cyBmb3IgdGhlIGBydW5gIHN1YmNvbW1hbmQgZm9yIGVhY2ggZXh0ZW5zaW9uIHR5cGVcbiAqIEBwYXJhbSB7RXh0ZW5zaW9uVHlwZX0gdHlwZVxuICogQHJldHVybnMge0FyZ3VtZW50RGVmaW5pdGlvbnN9XG4gKi9cbmZ1bmN0aW9uIG1ha2VSdW5BcmdzKHR5cGUpIHtcbiAgcmV0dXJuIG5ldyBNYXAoW1xuICAgIC4uLmdsb2JhbEV4dGVuc2lvbkFyZ3MsXG4gICAgW1xuICAgICAgW3R5cGVdLFxuICAgICAge1xuICAgICAgICB0eXBlOiAnc3RyJyxcbiAgICAgICAgaGVscDpcbiAgICAgICAgICBgTmFtZSBvZiB0aGUgJHt0eXBlfSB0byBydW4gYSBzY3JpcHQgZnJvbSwgZm9yIGV4YW1wbGU6IGAgKyB0eXBlID09PSBEUklWRVJfVFlQRVxuICAgICAgICAgICAgPyBEUklWRVJfRVhBTVBMRVxuICAgICAgICAgICAgOiBQTFVHSU5fRVhBTVBMRSxcbiAgICAgIH0sXG4gICAgXSxcbiAgICBbXG4gICAgICBbJ3NjcmlwdE5hbWUnXSxcbiAgICAgIHtcbiAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgdHlwZTogJ3N0cicsXG4gICAgICAgIGhlbHA6XG4gICAgICAgICAgYE5hbWUgb2YgdGhlIHNjcmlwdCB0byBydW4gZnJvbSB0aGUgJHt0eXBlfS4gVGhlIHNjcmlwdCBuYW1lIG11c3QgYmUgYSBrZXkgYCArXG4gICAgICAgICAgYGluc2lkZSB0aGUgXCJhcHBpdW0uc2NyaXB0c1wiIGZpZWxkIGluc2lkZSB0aGUgJHt0eXBlfSdzIFwicGFja2FnZS5qc29uXCIgZmlsZWAsXG4gICAgICB9LFxuICAgIF0sXG4gIF0pO1xufVxuXG4vKipcbiAqIERlcml2ZXMgdGhlIG9wdGlvbnMgZm9yIHRoZSBgc2VydmVyYCBjb21tYW5kIGZyb20gdGhlIHNjaGVtYSwgYW5kIGFkZHMgdGhlIGFyZ3VtZW50c1xuICogd2hpY2ggYXJlIGRpc2FsbG93ZWQgaW4gdGhlIGNvbmZpZyBmaWxlLlxuICogQHJldHVybnMge0FyZ3VtZW50RGVmaW5pdGlvbnN9XG4gKi9cbmZ1bmN0aW9uIGdldFNlcnZlckFyZ3MoKSB7XG4gIHJldHVybiBuZXcgTWFwKFsuLi50b1BhcnNlckFyZ3MoKSwgLi4uc2VydmVyQXJnc0Rpc2FsbG93ZWRJbkNvbmZpZ10pO1xufVxuXG4vKipcbiAqIFRoZXNlIGRvbid0IG1ha2Ugc2Vuc2UgaW4gdGhlIGNvbnRleHQgb2YgYSBjb25maWcgZmlsZSBmb3Igb2J2aW91cyByZWFzb25zLlxuICogQHR5cGUge0FyZ3VtZW50RGVmaW5pdGlvbnN9XG4gKi9cbmNvbnN0IHNlcnZlckFyZ3NEaXNhbGxvd2VkSW5Db25maWcgPSBuZXcgTWFwKFtcbiAgW1xuICAgIFsnLS1zaGVsbCddLFxuICAgIHtcbiAgICAgIHJlcXVpcmVkOiBmYWxzZSxcbiAgICAgIGhlbHA6ICdFbnRlciBSRVBMIG1vZGUnLFxuICAgICAgYWN0aW9uOiAnc3RvcmVfY29uc3QnLFxuICAgICAgY29uc3Q6IHRydWUsXG4gICAgICBkZXN0OiAnc2hlbGwnLFxuICAgIH0sXG4gIF0sXG4gIFtcbiAgICBbJy0tc2hvdy1idWlsZC1pbmZvJ10sXG4gICAge1xuICAgICAgZGVzdDogJ3Nob3dCdWlsZEluZm8nLFxuICAgICAgYWN0aW9uOiAnc3RvcmVfY29uc3QnLFxuICAgICAgY29uc3Q6IHRydWUsXG4gICAgICByZXF1aXJlZDogZmFsc2UsXG4gICAgICBoZWxwOiAnU2hvdyBpbmZvIGFib3V0IHRoZSBBcHBpdW0gYnVpbGQgYW5kIGV4aXQnLFxuICAgIH0sXG4gIF0sXG4gIFtcbiAgICBbJy0tc2hvdy1jb25maWcnXSxcbiAgICB7XG4gICAgICBkZXN0OiAnc2hvd0NvbmZpZycsXG4gICAgICBhY3Rpb246ICdzdG9yZV9jb25zdCcsXG4gICAgICBjb25zdDogdHJ1ZSxcbiAgICAgIHJlcXVpcmVkOiBmYWxzZSxcbiAgICAgIGhlbHA6ICdTaG93IHRoZSBjdXJyZW50IEFwcGl1bSBjb25maWd1cmF0aW9uIGFuZCBleGl0JyxcbiAgICB9LFxuICBdLFxuICBbXG4gICAgWyctLWNvbmZpZyddLFxuICAgIHtcbiAgICAgIGRlc3Q6ICdjb25maWdGaWxlJyxcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgcmVxdWlyZWQ6IGZhbHNlLFxuICAgICAgaGVscDogJ0V4cGxpY2l0IHBhdGggdG8gQXBwaXVtIGNvbmZpZ3VyYXRpb24gZmlsZScsXG4gICAgfSxcbiAgXSxcbl0pO1xuXG5leHBvcnQge2dldFNlcnZlckFyZ3MsIGdldEV4dGVuc2lvbkFyZ3N9O1xuXG4vKipcbiAqIEB0eXBlZGVmIHtpbXBvcnQoJ0BhcHBpdW0vdHlwZXMnKS5FeHRlbnNpb25UeXBlfSBFeHRlbnNpb25UeXBlXG4gKi9cblxuLyoqXG4gKiBBIHR1cGxlIG9mIGFyZ3VtZW50IGFsaWFzZXMgYW5kIGFyZ3VtZW50IG9wdGlvbnNcbiAqIEB0eXBlZGVmIHtNYXA8c3RyaW5nW10saW1wb3J0KCdhcmdwYXJzZScpLkFyZ3VtZW50T3B0aW9ucz59IEFyZ3VtZW50RGVmaW5pdGlvbnNcbiAqL1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7O0FBQ0E7O0FBU0E7O0FBQ0E7Ozs7QUFD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