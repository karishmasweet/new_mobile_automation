"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Manifest = void 0;

require("source-map-support/register");

var _bluebird = _interopRequireDefault(require("bluebird"));

var _glob = _interopRequireDefault(require("glob"));

var _support = require("@appium/support");

var _lodash = _interopRequireDefault(require("lodash"));

var _path = _interopRequireDefault(require("path"));

var _yaml = _interopRequireDefault(require("yaml"));

var _constants = require("../constants");

var _logger = _interopRequireDefault(require("../logger"));

var _extensionConfig = require("./extension-config");

var _packageChanged = require("./package-changed");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const CONFIG_SCHEMA_REV = 2;
const CONFIG_DATA_DRIVER_KEY = `${_constants.DRIVER_TYPE}s`;
const CONFIG_DATA_PLUGIN_KEY = `${_constants.PLUGIN_TYPE}s`;
const INITIAL_MANIFEST_DATA = Object.freeze({
  [CONFIG_DATA_DRIVER_KEY]: Object.freeze({}),
  [CONFIG_DATA_PLUGIN_KEY]: Object.freeze({}),
  schemaRev: CONFIG_SCHEMA_REV
});

function isExtension(value) {
  return _lodash.default.isPlainObject(value) && _lodash.default.isPlainObject(value.appium) && _lodash.default.isString(value.name) && _lodash.default.isString(value.version);
}

function isDriver(value) {
  return isExtension(value) && _lodash.default.isString(_lodash.default.get(value, 'appium.driverName')) && _lodash.default.isString(_lodash.default.get(value, 'appium.automationName')) && _lodash.default.isArray(_lodash.default.get(value, 'appium.platformNames'));
}

function isPlugin(value) {
  return isExtension(value) && _lodash.default.isString(_lodash.default.get(value, 'appium.pluginName'));
}

class Manifest {
  _data;
  _appiumHome;
  _manifestPath;
  _writing;
  _reading;

  constructor(appiumHome) {
    this._appiumHome = appiumHome;
    this._data = _lodash.default.cloneDeep(INITIAL_MANIFEST_DATA);
  }

  static getInstance = _lodash.default.memoize(function _getInstance(appiumHome) {
    return new Manifest(appiumHome);
  });

  async syncWithInstalledExtensions() {
    let didChange = false;

    const onMatch = async filepath => {
      try {
        const pkg = JSON.parse(await _support.fs.readFile(filepath, 'utf8'));

        if (isDriver(pkg) || isPlugin(pkg)) {
          const changed = this.addExtensionFromPackage(pkg, filepath);
          didChange = didChange || changed;
        }
      } catch {}
    };

    const queue = [onMatch(_path.default.join(this._appiumHome, 'package.json'))];
    await new _bluebird.default((resolve, reject) => {
      (0, _glob.default)('node_modules/{*,@*/*}/package.json', {
        cwd: this._appiumHome,
        silent: true,
        absolute: true
      }, err => {
        if (err) {
          reject(err);
        }

        resolve();
      }).on('error', reject).on('match', filepath => {
        queue.push(onMatch(filepath));
      });
    });
    await _bluebird.default.all(queue);
    return didChange;
  }

  hasDriver(name) {
    return Boolean(this._data.drivers[name]);
  }

  hasPlugin(name) {
    return Boolean(this._data.plugins[name]);
  }

  addExtensionFromPackage(pkgJson, pkgPath) {
    var _pkgJson$peerDependen;

    const extensionPath = _path.default.dirname(pkgPath);

    const internal = {
      pkgName: pkgJson.name,
      version: pkgJson.version,
      appiumVersion: (_pkgJson$peerDependen = pkgJson.peerDependencies) === null || _pkgJson$peerDependen === void 0 ? void 0 : _pkgJson$peerDependen.appium,
      installType: _extensionConfig.INSTALL_TYPE_NPM,
      installSpec: `${pkgJson.name}@${pkgJson.version}`
    };

    if (isDriver(pkgJson)) {
      if (!this.hasDriver(pkgJson.appium.driverName)) {
        this.addExtension(_constants.DRIVER_TYPE, pkgJson.appium.driverName, { ..._lodash.default.omit(pkgJson.appium, 'driverName'),
          ...internal
        });
        return true;
      }

      return false;
    } else if (isPlugin(pkgJson)) {
      if (!this.hasPlugin(pkgJson.appium.pluginName)) {
        this.addExtension(_constants.PLUGIN_TYPE, pkgJson.appium.pluginName, { ..._lodash.default.omit(pkgJson.appium, 'pluginName'),
          ...internal
        });
        return true;
      }

      return false;
    } else {
      throw new TypeError(`The extension in ${extensionPath} is neither a valid driver nor a valid plugin.`);
    }
  }

  addExtension(extType, extName, extData) {
    const data = _lodash.default.clone(extData);

    this._data[`${extType}s`][extName] = data;
    return data;
  }

  get appiumHome() {
    return this._appiumHome;
  }

  get manifestPath() {
    return this._manifestPath;
  }

  getExtensionData(extType) {
    return this._data[`${extType}s`];
  }

  async read() {
    if (this._reading) {
      await this._reading;
      return this._data;
    }

    this._reading = (async () => {
      let data;
      let isNewFile = false;
      await this._setManifestPath();

      try {
        _logger.default.debug(`Reading ${this._manifestPath}...`);

        const yaml = await _support.fs.readFile(this._manifestPath, 'utf8');
        data = _yaml.default.parse(yaml);

        _logger.default.debug(`Parsed manifest file: ${JSON.stringify(data, null, 2)}`);
      } catch (err) {
        if (err.code === 'ENOENT') {
          data = _lodash.default.cloneDeep(INITIAL_MANIFEST_DATA);
          isNewFile = true;
        } else {
          if (this._manifestPath) {
            throw new Error(`Appium had trouble loading the extension installation ` + `cache file (${this._manifestPath}). It may be invalid YAML. Specific error: ${err.message}`);
          } else {
            throw new Error(`Appium encountered an unknown problem. Specific error: ${err.message}`);
          }
        }
      }

      this._data = data;
      let installedExtensionsChanged = false;

      if ((await _support.env.hasAppiumDependency(this.appiumHome)) && (await (0, _packageChanged.packageDidChange)(this.appiumHome))) {
        installedExtensionsChanged = await this.syncWithInstalledExtensions();
      }

      if (isNewFile || installedExtensionsChanged) {
        await this.write();
      }
    })();

    try {
      await this._reading;
      return this._data;
    } finally {
      this._reading = undefined;
    }
  }

  async _setManifestPath() {
    if (!this._manifestPath) {
      this._manifestPath = await _support.env.resolveManifestPath(this._appiumHome);

      if (_path.default.relative(this._appiumHome, this._manifestPath).startsWith('.')) {
        throw new Error(`Mismatch between location of APPIUM_HOME and manifest file. APPIUM_HOME: ${this.appiumHome}, manifest file: ${this._manifestPath}`);
      }
    }

    return this._manifestPath;
  }

  async write() {
    if (this._writing) {
      return this._writing;
    }

    this._writing = (async () => {
      await this._setManifestPath();

      try {
        await _support.fs.mkdirp(_path.default.dirname(this._manifestPath));
      } catch (err) {
        throw new Error(`Appium could not create the directory for the manifest file: ${_path.default.dirname(this._manifestPath)}. Original error: ${err.message}`);
      }

      try {
        await _support.fs.writeFile(this._manifestPath, _yaml.default.stringify(this._data), 'utf8');
        return true;
      } catch (err) {
        throw new Error(`Appium could not write to manifest at ${this._manifestPath} using APPIUM_HOME ${this._appiumHome}. ` + `Please ensure it is writable. Original error: ${err.message}`);
      }
    })();

    try {
      return await this._writing;
    } finally {
      this._writing = undefined;
    }
  }

}

exports.Manifest = Manifest;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDT05GSUdfU0NIRU1BX1JFViIsIkNPTkZJR19EQVRBX0RSSVZFUl9LRVkiLCJEUklWRVJfVFlQRSIsIkNPTkZJR19EQVRBX1BMVUdJTl9LRVkiLCJQTFVHSU5fVFlQRSIsIklOSVRJQUxfTUFOSUZFU1RfREFUQSIsIk9iamVjdCIsImZyZWV6ZSIsInNjaGVtYVJldiIsImlzRXh0ZW5zaW9uIiwidmFsdWUiLCJfIiwiaXNQbGFpbk9iamVjdCIsImFwcGl1bSIsImlzU3RyaW5nIiwibmFtZSIsInZlcnNpb24iLCJpc0RyaXZlciIsImdldCIsImlzQXJyYXkiLCJpc1BsdWdpbiIsIk1hbmlmZXN0IiwiX2RhdGEiLCJfYXBwaXVtSG9tZSIsIl9tYW5pZmVzdFBhdGgiLCJfd3JpdGluZyIsIl9yZWFkaW5nIiwiY29uc3RydWN0b3IiLCJhcHBpdW1Ib21lIiwiY2xvbmVEZWVwIiwiZ2V0SW5zdGFuY2UiLCJtZW1vaXplIiwiX2dldEluc3RhbmNlIiwic3luY1dpdGhJbnN0YWxsZWRFeHRlbnNpb25zIiwiZGlkQ2hhbmdlIiwib25NYXRjaCIsImZpbGVwYXRoIiwicGtnIiwiSlNPTiIsInBhcnNlIiwiZnMiLCJyZWFkRmlsZSIsImNoYW5nZWQiLCJhZGRFeHRlbnNpb25Gcm9tUGFja2FnZSIsInF1ZXVlIiwicGF0aCIsImpvaW4iLCJCIiwicmVzb2x2ZSIsInJlamVjdCIsImdsb2IiLCJjd2QiLCJzaWxlbnQiLCJhYnNvbHV0ZSIsImVyciIsIm9uIiwicHVzaCIsImFsbCIsImhhc0RyaXZlciIsIkJvb2xlYW4iLCJkcml2ZXJzIiwiaGFzUGx1Z2luIiwicGx1Z2lucyIsInBrZ0pzb24iLCJwa2dQYXRoIiwiZXh0ZW5zaW9uUGF0aCIsImRpcm5hbWUiLCJpbnRlcm5hbCIsInBrZ05hbWUiLCJhcHBpdW1WZXJzaW9uIiwicGVlckRlcGVuZGVuY2llcyIsImluc3RhbGxUeXBlIiwiSU5TVEFMTF9UWVBFX05QTSIsImluc3RhbGxTcGVjIiwiZHJpdmVyTmFtZSIsImFkZEV4dGVuc2lvbiIsIm9taXQiLCJwbHVnaW5OYW1lIiwiVHlwZUVycm9yIiwiZXh0VHlwZSIsImV4dE5hbWUiLCJleHREYXRhIiwiZGF0YSIsImNsb25lIiwibWFuaWZlc3RQYXRoIiwiZ2V0RXh0ZW5zaW9uRGF0YSIsInJlYWQiLCJpc05ld0ZpbGUiLCJfc2V0TWFuaWZlc3RQYXRoIiwibG9nIiwiZGVidWciLCJ5YW1sIiwiWUFNTCIsInN0cmluZ2lmeSIsImNvZGUiLCJFcnJvciIsIm1lc3NhZ2UiLCJpbnN0YWxsZWRFeHRlbnNpb25zQ2hhbmdlZCIsImVudiIsImhhc0FwcGl1bURlcGVuZGVuY3kiLCJwYWNrYWdlRGlkQ2hhbmdlIiwid3JpdGUiLCJ1bmRlZmluZWQiLCJyZXNvbHZlTWFuaWZlc3RQYXRoIiwicmVsYXRpdmUiLCJzdGFydHNXaXRoIiwibWtkaXJwIiwid3JpdGVGaWxlIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vbGliL2V4dGVuc2lvbi9tYW5pZmVzdC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIE1vZHVsZSBjb250YWluaW5nIHtAbGluayBNYW5pZmVzdH0gd2hpY2ggaGFuZGxlcyByZWFkaW5nICYgd3JpdGluZyBvZiBleHRlbnNpb24gY29uZmlnIGZpbGVzLlxuICovXG5cbmltcG9ydCBCIGZyb20gJ2JsdWViaXJkJztcbmltcG9ydCBnbG9iIGZyb20gJ2dsb2InO1xuaW1wb3J0IHtlbnYsIGZzfSBmcm9tICdAYXBwaXVtL3N1cHBvcnQnO1xuaW1wb3J0IF8gZnJvbSAnbG9kYXNoJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IFlBTUwgZnJvbSAneWFtbCc7XG5pbXBvcnQge0RSSVZFUl9UWVBFLCBQTFVHSU5fVFlQRX0gZnJvbSAnLi4vY29uc3RhbnRzJztcbmltcG9ydCBsb2cgZnJvbSAnLi4vbG9nZ2VyJztcbmltcG9ydCB7SU5TVEFMTF9UWVBFX05QTX0gZnJvbSAnLi9leHRlbnNpb24tY29uZmlnJztcbmltcG9ydCB7cGFja2FnZURpZENoYW5nZX0gZnJvbSAnLi9wYWNrYWdlLWNoYW5nZWQnO1xuXG4vKipcbiAqIEN1cnJlbnQgY29uZmlndXJhdGlvbiBzY2hlbWEgcmV2aXNpb24hXG4gKi9cbmNvbnN0IENPTkZJR19TQ0hFTUFfUkVWID0gMjtcblxuLyoqXG4gKiBUaGUgbmFtZSBvZiB0aGUgcHJvcCAoYGRyaXZlcnNgKSB1c2VkIGluIGBleHRlbnNpb25zLnlhbWxgIGZvciBkcml2ZXJzLlxuICogQHR5cGUge2Ake3R5cGVvZiBEUklWRVJfVFlQRX1zYH1cbiAqL1xuY29uc3QgQ09ORklHX0RBVEFfRFJJVkVSX0tFWSA9IGAke0RSSVZFUl9UWVBFfXNgO1xuXG4vKipcbiAqIFRoZSBuYW1lIG9mIHRoZSBwcm9wIChgcGx1Z2luc2ApIHVzZWQgaW4gYGV4dGVuc2lvbnMueWFtbGAgZm9yIHBsdWdpbnMuXG4gKiBAdHlwZSB7YCR7dHlwZW9mIFBMVUdJTl9UWVBFfXNgfVxuICovXG5jb25zdCBDT05GSUdfREFUQV9QTFVHSU5fS0VZID0gYCR7UExVR0lOX1RZUEV9c2A7XG5cbi8qKlxuICogQHR5cGUge1JlYWRvbmx5PE1hbmlmZXN0RGF0YT59XG4gKi9cbmNvbnN0IElOSVRJQUxfTUFOSUZFU1RfREFUQSA9IE9iamVjdC5mcmVlemUoe1xuICBbQ09ORklHX0RBVEFfRFJJVkVSX0tFWV06IE9iamVjdC5mcmVlemUoe30pLFxuICBbQ09ORklHX0RBVEFfUExVR0lOX0tFWV06IE9iamVjdC5mcmVlemUoe30pLFxuICBzY2hlbWFSZXY6IENPTkZJR19TQ0hFTUFfUkVWLFxufSk7XG5cbi8qKlxuICogR2l2ZW4gYSBgcGFja2FnZS5qc29uYCByZXR1cm4gYHRydWVgIGlmIGl0IHJlcHJlc2VudHMgYW4gQXBwaXVtIEV4dGVuc2lvbiAoZWl0aGVyIGEgZHJpdmVyIG9yIHBsdWdpbikuXG4gKlxuICogVGhlIGBwYWNrYWdlLmpzb25gIG11c3QgaGF2ZSBhbiBgYXBwaXVtYCBwcm9wZXJ0eSB3aGljaCBpcyBhbiBvYmplY3QuXG4gKiBAcGFyYW0ge2FueX0gdmFsdWVcbiAqIEByZXR1cm5zIHt2YWx1ZSBpcyBFeHRQYWNrYWdlSnNvbjxFeHRlbnNpb25UeXBlPn1cbiAqL1xuZnVuY3Rpb24gaXNFeHRlbnNpb24odmFsdWUpIHtcbiAgcmV0dXJuIChcbiAgICBfLmlzUGxhaW5PYmplY3QodmFsdWUpICYmXG4gICAgXy5pc1BsYWluT2JqZWN0KHZhbHVlLmFwcGl1bSkgJiZcbiAgICBfLmlzU3RyaW5nKHZhbHVlLm5hbWUpICYmXG4gICAgXy5pc1N0cmluZyh2YWx1ZS52ZXJzaW9uKVxuICApO1xufVxuLyoqXG4gKiBHaXZlbiBhIGBwYWNrYWdlLmpzb25gLCByZXR1cm4gYHRydWVgIGlmIGl0IHJlcHJlc2VudHMgYW4gQXBwaXVtIERyaXZlci5cbiAqXG4gKiBUbyBiZSBjb25zaWRlcmVkIGEgZHJpdmVyLCBhIGBwYWNrYWdlLmpzb25gIG11c3QgaGF2ZSBhIGZpZWxkc1xuICogYGFwcGl1bS5kcml2ZXJOYW1lYCwgYGFwcGl1bS5hdXRvbWF0aW9uTmFtZWAgYW5kIGBhcHBpdW0ucGxhdGZvcm1OYW1lc2AuXG4gKiBAcGFyYW0ge2FueX0gdmFsdWUgLSBWYWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7dmFsdWUgaXMgRXh0UGFja2FnZUpzb248RHJpdmVyVHlwZT59XG4gKi9cbmZ1bmN0aW9uIGlzRHJpdmVyKHZhbHVlKSB7XG4gIHJldHVybiAoXG4gICAgaXNFeHRlbnNpb24odmFsdWUpICYmXG4gICAgXy5pc1N0cmluZyhfLmdldCh2YWx1ZSwgJ2FwcGl1bS5kcml2ZXJOYW1lJykpICYmXG4gICAgXy5pc1N0cmluZyhfLmdldCh2YWx1ZSwgJ2FwcGl1bS5hdXRvbWF0aW9uTmFtZScpKSAmJlxuICAgIF8uaXNBcnJheShfLmdldCh2YWx1ZSwgJ2FwcGl1bS5wbGF0Zm9ybU5hbWVzJykpXG4gICk7XG59XG5cbi8qKlxuICogR2l2ZW4gYSBgcGFja2FnZS5qc29uYCwgcmV0dXJuIGB0cnVlYCBpZiBpdCByZXByZXNlbnRzIGFuIEFwcGl1bSBQbHVnaW4uXG4gKlxuICogVG8gYmUgY29uc2lkZXJlZCBhIHBsdWdpbiwgYSBgcGFja2FnZS5qc29uYCBtdXN0IGhhdmUgYW4gYGFwcGl1bS5wbHVnaW5OYW1lYCBmaWVsZC5cbiAqIEBwYXJhbSB7YW55fSB2YWx1ZSAtIFZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHt2YWx1ZSBpcyBFeHRQYWNrYWdlSnNvbjxQbHVnaW5UeXBlPn1cbiAqL1xuZnVuY3Rpb24gaXNQbHVnaW4odmFsdWUpIHtcbiAgcmV0dXJuIGlzRXh0ZW5zaW9uKHZhbHVlKSAmJiBfLmlzU3RyaW5nKF8uZ2V0KHZhbHVlLCAnYXBwaXVtLnBsdWdpbk5hbWUnKSk7XG59XG5cbi8qKlxuICogSGFuZGxlcyByZWFkaW5nICYgd3JpdGluZyBvZiBleHRlbnNpb24gY29uZmlnIGZpbGVzLlxuICpcbiAqIE9ubHkgb25lIGluc3RhbmNlIG9mIHRoaXMgY2xhc3MgZXhpc3RzIHBlciB2YWx1ZSBvZiBgQVBQSVVNX0hPTUVgLlxuICovXG5leHBvcnQgY2xhc3MgTWFuaWZlc3Qge1xuICAvKipcbiAgICogVGhlIGVudGlyZSBjb250ZW50cyBvZiBhIHBhcnNlZCBZQU1MIGV4dGVuc2lvbiBjb25maWcgZmlsZS5cbiAgICpcbiAgICogQ29udGFpbnMgcHJveGllcyBmb3IgYXV0b21hdGljIHBlcnNpc3RlbmNlIG9uIGRpc2tcbiAgICogQHR5cGUge01hbmlmZXN0RGF0YX1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9kYXRhO1xuXG4gIC8qKlxuICAgKiBQYXRoIHRvIGBBUFBJVU1fSE9NRWAuXG4gICAqIEBwcml2YXRlXG4gICAqIEB0eXBlIHtSZWFkb25seTxzdHJpbmc+fVxuICAgKi9cbiAgX2FwcGl1bUhvbWU7XG5cbiAgLyoqXG4gICAqIFBhdGggdG8gYGV4dGVuc2lvbnMueWFtbGBcbiAgICogQHR5cGUge3N0cmluZ31cbiAgICogTm90IHNldCB1bnRpbCB7QGxpbmsgTWFuaWZlc3QucmVhZH0gaXMgY2FsbGVkLlxuICAgKi9cbiAgX21hbmlmZXN0UGF0aDtcblxuICAvKipcbiAgICogSGVscHMgYXZvaWQgd3JpdGluZyBtdWx0aXBsZSB0aW1lcy5cbiAgICpcbiAgICogSWYgdGhpcyBpcyBgdW5kZWZpbmVkYCwgY2FsbGluZyB7QGxpbmsgTWFuaWZlc3Qud3JpdGV9IHdpbGwgY2F1c2UgaXQgdG8gYmVcbiAgICogc2V0IHRvIGEgYFByb21pc2VgLiBXaGVuIHRoZSBjYWxsIHRvIGB3cml0ZSgpYCBpcyBjb21wbGV0ZSwgdGhlIGBQcm9taXNlYFxuICAgKiB3aWxsIHJlc29sdmUgYW5kIHRoZW4gdGhpcyB2YWx1ZSB3aWxsIGJlIHNldCB0byBgdW5kZWZpbmVkYC4gIENvbmN1cnJlbnQgY2FsbHNcbiAgICogbWFkZSB3aGlsZSB0aGlzIHZhbHVlIGlzIGEgYFByb21pc2VgIHdpbGwgcmV0dXJuIHRoZSBgUHJvbWlzZWAgaXRzZWxmLlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAdHlwZSB7UHJvbWlzZTxib29sZWFuPnx1bmRlZmluZWR9XG4gICAqL1xuICBfd3JpdGluZztcblxuICAvKipcbiAgICogSGVscHMgYXZvaWQgcmVhZGluZyBtdWx0aXBsZSB0aW1lcy5cbiAgICpcbiAgICogSWYgdGhpcyBpcyBgdW5kZWZpbmVkYCwgY2FsbGluZyB7QGxpbmsgTWFuaWZlc3QucmVhZH0gd2lsbCBjYXVzZSBpdCB0byBiZVxuICAgKiBzZXQgdG8gYSBgUHJvbWlzZWAuIFdoZW4gdGhlIGNhbGwgdG8gYHJlYWQoKWAgaXMgY29tcGxldGUsIHRoZSBgUHJvbWlzZWBcbiAgICogd2lsbCByZXNvbHZlIGFuZCB0aGVuIHRoaXMgdmFsdWUgd2lsbCBiZSBzZXQgdG8gYHVuZGVmaW5lZGAuICBDb25jdXJyZW50IGNhbGxzXG4gICAqIG1hZGUgd2hpbGUgdGhpcyB2YWx1ZSBpcyBhIGBQcm9taXNlYCB3aWxsIHJldHVybiB0aGUgYFByb21pc2VgIGl0c2VsZi5cbiAgICogQHByaXZhdGVcbiAgICogQHR5cGUge1Byb21pc2U8dm9pZD58dW5kZWZpbmVkfVxuICAgKi9cbiAgX3JlYWRpbmc7XG5cbiAgLyoqXG4gICAqIFNldHMgaW50ZXJuYWwgZGF0YSB0byBhIGZyZXNoIGNsb25lIG9mIHtAbGluayBJTklUSUFMX01BTklGRVNUX0RBVEF9XG4gICAqXG4gICAqIFVzZSB7QGxpbmsgTWFuaWZlc3QuZ2V0SW5zdGFuY2V9IGluc3RlYWQuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcHBpdW1Ib21lXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBjb25zdHJ1Y3RvcihhcHBpdW1Ib21lKSB7XG4gICAgdGhpcy5fYXBwaXVtSG9tZSA9IGFwcGl1bUhvbWU7XG4gICAgdGhpcy5fZGF0YSA9IF8uY2xvbmVEZWVwKElOSVRJQUxfTUFOSUZFU1RfREFUQSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIG5ldyBvciBleGlzdGluZyB7QGxpbmsgTWFuaWZlc3R9IGluc3RhbmNlLCBiYXNlZCBvbiB0aGUgdmFsdWUgb2YgYGFwcGl1bUhvbWVgLlxuICAgKlxuICAgKiBNYWludGFpbnMgb25lIGluc3RhbmNlIHBlciB2YWx1ZSBvZiBgYXBwaXVtSG9tZWAuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcHBpdW1Ib21lIC0gUGF0aCB0byBgQVBQSVVNX0hPTUVgXG4gICAqIEByZXR1cm5zIHtNYW5pZmVzdH1cbiAgICovXG4gIHN0YXRpYyBnZXRJbnN0YW5jZSA9IF8ubWVtb2l6ZShmdW5jdGlvbiBfZ2V0SW5zdGFuY2UoYXBwaXVtSG9tZSkge1xuICAgIHJldHVybiBuZXcgTWFuaWZlc3QoYXBwaXVtSG9tZSk7XG4gIH0pO1xuXG4gIC8qKlxuICAgKiBTZWFyY2hlcyBgQVBQSVVNX0hPTUVgIGZvciBpbnN0YWxsZWQgZXh0ZW5zaW9ucyBhbmQgYWRkcyB0aGVtIHRvIHRoZSBtYW5pZmVzdC5cbiAgICogQHJldHVybnMge1Byb21pc2U8Ym9vbGVhbj59IGB0cnVlYCBpZiBhbnkgZXh0ZW5zaW9ucyB3ZXJlIGFkZGVkLCBgZmFsc2VgIG90aGVyd2lzZS5cbiAgICovXG4gIGFzeW5jIHN5bmNXaXRoSW5zdGFsbGVkRXh0ZW5zaW9ucygpIHtcbiAgICAvLyB0aGlzIGNvdWxkIGJlIHBhcmFsbGVsaXplZCwgYnV0IHdlIGNhbid0IHVzZSBmcy53YWxrIGFzIGFuIGFzeW5jIGl0ZXJhdG9yXG4gICAgbGV0IGRpZENoYW5nZSA9IGZhbHNlO1xuXG4gICAgLyoqXG4gICAgICogTGlzdGVuZXIgZm9yIHRoZSBgbWF0Y2hgIGV2ZW50IG9mIGEgYGdsb2JgIGluc3RhbmNlXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGZpbGVwYXRoIC0gUGF0aCB0byBhIGBwYWNrYWdlLmpzb25gXG4gICAgICogQHJldHVybnMge1Byb21pc2U8dm9pZD59XG4gICAgICovXG4gICAgY29uc3Qgb25NYXRjaCA9IGFzeW5jIChmaWxlcGF0aCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcGtnID0gSlNPTi5wYXJzZShhd2FpdCBmcy5yZWFkRmlsZShmaWxlcGF0aCwgJ3V0ZjgnKSk7XG4gICAgICAgIGlmIChpc0RyaXZlcihwa2cpIHx8IGlzUGx1Z2luKHBrZykpIHtcbiAgICAgICAgICBjb25zdCBjaGFuZ2VkID0gdGhpcy5hZGRFeHRlbnNpb25Gcm9tUGFja2FnZShwa2csIGZpbGVwYXRoKTtcbiAgICAgICAgICBkaWRDaGFuZ2UgPSBkaWRDaGFuZ2UgfHwgY2hhbmdlZDtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCB7fVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBBIGxpc3Qgb2YgYFByb21pc2VgcyB3aGljaCByZWFkIGBwYWNrYWdlLmpzb25gIGZpbGVzIGxvb2tpbmcgZm9yIEFwcGl1bSBleHRlbnNpb25zLlxuICAgICAqIEB0eXBlIHtQcm9taXNlPHZvaWQ+W119XG4gICAgICovXG4gICAgY29uc3QgcXVldWUgPSBbXG4gICAgICAvLyBsb29rIGF0IGBwYWNrYWdlLmpzb25gIGluIGBBUFBJVU1fSE9NRWAgb25seVxuICAgICAgb25NYXRjaChwYXRoLmpvaW4odGhpcy5fYXBwaXVtSG9tZSwgJ3BhY2thZ2UuanNvbicpKSxcbiAgICBdO1xuXG4gICAgLy8gYWRkIGRlcGVuZGVuY2llcyB0byB0aGUgcXVldWVcbiAgICBhd2FpdCBuZXcgQigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBnbG9iKFxuICAgICAgICAnbm9kZV9tb2R1bGVzL3sqLEAqLyp9L3BhY2thZ2UuanNvbicsXG4gICAgICAgIHtjd2Q6IHRoaXMuX2FwcGl1bUhvbWUsIHNpbGVudDogdHJ1ZSwgYWJzb2x1dGU6IHRydWV9LFxuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcHJvbWlzZS9wcmVmZXItYXdhaXQtdG8tY2FsbGJhY2tzXG4gICAgICAgIChlcnIpID0+IHtcbiAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9XG4gICAgICApXG4gICAgICAgIC5vbignZXJyb3InLCByZWplY3QpXG4gICAgICAgIC5vbignbWF0Y2gnLCAoZmlsZXBhdGgpID0+IHtcbiAgICAgICAgICBxdWV1ZS5wdXNoKG9uTWF0Y2goZmlsZXBhdGgpKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICAvLyB3YWl0IGZvciBldmVyeXRoaW5nIHRvIGZpbmlzaFxuICAgIGF3YWl0IEIuYWxsKHF1ZXVlKTtcblxuICAgIHJldHVybiBkaWRDaGFuZ2U7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBgdHJ1ZWAgaWYgZHJpdmVyIHdpdGggbmFtZSBgbmFtZWAgaXMgcmVnaXN0ZXJlZC5cbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBEcml2ZXIgbmFtZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIGhhc0RyaXZlcihuYW1lKSB7XG4gICAgcmV0dXJuIEJvb2xlYW4odGhpcy5fZGF0YS5kcml2ZXJzW25hbWVdKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGB0cnVlYCBpZiBwbHVnaW4gd2l0aCBuYW1lIGBuYW1lYCBpcyByZWdpc3RlcmVkLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIFBsdWdpbiBuYW1lXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgaGFzUGx1Z2luKG5hbWUpIHtcbiAgICByZXR1cm4gQm9vbGVhbih0aGlzLl9kYXRhLnBsdWdpbnNbbmFtZV0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEdpdmVuIGEgcGF0aCB0byBhIGBwYWNrYWdlLmpzb25gLCBhZGQgaXQgYXMgZWl0aGVyIGEgZHJpdmVyIG9yIHBsdWdpbiB0byB0aGUgbWFuaWZlc3QuXG4gICAqXG4gICAqIFdpbGwgX25vdF8gb3ZlcndyaXRlIGV4aXN0aW5nIGVudHJpZXMuXG4gICAqIEB0ZW1wbGF0ZSB7RXh0ZW5zaW9uVHlwZX0gRXh0VHlwZVxuICAgKiBAcGFyYW0ge0V4dFBhY2thZ2VKc29uPEV4dFR5cGU+fSBwa2dKc29uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwa2dQYXRoXG4gICAqIEByZXR1cm5zIHtib29sZWFufSAtIGB0cnVlYCB1cG9uIHN1Y2Nlc3MsIGBmYWxzZWAgaWYgdGhlIGV4dGVuc2lvbiBpcyBhbHJlYWR5IHJlZ2lzdGVyZWQuXG4gICAqL1xuICBhZGRFeHRlbnNpb25Gcm9tUGFja2FnZShwa2dKc29uLCBwa2dQYXRoKSB7XG4gICAgY29uc3QgZXh0ZW5zaW9uUGF0aCA9IHBhdGguZGlybmFtZShwa2dQYXRoKTtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtJbnRlcm5hbE1ldGFkYXRhfVxuICAgICAqL1xuICAgIGNvbnN0IGludGVybmFsID0ge1xuICAgICAgcGtnTmFtZTogcGtnSnNvbi5uYW1lLFxuICAgICAgdmVyc2lvbjogcGtnSnNvbi52ZXJzaW9uLFxuICAgICAgYXBwaXVtVmVyc2lvbjogcGtnSnNvbi5wZWVyRGVwZW5kZW5jaWVzPy5hcHBpdW0sXG4gICAgICBpbnN0YWxsVHlwZTogSU5TVEFMTF9UWVBFX05QTSxcbiAgICAgIGluc3RhbGxTcGVjOiBgJHtwa2dKc29uLm5hbWV9QCR7cGtnSnNvbi52ZXJzaW9ufWAsXG4gICAgfTtcblxuICAgIGlmIChpc0RyaXZlcihwa2dKc29uKSkge1xuICAgICAgaWYgKCF0aGlzLmhhc0RyaXZlcihwa2dKc29uLmFwcGl1bS5kcml2ZXJOYW1lKSkge1xuICAgICAgICB0aGlzLmFkZEV4dGVuc2lvbihEUklWRVJfVFlQRSwgcGtnSnNvbi5hcHBpdW0uZHJpdmVyTmFtZSwge1xuICAgICAgICAgIC4uLl8ub21pdChwa2dKc29uLmFwcGl1bSwgJ2RyaXZlck5hbWUnKSxcbiAgICAgICAgICAuLi5pbnRlcm5hbCxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gZWxzZSBpZiAoaXNQbHVnaW4ocGtnSnNvbikpIHtcbiAgICAgIGlmICghdGhpcy5oYXNQbHVnaW4ocGtnSnNvbi5hcHBpdW0ucGx1Z2luTmFtZSkpIHtcbiAgICAgICAgdGhpcy5hZGRFeHRlbnNpb24oUExVR0lOX1RZUEUsIHBrZ0pzb24uYXBwaXVtLnBsdWdpbk5hbWUsIHtcbiAgICAgICAgICAuLi5fLm9taXQocGtnSnNvbi5hcHBpdW0sICdwbHVnaW5OYW1lJyksXG4gICAgICAgICAgLi4uaW50ZXJuYWwsXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgYFRoZSBleHRlbnNpb24gaW4gJHtleHRlbnNpb25QYXRofSBpcyBuZWl0aGVyIGEgdmFsaWQgZHJpdmVyIG5vciBhIHZhbGlkIHBsdWdpbi5gXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGFuIGV4dGVuc2lvbiB0byB0aGUgbWFuaWZlc3QgYXMgd2FzIGluc3RhbGxlZCBieSB0aGUgYGFwcGl1bWAgQ0xJLiAgVGhlXG4gICAqIGBleHREYXRhYCwgYGV4dFR5cGVgLCBhbmQgYGV4dE5hbWVgIGhhdmUgYWxyZWFkeSBiZWVuIGRldGVybWluZWQuXG4gICAqXG4gICAqIFNlZSB7QGxpbmsgTWFuaWZlc3QuYWRkRXh0ZW5zaW9uRnJvbVBhY2thZ2V9IGZvciBhZGRpbmcgYW4gZXh0ZW5zaW9uIGZyb20gYW4gb24tZGlzayBwYWNrYWdlLlxuICAgKiBAdGVtcGxhdGUge0V4dGVuc2lvblR5cGV9IEV4dFR5cGVcbiAgICogQHBhcmFtIHtFeHRUeXBlfSBleHRUeXBlIC0gYGRyaXZlcmAgb3IgYHBsdWdpbmBcbiAgICogQHBhcmFtIHtzdHJpbmd9IGV4dE5hbWUgLSBOYW1lIG9mIGV4dGVuc2lvblxuICAgKiBAcGFyYW0ge0V4dE1hbmlmZXN0PEV4dFR5cGU+fSBleHREYXRhIC0gRXh0ZW5zaW9uIG1ldGFkYXRhXG4gICAqIEByZXR1cm5zIHtFeHRNYW5pZmVzdDxFeHRUeXBlPn0gQSBjbG9uZSBvZiBgZXh0RGF0YWAsIHBvdGVudGlhbGx5IHdpdGggYSBtdXRhdGVkIGBhcHBpdW1WZXJzaW9uYCBmaWVsZFxuICAgKi9cbiAgYWRkRXh0ZW5zaW9uKGV4dFR5cGUsIGV4dE5hbWUsIGV4dERhdGEpIHtcbiAgICBjb25zdCBkYXRhID0gXy5jbG9uZShleHREYXRhKTtcbiAgICB0aGlzLl9kYXRhW2Ake2V4dFR5cGV9c2BdW2V4dE5hbWVdID0gZGF0YTtcbiAgICByZXR1cm4gZGF0YTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBBUFBJVU1fSE9NRSBwYXRoXG4gICAqL1xuICBnZXQgYXBwaXVtSG9tZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fYXBwaXVtSG9tZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBwYXRoIHRvIHRoZSBtYW5pZmVzdCBmaWxlXG4gICAqL1xuICBnZXQgbWFuaWZlc3RQYXRoKCkge1xuICAgIHJldHVybiB0aGlzLl9tYW5pZmVzdFBhdGg7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBleHRlbnNpb24gZGF0YSBmb3IgYSBwYXJ0aWN1bGFyIHR5cGUuXG4gICAqXG4gICAqIEB0ZW1wbGF0ZSB7RXh0ZW5zaW9uVHlwZX0gRXh0VHlwZVxuICAgKiBAcGFyYW0ge0V4dFR5cGV9IGV4dFR5cGVcbiAgICogQHJldHVybnMge0V4dFJlY29yZDxFeHRUeXBlPn1cbiAgICovXG4gIGdldEV4dGVuc2lvbkRhdGEoZXh0VHlwZSkge1xuICAgIHJldHVybiB0aGlzLl9kYXRhWy8qKiBAdHlwZSB7c3RyaW5nfSAqLyAoYCR7ZXh0VHlwZX1zYCldO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlYWRzIG1hbmlmZXN0IGZyb20gZGlzayBhbmQgX292ZXJ3cml0ZXNfIHRoZSBpbnRlcm5hbCBkYXRhLlxuICAgKlxuICAgKiBJZiB0aGUgbWFuaWZlc3QgZG9lcyBub3QgZXhpc3Qgb24gZGlzaywgYW4ge0BsaW5rIElOSVRJQUxfTUFOSUZFU1RfREFUQSBcImVtcHR5XCJ9IG1hbmlmZXN0IGZpbGUgd2lsbCBiZSBjcmVhdGVkLlxuICAgKlxuICAgKiBJZiBgQVBQSVVNX0hPTUVgIGNvbnRhaW5zIGEgYHBhY2thZ2UuanNvbmAgd2l0aCBhbiBgYXBwaXVtYCBkZXBlbmRlbmN5LCB0aGVuIGEgaGFzaCBvZiB0aGUgYHBhY2thZ2UuanNvbmAgd2lsbCBiZSB0YWtlbi4gSWYgdGhpcyBoYXNoIGRpZmZlcnMgZnJvbSB0aGUgbGFzdCBoYXNoLCB0aGUgY29udGVudHMgb2YgYEFQUElVTV9IT01FL25vZGVfbW9kdWxlc2Agd2lsbCBiZSBzY2FubmVkIGZvciBleHRlbnNpb25zIHRoYXQgbWF5IGhhdmUgYmVlbiBpbnN0YWxsZWQgb3V0c2lkZSBvZiB0aGUgYGFwcGl1bWAgQ0xJLiAgQW55IGZvdW5kIGV4dGVuc2lvbnMgd2lsbCBiZSBhZGRlZCB0byB0aGUgbWFuaWZlc3QgZmlsZSwgYW5kIGlmIHNvLCB0aGUgbWFuaWZlc3QgZmlsZSB3aWxsIGJlIHdyaXR0ZW4gdG8gZGlzay5cbiAgICpcbiAgICogT25seSBvbmUgcmVhZCBvcGVyYXRpb24gc2hvdWxkIGhhcHBlbiBhdCBhIHRpbWUuICBUaGlzIGlzIGNvbnRyb2xsZWQgdmlhIHRoZSB7QGxpbmsgTWFuaWZlc3QuX3JlYWRpbmd9IHByb3BlcnR5LlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxNYW5pZmVzdERhdGE+fSBUaGUgZGF0YVxuICAgKi9cbiAgYXN5bmMgcmVhZCgpIHtcbiAgICBpZiAodGhpcy5fcmVhZGluZykge1xuICAgICAgYXdhaXQgdGhpcy5fcmVhZGluZztcbiAgICAgIHJldHVybiB0aGlzLl9kYXRhO1xuICAgIH1cblxuICAgIHRoaXMuX3JlYWRpbmcgPSAoYXN5bmMgKCkgPT4ge1xuICAgICAgLyoqIEB0eXBlIHtNYW5pZmVzdERhdGF9ICovXG4gICAgICBsZXQgZGF0YTtcbiAgICAgIGxldCBpc05ld0ZpbGUgPSBmYWxzZTtcbiAgICAgIGF3YWl0IHRoaXMuX3NldE1hbmlmZXN0UGF0aCgpO1xuICAgICAgdHJ5IHtcbiAgICAgICAgbG9nLmRlYnVnKGBSZWFkaW5nICR7dGhpcy5fbWFuaWZlc3RQYXRofS4uLmApO1xuICAgICAgICBjb25zdCB5YW1sID0gYXdhaXQgZnMucmVhZEZpbGUodGhpcy5fbWFuaWZlc3RQYXRoLCAndXRmOCcpO1xuICAgICAgICBkYXRhID0gWUFNTC5wYXJzZSh5YW1sKTtcbiAgICAgICAgbG9nLmRlYnVnKGBQYXJzZWQgbWFuaWZlc3QgZmlsZTogJHtKU09OLnN0cmluZ2lmeShkYXRhLCBudWxsLCAyKX1gKTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBpZiAoZXJyLmNvZGUgPT09ICdFTk9FTlQnKSB7XG4gICAgICAgICAgZGF0YSA9IF8uY2xvbmVEZWVwKElOSVRJQUxfTUFOSUZFU1RfREFUQSk7XG4gICAgICAgICAgaXNOZXdGaWxlID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAodGhpcy5fbWFuaWZlc3RQYXRoKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgIGBBcHBpdW0gaGFkIHRyb3VibGUgbG9hZGluZyB0aGUgZXh0ZW5zaW9uIGluc3RhbGxhdGlvbiBgICtcbiAgICAgICAgICAgICAgICBgY2FjaGUgZmlsZSAoJHt0aGlzLl9tYW5pZmVzdFBhdGh9KS4gSXQgbWF5IGJlIGludmFsaWQgWUFNTC4gU3BlY2lmaWMgZXJyb3I6ICR7ZXJyLm1lc3NhZ2V9YFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICBgQXBwaXVtIGVuY291bnRlcmVkIGFuIHVua25vd24gcHJvYmxlbS4gU3BlY2lmaWMgZXJyb3I6ICR7ZXJyLm1lc3NhZ2V9YFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5fZGF0YSA9IGRhdGE7XG4gICAgICBsZXQgaW5zdGFsbGVkRXh0ZW5zaW9uc0NoYW5nZWQgPSBmYWxzZTtcbiAgICAgIGlmIChcbiAgICAgICAgKGF3YWl0IGVudi5oYXNBcHBpdW1EZXBlbmRlbmN5KHRoaXMuYXBwaXVtSG9tZSkpICYmXG4gICAgICAgIChhd2FpdCBwYWNrYWdlRGlkQ2hhbmdlKHRoaXMuYXBwaXVtSG9tZSkpXG4gICAgICApIHtcbiAgICAgICAgaW5zdGFsbGVkRXh0ZW5zaW9uc0NoYW5nZWQgPSBhd2FpdCB0aGlzLnN5bmNXaXRoSW5zdGFsbGVkRXh0ZW5zaW9ucygpO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXNOZXdGaWxlIHx8IGluc3RhbGxlZEV4dGVuc2lvbnNDaGFuZ2VkKSB7XG4gICAgICAgIGF3YWl0IHRoaXMud3JpdGUoKTtcbiAgICAgIH1cbiAgICB9KSgpO1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCB0aGlzLl9yZWFkaW5nO1xuICAgICAgcmV0dXJuIHRoaXMuX2RhdGE7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRoaXMuX3JlYWRpbmcgPSB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEVuc3VyZXMge0BsaW5rIE1hbmlmZXN0Ll9tYW5pZmVzdFBhdGh9IGlzIHNldC5cbiAgICpcbiAgICogQ3JlYXRlcyB0aGUgZGlyZWN0b3J5IGlmIG5lY2Vzc2FyeS5cbiAgICogQHByaXZhdGVcbiAgICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn1cbiAgICovXG4gIGFzeW5jIF9zZXRNYW5pZmVzdFBhdGgoKSB7XG4gICAgaWYgKCF0aGlzLl9tYW5pZmVzdFBhdGgpIHtcbiAgICAgIHRoaXMuX21hbmlmZXN0UGF0aCA9IGF3YWl0IGVudi5yZXNvbHZlTWFuaWZlc3RQYXRoKHRoaXMuX2FwcGl1bUhvbWUpO1xuXG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgIGlmIChwYXRoLnJlbGF0aXZlKHRoaXMuX2FwcGl1bUhvbWUsIHRoaXMuX21hbmlmZXN0UGF0aCkuc3RhcnRzV2l0aCgnLicpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgTWlzbWF0Y2ggYmV0d2VlbiBsb2NhdGlvbiBvZiBBUFBJVU1fSE9NRSBhbmQgbWFuaWZlc3QgZmlsZS4gQVBQSVVNX0hPTUU6ICR7dGhpcy5hcHBpdW1Ib21lfSwgbWFuaWZlc3QgZmlsZTogJHt0aGlzLl9tYW5pZmVzdFBhdGh9YFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9tYW5pZmVzdFBhdGg7XG4gIH1cblxuICAvKipcbiAgICogV3JpdGVzIHRoZSBkYXRhIGlmIGl0IG5lZWQgcyB3cml0aW5nLlxuICAgKlxuICAgKiBJZiB0aGUgYHNjaGVtYVJldmAgcHJvcCBuZWVkcyB1cGRhdGluZywgdGhlIGZpbGUgd2lsbCBiZSB3cml0dGVuLlxuICAgKlxuICAgKiBAdG9kbyBJZiB0aGlzIGJlY29tZXMgdG9vIG11Y2ggb2YgYSBib3R0bGVuZWNrLCB0aHJvdHRsZSBpdC5cbiAgICogQHJldHVybnMge1Byb21pc2U8Ym9vbGVhbj59IFdoZXRoZXIgdGhlIGRhdGEgd2FzIHdyaXR0ZW5cbiAgICovXG4gIGFzeW5jIHdyaXRlKCkge1xuICAgIGlmICh0aGlzLl93cml0aW5nKSB7XG4gICAgICByZXR1cm4gdGhpcy5fd3JpdGluZztcbiAgICB9XG4gICAgdGhpcy5fd3JpdGluZyA9IChhc3luYyAoKSA9PiB7XG4gICAgICBhd2FpdCB0aGlzLl9zZXRNYW5pZmVzdFBhdGgoKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IGZzLm1rZGlycChwYXRoLmRpcm5hbWUodGhpcy5fbWFuaWZlc3RQYXRoKSk7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBBcHBpdW0gY291bGQgbm90IGNyZWF0ZSB0aGUgZGlyZWN0b3J5IGZvciB0aGUgbWFuaWZlc3QgZmlsZTogJHtwYXRoLmRpcm5hbWUoXG4gICAgICAgICAgICB0aGlzLl9tYW5pZmVzdFBhdGhcbiAgICAgICAgICApfS4gT3JpZ2luYWwgZXJyb3I6ICR7ZXJyLm1lc3NhZ2V9YFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgZnMud3JpdGVGaWxlKHRoaXMuX21hbmlmZXN0UGF0aCwgWUFNTC5zdHJpbmdpZnkodGhpcy5fZGF0YSksICd1dGY4Jyk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgQXBwaXVtIGNvdWxkIG5vdCB3cml0ZSB0byBtYW5pZmVzdCBhdCAke3RoaXMuX21hbmlmZXN0UGF0aH0gdXNpbmcgQVBQSVVNX0hPTUUgJHt0aGlzLl9hcHBpdW1Ib21lfS4gYCArXG4gICAgICAgICAgICBgUGxlYXNlIGVuc3VyZSBpdCBpcyB3cml0YWJsZS4gT3JpZ2luYWwgZXJyb3I6ICR7ZXJyLm1lc3NhZ2V9YFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH0pKCk7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBhd2FpdCB0aGlzLl93cml0aW5nO1xuICAgIH0gZmluYWxseSB7XG4gICAgICB0aGlzLl93cml0aW5nID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIFR5cGUgb2YgdGhlIHN0cmluZyByZWZlcnJpbmcgdG8gYSBkcml2ZXIgKHR5cGljYWxseSBhcyBhIGtleSBvciB0eXBlIHN0cmluZylcbiAqIEB0eXBlZGVmIHtpbXBvcnQoJ0BhcHBpdW0vdHlwZXMnKS5Ecml2ZXJUeXBlfSBEcml2ZXJUeXBlXG4gKi9cblxuLyoqXG4gKiBUeXBlIG9mIHRoZSBzdHJpbmcgcmVmZXJyaW5nIHRvIGEgcGx1Z2luICh0eXBpY2FsbHkgYXMgYSBrZXkgb3IgdHlwZSBzdHJpbmcpXG4gKiBAdHlwZWRlZiB7aW1wb3J0KCdAYXBwaXVtL3R5cGVzJykuUGx1Z2luVHlwZX0gUGx1Z2luVHlwZVxuICovXG5cbi8qKlxuICogQHR5cGVkZWYgU3luY1dpdGhJbnN0YWxsZWRFeHRlbnNpb25zT3B0c1xuICogQHByb3BlcnR5IHtudW1iZXJ9IFtkZXB0aExpbWl0XSAtIE1heGltdW0gZGVwdGggdG8gcmVjdXJzZSBpbnRvIHN1YmRpcmVjdG9yaWVzXG4gKi9cblxuLyoqXG4gKiBAdHlwZWRlZiB7aW1wb3J0KCdhcHBpdW0vdHlwZXMnKS5NYW5pZmVzdERhdGF9IE1hbmlmZXN0RGF0YVxuICogQHR5cGVkZWYge2ltcG9ydCgnYXBwaXVtL3R5cGVzJykuSW50ZXJuYWxNZXRhZGF0YX0gSW50ZXJuYWxNZXRhZGF0YVxuICovXG5cbi8qKlxuICogQHRlbXBsYXRlIFRcbiAqIEB0eXBlZGVmIHtpbXBvcnQoJ2FwcGl1bS90eXBlcycpLkV4dFBhY2thZ2VKc29uPFQ+fSBFeHRQYWNrYWdlSnNvblxuICovXG5cbi8qKlxuICogQHRlbXBsYXRlIFRcbiAqIEB0eXBlZGVmIHtpbXBvcnQoJ2FwcGl1bS90eXBlcycpLkV4dE1hbmlmZXN0PFQ+fSBFeHRNYW5pZmVzdFxuICovXG5cbi8qKlxuICogQHRlbXBsYXRlIFRcbiAqIEB0eXBlZGVmIHtpbXBvcnQoJ2FwcGl1bS90eXBlcycpLkV4dFJlY29yZDxUPn0gRXh0UmVjb3JkXG4gKi9cblxuLyoqXG4gKiBFaXRoZXIgYGRyaXZlcmAgb3IgYHBsdWdpbmAgcm5cbiAqIEB0eXBlZGVmIHtpbXBvcnQoJ0BhcHBpdW0vdHlwZXMnKS5FeHRlbnNpb25UeXBlfSBFeHRlbnNpb25UeXBlXG4gKi9cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBSUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7QUFLQSxNQUFNQSxpQkFBaUIsR0FBRyxDQUExQjtBQU1BLE1BQU1DLHNCQUFzQixHQUFJLEdBQUVDLHNCQUFZLEdBQTlDO0FBTUEsTUFBTUMsc0JBQXNCLEdBQUksR0FBRUMsc0JBQVksR0FBOUM7QUFLQSxNQUFNQyxxQkFBcUIsR0FBR0MsTUFBTSxDQUFDQyxNQUFQLENBQWM7RUFDMUMsQ0FBQ04sc0JBQUQsR0FBMEJLLE1BQU0sQ0FBQ0MsTUFBUCxDQUFjLEVBQWQsQ0FEZ0I7RUFFMUMsQ0FBQ0osc0JBQUQsR0FBMEJHLE1BQU0sQ0FBQ0MsTUFBUCxDQUFjLEVBQWQsQ0FGZ0I7RUFHMUNDLFNBQVMsRUFBRVI7QUFIK0IsQ0FBZCxDQUE5Qjs7QUFhQSxTQUFTUyxXQUFULENBQXFCQyxLQUFyQixFQUE0QjtFQUMxQixPQUNFQyxlQUFBLENBQUVDLGFBQUYsQ0FBZ0JGLEtBQWhCLEtBQ0FDLGVBQUEsQ0FBRUMsYUFBRixDQUFnQkYsS0FBSyxDQUFDRyxNQUF0QixDQURBLElBRUFGLGVBQUEsQ0FBRUcsUUFBRixDQUFXSixLQUFLLENBQUNLLElBQWpCLENBRkEsSUFHQUosZUFBQSxDQUFFRyxRQUFGLENBQVdKLEtBQUssQ0FBQ00sT0FBakIsQ0FKRjtBQU1EOztBQVNELFNBQVNDLFFBQVQsQ0FBa0JQLEtBQWxCLEVBQXlCO0VBQ3ZCLE9B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