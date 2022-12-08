"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.APPIUM_VER = void 0;
exports.checkNodeOk = checkNodeOk;
exports.checkNpmOk = checkNpmOk;
exports.getBuildInfo = getBuildInfo;
exports.getGitRev = getGitRev;
exports.getNonDefaultServerArgs = getNonDefaultServerArgs;
exports.rootDir = void 0;
exports.showBuildInfo = showBuildInfo;
exports.showConfig = showConfig;
exports.updateBuildInfo = updateBuildInfo;
exports.validateTmpDir = validateTmpDir;
exports.warnNodeDeprecations = warnNodeDeprecations;

require("source-map-support/register");

var _lodash = _interopRequireDefault(require("lodash"));

var _support = require("@appium/support");

var _axios = _interopRequireDefault(require("axios"));

var _teen_process = require("teen_process");

var _semver = _interopRequireDefault(require("semver"));

var _findUp = _interopRequireDefault(require("find-up"));

var _schema = require("./schema/schema");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const npmPackage = _support.fs.readPackageJsonFrom(__dirname);

const APPIUM_VER = npmPackage.version;
exports.APPIUM_VER = APPIUM_VER;
const MIN_NODE_VERSION = npmPackage.engines.node;
const MIN_NPM_VERSION = npmPackage.engines.npm;
const GIT_META_ROOT = '.git';
const GIT_BINARY = `git${_support.system.isWindows() ? '.exe' : ''}`;
const GITHUB_API = 'https://api.github.com/repos/appium/appium';
const BUILD_INFO = {
  version: APPIUM_VER
};

function getNodeVersion() {
  return _semver.default.coerce(process.version);
}

async function getNpmVersion() {
  const {
    stdout
  } = await (0, _teen_process.exec)(_support.system.isWindows() ? 'npm.cmd' : 'npm', ['--version']);
  return stdout.trim();
}

async function updateBuildInfo(useGithubApiFallback = false) {
  const sha = await getGitRev(useGithubApiFallback);

  if (!sha) {
    return;
  }

  BUILD_INFO['git-sha'] = sha;
  const buildTimestamp = await getGitTimestamp(sha, useGithubApiFallback);

  if (buildTimestamp) {
    BUILD_INFO.built = buildTimestamp;
  }
}

async function findGitRoot() {
  return await (0, _findUp.default)(GIT_META_ROOT, {
    cwd: rootDir,
    type: 'directory'
  });
}

async function getGitRev(useGithubApiFallback = false) {
  const gitRoot = await findGitRoot();

  if (gitRoot) {
    try {
      const {
        stdout
      } = await (0, _teen_process.exec)(GIT_BINARY, ['rev-parse', 'HEAD'], {
        cwd: gitRoot
      });
      return stdout.trim();
    } catch (ign) {}
  }

  if (!useGithubApiFallback) {
    return null;
  }

  try {
    var _await$axios$get$data, _await$axios$get$data2;

    return (_await$axios$get$data = (await _axios.default.get(`${GITHUB_API}/git/refs/tags/appium@${APPIUM_VER}`, {
      headers: {
        'User-Agent': `Appium ${APPIUM_VER}`
      }
    })).data) === null || _await$axios$get$data === void 0 ? void 0 : (_await$axios$get$data2 = _await$axios$get$data.object) === null || _await$axios$get$data2 === void 0 ? void 0 : _await$axios$get$data2.sha;
  } catch (ign) {}

  return null;
}

async function getGitTimestamp(commitSha, useGithubApiFallback = false) {
  const gitRoot = await findGitRoot();

  if (gitRoot) {
    try {
      const {
        stdout
      } = await (0, _teen_process.exec)(GIT_BINARY, ['show', '-s', '--format=%ci', commitSha], {
        cwd: gitRoot
      });
      return stdout.trim();
    } catch (ign) {}
  }

  if (!useGithubApiFallback) {
    return null;
  }

  try {
    var _await$axios$get$data3, _await$axios$get$data4;

    return (_await$axios$get$data3 = (await _axios.default.get(`${GITHUB_API}/git/tags/${commitSha}`, {
      headers: {
        'User-Agent': `Appium ${APPIUM_VER}`
      }
    })).data) === null || _await$axios$get$data3 === void 0 ? void 0 : (_await$axios$get$data4 = _await$axios$get$data3.tagger) === null || _await$axios$get$data4 === void 0 ? void 0 : _await$axios$get$data4.date;
  } catch (ign) {}

  return null;
}

function getBuildInfo() {
  return BUILD_INFO;
}

function checkNodeOk() {
  const version = getNodeVersion();

  if (!_semver.default.satisfies(version, MIN_NODE_VERSION)) {
    throw new Error(`Node version must be at least ${MIN_NODE_VERSION}; current is ${version.version}`);
  }
}

async function checkNpmOk() {
  const npmVersion = await getNpmVersion();

  if (!_semver.default.satisfies(npmVersion, MIN_NPM_VERSION)) {
    throw new Error(`npm version must be at least ${MIN_NPM_VERSION}; current is ${npmVersion}. Run "npm install -g npm" to upgrade.`);
  }
}

function warnNodeDeprecations() {}

async function showBuildInfo() {
  await updateBuildInfo(true);
  console.log(JSON.stringify(getBuildInfo()));
}

function getNonDefaultServerArgs(parsedArgs) {
  const flatten = args => {
    const argSpecs = (0, _schema.getAllArgSpecs)();

    const flattened = _lodash.default.reduce([...argSpecs.values()], (acc, argSpec) => {
      if (_lodash.default.has(args, argSpec.dest)) {
        acc[argSpec.dest] = {
          value: _lodash.default.get(args, argSpec.dest),
          argSpec
        };
      }

      return acc;
    }, {});

    return flattened;
  };

  const args = flatten(parsedArgs);

  const typesDiffer = dest => typeof args[dest].value !== typeof defaultsFromSchema[dest];

  const defaultValueIsArray = dest => _lodash.default.isArray(defaultsFromSchema[dest]);

  const argsValueIsArray = dest => _lodash.default.isArray(args[dest].value);

  const arraysDiffer = dest => _lodash.default.gt(_lodash.default.size(_lodash.default.difference(args[dest].value, defaultsFromSchema[dest])), 0);

  const valuesDiffer = dest => args[dest].value !== defaultsFromSchema[dest];

  const defaultIsDefined = dest => !_lodash.default.isUndefined(defaultsFromSchema[dest]);

  const argValueNotArrayOrArraysDiffer = _lodash.default.overSome([_lodash.default.negate(argsValueIsArray), arraysDiffer]);

  const defaultValueNotArrayAndValuesDiffer = _lodash.default.overEvery([_lodash.default.negate(defaultValueIsArray), valuesDiffer]);

  const isNotDefault = _lodash.default.overEvery([defaultIsDefined, _lodash.default.overSome([typesDiffer, _lodash.default.overEvery([defaultValueIsArray, argValueNotArrayOrArraysDiffer]), defaultValueNotArrayAndValuesDiffer])]);

  const defaultsFromSchema = (0, _schema.getDefaultsForSchema)(true);
  return _lodash.default.reduce(_lodash.default.pickBy(args, (__, key) => isNotDefault(key)), (acc, {
    value,
    argSpec
  }) => _lodash.default.set(acc, argSpec.dest, value), {});
}

const compactConfig = _lodash.default.partial(_lodash.default.omitBy, _lodash.default, (value, key) => key === 'subcommand' || _lodash.default.isUndefined(value) || _lodash.default.isObject(value) && _lodash.default.isEmpty(value));

function showConfig(nonDefaultPreConfigParsedArgs, configResult, defaults, parsedArgs) {
  console.log('Appium Configuration\n');
  console.log('from defaults:\n');
  console.dir(compactConfig(defaults));

  if (configResult.config) {
    console.log(`\nfrom config file at ${configResult.filepath}:\n`);
    console.dir(compactConfig(configResult.config));
  } else {
    console.log(`\n(no configuration file loaded)`);
  }

  if (_lodash.default.isEmpty(nonDefaultPreConfigParsedArgs)) {
    console.log(`\n(no CLI parameters provided)`);
  } else {
    console.log('\nvia CLI or function call:\n');
    console.dir(compactConfig(nonDefaultPreConfigParsedArgs));
  }

  console.log('\nfinal configuration:\n');
  console.dir(compactConfig(parsedArgs));
}

async function validateTmpDir(tmpDir) {
  try {
    await _support.fs.mkdirp(tmpDir);
  } catch (e) {
    throw new Error(`We could not ensure that the temp dir you specified ` + `(${tmpDir}) exists. Please make sure it's writeable.`);
  }
}

const rootDir = _support.fs.findRoot(__dirname);

exports.rootDir = rootDir;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJucG1QYWNrYWdlIiwiZnMiLCJyZWFkUGFja2FnZUpzb25Gcm9tIiwiX19kaXJuYW1lIiwiQVBQSVVNX1ZFUiIsInZlcnNpb24iLCJNSU5fTk9ERV9WRVJTSU9OIiwiZW5naW5lcyIsIm5vZGUiLCJNSU5fTlBNX1ZFUlNJT04iLCJucG0iLCJHSVRfTUVUQV9ST09UIiwiR0lUX0JJTkFSWSIsInN5c3RlbSIsImlzV2luZG93cyIsIkdJVEhVQl9BUEkiLCJCVUlMRF9JTkZPIiwiZ2V0Tm9kZVZlcnNpb24iLCJzZW12ZXIiLCJjb2VyY2UiLCJwcm9jZXNzIiwiZ2V0TnBtVmVyc2lvbiIsInN0ZG91dCIsImV4ZWMiLCJ0cmltIiwidXBkYXRlQnVpbGRJbmZvIiwidXNlR2l0aHViQXBpRmFsbGJhY2siLCJzaGEiLCJnZXRHaXRSZXYiLCJidWlsZFRpbWVzdGFtcCIsImdldEdpdFRpbWVzdGFtcCIsImJ1aWx0IiwiZmluZEdpdFJvb3QiLCJmaW5kVXAiLCJjd2QiLCJyb290RGlyIiwidHlwZSIsImdpdFJvb3QiLCJpZ24iLCJheGlvcyIsImdldCIsImhlYWRlcnMiLCJkYXRhIiwib2JqZWN0IiwiY29tbWl0U2hhIiwidGFnZ2VyIiwiZGF0ZSIsImdldEJ1aWxkSW5mbyIsImNoZWNrTm9kZU9rIiwic2F0aXNmaWVzIiwiRXJyb3IiLCJjaGVja05wbU9rIiwibnBtVmVyc2lvbiIsIndhcm5Ob2RlRGVwcmVjYXRpb25zIiwic2hvd0J1aWxkSW5mbyIsImNvbnNvbGUiLCJsb2ciLCJKU09OIiwic3RyaW5naWZ5IiwiZ2V0Tm9uRGVmYXVsdFNlcnZlckFyZ3MiLCJwYXJzZWRBcmdzIiwiZmxhdHRlbiIsImFyZ3MiLCJhcmdTcGVjcyIsImdldEFsbEFyZ1NwZWNzIiwiZmxhdHRlbmVkIiwiXyIsInJlZHVjZSIsInZhbHVlcyIsImFjYyIsImFyZ1NwZWMiLCJoYXMiLCJkZXN0IiwidmFsdWUiLCJ0eXBlc0RpZmZlciIsImRlZmF1bHRzRnJvbVNjaGVtYSIsImRlZmF1bHRWYWx1ZUlzQXJyYXkiLCJpc0FycmF5IiwiYXJnc1ZhbHVlSXNBcnJheSIsImFycmF5c0RpZmZlciIsImd0Iiwic2l6ZSIsImRpZmZlcmVuY2UiLCJ2YWx1ZXNEaWZmZXIiLCJkZWZhdWx0SXNEZWZpbmVkIiwiaXNVbmRlZmluZWQiLCJhcmdWYWx1ZU5vdEFycmF5T3JBcnJheXNEaWZmZXIiLCJvdmVyU29tZSIsIm5lZ2F0ZSIsImRlZmF1bHRWYWx1ZU5vdEFycmF5QW5kVmFsdWVzRGlmZmVyIiwib3ZlckV2ZXJ5IiwiaXNOb3REZWZhdWx0IiwiZ2V0RGVmYXVsdHNGb3JTY2hlbWEiLCJwaWNrQnkiLCJfXyIsImtleSIsInNldCIsImNvbXBhY3RDb25maWciLCJwYXJ0aWFsIiwib21pdEJ5IiwiaXNPYmplY3QiLCJpc0VtcHR5Iiwic2hvd0NvbmZpZyIsIm5vbkRlZmF1bHRQcmVDb25maWdQYXJzZWRBcmdzIiwiY29uZmlnUmVzdWx0IiwiZGVmYXVsdHMiLCJkaXIiLCJjb25maWciLCJmaWxlcGF0aCIsInZhbGlkYXRlVG1wRGlyIiwidG1wRGlyIiwibWtkaXJwIiwiZSIsImZpbmRSb290Il0sInNvdXJjZXMiOlsiLi4vLi4vbGliL2NvbmZpZy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiBlc2xpbnQtZGlzYWJsZSBuby1jb25zb2xlICovXG5pbXBvcnQgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IHtzeXN0ZW0sIGZzfSBmcm9tICdAYXBwaXVtL3N1cHBvcnQnO1xuaW1wb3J0IGF4aW9zIGZyb20gJ2F4aW9zJztcbmltcG9ydCB7ZXhlY30gZnJvbSAndGVlbl9wcm9jZXNzJztcbmltcG9ydCBzZW12ZXIgZnJvbSAnc2VtdmVyJztcbmltcG9ydCBmaW5kVXAgZnJvbSAnZmluZC11cCc7XG5pbXBvcnQge2dldERlZmF1bHRzRm9yU2NoZW1hLCBnZXRBbGxBcmdTcGVjc30gZnJvbSAnLi9zY2hlbWEvc2NoZW1hJztcblxuY29uc3QgbnBtUGFja2FnZSA9IGZzLnJlYWRQYWNrYWdlSnNvbkZyb20oX19kaXJuYW1lKTtcblxuY29uc3QgQVBQSVVNX1ZFUiA9IG5wbVBhY2thZ2UudmVyc2lvbjtcbmNvbnN0IE1JTl9OT0RFX1ZFUlNJT04gPSBucG1QYWNrYWdlLmVuZ2luZXMubm9kZTtcbmNvbnN0IE1JTl9OUE1fVkVSU0lPTiA9IG5wbVBhY2thZ2UuZW5naW5lcy5ucG07XG5cbmNvbnN0IEdJVF9NRVRBX1JPT1QgPSAnLmdpdCc7XG5jb25zdCBHSVRfQklOQVJZID0gYGdpdCR7c3lzdGVtLmlzV2luZG93cygpID8gJy5leGUnIDogJyd9YDtcbmNvbnN0IEdJVEhVQl9BUEkgPSAnaHR0cHM6Ly9hcGkuZ2l0aHViLmNvbS9yZXBvcy9hcHBpdW0vYXBwaXVtJztcblxuLyoqXG4gKiBAdHlwZSB7aW1wb3J0KCdhcHBpdW0vdHlwZXMnKS5CdWlsZEluZm99XG4gKi9cbmNvbnN0IEJVSUxEX0lORk8gPSB7XG4gIHZlcnNpb246IEFQUElVTV9WRVIsXG59O1xuXG5mdW5jdGlvbiBnZXROb2RlVmVyc2lvbigpIHtcbiAgcmV0dXJuIC8qKiBAdHlwZSB7aW1wb3J0KCdzZW12ZXInKS5TZW1WZXJ9ICovIChzZW12ZXIuY29lcmNlKHByb2Nlc3MudmVyc2lvbikpO1xufVxuXG4vKipcbiAqIFJldHVybnMgdmVyc2lvbiBvZiBgbnBtYFxuICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn1cbiAqL1xuYXN5bmMgZnVuY3Rpb24gZ2V0TnBtVmVyc2lvbigpIHtcbiAgY29uc3Qge3N0ZG91dH0gPSBhd2FpdCBleGVjKHN5c3RlbS5pc1dpbmRvd3MoKSA/ICducG0uY21kJyA6ICducG0nLCBbJy0tdmVyc2lvbiddKTtcbiAgcmV0dXJuIHN0ZG91dC50cmltKCk7XG59XG5cbi8qKlxuICogQHBhcmFtIHtib29sZWFufSBbdXNlR2l0aHViQXBpRmFsbGJhY2tdXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHVwZGF0ZUJ1aWxkSW5mbyh1c2VHaXRodWJBcGlGYWxsYmFjayA9IGZhbHNlKSB7XG4gIGNvbnN0IHNoYSA9IGF3YWl0IGdldEdpdFJldih1c2VHaXRodWJBcGlGYWxsYmFjayk7XG4gIGlmICghc2hhKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIEJVSUxEX0lORk9bJ2dpdC1zaGEnXSA9IHNoYTtcbiAgY29uc3QgYnVpbGRUaW1lc3RhbXAgPSBhd2FpdCBnZXRHaXRUaW1lc3RhbXAoc2hhLCB1c2VHaXRodWJBcGlGYWxsYmFjayk7XG4gIGlmIChidWlsZFRpbWVzdGFtcCkge1xuICAgIEJVSUxEX0lORk8uYnVpbHQgPSBidWlsZFRpbWVzdGFtcDtcbiAgfVxufVxuXG4vKipcbiAqIEZpbmRzIHRoZSBHaXQgbWV0YWRhdGEgZGlyIChzZWUgYEdJVF9NRVRBX1JPT1RgKVxuICpcbiAqIFRoaXMgaXMgbmVlZGVkIGJlY2F1c2UgQXBwaXVtIGNhbm5vdCBhc3N1bWUgYHBhY2thZ2UuanNvbmAgYW5kIGAuZ2l0YCBhcmUgaW4gdGhlIHNhbWVcbiAqIGRpcmVjdG9yeS4gIE1vbm9yZXBvcywgc2VlP1xuICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nfHVuZGVmaW5lZD59IFBhdGggdG8gZGlyIG9yIGB1bmRlZmluZWRgIGlmIG5vdCBmb3VuZFxuICovXG5hc3luYyBmdW5jdGlvbiBmaW5kR2l0Um9vdCgpIHtcbiAgcmV0dXJuIGF3YWl0IGZpbmRVcChHSVRfTUVUQV9ST09ULCB7Y3dkOiByb290RGlyLCB0eXBlOiAnZGlyZWN0b3J5J30pO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW3VzZUdpdGh1YkFwaUZhbGxiYWNrXVxuICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPz59XG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGdldEdpdFJldih1c2VHaXRodWJBcGlGYWxsYmFjayA9IGZhbHNlKSB7XG4gIGNvbnN0IGdpdFJvb3QgPSBhd2FpdCBmaW5kR2l0Um9vdCgpO1xuICBpZiAoZ2l0Um9vdCkge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB7c3Rkb3V0fSA9IGF3YWl0IGV4ZWMoR0lUX0JJTkFSWSwgWydyZXYtcGFyc2UnLCAnSEVBRCddLCB7XG4gICAgICAgIGN3ZDogZ2l0Um9vdCxcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHN0ZG91dC50cmltKCk7XG4gICAgfSBjYXRjaCAoaWduKSB7fVxuICB9XG5cbiAgaWYgKCF1c2VHaXRodWJBcGlGYWxsYmFjaykge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLy8gSWYgdGhlIHBhY2thZ2UgZm9sZGVyIGlzIG5vdCBhIHZhbGlkIGdpdCByZXBvc2l0b3J5XG4gIC8vIHRoZW4gZmV0Y2ggdGhlIGNvcnJlc3BvbmRpbmcgdGFnIGluZm8gZnJvbSBHaXRIdWJcbiAgdHJ5IHtcbiAgICByZXR1cm4gKFxuICAgICAgYXdhaXQgYXhpb3MuZ2V0KGAke0dJVEhVQl9BUEl9L2dpdC9yZWZzL3RhZ3MvYXBwaXVtQCR7QVBQSVVNX1ZFUn1gLCB7XG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAnVXNlci1BZ2VudCc6IGBBcHBpdW0gJHtBUFBJVU1fVkVSfWAsXG4gICAgICAgIH0sXG4gICAgICB9KVxuICAgICkuZGF0YT8ub2JqZWN0Py5zaGE7XG4gIH0gY2F0Y2ggKGlnbikge31cbiAgcmV0dXJuIG51bGw7XG59XG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd9IGNvbW1pdFNoYVxuICogQHBhcmFtIHtib29sZWFufSBbdXNlR2l0aHViQXBpRmFsbGJhY2tdXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc/Pn1cbiAqL1xuYXN5bmMgZnVuY3Rpb24gZ2V0R2l0VGltZXN0YW1wKGNvbW1pdFNoYSwgdXNlR2l0aHViQXBpRmFsbGJhY2sgPSBmYWxzZSkge1xuICBjb25zdCBnaXRSb290ID0gYXdhaXQgZmluZEdpdFJvb3QoKTtcbiAgaWYgKGdpdFJvb3QpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3Qge3N0ZG91dH0gPSBhd2FpdCBleGVjKEdJVF9CSU5BUlksIFsnc2hvdycsICctcycsICctLWZvcm1hdD0lY2knLCBjb21taXRTaGFdLCB7XG4gICAgICAgIGN3ZDogZ2l0Um9vdCxcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHN0ZG91dC50cmltKCk7XG4gICAgfSBjYXRjaCAoaWduKSB7fVxuICB9XG5cbiAgaWYgKCF1c2VHaXRodWJBcGlGYWxsYmFjaykge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgdHJ5IHtcbiAgICByZXR1cm4gKFxuICAgICAgYXdhaXQgYXhpb3MuZ2V0KGAke0dJVEhVQl9BUEl9L2dpdC90YWdzLyR7Y29tbWl0U2hhfWAsIHtcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICdVc2VyLUFnZW50JzogYEFwcGl1bSAke0FQUElVTV9WRVJ9YCxcbiAgICAgICAgfSxcbiAgICAgIH0pXG4gICAgKS5kYXRhPy50YWdnZXI/LmRhdGU7XG4gIH0gY2F0Y2ggKGlnbikge31cbiAgcmV0dXJuIG51bGw7XG59XG5cbi8qKlxuICogTXV0YWJsZSBvYmplY3QgY29udGFpbmluZyBBcHBpdW0gYnVpbGQgaW5mb3JtYXRpb24uIEJ5IGRlZmF1bHQgaXRcbiAqIG9ubHkgY29udGFpbnMgdGhlIEFwcGl1bSB2ZXJzaW9uLCBidXQgaXMgdXBkYXRlZCB3aXRoIHRoZSBidWlsZCB0aW1lc3RhbXBcbiAqIGFuZCBnaXQgY29tbWl0IGhhc2ggYXN5bmNocm9ub3VzbHkgYXMgc29vbiBhcyBgdXBkYXRlQnVpbGRJbmZvYCBpcyBjYWxsZWRcbiAqIGFuZCBzdWNjZWVkcy5cbiAqIEByZXR1cm5zIHtpbXBvcnQoJ2FwcGl1bS90eXBlcycpLkJ1aWxkSW5mb31cbiAqL1xuZnVuY3Rpb24gZ2V0QnVpbGRJbmZvKCkge1xuICByZXR1cm4gQlVJTERfSU5GTztcbn1cblxuZnVuY3Rpb24gY2hlY2tOb2RlT2soKSB7XG4gIGNvbnN0IHZlcnNpb24gPSBnZXROb2RlVmVyc2lvbigpO1xuICBpZiAoIXNlbXZlci5zYXRpc2ZpZXModmVyc2lvbiwgTUlOX05PREVfVkVSU0lPTikpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgTm9kZSB2ZXJzaW9uIG11c3QgYmUgYXQgbGVhc3QgJHtNSU5fTk9ERV9WRVJTSU9OfTsgY3VycmVudCBpcyAke3ZlcnNpb24udmVyc2lvbn1gXG4gICAgKTtcbiAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2hlY2tOcG1PaygpIHtcbiAgY29uc3QgbnBtVmVyc2lvbiA9IGF3YWl0IGdldE5wbVZlcnNpb24oKTtcbiAgaWYgKCFzZW12ZXIuc2F0aXNmaWVzKG5wbVZlcnNpb24sIE1JTl9OUE1fVkVSU0lPTikpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgbnBtIHZlcnNpb24gbXVzdCBiZSBhdCBsZWFzdCAke01JTl9OUE1fVkVSU0lPTn07IGN1cnJlbnQgaXMgJHtucG1WZXJzaW9ufS4gUnVuIFwibnBtIGluc3RhbGwgLWcgbnBtXCIgdG8gdXBncmFkZS5gXG4gICAgKTtcbiAgfVxufVxuXG5mdW5jdGlvbiB3YXJuTm9kZURlcHJlY2F0aW9ucygpIHtcbiAgLyoqXG4gICAqIFVuY29tbWVudCB0aGlzIHNlY3Rpb24gdG8gZ2V0IG5vZGUgdmVyc2lvbiBkZXByZWNhdGlvbiB3YXJuaW5nc1xuICAgKiBBbHNvIGFkZCB0ZXN0IGNhc2VzIHRvIGNvbmZpZy1zcGVjcy5qcyB0byBjb3ZlciB0aGUgY2FzZXMgYWRkZWRcbiAgICoqL1xuICAvLyBjb25zdCB2ZXJzaW9uID0gZ2V0Tm9kZVZlcnNpb24oKTtcbiAgLy8gaWYgKHZlcnNpb24ubWFqb3IgPCA4KSB7XG4gIC8vICAgbG9nZ2VyLndhcm4oYEFwcGl1bSBzdXBwb3J0IGZvciB2ZXJzaW9ucyBvZiBub2RlIDwgJHt2ZXJzaW9uLm1ham9yfSBoYXMgYmVlbiBgICtcbiAgLy8gICAgICAgICAgICAgICAnZGVwcmVjYXRlZCBhbmQgd2lsbCBiZSByZW1vdmVkIGluIGEgZnV0dXJlIHZlcnNpb24uIFBsZWFzZSAnICtcbiAgLy8gICAgICAgICAgICAgICAndXBncmFkZSEnKTtcbiAgLy8gfVxufVxuXG5hc3luYyBmdW5jdGlvbiBzaG93QnVpbGRJbmZvKCkge1xuICBhd2FpdCB1cGRhdGVCdWlsZEluZm8odHJ1ZSk7XG4gIGNvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KGdldEJ1aWxkSW5mbygpKSk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29uc29sZVxufVxuXG4vKipcbiAqIFJldHVybnMgay92IHBhaXJzIG9mIHNlcnZlciBhcmd1bWVudHMgd2hpY2ggYXJlIF9ub3RfIHRoZSBkZWZhdWx0cy5cbiAqIEBwYXJhbSB7QXJnc30gcGFyc2VkQXJnc1xuICogQHJldHVybnMge0FyZ3N9XG4gKi9cbmZ1bmN0aW9uIGdldE5vbkRlZmF1bHRTZXJ2ZXJBcmdzKHBhcnNlZEFyZ3MpIHtcbiAgLyoqXG4gICAqIEZsYXR0ZW5zIHBhcnNlZCBhcmdzIGludG8gYSBzaW5nbGUgbGV2ZWwgb2JqZWN0IGZvciBjb21wYXJpc29uIHdpdGhcbiAgICogZmxhdHRlbmVkIGRlZmF1bHRzIGFjcm9zcyBzZXJ2ZXIgYXJncyBhbmQgZXh0ZW5zaW9uIGFyZ3MuXG4gICAqIEBwYXJhbSB7QXJnc30gYXJnc1xuICAgKiBAcmV0dXJucyB7UmVjb3JkPHN0cmluZywgeyB2YWx1ZTogYW55LCBhcmdTcGVjOiBBcmdTcGVjIH0+fVxuICAgKi9cbiAgY29uc3QgZmxhdHRlbiA9IChhcmdzKSA9PiB7XG4gICAgY29uc3QgYXJnU3BlY3MgPSBnZXRBbGxBcmdTcGVjcygpO1xuICAgIGNvbnN0IGZsYXR0ZW5lZCA9IF8ucmVkdWNlKFxuICAgICAgWy4uLmFyZ1NwZWNzLnZhbHVlcygpXSxcbiAgICAgIChhY2MsIGFyZ1NwZWMpID0+IHtcbiAgICAgICAgaWYgKF8uaGFzKGFyZ3MsIGFyZ1NwZWMuZGVzdCkpIHtcbiAgICAgICAgICBhY2NbYXJnU3BlYy5kZXN0XSA9IHt2YWx1ZTogXy5nZXQoYXJncywgYXJnU3BlYy5kZXN0KSwgYXJnU3BlY307XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFjYztcbiAgICAgIH0sXG4gICAgICAvKiogQHR5cGUge1JlY29yZDxzdHJpbmcsIHsgdmFsdWU6IGFueSwgYXJnU3BlYzogQXJnU3BlYyB9Pn0gKi8gKHt9KVxuICAgICk7XG5cbiAgICByZXR1cm4gZmxhdHRlbmVkO1xuICB9O1xuXG4gIGNvbnN0IGFyZ3MgPSBmbGF0dGVuKHBhcnNlZEFyZ3MpO1xuXG4gIC8vIGhvcGVmdWxseSB0aGVzZSBmdW5jdGlvbiBuYW1lcyBhcmUgZGVzY3JpcHRpdmUgZW5vdWdoXG4gIGNvbnN0IHR5cGVzRGlmZmVyID0gLyoqIEBwYXJhbSB7c3RyaW5nfSBkZXN0ICovIChkZXN0KSA9PlxuICAgIHR5cGVvZiBhcmdzW2Rlc3RdLnZhbHVlICE9PSB0eXBlb2YgZGVmYXVsdHNGcm9tU2NoZW1hW2Rlc3RdO1xuXG4gIGNvbnN0IGRlZmF1bHRWYWx1ZUlzQXJyYXkgPSAvKiogQHBhcmFtIHtzdHJpbmd9IGRlc3QgKi8gKGRlc3QpID0+XG4gICAgXy5pc0FycmF5KGRlZmF1bHRzRnJvbVNjaGVtYVtkZXN0XSk7XG5cbiAgY29uc3QgYXJnc1ZhbHVlSXNBcnJheSA9IC8qKiBAcGFyYW0ge3N0cmluZ30gZGVzdCAqLyAoZGVzdCkgPT4gXy5pc0FycmF5KGFyZ3NbZGVzdF0udmFsdWUpO1xuXG4gIGNvbnN0IGFycmF5c0RpZmZlciA9IC8qKiBAcGFyYW0ge3N0cmluZ30gZGVzdCAqLyAoZGVzdCkgPT5cbiAgICBfLmd0KF8uc2l6ZShfLmRpZmZlcmVuY2UoYXJnc1tkZXN0XS52YWx1ZSwgZGVmYXVsdHNGcm9tU2NoZW1hW2Rlc3RdKSksIDApO1xuXG4gIGNvbnN0IHZhbHVlc0RpZmZlciA9IC8qKiBAcGFyYW0ge3N0cmluZ30gZGVzdCAqLyAoZGVzdCkgPT5cbiAgICBhcmdzW2Rlc3RdLnZhbHVlICE9PSBkZWZhdWx0c0Zyb21TY2hlbWFbZGVzdF07XG5cbiAgY29uc3QgZGVmYXVsdElzRGVmaW5lZCA9IC8qKiBAcGFyYW0ge3N0cmluZ30gZGVzdCAqLyAoZGVzdCkgPT5cbiAgICAhXy5pc1VuZGVmaW5lZChkZWZhdWx0c0Zyb21TY2hlbWFbZGVzdF0pO1xuXG4gIC8vIG5vdGUgdGhhdCBgXy5vdmVyRXZlcnlgIGlzIGxpa2UgYW4gXCJBTkRcIiwgYW5kIGBfLm92ZXJTb21lYCBpcyBsaWtlIGFuIFwiT1JcIlxuXG4gIGNvbnN0IGFyZ1ZhbHVlTm90QXJyYXlPckFycmF5c0RpZmZlciA9IF8ub3ZlclNvbWUoW18ubmVnYXRlKGFyZ3NWYWx1ZUlzQXJyYXkpLCBhcnJheXNEaWZmZXJdKTtcblxuICBjb25zdCBkZWZhdWx0VmFsdWVOb3RBcnJheUFuZFZhbHVlc0RpZmZlciA9IF8ub3ZlckV2ZXJ5KFtcbiAgICBfLm5lZ2F0ZShkZWZhdWx0VmFsdWVJc0FycmF5KSxcbiAgICB2YWx1ZXNEaWZmZXIsXG4gIF0pO1xuXG4gIC8qKlxuICAgKiBUaGlzIHVzZWQgdG8gYmUgYSBoaWRlb3VzIGNvbmRpdGlvbmFsLCBidXQgaXQncyBicm9rZW4gdXAgaW50byBhIGhpZGVvdXMgZnVuY3Rpb24gaW5zdGVhZC5cbiAgICogaG9wZWZ1bGx5IHRoaXMgbWFrZXMgdGhpbmdzIGEgbGl0dGxlIG1vcmUgdW5kZXJzdGFuZGFibGUuXG4gICAqIC0gY2hlY2tzIGlmIHRoZSBkZWZhdWx0IHZhbHVlIGlzIGRlZmluZWRcbiAgICogLSBpZiBzbywgYW5kIHRoZSBkZWZhdWx0IGlzIG5vdCBhbiBhcnJheTpcbiAgICogICAtIGVuc3VyZXMgdGhlIHR5cGVzIGFyZSB0aGUgc2FtZVxuICAgKiAgIC0gZW5zdXJlcyB0aGUgdmFsdWVzIGFyZSBlcXVhbFxuICAgKiAtIGlmIHNvLCBhbmQgdGhlIGRlZmF1bHQgaXMgYW4gYXJyYXk6XG4gICAqICAgLSBlbnN1cmVzIHRoZSBhcmdzIHZhbHVlIGlzIGFuIGFycmF5XG4gICAqICAgLSBlbnN1cmVzIHRoZSBhcmdzIHZhbHVlcyBkbyBub3QgZGlmZmVyIGZyb20gdGhlIGRlZmF1bHQgdmFsdWVzXG4gICAqIEB0eXBlIHsoZGVzdDogc3RyaW5nKSA9PiBib29sZWFufVxuICAgKi9cbiAgY29uc3QgaXNOb3REZWZhdWx0ID0gXy5vdmVyRXZlcnkoW1xuICAgIGRlZmF1bHRJc0RlZmluZWQsXG4gICAgXy5vdmVyU29tZShbXG4gICAgICB0eXBlc0RpZmZlcixcbiAgICAgIF8ub3ZlckV2ZXJ5KFtkZWZhdWx0VmFsdWVJc0FycmF5LCBhcmdWYWx1ZU5vdEFycmF5T3JBcnJheXNEaWZmZXJdKSxcbiAgICAgIGRlZmF1bHRWYWx1ZU5vdEFycmF5QW5kVmFsdWVzRGlmZmVyLFxuICAgIF0pLFxuICBdKTtcblxuICBjb25zdCBkZWZhdWx0c0Zyb21TY2hlbWEgPSBnZXREZWZhdWx0c0ZvclNjaGVtYSh0cnVlKTtcblxuICByZXR1cm4gXy5yZWR1Y2UoXG4gICAgXy5waWNrQnkoYXJncywgKF9fLCBrZXkpID0+IGlzTm90RGVmYXVsdChrZXkpKSxcbiAgICAvLyBleHBsb2RlcyB0aGUgZmxhdHRlbmVkIG9iamVjdCBiYWNrIGludG8gbmVzdGVkIG9uZVxuICAgIChhY2MsIHt2YWx1ZSwgYXJnU3BlY30pID0+IF8uc2V0KGFjYywgYXJnU3BlYy5kZXN0LCB2YWx1ZSksXG4gICAgLyoqIEB0eXBlIHtBcmdzfSAqLyAoe30pXG4gICk7XG59XG5cbi8qKlxuICogQ29tcGFjdHMgYW4gb2JqZWN0IGZvciB7QGxpbmsgc2hvd0NvbmZpZ306XG4gKiAxLiBSZW1vdmVzIGBzdWJjb21tYW5kYCBrZXkvdmFsdWVcbiAqIDIuIFJlbW92ZXMgYHVuZGVmaW5lZGAgdmFsdWVzXG4gKiAzLiBSZW1vdmVzIGVtcHR5IG9iamVjdHMgKGJ1dCBub3QgYGZhbHNlYCB2YWx1ZXMpXG4gKiBEb2VzIG5vdCBvcGVyYXRlIHJlY3Vyc2l2ZWx5LlxuICovXG5jb25zdCBjb21wYWN0Q29uZmlnID0gXy5wYXJ0aWFsKFxuICBfLm9taXRCeSxcbiAgXyxcbiAgKHZhbHVlLCBrZXkpID0+XG4gICAga2V5ID09PSAnc3ViY29tbWFuZCcgfHwgXy5pc1VuZGVmaW5lZCh2YWx1ZSkgfHwgKF8uaXNPYmplY3QodmFsdWUpICYmIF8uaXNFbXB0eSh2YWx1ZSkpXG4pO1xuXG4vKipcbiAqIFNob3dzIGEgYnJlYWtkb3duIG9mIHRoZSBjdXJyZW50IGNvbmZpZyBhZnRlciBDTEkgcGFyYW1zLCBjb25maWcgZmlsZSBsb2FkZWQgJiBkZWZhdWx0cyBhcHBsaWVkLlxuICpcbiAqIFRoZSBhY3R1YWwgc2hhcGUgb2YgYHByZUNvbmZpZ1BhcnNlZEFyZ3NgIGFuZCBgZGVmYXVsdHNgIGRvZXMgbm90IG1hdHRlciBmb3IgdGhlIHB1cnBvc2VzIG9mIHRoaXMgZnVuY3Rpb24sXG4gKiBidXQgaXQncyBpbnRlbmRlZCB0byBiZSBjYWxsZWQgd2l0aCB2YWx1ZXMgb2YgdHlwZSB7QGxpbmsgUGFyc2VkQXJnc30gYW5kIGBEZWZhdWx0VmFsdWVzPHRydWU+YCwgcmVzcGVjdGl2ZWx5LlxuICpcbiAqIEBwYXJhbSB7UGFydGlhbDxQYXJzZWRBcmdzPn0gbm9uRGVmYXVsdFByZUNvbmZpZ1BhcnNlZEFyZ3MgLSBQYXJzZWQgQ0xJIGFyZ3MgKG9yIHBhcmFtIHRvIGBpbml0KClgKSBiZWZvcmUgY29uZmlnICYgZGVmYXVsdHMgYXBwbGllZFxuICogQHBhcmFtIHtpbXBvcnQoJy4vY29uZmlnLWZpbGUnKS5SZWFkQ29uZmlnRmlsZVJlc3VsdH0gY29uZmlnUmVzdWx0IC0gUmVzdWx0IG9mIGF0dGVtcHRpbmcgdG8gbG9hZCBhIGNvbmZpZyBmaWxlLiAgX011c3RfIGJlIG5vcm1hbGl6ZWRcbiAqIEBwYXJhbSB7UGFydGlhbDxQYXJzZWRBcmdzPn0gZGVmYXVsdHMgLSBDb25maWd1cmF0aW9uIGRlZmF1bHRzIGZyb20gc2NoZW1hc1xuICogQHBhcmFtIHtQYXJzZWRBcmdzfSBwYXJzZWRBcmdzIC0gRW50aXJlIHBhcnNlZCBhcmdzIG9iamVjdFxuICovXG5mdW5jdGlvbiBzaG93Q29uZmlnKG5vbkRlZmF1bHRQcmVDb25maWdQYXJzZWRBcmdzLCBjb25maWdSZXN1bHQsIGRlZmF1bHRzLCBwYXJzZWRBcmdzKSB7XG4gIGNvbnNvbGUubG9nKCdBcHBpdW0gQ29uZmlndXJhdGlvblxcbicpO1xuICBjb25zb2xlLmxvZygnZnJvbSBkZWZhdWx0czpcXG4nKTtcbiAgY29uc29sZS5kaXIoY29tcGFjdENvbmZpZyhkZWZhdWx0cykpO1xuICBpZiAoY29uZmlnUmVzdWx0LmNvbmZpZykge1xuICAgIGNvbnNvbGUubG9nKGBcXG5mcm9tIGNvbmZpZyBmaWxlIGF0ICR7Y29uZmlnUmVzdWx0LmZpbGVwYXRofTpcXG5gKTtcbiAgICBjb25zb2xlLmRpcihjb21wYWN0Q29uZmlnKGNvbmZpZ1Jlc3VsdC5jb25maWcpKTtcbiAgfSBlbHNlIHtcbiAgICBjb25zb2xlLmxvZyhgXFxuKG5vIGNvbmZpZ3VyYXRpb24gZmlsZSBsb2FkZWQpYCk7XG4gIH1cbiAgaWYgKF8uaXNFbXB0eShub25EZWZhdWx0UHJlQ29uZmlnUGFyc2VkQXJncykpIHtcbiAgICBjb25zb2xlLmxvZyhgXFxuKG5vIENMSSBwYXJhbWV0ZXJzIHByb3ZpZGVkKWApO1xuICB9IGVsc2Uge1xuICAgIGNvbnNvbGUubG9nKCdcXG52aWEgQ0xJIG9yIGZ1bmN0aW9uIGNhbGw6XFxuJyk7XG4gICAgY29uc29sZS5kaXIoY29tcGFjdENvbmZpZyhub25EZWZhdWx0UHJlQ29uZmlnUGFyc2VkQXJncykpO1xuICB9XG4gIGNvbnNvbGUubG9nKCdcXG5maW5hbCBjb25maWd1cmF0aW9uOlxcbicpO1xuICBjb25zb2xlLmRpcihjb21wYWN0Q29uZmlnKHBhcnNlZEFyZ3MpKTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gdG1wRGlyXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHZhbGlkYXRlVG1wRGlyKHRtcERpcikge1xuICB0cnkge1xuICAgIGF3YWl0IGZzLm1rZGlycCh0bXBEaXIpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgYFdlIGNvdWxkIG5vdCBlbnN1cmUgdGhhdCB0aGUgdGVtcCBkaXIgeW91IHNwZWNpZmllZCBgICtcbiAgICAgICAgYCgke3RtcERpcn0pIGV4aXN0cy4gUGxlYXNlIG1ha2Ugc3VyZSBpdCdzIHdyaXRlYWJsZS5gXG4gICAgKTtcbiAgfVxufVxuXG5jb25zdCByb290RGlyID0gZnMuZmluZFJvb3QoX19kaXJuYW1lKTtcblxuZXhwb3J0IHtcbiAgZ2V0QnVpbGRJbmZvLFxuICBjaGVja05vZGVPayxcbiAgc2hvd0J1aWxkSW5mbyxcbiAgd2Fybk5vZGVEZXByZWNhdGlvbnMsXG4gIHZhbGlkYXRlVG1wRGlyLFxuICBnZXROb25EZWZhdWx0U2VydmVyQXJncyxcbiAgZ2V0R2l0UmV2LFxuICBBUFBJVU1fVkVSLFxuICB1cGRhdGVCdWlsZEluZm8sXG4gIHNob3dDb25maWcsXG4gIHJvb3REaXIsXG59O1xuXG4vKipcbiAqIEB0eXBlZGVmIHtpbXBvcnQoJ2FwcGl1bS90eXBlcycpLlBhcnNlZEFyZ3N9IFBhcnNlZEFyZ3NcbiAqIEB0eXBlZGVmIHtpbXBvcnQoJ2FwcGl1bS90eXBlcycpLkFyZ3N9IEFyZ3NcbiAqIEB0eXBlZGVmIHtpbXBvcnQoJy4vc2NoZW1hL2FyZy1zcGVjJykuQXJnU3BlY30gQXJnU3BlY1xuICovXG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7QUFFQSxNQUFNQSxVQUFVLEdBQUdDLFdBQUEsQ0FBR0MsbUJBQUgsQ0FBdUJDLFNBQXZCLENBQW5COztBQUVBLE1BQU1DLFVBQVUsR0FBR0osVUFBVSxDQUFDSyxPQUE5Qjs7QUFDQSxNQUFNQyxnQkFBZ0IsR0FBR04sVUFBVSxDQUFDTyxPQUFYLENBQW1CQyxJQUE1QztBQUNBLE1BQU1DLGVBQWUsR0FBR1QsVUFBVSxDQUFDTyxPQUFYLENBQW1CRyxHQUEzQztBQUVBLE1BQU1DLGFBQWEsR0FBRyxNQUF0QjtBQUNBLE1BQU1DLFVBQVUsR0FBSSxNQUFLQyxlQUFBLENBQU9DLFNBQVAsS0FBcUIsTUFBckIsR0FBOEIsRUFBRyxFQUExRDtBQUNBLE1BQU1DLFVBQVUsR0FBRyw0Q0FBbkI7QUFLQSxNQUFNQyxVQUFVLEdBQUc7RUFDakJYLE9BQU8sRUFBRUQ7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