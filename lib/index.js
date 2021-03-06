'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.read = exports.write = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

// options: passphrase, blobKey, metdata, overwrite
let write = exports.write = (() => {
  var _ref = _asyncToGenerator(function* (file, data, options = {}) {
    options = _extends({ overwrite: false }, options);
    if (!options.header) console.warn('seco-file: should pass options.header.');
    let header = conHeader.create(options.header);

    if (!options.overwrite && (yield _fsExtra2.default.pathExists(file))) throw new Error(`${file} exists. Set 'overwrite' to true.`);

    let blobKey;
    let metadata;
    if (options.passphrase) {
      blobKey = crypto.randomBytes(32);
      metadata = conMetadata.create();
      conMetadata.encryptBlobKey(metadata, options.passphrase, blobKey);
    } else if (options.metadata && options.blobKey) {
      blobKey = options.blobKey;
      metadata = options.metadata;
    } else {
      throw new Error('Must set either passphrase or (metadata and blobKey)');
    }

    data = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf8');
    let { blob: encBlob } = conBlob.encrypt(data, metadata, blobKey);

    const headerBuf = conHeader.serialize(header);
    const mdBuf = conMetadata.serialize(metadata);

    let fileObj = {
      header: headerBuf,
      checksum: conFile.computeChecksum(mdBuf, encBlob),
      metadata: mdBuf,
      blob: encBlob
    };
    const fileData = conFile.encode(fileObj);

    yield _fsExtra2.default.outputFile(file, fileData);

    return { blobKey, metadata };
  });

  return function write(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

let read = exports.read = (() => {
  var _ref2 = _asyncToGenerator(function* (file, passphrase) {
    let fileData = yield _fsExtra2.default.readFile(file);

    const fileObj = conFile.decode(fileData);

    const checksum = conFile.computeChecksum(fileObj.metadata, fileObj.blob);
    if (!fileObj.checksum.equals(checksum)) throw new Error(`${file}: seco checksum does not match; file may be corrupted`);

    let metadata = conMetadata.decode(fileObj.metadata);
    let blobKey = conMetadata.decryptBlobKey(metadata, passphrase);
    let header = conHeader.decode(fileObj.header);
    let data = conBlob.decrypt(fileObj.blob, metadata, blobKey);

    return { data, blobKey, metadata, header };
  });

  return function read(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
})();

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _crypto = require('crypto');

var crypto = _interopRequireWildcard(_crypto);

var _blob = require('secure-container/lib/blob');

var conBlob = _interopRequireWildcard(_blob);

var _header = require('secure-container/lib/header');

var conHeader = _interopRequireWildcard(_header);

var _metadata = require('secure-container/lib/metadata');

var conMetadata = _interopRequireWildcard(_metadata);

var _file = require('secure-container/lib/file');

var conFile = _interopRequireWildcard(_file);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /* flow */