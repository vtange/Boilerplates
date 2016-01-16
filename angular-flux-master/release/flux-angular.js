(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Baobab Data Structure
 * ======================
 *
 * A handy data tree with cursors.
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _emmett = require('emmett');

var _emmett2 = _interopRequireDefault(_emmett);

var _cursor = require('./cursor');

var _cursor2 = _interopRequireDefault(_cursor);

var _monkey = require('./monkey');

var _watcher = require('./watcher');

var _watcher2 = _interopRequireDefault(_watcher);

var _type = require('./type');

var _type2 = _interopRequireDefault(_type);

var _update2 = require('./update');

var _update3 = _interopRequireDefault(_update2);

var _helpers = require('./helpers');

var helpers = _interopRequireWildcard(_helpers);

var arrayFrom = helpers.arrayFrom;
var coercePath = helpers.coercePath;
var deepFreeze = helpers.deepFreeze;
var getIn = helpers.getIn;
var makeError = helpers.makeError;
var deepMerge = helpers.deepMerge;
var shallowClone = helpers.shallowClone;
var shallowMerge = helpers.shallowMerge;
var uniqid = helpers.uniqid;

/**
 * Baobab defaults
 */
var DEFAULTS = {

  // Should the tree handle its transactions on its own?
  autoCommit: true,

  // Should the transactions be handled asynchronously?
  asynchronous: true,

  // Should the tree's data be immutable?
  immutable: true,

  // Should the monkeys be lazy?
  lazyMonkeys: true,

  // Should the tree be persistent?
  persistent: true,

  // Should the tree's update be pure?
  pure: true,

  // Validation specifications
  validate: null,

  // Validation behavior 'rollback' or 'notify'
  validationBehavior: 'rollback'
};

/**
 * Function returning a string hash from a non-dynamic path expressed as an
 * array.
 *
 * @param  {array}  path - The path to hash.
 * @return {string} string - The resultant hash.
 */
function hashPath(path) {
  return 'λ' + path.map(function (step) {
    if (_type2['default']['function'](step) || _type2['default'].object(step)) return '#' + uniqid() + '#';

    return step;
  }).join('λ');
}

/**
 * Baobab class
 *
 * @constructor
 * @param {object|array} [initialData={}]    - Initial data passed to the tree.
 * @param {object}       [opts]              - Optional options.
 * @param {boolean}      [opts.autoCommit]   - Should the tree auto-commit?
 * @param {boolean}      [opts.asynchronous] - Should the tree's transactions
 *                                             handled asynchronously?
 * @param {boolean}      [opts.immutable]    - Should the tree be immutable?
 * @param {boolean}      [opts.persistent]   - Should the tree be persistent?
 * @param {boolean}      [opts.pure]         - Should the tree be pure?
 * @param {function}     [opts.validate]     - Validation function.
 * @param {string}       [opts.validationBehaviour] - "rollback" or "notify".
 */

var Baobab = (function (_Emitter) {
  _inherits(Baobab, _Emitter);

  function Baobab(initialData, opts) {
    var _this = this;

    _classCallCheck(this, Baobab);

    _get(Object.getPrototypeOf(Baobab.prototype), 'constructor', this).call(this);

    // Setting initialData to an empty object if no data is provided by use
    if (arguments.length < 1) initialData = {};

    // Checking whether given initial data is valid
    if (!_type2['default'].object(initialData) && !_type2['default'].array(initialData)) throw makeError('Baobab: invalid data.', { data: initialData });

    // Merging given options with defaults
    this.options = shallowMerge({}, DEFAULTS, opts);

    // Disabling immutability & persistence if persistence if disabled
    if (!this.options.persistent) {
      this.options.immutable = false;
      this.options.pure = false;
    }

    // Privates
    this._identity = '[object Baobab]';
    this._cursors = {};
    this._future = null;
    this._transaction = [];
    this._affectedPathsIndex = {};
    this._monkeys = {};
    this._previousData = null;
    this._data = initialData;

    // Properties
    this.root = new _cursor2['default'](this, [], 'λ');
    delete this.root.release;

    // Does the user want an immutable tree?
    if (this.options.immutable) deepFreeze(this._data);

    // Bootstrapping root cursor's getters and setters
    var bootstrap = function bootstrap(name) {
      _this[name] = function () {
        var r = this.root[name].apply(this.root, arguments);
        return r instanceof _cursor2['default'] ? this : r;
      };
    };

    ['apply', 'clone', 'concat', 'deepClone', 'deepMerge', 'exists', 'get', 'push', 'merge', 'pop', 'project', 'serialize', 'set', 'shift', 'splice', 'unset', 'unshift'].forEach(bootstrap);

    // Registering the initial monkeys
    this._refreshMonkeys();

    // Initial validation
    var validationError = this.validate();

    if (validationError) throw Error('Baobab: invalid data.', { error: validationError });
  }

  /**
   * Monkey helper.
   */

  /**
   * Internal method used to refresh the tree's monkey register on every
   * update.
   * Note 1) For the time being, placing monkeys beneath array nodes is not
   * allowed for performance reasons.
   *
   * @param  {mixed}   node      - The starting node.
   * @param  {array}   path      - The starting node's path.
   * @param  {string}  operation - The operation that lead to a refreshment.
   * @return {Baobab}            - The tree instance for chaining purposes.
   */

  _createClass(Baobab, [{
    key: '_refreshMonkeys',
    value: function _refreshMonkeys(node, path, operation) {
      var _this2 = this;

      var clean = function clean(data) {
        var p = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

        if (data instanceof _monkey.Monkey) {
          data.release();
          (0, _update3['default'])(_this2._monkeys, p, { type: 'unset' }, {
            immutable: false,
            persistent: false,
            pure: false
          });

          return;
        }

        if (_type2['default'].object(data)) {
          for (var k in data) {
            clean(data[k], p.concat(k));
          }
        }
      };

      var register = [];

      var walk = function walk(data) {
        var p = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

        // Should we sit a monkey in the tree?
        if (data instanceof _monkey.MonkeyDefinition || data instanceof _monkey.Monkey) {
          var monkeyInstance = new _monkey.Monkey(_this2, p, data instanceof _monkey.Monkey ? data.definition : data);

          register.push(monkeyInstance);

          (0, _update3['default'])(_this2._monkeys, p, { type: 'set', value: monkeyInstance }, {
            immutable: false,
            persistent: false,
            pure: false
          });

          return;
        }

        // Object iteration
        if (_type2['default'].object(data)) {
          for (var k in data) {
            walk(data[k], p.concat(k));
          }
        }
      };

      // Walking the whole tree
      if (!arguments.length) {
        walk(this._data);
        register.forEach(function (m) {
          return m.checkRecursivity();
        });
      } else {
        var monkeysNode = getIn(this._monkeys, path).data;

        // Is this required that we clean some already existing monkeys?
        if (monkeysNode) clean(monkeysNode, path);

        // Let's walk the tree only from the updated point
        if (operation !== 'unset') {
          walk(node, path);
          register.forEach(function (m) {
            return m.checkRecursivity();
          });
        }
      }

      return this;
    }

    /**
     * Method used to validate the tree's data.
     *
     * @return {boolean} - Is the tree valid?
     */
  }, {
    key: 'validate',
    value: function validate(affectedPaths) {
      var _options = this.options;
      var validate = _options.validate;
      var behavior = _options.validationBehavior;

      if (typeof validate !== 'function') return null;

      var error = validate.call(this, this._previousData, this._data, affectedPaths || [[]]);

      if (error instanceof Error) {

        if (behavior === 'rollback') {
          this._data = this._previousData;
          this._affectedPathsIndex = {};
          this._transaction = [];
          this._previousData = this._data;
        }

        this.emit('invalid', { error: error });

        return error;
      }

      return null;
    }

    /**
     * Method used to select data within the tree by creating a cursor. Cursors
     * are kept as singletons by the tree for performance and hygiene reasons.
     *
     * Arity (1):
     * @param {path}    path - Path to select in the tree.
     *
     * Arity (*):
     * @param {...step} path - Path to select in the tree.
     *
     * @return {Cursor}      - The resultant cursor.
     */
  }, {
    key: 'select',
    value: function select(path) {

      // If no path is given, we simply return the root
      path = path || [];

      // Variadic
      if (arguments.length > 1) path = arrayFrom(arguments);

      // Checking that given path is valid
      if (!_type2['default'].path(path)) throw makeError('Baobab.select: invalid path.', { path: path });

      // Casting to array
      path = [].concat(path);

      // Computing hash (done here because it would be too late to do it in the
      // cursor's constructor since we need to hit the cursors' index first).
      var hash = hashPath(path);

      // Creating a new cursor or returning the already existing one for the
      // requested path.
      var cursor = this._cursors[hash];

      if (!cursor) {
        cursor = new _cursor2['default'](this, path, hash);
        this._cursors[hash] = cursor;
      }

      // Emitting an event to notify that a part of the tree was selected
      this.emit('select', { path: path, cursor: cursor });
      return cursor;
    }

    /**
     * Method used to update the tree. Updates are simply expressed by a path,
     * dynamic or not, and an operation.
     *
     * This is where path solving should happen and not in the cursor.
     *
     * @param  {path}   path      - The path where we'll apply the operation.
     * @param  {object} operation - The operation to apply.
     * @return {mixed} - Return the result of the update.
     */
  }, {
    key: 'update',
    value: function update(path, operation) {
      var _this3 = this;

      // Coercing path
      path = coercePath(path);

      if (!_type2['default'].operationType(operation.type)) throw makeError('Baobab.update: unknown operation type "' + operation.type + '".', { operation: operation });

      // Solving the given path

      var _getIn = getIn(this._data, path);

      var solvedPath = _getIn.solvedPath;
      var exists = _getIn.exists;

      // If we couldn't solve the path, we throw
      if (!solvedPath) throw makeError('Baobab.update: could not solve the given path.', {
        path: solvedPath
      });

      // Read-only path?
      var monkeyPath = _type2['default'].monkeyPath(this._monkeys, solvedPath);
      if (monkeyPath && solvedPath.length > monkeyPath.length) throw makeError('Baobab.update: attempting to update a read-only path.', {
        path: solvedPath
      });

      // We don't unset irrelevant paths
      if (operation.type === 'unset' && !exists) return;

      // If we merge data, we need to acknowledge monkeys
      var realOperation = operation;
      if (/merge/.test(operation.type)) {
        var monkeysNode = getIn(this._monkeys, solvedPath).data;

        if (_type2['default'].object(monkeysNode)) {
          realOperation = shallowClone(realOperation);

          if (/deep/.test(realOperation.type)) realOperation.value = deepMerge({}, monkeysNode, realOperation.value);else realOperation.value = shallowMerge({}, monkeysNode, realOperation.value);
        }
      }

      // Stashing previous data if this is the frame's first update
      if (!this._transaction.length) this._previousData = this._data;

      // Applying the operation
      var result = (0, _update3['default'])(this._data, solvedPath, realOperation, this.options);

      var data = result.data;
      var node = result.node;

      // If because of purity, the update was moot, we stop here
      if (!('data' in result)) return node;

      // If the operation is push, the affected path is slightly different
      var affectedPath = solvedPath.concat(operation.type === 'push' ? node.length - 1 : []);

      var hash = hashPath(affectedPath);

      // Updating data and transaction
      this._data = data;
      this._affectedPathsIndex[hash] = true;
      this._transaction.push(shallowMerge({}, operation, { path: affectedPath }));

      // Updating the monkeys
      this._refreshMonkeys(node, solvedPath, operation.type);

      // Emitting a `write` event
      this.emit('write', { path: affectedPath });

      // Should we let the user commit?
      if (!this.options.autoCommit) return node;

      // Should we update asynchronously?
      if (!this.options.asynchronous) {
        this.commit();
        return node;
      }

      // Updating asynchronously
      if (!this._future) this._future = setTimeout(function () {
        return _this3.commit();
      }, 0);

      // Finally returning the affected node
      return node;
    }

    /**
     * Method committing the updates of the tree and firing the tree's events.
     *
     * @return {Baobab} - The tree instance for chaining purposes.
     */
  }, {
    key: 'commit',
    value: function commit() {

      // Do not fire update if the transaction is empty
      if (!this._transaction.length) return this;

      // Clearing timeout if one was defined
      if (this._future) this._future = clearTimeout(this._future);

      var affectedPaths = Object.keys(this._affectedPathsIndex).map(function (h) {
        return h !== 'λ' ? h.split('λ').slice(1) : [];
      });

      // Is the tree still valid?
      var validationError = this.validate(affectedPaths);

      if (validationError) return this;

      // Caching to keep original references before we change them
      var transaction = this._transaction,
          previousData = this._previousData;

      this._affectedPathsIndex = {};
      this._transaction = [];
      this._previousData = this._data;

      // Emitting update event
      this.emit('update', {
        paths: affectedPaths,
        currentData: this._data,
        transaction: transaction,
        previousData: previousData
      });

      return this;
    }

    /**
     * Method used to watch a collection of paths within the tree. Very useful
     * to bind UI components and such to the tree.
     *
     * @param  {object} mapping - Mapping of paths to listen.
     * @return {Cursor}         - The created watcher.
     */
  }, {
    key: 'watch',
    value: function watch(mapping) {
      return new _watcher2['default'](this, mapping);
    }

    /**
     * Method releasing the tree and its attached data from memory.
     */
  }, {
    key: 'release',
    value: function release() {
      var k = undefined;

      this.emit('release');

      delete this.root;

      delete this._data;
      delete this._previousData;
      delete this._transaction;
      delete this._affectedPathsIndex;
      delete this._monkeys;

      // Releasing cursors
      for (k in this._cursors) this._cursors[k].release();
      delete this._cursors;

      // Killing event emitter
      this.kill();
    }

    /**
     * Overriding the `toJSON` method for convenient use with JSON.stringify.
     *
     * @return {mixed} - Data at cursor.
     */
  }, {
    key: 'toJSON',
    value: function toJSON() {
      return this.serialize();
    }

    /**
     * Overriding the `toString` method for debugging purposes.
     *
     * @return {string} - The baobab's identity.
     */
  }, {
    key: 'toString',
    value: function toString() {
      return this._identity;
    }
  }]);

  return Baobab;
})(_emmett2['default']);

exports['default'] = Baobab;
Baobab.monkey = function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  if (!args.length) throw new Error('Baobab.monkey: missing definition.');

  if (args.length === 1 && typeof args[0] !== 'function') return new _monkey.MonkeyDefinition(args[0]);

  return new _monkey.MonkeyDefinition(args);
};
Baobab.dynamicNode = Baobab.monkey;

/**
 * Exposing some internals for convenience
 */
Baobab.Cursor = _cursor2['default'];
Baobab.MonkeyDefinition = _monkey.MonkeyDefinition;
Baobab.Monkey = _monkey.Monkey;
Baobab.type = _type2['default'];
Baobab.helpers = helpers;

/**
 * Version
 */
Baobab.VERSION = '2.3.0';
module.exports = exports['default'];
},{"./cursor":2,"./helpers":3,"./monkey":4,"./type":5,"./update":6,"./watcher":7,"emmett":8}],2:[function(require,module,exports){
/**
 * Baobab Cursors
 * ===============
 *
 * Cursors created by selecting some data within a Baobab tree.
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _emmett = require('emmett');

var _emmett2 = _interopRequireDefault(_emmett);

var _monkey = require('./monkey');

var _type = require('./type');

var _type2 = _interopRequireDefault(_type);

var _helpers = require('./helpers');

/**
 * Traversal helper function for dynamic cursors. Will throw a legible error
 * if traversal is not possible.
 *
 * @param {string} method     - The method name, to create a correct error msg.
 * @param {array}  solvedPath - The cursor's solved path.
 */
function checkPossibilityOfDynamicTraversal(method, solvedPath) {
  if (!solvedPath) throw (0, _helpers.makeError)('Baobab.Cursor.' + method + ': ' + ('cannot use ' + method + ' on an unresolved dynamic path.'), { path: solvedPath });
}

/**
 * Cursor class
 *
 * @constructor
 * @param {Baobab} tree   - The cursor's root.
 * @param {array}  path   - The cursor's path in the tree.
 * @param {string} hash   - The path's hash computed ahead by the tree.
 */

var Cursor = (function (_Emitter) {
  _inherits(Cursor, _Emitter);

  function Cursor(tree, path, hash) {
    var _this = this;

    _classCallCheck(this, Cursor);

    _get(Object.getPrototypeOf(Cursor.prototype), 'constructor', this).call(this);

    // If no path were to be provided, we fallback to an empty path (root)
    path = path || [];

    // Privates
    this._identity = '[object Cursor]';
    this._archive = null;

    // Properties
    this.tree = tree;
    this.path = path;
    this.hash = hash;

    // State
    this.state = {
      killed: false,
      recording: false,
      undoing: false
    };

    // Checking whether the given path is dynamic or not
    this._dynamicPath = _type2['default'].dynamicPath(this.path);

    // Checking whether the given path will meet a monkey
    this._monkeyPath = _type2['default'].monkeyPath(this.tree._monkeys, this.path);

    if (!this._dynamicPath) this.solvedPath = this.path;else this.solvedPath = (0, _helpers.getIn)(this.tree._data, this.path).solvedPath;

    /**
     * Listener bound to the tree's writes so that cursors with dynamic paths
     * may update their solved path correctly.
     *
     * @param {object} event - The event fired by the tree.
     */
    this._writeHandler = function (_ref) {
      var data = _ref.data;

      if (_this.state.killed || !(0, _helpers.solveUpdate)([data.path], _this._getComparedPaths())) return;

      _this.solvedPath = (0, _helpers.getIn)(_this.tree._data, _this.path).solvedPath;
    };

    /**
     * Function in charge of actually trigger the cursor's updates and
     * deal with the archived records.
     *
     * @note: probably should wrap the current solvedPath in closure to avoid
     * for tricky cases where it would fail.
     *
     * @param {mixed} previousData - the tree's previous data.
     */
    var fireUpdate = function fireUpdate(previousData) {
      var self = _this;

      var eventData = Object.defineProperties({}, {
        previousData: {
          get: function get() {
            return (0, _helpers.getIn)(previousData, self.solvedPath).data;
          },
          configurable: true,
          enumerable: true
        },
        currentData: {
          get: function get() {
            return self.get();
          },
          configurable: true,
          enumerable: true
        }
      });

      if (_this.state.recording && !_this.state.undoing) _this.archive.add(eventData.previousData);

      _this.state.undoing = false;

      return _this.emit('update', eventData);
    };

    /**
     * Listener bound to the tree's updates and determining whether the
     * cursor is affected and should react accordingly.
     *
     * Note that this listener is lazily bound to the tree to be sure
     * one wouldn't leak listeners when only creating cursors for convenience
     * and not to listen to updates specifically.
     *
     * @param {object} event - The event fired by the tree.
     */
    this._updateHandler = function (event) {
      if (_this.state.killed) return;

      var _event$data = event.data;
      var paths = _event$data.paths;
      var previousData = _event$data.previousData;
      var update = fireUpdate.bind(_this, previousData);
      var comparedPaths = _this._getComparedPaths();

      if ((0, _helpers.solveUpdate)(paths, comparedPaths)) return update();
    };

    // Lazy binding
    var bound = false;
    this._lazyBind = function () {
      if (bound) return;

      bound = true;

      if (_this._dynamicPath) _this.tree.on('write', _this._writeHandler);

      return _this.tree.on('update', _this._updateHandler);
    };

    // If the path is dynamic, we actually need to listen to the tree
    if (this._dynamicPath) {
      this._lazyBind();
    } else {

      // Overriding the emitter `on` and `once` methods
      this.on = (0, _helpers.before)(this._lazyBind, this.on.bind(this));
      this.once = (0, _helpers.before)(this._lazyBind, this.once.bind(this));
    }
  }

  /**
   * Method used to allow iterating over cursors containing list-type data.
   *
   * e.g. for(let i of cursor) { ... }
   *
   * @returns {object} -  Each item sequentially.
   */

  /**
   * Internal helpers
   * -----------------
   */

  /**
   * Method returning the paths of the tree watched over by the cursor and that
   * should be taken into account when solving a potential update.
   *
   * @return {array} - Array of paths to compare with a given update.
   */

  _createClass(Cursor, [{
    key: '_getComparedPaths',
    value: function _getComparedPaths() {

      // Checking whether we should keep track of some dependencies
      var additionalPaths = this._monkeyPath ? (0, _helpers.getIn)(this.tree._monkeys, this._monkeyPath).data.relatedPaths() : [];

      return [this.solvedPath].concat(additionalPaths);
    }

    /**
     * Predicates
     * -----------
     */

    /**
     * Method returning whether the cursor is at root level.
     *
     * @return {boolean} - Is the cursor the root?
     */
  }, {
    key: 'isRoot',
    value: function isRoot() {
      return !this.path.length;
    }

    /**
     * Method returning whether the cursor is at leaf level.
     *
     * @return {boolean} - Is the cursor a leaf?
     */
  }, {
    key: 'isLeaf',
    value: function isLeaf() {
      return _type2['default'].primitive(this._get().data);
    }

    /**
     * Method returning whether the cursor is at branch level.
     *
     * @return {boolean} - Is the cursor a branch?
     */
  }, {
    key: 'isBranch',
    value: function isBranch() {
      return !this.isRoot() && !this.isLeaf();
    }

    /**
     * Traversal Methods
     * ------------------
     */

    /**
     * Method returning the root cursor.
     *
     * @return {Baobab} - The root cursor.
     */
  }, {
    key: 'root',
    value: function root() {
      return this.tree.select();
    }

    /**
     * Method selecting a subpath as a new cursor.
     *
     * Arity (1):
     * @param  {path} path    - The path to select.
     *
     * Arity (*):
     * @param  {...step} path - The path to select.
     *
     * @return {Cursor}       - The created cursor.
     */
  }, {
    key: 'select',
    value: function select(path) {
      if (arguments.length > 1) path = (0, _helpers.arrayFrom)(arguments);

      return this.tree.select(this.path.concat(path));
    }

    /**
     * Method returning the parent node of the cursor or else `null` if the
     * cursor is already at root level.
     *
     * @return {Baobab} - The parent cursor.
     */
  }, {
    key: 'up',
    value: function up() {
      if (!this.isRoot()) return this.tree.select(this.path.slice(0, -1));

      return null;
    }

    /**
     * Method returning the child node of the cursor.
     *
     * @return {Baobab} - The child cursor.
     */
  }, {
    key: 'down',
    value: function down() {
      checkPossibilityOfDynamicTraversal('down', this.solvedPath);

      if (!(this._get().data instanceof Array)) throw Error('Baobab.Cursor.down: cannot go down on a non-list type.');

      return this.tree.select(this.solvedPath.concat(0));
    }

    /**
     * Method returning the left sibling node of the cursor if this one is
     * pointing at a list. Returns `null` if this cursor is already leftmost.
     *
     * @return {Baobab} - The left sibling cursor.
     */
  }, {
    key: 'left',
    value: function left() {
      checkPossibilityOfDynamicTraversal('left', this.solvedPath);

      var last = +this.solvedPath[this.solvedPath.length - 1];

      if (isNaN(last)) throw Error('Baobab.Cursor.left: cannot go left on a non-list type.');

      return last ? this.tree.select(this.solvedPath.slice(0, -1).concat(last - 1)) : null;
    }

    /**
     * Method returning the right sibling node of the cursor if this one is
     * pointing at a list. Returns `null` if this cursor is already rightmost.
     *
     * @return {Baobab} - The right sibling cursor.
     */
  }, {
    key: 'right',
    value: function right() {
      checkPossibilityOfDynamicTraversal('right', this.solvedPath);

      var last = +this.solvedPath[this.solvedPath.length - 1];

      if (isNaN(last)) throw Error('Baobab.Cursor.right: cannot go right on a non-list type.');

      if (last + 1 === this.up()._get().data.length) return null;

      return this.tree.select(this.solvedPath.slice(0, -1).concat(last + 1));
    }

    /**
     * Method returning the leftmost sibling node of the cursor if this one is
     * pointing at a list.
     *
     * @return {Baobab} - The leftmost sibling cursor.
     */
  }, {
    key: 'leftmost',
    value: function leftmost() {
      checkPossibilityOfDynamicTraversal('leftmost', this.solvedPath);

      var last = +this.solvedPath[this.solvedPath.length - 1];

      if (isNaN(last)) throw Error('Baobab.Cursor.leftmost: cannot go left on a non-list type.');

      return this.tree.select(this.solvedPath.slice(0, -1).concat(0));
    }

    /**
     * Method returning the rightmost sibling node of the cursor if this one is
     * pointing at a list.
     *
     * @return {Baobab} - The rightmost sibling cursor.
     */
  }, {
    key: 'rightmost',
    value: function rightmost() {
      checkPossibilityOfDynamicTraversal('rightmost', this.solvedPath);

      var last = +this.solvedPath[this.solvedPath.length - 1];

      if (isNaN(last)) throw Error('Baobab.Cursor.rightmost: cannot go right on a non-list type.');

      var list = this.up()._get().data;

      return this.tree.select(this.solvedPath.slice(0, -1).concat(list.length - 1));
    }

    /**
     * Method mapping the children nodes of the cursor.
     *
     * @param  {function} fn      - The function to map.
     * @param  {object}   [scope] - An optional scope.
     * @return {array}            - The resultant array.
     */
  }, {
    key: 'map',
    value: function map(fn, scope) {
      checkPossibilityOfDynamicTraversal('map', this.solvedPath);

      var array = this._get().data,
          l = arguments.length;

      if (!_type2['default'].array(array)) throw Error('baobab.Cursor.map: cannot map a non-list type.');

      return array.map(function (item, i) {
        return fn.call(l > 1 ? scope : this, this.select(i), i, array);
      }, this);
    }

    /**
     * Getter Methods
     * ---------------
     */

    /**
     * Internal get method. Basically contains the main body of the `get` method
     * without the event emitting. This is sometimes needed not to fire useless
     * events.
     *
     * @param  {path}   [path=[]]       - Path to get in the tree.
     * @return {object} info            - The resultant information.
     * @return {mixed}  info.data       - Data at path.
     * @return {array}  info.solvedPath - The path solved when getting.
     */
  }, {
    key: '_get',
    value: function _get() {
      var path = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

      if (!_type2['default'].path(path)) throw (0, _helpers.makeError)('Baobab.Cursor.getters: invalid path.', { path: path });

      if (!this.solvedPath) return { data: undefined, solvedPath: null, exists: false };

      return (0, _helpers.getIn)(this.tree._data, this.solvedPath.concat(path));
    }

    /**
     * Method used to check whether a certain path exists in the tree starting
     * from the current cursor.
     *
     * Arity (1):
     * @param  {path}   path           - Path to check in the tree.
     *
     * Arity (2):
     * @param {..step}  path           - Path to check in the tree.
     *
     * @return {boolean}               - Does the given path exists?
     */
  }, {
    key: 'exists',
    value: function exists(path) {
      path = (0, _helpers.coercePath)(path);

      if (arguments.length > 1) path = (0, _helpers.arrayFrom)(arguments);

      return this._get(path).exists;
    }

    /**
     * Method used to get data from the tree. Will fire a `get` event from the
     * tree so that the user may sometimes react upon it to fetch data, for
     * instance.
     *
     * Arity (1):
     * @param  {path}   path           - Path to get in the tree.
     *
     * Arity (2):
     * @param  {..step} path           - Path to get in the tree.
     *
     * @return {mixed}                 - Data at path.
     */
  }, {
    key: 'get',
    value: function get(path) {
      path = (0, _helpers.coercePath)(path);

      if (arguments.length > 1) path = (0, _helpers.arrayFrom)(arguments);

      var _get2 = this._get(path);

      var data = _get2.data;
      var solvedPath = _get2.solvedPath;

      // Emitting the event
      this.tree.emit('get', { data: data, solvedPath: solvedPath, path: this.path.concat(path) });

      return data;
    }

    /**
     * Method used to shallow clone data from the tree.
     *
     * Arity (1):
     * @param  {path}   path           - Path to get in the tree.
     *
     * Arity (2):
     * @param  {..step} path           - Path to get in the tree.
     *
     * @return {mixed}                 - Cloned data at path.
     */
  }, {
    key: 'clone',
    value: function clone() {
      var data = this.get.apply(this, arguments);

      return (0, _helpers.shallowClone)(data);
    }

    /**
     * Method used to deep clone data from the tree.
     *
     * Arity (1):
     * @param  {path}   path           - Path to get in the tree.
     *
     * Arity (2):
     * @param  {..step} path           - Path to get in the tree.
     *
     * @return {mixed}                 - Cloned data at path.
     */
  }, {
    key: 'deepClone',
    value: function deepClone() {
      var data = this.get.apply(this, arguments);

      return (0, _helpers.deepClone)(data);
    }

    /**
     * Method used to return raw data from the tree, by carefully avoiding
     * computed one.
     *
     * @todo: should be more performant as the cloning should happen as well as
     * when dropping computed data.
     *
     * Arity (1):
     * @param  {path}   path           - Path to serialize in the tree.
     *
     * Arity (2):
     * @param  {..step} path           - Path to serialize in the tree.
     *
     * @return {mixed}                 - The retrieved raw data.
     */
  }, {
    key: 'serialize',
    value: function serialize(path) {
      path = (0, _helpers.coercePath)(path);

      if (arguments.length > 1) path = (0, _helpers.arrayFrom)(arguments);

      if (!_type2['default'].path(path)) throw (0, _helpers.makeError)('Baobab.Cursor.getters: invalid path.', { path: path });

      if (!this.solvedPath) return undefined;

      var fullPath = this.solvedPath.concat(path);

      var data = (0, _helpers.deepClone)((0, _helpers.getIn)(this.tree._data, fullPath).data),
          monkeys = (0, _helpers.getIn)(this.tree._monkeys, fullPath).data;

      var dropComputedData = function dropComputedData(d, m) {
        if (!_type2['default'].object(m) || !_type2['default'].object(d)) return;

        for (var k in m) {
          if (m[k] instanceof _monkey.Monkey) delete d[k];else dropComputedData(d[k], m[k]);
        }
      };

      dropComputedData(data, monkeys);
      return data;
    }

    /**
     * Method used to project some of the data at cursor onto a map or a list.
     *
     * @param  {object|array} projection - The projection's formal definition.
     * @return {object|array}            - The resultant map/list.
     */
  }, {
    key: 'project',
    value: function project(projection) {
      if (_type2['default'].object(projection)) {
        var data = {};

        for (var k in projection) {
          data[k] = this.get(projection[k]);
        }return data;
      } else if (_type2['default'].array(projection)) {
        var data = [];

        for (var i = 0, l = projection.length; i < l; i++) {
          data.push(this.get(projection[i]));
        }return data;
      }

      throw (0, _helpers.makeError)('Baobab.Cursor.project: wrong projection.', { projection: projection });
    }

    /**
     * History Methods
     * ----------------
     */

    /**
     * Methods starting to record the cursor's successive states.
     *
     * @param  {integer} [maxRecords] - Maximum records to keep in memory. Note
     *                                  that if no number is provided, the cursor
     *                                  will keep everything.
     * @return {Cursor}               - The cursor instance for chaining purposes.
     */
  }, {
    key: 'startRecording',
    value: function startRecording(maxRecords) {
      maxRecords = maxRecords || Infinity;

      if (maxRecords < 1) throw (0, _helpers.makeError)('Baobab.Cursor.startRecording: invalid max records.', {
        value: maxRecords
      });

      this.state.recording = true;

      if (this.archive) return this;

      // Lazy binding
      this._lazyBind();

      this.archive = new _helpers.Archive(maxRecords);
      return this;
    }

    /**
     * Methods stopping to record the cursor's successive states.
     *
     * @return {Cursor} - The cursor instance for chaining purposes.
     */
  }, {
    key: 'stopRecording',
    value: function stopRecording() {
      this.state.recording = false;
      return this;
    }

    /**
     * Methods undoing n steps of the cursor's recorded states.
     *
     * @param  {integer} [steps=1] - The number of steps to rollback.
     * @return {Cursor}            - The cursor instance for chaining purposes.
     */
  }, {
    key: 'undo',
    value: function undo() {
      var steps = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];

      if (!this.state.recording) throw new Error('Baobab.Cursor.undo: cursor is not recording.');

      var record = this.archive.back(steps);

      if (!record) throw Error('Baobab.Cursor.undo: cannot find a relevant record.');

      this.state.undoing = true;
      this.set(record);

      return this;
    }

    /**
     * Methods returning whether the cursor has a recorded history.
     *
     * @return {boolean} - `true` if the cursor has a recorded history?
     */
  }, {
    key: 'hasHistory',
    value: function hasHistory() {
      return !!(this.archive && this.archive.get().length);
    }

    /**
     * Methods returning the cursor's history.
     *
     * @return {array} - The cursor's history.
     */
  }, {
    key: 'getHistory',
    value: function getHistory() {
      return this.archive ? this.archive.get() : [];
    }

    /**
     * Methods clearing the cursor's history.
     *
     * @return {Cursor} - The cursor instance for chaining purposes.
     */
  }, {
    key: 'clearHistory',
    value: function clearHistory() {
      if (this.archive) this.archive.clear();
      return this;
    }

    /**
     * Releasing
     * ----------
     */

    /**
     * Methods releasing the cursor from memory.
     */
  }, {
    key: 'release',
    value: function release() {

      // Removing listeners on parent
      if (this._dynamicPath) this.tree.off('write', this._writeHandler);

      this.tree.off('update', this._updateHandler);

      // Unsubscribe from the parent
      if (this.hash) delete this.tree._cursors[this.hash];

      // Dereferencing
      delete this.tree;
      delete this.path;
      delete this.solvedPath;
      delete this.archive;

      // Killing emitter
      this.kill();
      this.state.killed = true;
    }

    /**
     * Output
     * -------
     */

    /**
     * Overriding the `toJSON` method for convenient use with JSON.stringify.
     *
     * @return {mixed} - Data at cursor.
     */
  }, {
    key: 'toJSON',
    value: function toJSON() {
      return this.serialize();
    }

    /**
     * Overriding the `toString` method for debugging purposes.
     *
     * @return {string} - The cursor's identity.
     */
  }, {
    key: 'toString',
    value: function toString() {
      return this._identity;
    }
  }]);

  return Cursor;
})(_emmett2['default']);

exports['default'] = Cursor;
if (typeof Symbol === 'function' && typeof Symbol.iterator !== 'undefined') {
  Cursor.prototype[Symbol.iterator] = function () {
    var array = this._get().data;

    if (!_type2['default'].array(array)) throw Error('baobab.Cursor.@@iterate: cannot iterate a non-list type.');

    var i = 0;

    var cursor = this,
        length = array.length;

    return {
      next: function next() {
        if (i < length) {
          return {
            value: cursor.select(i++)
          };
        }

        return {
          done: true
        };
      }
    };
  };
}

/**
 * Setter Methods
 * ---------------
 *
 * Those methods are dynamically assigned to the class for DRY reasons.
 */

// Not using a Set so that ES5 consumers don't pay a bundle size price
var INTRANSITIVE_SETTERS = {
  unset: true,
  pop: true,
  shift: true
};

/**
 * Function creating a setter method for the Cursor class.
 *
 * @param {string}   name          - the method's name.
 * @param {function} [typeChecker] - a function checking that the given value is
 *                                   valid for the given operation.
 */
function makeSetter(name, typeChecker) {

  /**
   * Binding a setter method to the Cursor class and having the following
   * definition.
   *
   * Note: this is not really possible to make those setters variadic because
   * it would create an impossible polymorphism with path.
   *
   * @todo: perform value validation elsewhere so that tree.update can
   * beneficiate from it.
   *
   * Arity (1):
   * @param  {mixed} value - New value to set at cursor's path.
   *
   * Arity (2):
   * @param  {path}  path  - Subpath to update starting from cursor's.
   * @param  {mixed} value - New value to set.
   *
   * @return {mixed}       - Data at path.
   */
  Cursor.prototype[name] = function (path, value) {

    // We should warn the user if he applies to many arguments to the function
    if (arguments.length > 2) throw (0, _helpers.makeError)('Baobab.Cursor.' + name + ': too many arguments.');

    // Handling arities
    if (arguments.length === 1 && !INTRANSITIVE_SETTERS[name]) {
      value = path;
      path = [];
    }

    // Coerce path
    path = (0, _helpers.coercePath)(path);

    // Checking the path's validity
    if (!_type2['default'].path(path)) throw (0, _helpers.makeError)('Baobab.Cursor.' + name + ': invalid path.', { path: path });

    // Checking the value's validity
    if (typeChecker && !typeChecker(value)) throw (0, _helpers.makeError)('Baobab.Cursor.' + name + ': invalid value.', { path: path, value: value });

    // Checking the solvability of the cursor's dynamic path
    if (!this.solvedPath) throw (0, _helpers.makeError)('Baobab.Cursor.' + name + ': the dynamic path of the cursor cannot be solved.', { path: this.path });

    var fullPath = this.solvedPath.concat(path);

    // Filing the update to the tree
    return this.tree.update(fullPath, {
      type: name,
      value: value
    });
  };
}

/**
 * Making the necessary setters.
 */
makeSetter('set');
makeSetter('unset');
makeSetter('apply', _type2['default']['function']);
makeSetter('push');
makeSetter('concat', _type2['default'].array);
makeSetter('unshift');
makeSetter('pop');
makeSetter('shift');
makeSetter('splice', _type2['default'].splicer);
makeSetter('merge', _type2['default'].object);
makeSetter('deepMerge', _type2['default'].object);
module.exports = exports['default'];
},{"./helpers":3,"./monkey":4,"./type":5,"emmett":8}],3:[function(require,module,exports){
(function (global){
/* eslint eqeqeq: 0 */

/**
 * Baobab Helpers
 * ===============
 *
 * Miscellaneous helper functions.
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.arrayFrom = arrayFrom;
exports.before = before;
exports.coercePath = coercePath;
exports.getIn = getIn;
exports.makeError = makeError;
exports.solveRelativePath = solveRelativePath;
exports.solveUpdate = solveUpdate;
exports.splice = splice;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _monkey = require('./monkey');

var _type = require('./type');

var _type2 = _interopRequireDefault(_type);

/**
 * Noop function
 */
var noop = Function.prototype;

/**
 * Function returning the index of the first element of a list matching the
 * given predicate.
 *
 * @param  {array}     a  - The target array.
 * @param  {function}  fn - The predicate function.
 * @return {mixed}        - The index of the first matching item or -1.
 */
function index(a, fn) {
  var i = undefined,
      l = undefined;
  for (i = 0, l = a.length; i < l; i++) {
    if (fn(a[i])) return i;
  }
  return -1;
}

/**
 * Efficient slice function used to clone arrays or parts of them.
 *
 * @param  {array} array - The array to slice.
 * @return {array}       - The sliced array.
 */
function slice(array) {
  var newArray = new Array(array.length);

  var i = undefined,
      l = undefined;

  for (i = 0, l = array.length; i < l; i++) newArray[i] = array[i];

  return newArray;
}

/**
 * Archive abstraction
 *
 * @constructor
 * @param {integer} size - Maximum number of records to store.
 */

var Archive = (function () {
  function Archive(size) {
    _classCallCheck(this, Archive);

    this.size = size;
    this.records = [];
  }

  /**
   * Function creating a real array from what should be an array but is not.
   * I'm looking at you nasty `arguments`...
   *
   * @param  {mixed} culprit - The culprit to convert.
   * @return {array}         - The real array.
   */

  /**
   * Method retrieving the records.
   *
   * @return {array} - The records.
   */

  _createClass(Archive, [{
    key: 'get',
    value: function get() {
      return this.records;
    }

    /**
     * Method adding a record to the archive
     *
     * @param {object}  record - The record to store.
     * @return {Archive}       - The archive itself for chaining purposes.
     */
  }, {
    key: 'add',
    value: function add(record) {
      this.records.unshift(record);

      // If the number of records is exceeded, we truncate the records
      if (this.records.length > this.size) this.records.length = this.size;

      return this;
    }

    /**
     * Method clearing the records.
     *
     * @return {Archive} - The archive itself for chaining purposes.
     */
  }, {
    key: 'clear',
    value: function clear() {
      this.records = [];
      return this;
    }

    /**
     * Method to go back in time.
     *
     * @param {integer} steps - Number of steps we should go back by.
     * @return {number}       - The last record.
     */
  }, {
    key: 'back',
    value: function back(steps) {
      var record = this.records[steps - 1];

      if (record) this.records = this.records.slice(steps);
      return record;
    }
  }]);

  return Archive;
})();

exports.Archive = Archive;

function arrayFrom(culprit) {
  return slice(culprit);
}

/**
 * Function decorating one function with another that will be called before the
 * decorated one.
 *
 * @param  {function} decorator - The decorating function.
 * @param  {function} fn        - The function to decorate.
 * @return {function}           - The decorated function.
 */

function before(decorator, fn) {
  return function () {
    decorator.apply(null, arguments);
    fn.apply(null, arguments);
  };
}

/**
 * Function cloning the given regular expression. Supports `y` and `u` flags
 * already.
 *
 * @param  {RegExp} re - The target regular expression.
 * @return {RegExp}    - The cloned regular expression.
 */
function cloneRegexp(re) {
  var pattern = re.source;

  var flags = '';

  if (re.global) flags += 'g';
  if (re.multiline) flags += 'm';
  if (re.ignoreCase) flags += 'i';
  if (re.sticky) flags += 'y';
  if (re.unicode) flags += 'u';

  return new RegExp(pattern, flags);
}

/**
 * Function cloning the given variable.
 *
 * @todo: implement a faster way to clone an array.
 *
 * @param  {boolean} deep - Should we deep clone the variable.
 * @param  {mixed}   item - The variable to clone
 * @return {mixed}        - The cloned variable.
 */
function cloner(deep, item) {
  if (!item || typeof item !== 'object' || item instanceof Error || item instanceof _monkey.MonkeyDefinition || 'ArrayBuffer' in global && item instanceof ArrayBuffer) return item;

  // Array
  if (_type2['default'].array(item)) {
    if (deep) {
      var a = [];

      var i = undefined,
          l = undefined;

      for (i = 0, l = item.length; i < l; i++) a.push(cloner(true, item[i]));
      return a;
    }

    return slice(item);
  }

  // Date
  if (item instanceof Date) return new Date(item.getTime());

  // RegExp
  if (item instanceof RegExp) return cloneRegexp(item);

  // Object
  if (_type2['default'].object(item)) {
    var o = {};

    var k = undefined;

    // NOTE: could be possible to erase computed properties through `null`.
    for (k in item) {
      if (_type2['default'].lazyGetter(item, k)) {
        Object.defineProperty(o, k, {
          get: Object.getOwnPropertyDescriptor(item, k).get,
          enumerable: true,
          configurable: true
        });
      } else if (item.hasOwnProperty(k)) {
        o[k] = deep ? cloner(true, item[k]) : item[k];
      }
    }
    return o;
  }

  return item;
}

/**
 * Exporting shallow and deep cloning functions.
 */
var shallowClone = cloner.bind(null, false),
    deepClone = cloner.bind(null, true);

exports.shallowClone = shallowClone;
exports.deepClone = deepClone;

/**
 * Coerce the given variable into a full-fledged path.
 *
 * @param  {mixed} target - The variable to coerce.
 * @return {array}        - The array path.
 */

function coercePath(target) {
  if (target || target === 0 || target === '') return target;
  return [];
}

/**
 * Function comparing an object's properties to a given descriptive
 * object.
 *
 * @param  {object} object      - The object to compare.
 * @param  {object} description - The description's mapping.
 * @return {boolean}            - Whether the object matches the description.
 */
function compare(object, description) {
  var ok = true,
      k = undefined;

  // If we reached here via a recursive call, object may be undefined because
  // not all items in a collection will have the same deep nesting structure.
  if (!object) return false;

  for (k in description) {
    if (_type2['default'].object(description[k])) {
      ok = ok && compare(object[k], description[k]);
    } else if (_type2['default'].array(description[k])) {
      ok = ok && !! ~description[k].indexOf(object[k]);
    } else {
      if (object[k] !== description[k]) return false;
    }
  }

  return ok;
}

/**
 * Function freezing the given variable if possible.
 *
 * @param  {boolean} deep - Should we recursively freeze the given objects?
 * @param  {object}  o    - The variable to freeze.
 * @return {object}    - The merged object.
 */
function freezer(deep, o) {
  if (typeof o !== 'object' || o === null || o instanceof _monkey.Monkey) return;

  Object.freeze(o);

  if (!deep) return;

  if (Array.isArray(o)) {

    // Iterating through the elements
    var i = undefined,
        l = undefined;

    for (i = 0, l = o.length; i < l; i++) freezer(true, o[i]);
  } else {
    var p = undefined,
        k = undefined;

    for (k in o) {
      if (_type2['default'].lazyGetter(o, k)) continue;

      p = o[k];

      if (!p || !o.hasOwnProperty(k) || typeof p !== 'object' || Object.isFrozen(p)) continue;

      freezer(true, p);
    }
  }
}

/**
 * Exporting both `freeze` and `deepFreeze` functions.
 * Note that if the engine does not support `Object.freeze` then this will
 * export noop functions instead.
 */
var isFreezeSupported = typeof Object.freeze === 'function';

var freeze = isFreezeSupported ? freezer.bind(null, false) : noop,
    deepFreeze = isFreezeSupported ? freezer.bind(null, true) : noop;

exports.freeze = freeze;
exports.deepFreeze = deepFreeze;

/**
 * Function retrieving nested data within the given object and according to
 * the given path.
 *
 * @todo: work if dynamic path hit objects also.
 * @todo: memoized perfgetters.
 *
 * @param  {object}  object - The object we need to get data from.
 * @param  {array}   path   - The path to follow.
 * @return {object}  result            - The result.
 * @return {mixed}   result.data       - The data at path, or `undefined`.
 * @return {array}   result.solvedPath - The solved path or `null`.
 * @return {boolean} result.exists     - Does the path exists in the tree?
 */
var notFoundObject = { data: undefined, solvedPath: null, exists: false };

function getIn(object, path) {
  if (!path) return notFoundObject;

  var solvedPath = [];

  var exists = true,
      c = object,
      idx = undefined,
      i = undefined,
      l = undefined;

  for (i = 0, l = path.length; i < l; i++) {
    if (!c) return { data: undefined, solvedPath: path, exists: false };

    if (typeof path[i] === 'function') {
      if (!_type2['default'].array(c)) return notFoundObject;

      idx = index(c, path[i]);
      if (! ~idx) return notFoundObject;

      solvedPath.push(idx);
      c = c[idx];
    } else if (typeof path[i] === 'object') {
      if (!_type2['default'].array(c)) return notFoundObject;

      idx = index(c, function (e) {
        return compare(e, path[i]);
      });
      if (! ~idx) return notFoundObject;

      solvedPath.push(idx);
      c = c[idx];
    } else {
      solvedPath.push(path[i]);
      exists = typeof c === 'object' && path[i] in c;
      c = c[path[i]];
    }
  }

  return { data: c, solvedPath: solvedPath, exists: exists };
}

/**
 * Little helper returning a JavaScript error carrying some data with it.
 *
 * @param  {string} message - The error message.
 * @param  {object} [data]  - Optional data to assign to the error.
 * @return {Error}          - The created error.
 */

function makeError(message, data) {
  var err = new Error(message);

  for (var k in data) {
    err[k] = data[k];
  }return err;
}

/**
 * Function taking n objects to merge them together.
 * Note 1): the latter object will take precedence over the first one.
 * Note 2): the first object will be mutated to allow for perf scenarios.
 * Note 3): this function will consider monkeys as leaves.
 *
 * @param  {boolean}   deep    - Whether the merge should be deep or not.
 * @param  {...object} objects - Objects to merge.
 * @return {object}            - The merged object.
 */
function merger(deep) {
  for (var _len = arguments.length, objects = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    objects[_key - 1] = arguments[_key];
  }

  var o = objects[0];

  var t = undefined,
      i = undefined,
      l = undefined,
      k = undefined;

  for (i = 1, l = objects.length; i < l; i++) {
    t = objects[i];

    for (k in t) {
      if (deep && _type2['default'].object(t[k]) && !(t[k] instanceof _monkey.Monkey)) {
        o[k] = merger(true, o[k] || {}, t[k]);
      } else {
        o[k] = t[k];
      }
    }
  }

  return o;
}

/**
 * Exporting both `shallowMerge` and `deepMerge` functions.
 */
var shallowMerge = merger.bind(null, false),
    deepMerge = merger.bind(null, true);

exports.shallowMerge = shallowMerge;
exports.deepMerge = deepMerge;

/**
 * Solving a potentially relative path.
 *
 * @param  {array} base - The base path from which to solve the path.
 * @param  {array} to   - The subpath to reach.
 * @param  {array}      - The solved absolute path.
 */

function solveRelativePath(base, to) {
  var solvedPath = [];

  for (var i = 0, l = to.length; i < l; i++) {
    var step = to[i];

    if (step === '.') {
      if (!i) solvedPath = base.slice(0);
    } else if (step === '..') {
      solvedPath = (!i ? base : solvedPath).slice(0, -1);
    } else {
      solvedPath.push(step);
    }
  }

  return solvedPath;
}

/**
 * Function determining whether some paths in the tree were affected by some
 * updates that occurred at the given paths. This helper is mainly used at
 * cursor level to determine whether the cursor is concerned by the updates
 * fired at tree level.
 *
 * NOTES: 1) If performance become an issue, the following threefold loop
 *           can be simplified to a complex twofold one.
 *        2) A regex version could also work but I am not confident it would
 *           be faster.
 *        3) Another solution would be to keep a register of cursors like with
 *           the monkeys and update along this tree.
 *
 * @param  {array} affectedPaths - The paths that were updated.
 * @param  {array} comparedPaths - The paths that we are actually interested in.
 * @return {boolean}             - Is the update relevant to the compared
 *                                 paths?
 */

function solveUpdate(affectedPaths, comparedPaths) {
  var i = undefined,
      j = undefined,
      k = undefined,
      l = undefined,
      m = undefined,
      n = undefined,
      p = undefined,
      c = undefined,
      s = undefined;

  // Looping through possible paths
  for (i = 0, l = affectedPaths.length; i < l; i++) {
    p = affectedPaths[i];

    if (!p.length) return true;

    // Looping through logged paths
    for (j = 0, m = comparedPaths.length; j < m; j++) {
      c = comparedPaths[j];

      if (!c || !c.length) return true;

      // Looping through steps
      for (k = 0, n = c.length; k < n; k++) {
        s = c[k];

        // If path is not relevant, we break
        // NOTE: the '!=' instead of '!==' is required here!
        if (s != p[k]) break;

        // If we reached last item and we are relevant
        if (k + 1 === n || k + 1 === p.length) return true;
      }
    }
  }

  return false;
}

/**
 * Non-mutative version of the splice array method.
 *
 * @param  {array}    array        - The array to splice.
 * @param  {integer}  startIndex   - The start index.
 * @param  {integer}  nb           - Number of elements to remove.
 * @param  {...mixed} elements     - Elements to append after splicing.
 * @return {array}                 - The spliced array.
 */

function splice(array, startIndex, nb) {
  nb = Math.max(0, nb);

  // Positive index

  for (var _len2 = arguments.length, elements = Array(_len2 > 3 ? _len2 - 3 : 0), _key2 = 3; _key2 < _len2; _key2++) {
    elements[_key2 - 3] = arguments[_key2];
  }

  if (startIndex >= 0) return array.slice(0, startIndex).concat(elements).concat(array.slice(startIndex + nb));

  // Negative index
  return array.slice(0, array.length + startIndex).concat(elements).concat(array.slice(array.length + startIndex + nb));
}

/**
 * Function returning a unique incremental id each time it is called.
 *
 * @return {integer} - The latest unique id.
 */
var uniqid = (function () {
  var i = 0;

  return function () {
    return i++;
  };
})();

exports.uniqid = uniqid;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./monkey":4,"./type":5}],4:[function(require,module,exports){
/**
 * Baobab Monkeys
 * ===============
 *
 * Exposing both handy monkey definitions and the underlying working class.
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _type = require('./type');

var _type2 = _interopRequireDefault(_type);

var _update2 = require('./update');

var _update3 = _interopRequireDefault(_update2);

var _helpers = require('./helpers');

/**
 * Monkey Definition class
 * Note: The only reason why this is a class is to be able to spot it within
 * otherwise ordinary data.
 *
 * @constructor
 * @param {array|object} definition - The formal definition of the monkey.
 */

var MonkeyDefinition = function MonkeyDefinition(definition) {
  var _this = this;

  _classCallCheck(this, MonkeyDefinition);

  var monkeyType = _type2['default'].monkeyDefinition(definition);

  if (!monkeyType) throw (0, _helpers.makeError)('Baobab.monkey: invalid definition.', { definition: definition });

  this.type = monkeyType;

  if (this.type === 'object') {
    this.getter = definition.get;
    this.projection = definition.cursors || {};
    this.paths = Object.keys(this.projection).map(function (k) {
      return _this.projection[k];
    });
    this.options = definition.options || {};
  } else {
    var offset = 1,
        options = {};

    if (_type2['default'].object(definition[definition.length - 1])) {
      offset++;
      options = definition[definition.length - 1];
    }

    this.getter = definition[definition.length - offset];
    this.projection = definition.slice(0, -offset);
    this.paths = this.projection;
    this.options = options;
  }

  this.hasDynamicPaths = this.paths.some(_type2['default'].dynamicPath);
}

/**
 * Monkey core class
 *
 * @constructor
 * @param {Baobab}           tree       - The bound tree.
 * @param {MonkeyDefinition} definition - A definition instance.
 */
;

exports.MonkeyDefinition = MonkeyDefinition;

var Monkey = (function () {
  function Monkey(tree, pathInTree, definition) {
    var _this2 = this;

    _classCallCheck(this, Monkey);

    // Properties
    this.tree = tree;
    this.path = pathInTree;
    this.definition = definition;
    this.isRecursive = false;

    // Adapting the definition's paths & projection to this monkey's case
    var projection = definition.projection,
        relative = _helpers.solveRelativePath.bind(null, pathInTree.slice(0, -1));

    if (definition.type === 'object') {
      this.projection = Object.keys(projection).reduce(function (acc, k) {
        acc[k] = relative(projection[k]);
        return acc;
      }, {});
      this.depPaths = Object.keys(this.projection).map(function (k) {
        return _this2.projection[k];
      });
    } else {
      this.projection = projection.map(relative);
      this.depPaths = this.projection;
    }

    // Internal state
    this.state = {
      killed: false
    };

    /**
     * Listener on the tree's `write` event.
     *
     * When the tree writes, this listener will check whether the updated paths
     * are of any use to the monkey and, if so, will update the tree's node
     * where the monkey sits with a lazy getter.
     */
    this.listener = function (_ref) {
      var path = _ref.data.path;

      if (_this2.state.killed) return;

      // Is the monkey affected by the current write event?
      var concerned = (0, _helpers.solveUpdate)([path], _this2.relatedPaths());

      if (concerned) _this2.update();
    };

    // Binding listener
    this.tree.on('write', this.listener);

    // Updating relevant node
    this.update();
  }

  /**
   * Method triggering a recursivity check.
   *
   * @return {Monkey} - Returns itself for chaining purposes.
   */

  _createClass(Monkey, [{
    key: 'checkRecursivity',
    value: function checkRecursivity() {
      var _this3 = this;

      this.isRecursive = this.depPaths.some(function (p) {
        return !!_type2['default'].monkeyPath(_this3.tree._monkeys, p);
      });

      // Putting the recursive monkeys' listeners at the end of the stack
      // NOTE: this is a dirty hack and a more thorough solution should be found
      if (this.isRecursive) {
        this.tree.off('write', this.listener);
        this.tree.on('write', this.listener);
      }

      return this;
    }

    /**
     * Method returning solved paths related to the monkey.
     *
     * @return {array} - An array of related paths.
     */
  }, {
    key: 'relatedPaths',
    value: function relatedPaths() {
      var _this4 = this;

      var paths = undefined;

      if (this.definition.hasDynamicPaths) paths = this.depPaths.map(function (p) {
        return (0, _helpers.getIn)(_this4.tree._data, p).solvedPath;
      });else paths = this.depPaths;

      if (!this.isRecursive) return paths;

      return paths.reduce(function (accumulatedPaths, path) {
        var monkeyPath = _type2['default'].monkeyPath(_this4.tree._monkeys, path);

        if (!monkeyPath) return accumulatedPaths.concat([path]);

        // Solving recursive path
        var relatedMonkey = (0, _helpers.getIn)(_this4.tree._monkeys, monkeyPath).data;

        return accumulatedPaths.concat(relatedMonkey.relatedPaths());
      }, []);
    }

    /**
     * Method used to update the tree's internal data with a lazy getter holding
     * the computed data.
     *
     * @return {Monkey} - Returns itself for chaining purposes.
     */
  }, {
    key: 'update',
    value: function update() {
      var deps = this.tree.project(this.projection);

      var lazyGetter = (function (tree, def, data) {
        var cache = null,
            alreadyComputed = false;

        return function () {

          if (!alreadyComputed) {
            cache = def.getter.apply(tree, def.type === 'object' ? [data] : data);

            if (tree.options.immutable && def.options.immutable !== false) (0, _helpers.deepFreeze)(cache);

            alreadyComputed = true;
          }

          return cache;
        };
      })(this.tree, this.definition, deps);

      lazyGetter.isLazyGetter = true;

      // Should we write the lazy getter in the tree or solve it right now?
      if (this.tree.options.lazyMonkeys) {
        this.tree._data = (0, _update3['default'])(this.tree._data, this.path, {
          type: 'monkey',
          value: lazyGetter
        }, this.tree.options).data;
      } else {
        var result = (0, _update3['default'])(this.tree._data, this.path, {
          type: 'set',
          value: lazyGetter(),
          options: {
            mutableLeaf: !this.definition.options.immutable
          }
        }, this.tree.options);

        if ('data' in result) this.tree._data = result.data;
      }

      return this;
    }

    /**
     * Method releasing the monkey from memory.
     */
  }, {
    key: 'release',
    value: function release() {

      // Unbinding events
      this.tree.off('write', this.listener);
      this.state.killed = true;

      // Deleting properties
      // NOTE: not deleting this.definition because some strange things happen
      // in the _refreshMonkeys method. See #372.
      delete this.projection;
      delete this.depPaths;
      delete this.tree;
    }
  }]);

  return Monkey;
})();

exports.Monkey = Monkey;
},{"./helpers":3,"./type":5,"./update":6}],5:[function(require,module,exports){
/**
 * Baobab Type Checking
 * =====================
 *
 * Helpers functions used throughout the library to perform some type
 * tests at runtime.
 *
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _monkey = require('./monkey');

var type = {};

/**
 * Helpers
 * --------
 */

/**
 * Checking whether the given variable is of any of the given types.
 *
 * @todo   Optimize this function by dropping `some`.
 *
 * @param  {mixed} target  - Variable to test.
 * @param  {array} allowed - Array of allowed types.
 * @return {boolean}
 */
function anyOf(target, allowed) {
  return allowed.some(function (t) {
    return type[t](target);
  });
}

/**
 * Simple types
 * -------------
 */

/**
 * Checking whether the given variable is an array.
 *
 * @param  {mixed} target - Variable to test.
 * @return {boolean}
 */
type.array = function (target) {
  return Array.isArray(target);
};

/**
 * Checking whether the given variable is an object.
 *
 * @param  {mixed} target - Variable to test.
 * @return {boolean}
 */
type.object = function (target) {
  return target && typeof target === 'object' && !Array.isArray(target) && !(target instanceof Date) && !(target instanceof RegExp) && !(typeof Map === 'function' && target instanceof Map) && !(typeof Set === 'function' && target instanceof Set);
};

/**
 * Checking whether the given variable is a string.
 *
 * @param  {mixed} target - Variable to test.
 * @return {boolean}
 */
type.string = function (target) {
  return typeof target === 'string';
};

/**
 * Checking whether the given variable is a number.
 *
 * @param  {mixed} target - Variable to test.
 * @return {boolean}
 */
type.number = function (target) {
  return typeof target === 'number';
};

/**
 * Checking whether the given variable is a function.
 *
 * @param  {mixed} target - Variable to test.
 * @return {boolean}
 */
type['function'] = function (target) {
  return typeof target === 'function';
};

/**
 * Checking whether the given variable is a JavaScript primitive.
 *
 * @param  {mixed} target - Variable to test.
 * @return {boolean}
 */
type.primitive = function (target) {
  return target !== Object(target);
};

/**
 * Complex types
 * --------------
 */

/**
 * Checking whether the given variable is a valid splicer.
 *
 * @param  {mixed} target    - Variable to test.
 * @param  {array} [allowed] - Optional valid types in path.
 * @return {boolean}
 */
type.splicer = function (target) {
  if (!type.array(target) || target.length < 2) return false;

  return anyOf(target[0], ['number', 'function', 'object']) && type.number(target[1]);
};

/**
 * Checking whether the given variable is a valid cursor path.
 *
 * @param  {mixed} target    - Variable to test.
 * @param  {array} [allowed] - Optional valid types in path.
 * @return {boolean}
 */

// Order is important for performance reasons
var ALLOWED_FOR_PATH = ['string', 'number', 'function', 'object'];

type.path = function (target) {
  if (!target && target !== 0 && target !== '') return false;

  return [].concat(target).every(function (step) {
    return anyOf(step, ALLOWED_FOR_PATH);
  });
};

/**
 * Checking whether the given path is a dynamic one.
 *
 * @param  {mixed} path - The path to test.
 * @return {boolean}
 */
type.dynamicPath = function (path) {
  return path.some(function (step) {
    return type['function'](step) || type.object(step);
  });
};

/**
 * Retrieve any monkey subpath in the given path or null if the path never comes
 * across computed data.
 *
 * @param  {mixed} data - The data to test.
 * @param  {array} path - The path to test.
 * @return {boolean}
 */
type.monkeyPath = function (data, path) {
  var subpath = [];

  var c = data,
      i = undefined,
      l = undefined;

  for (i = 0, l = path.length; i < l; i++) {
    subpath.push(path[i]);

    if (typeof c !== 'object') return null;

    c = c[path[i]];

    if (c instanceof _monkey.Monkey) return subpath;
  }

  return null;
};

/**
 * Check if the given object property is a lazy getter used by a monkey.
 *
 * @param  {mixed}   o           - The target object.
 * @param  {string}  propertyKey - The property to test.
 * @return {boolean}
 */
type.lazyGetter = function (o, propertyKey) {
  var descriptor = Object.getOwnPropertyDescriptor(o, propertyKey);

  return descriptor && descriptor.get && descriptor.get.isLazyGetter === true;
};

/**
 * Returns the type of the given monkey definition or `null` if invalid.
 *
 * @param  {mixed} definition - The definition to check.
 * @return {string|null}
 */
type.monkeyDefinition = function (definition) {

  if (type.object(definition)) {
    if (!type['function'](definition.get) || definition.cursors && (!type.object(definition.cursors) || !Object.keys(definition.cursors).every(function (k) {
      return type.path(definition.cursors[k]);
    }))) return null;

    return 'object';
  } else if (type.array(definition)) {
    var offset = 1;

    if (type.object(definition[definition.length - 1])) offset++;

    if (!type['function'](definition[definition.length - offset]) || !definition.slice(0, -offset).every(function (p) {
      return type.path(p);
    })) return null;

    return 'array';
  }

  return null;
};

/**
 * Checking whether the given watcher definition is valid.
 *
 * @param  {mixed}   definition - The definition to check.
 * @return {boolean}
 */
type.watcherMapping = function (definition) {
  return type.object(definition) && Object.keys(definition).every(function (k) {
    return type.path(definition[k]);
  });
};

/**
 * Checking whether the given string is a valid operation type.
 *
 * @param  {mixed} string - The string to test.
 * @return {boolean}
 */

// Ordered by likeliness
var VALID_OPERATIONS = ['set', 'apply', 'push', 'unshift', 'concat', 'pop', 'shift', 'deepMerge', 'merge', 'splice', 'unset'];

type.operationType = function (string) {
  return typeof string === 'string' && !! ~VALID_OPERATIONS.indexOf(string);
};

exports['default'] = type;
module.exports = exports['default'];
},{"./monkey":4}],6:[function(require,module,exports){
/**
 * Baobab Update
 * ==============
 *
 * The tree's update scheme.
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = update;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var _type = require('./type');

var _type2 = _interopRequireDefault(_type);

var _helpers = require('./helpers');

function err(operation, expectedTarget, path) {
  return (0, _helpers.makeError)('Baobab.update: cannot apply the "' + operation + '" on ' + ('a non ' + expectedTarget + ' (path: /' + path.join('/') + ').'), { path: path });
}

/**
 * Function aiming at applying a single update operation on the given tree's
 * data.
 *
 * @param  {mixed}  data      - The tree's data.
 * @param  {path}   path      - Path of the update.
 * @param  {object} operation - The operation to apply.
 * @param  {object} [opts]    - Optional options.
 * @return {mixed}            - Both the new tree's data and the updated node.
 */

function update(data, path, operation) {
  var opts = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];
  var operationType = operation.type;
  var value = operation.value;
  var _operation$options = operation.options;
  var operationOptions = _operation$options === undefined ? {} : _operation$options;

  // Dummy root, so we can shift and alter the root
  var dummy = { root: data },
      dummyPath = ['root'].concat(_toConsumableArray(path)),
      currentPath = [];

  // Walking the path
  var p = dummy,
      i = undefined,
      l = undefined,
      s = undefined;

  for (i = 0, l = dummyPath.length; i < l; i++) {

    // Current item's reference is therefore p[s]
    // The reason why we don't create a variable here for convenience
    // is because we actually need to mutate the reference.
    s = dummyPath[i];

    // Updating the path
    if (i > 0) currentPath.push(s);

    // If we reached the end of the path, we apply the operation
    if (i === l - 1) {

      /**
       * Set
       */
      if (operationType === 'set') {

        // Purity check
        if (opts.pure && p[s] === value) return { node: p[s] };

        if (_type2['default'].lazyGetter(p, s)) {
          Object.defineProperty(p, s, {
            value: value,
            enumerable: true,
            configurable: true
          });
        } else if (opts.persistent && !operationOptions.mutableLeaf) {
          p[s] = (0, _helpers.shallowClone)(value);
        } else {
          p[s] = value;
        }
      }

      /**
       * Monkey
       */
      else if (operationType === 'monkey') {
          Object.defineProperty(p, s, {
            get: value,
            enumerable: true,
            configurable: true
          });
        }

        /**
         * Apply
         */
        else if (operationType === 'apply') {
            var result = value(p[s]);

            // Purity check
            if (opts.pure && p[s] === result) return { node: p[s] };

            if (_type2['default'].lazyGetter(p, s)) {
              Object.defineProperty(p, s, {
                value: result,
                enumerable: true,
                configurable: true
              });
            } else if (opts.persistent) {
              p[s] = (0, _helpers.shallowClone)(result);
            } else {
              p[s] = result;
            }
          }

          /**
           * Push
           */
          else if (operationType === 'push') {
              if (!_type2['default'].array(p[s])) throw err('push', 'array', currentPath);

              if (opts.persistent) p[s] = p[s].concat([value]);else p[s].push(value);
            }

            /**
             * Unshift
             */
            else if (operationType === 'unshift') {
                if (!_type2['default'].array(p[s])) throw err('unshift', 'array', currentPath);

                if (opts.persistent) p[s] = [value].concat(p[s]);else p[s].unshift(value);
              }

              /**
               * Concat
               */
              else if (operationType === 'concat') {
                  if (!_type2['default'].array(p[s])) throw err('concat', 'array', currentPath);

                  if (opts.persistent) p[s] = p[s].concat(value);else p[s].push.apply(p[s], value);
                }

                /**
                 * Splice
                 */
                else if (operationType === 'splice') {
                    if (!_type2['default'].array(p[s])) throw err('splice', 'array', currentPath);

                    if (opts.persistent) p[s] = _helpers.splice.apply(null, [p[s]].concat(value));else p[s].splice.apply(p[s], value);
                  }

                  /**
                   * Pop
                   */
                  else if (operationType === 'pop') {
                      if (!_type2['default'].array(p[s])) throw err('pop', 'array', currentPath);

                      if (opts.persistent) p[s] = (0, _helpers.splice)(p[s], -1, 1);else p[s].pop();
                    }

                    /**
                     * Shift
                     */
                    else if (operationType === 'shift') {
                        if (!_type2['default'].array(p[s])) throw err('shift', 'array', currentPath);

                        if (opts.persistent) p[s] = (0, _helpers.splice)(p[s], 0, 1);else p[s].shift();
                      }

                      /**
                       * Unset
                       */
                      else if (operationType === 'unset') {
                          if (_type2['default'].object(p)) delete p[s];else if (_type2['default'].array(p)) p.splice(s, 1);
                        }

                        /**
                         * Merge
                         */
                        else if (operationType === 'merge') {
                            if (!_type2['default'].object(p[s])) throw err('merge', 'object', currentPath);

                            if (opts.persistent) p[s] = (0, _helpers.shallowMerge)({}, p[s], value);else p[s] = (0, _helpers.shallowMerge)(p[s], value);
                          }

                          /**
                           * Deep merge
                           */
                          else if (operationType === 'deepMerge') {
                              if (!_type2['default'].object(p[s])) throw err('deepMerge', 'object', currentPath);

                              if (opts.persistent) p[s] = (0, _helpers.deepMerge)({}, p[s], value);else p[s] = (0, _helpers.deepMerge)(p[s], value);
                            }

      // Deep freezing the resulting value
      if (opts.immutable && !operationOptions.mutableLeaf) (0, _helpers.deepFreeze)(p);

      break;
    }

    // If we reached a leaf, we override by setting an empty object
    else if (_type2['default'].primitive(p[s])) {
        p[s] = {};
      }

      // Else, we shift the reference and continue the path
      else if (opts.persistent) {
          p[s] = (0, _helpers.shallowClone)(p[s]);
        }

    // Should we freeze the current step before continuing?
    if (opts.immutable && l > 0) (0, _helpers.freeze)(p);

    p = p[s];
  }

  // If we are updating a dynamic node, we need not return the affected node
  if (_type2['default'].lazyGetter(p, s)) return { data: dummy.root };

  // Returning new data object
  return { data: dummy.root, node: p[s] };
}

module.exports = exports['default'];
},{"./helpers":3,"./type":5}],7:[function(require,module,exports){
/**
 * Baobab Watchers
 * ================
 *
 * Abstraction used to listen and retrieve data from multiple parts of a
 * Baobab tree at once.
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _emmett = require('emmett');

var _emmett2 = _interopRequireDefault(_emmett);

var _cursor = require('./cursor');

var _cursor2 = _interopRequireDefault(_cursor);

var _type = require('./type');

var _type2 = _interopRequireDefault(_type);

var _helpers = require('./helpers');

/**
 * Watcher class.
 *
 * @constructor
 * @param {Baobab} tree     - The watched tree.
 * @param {object} mapping  - A mapping of the paths to watch in the tree.
 */

var Watcher = (function (_Emitter) {
  _inherits(Watcher, _Emitter);

  function Watcher(tree, mapping) {
    var _this = this;

    _classCallCheck(this, Watcher);

    _get(Object.getPrototypeOf(Watcher.prototype), 'constructor', this).call(this);

    // Properties
    this.tree = tree;
    this.mapping = null;

    this.state = {
      killed: false
    };

    // Initializing
    this.refresh(mapping);

    // Listening
    this.handler = function (e) {
      if (_this.state.killed) return;

      var watchedPaths = _this.getWatchedPaths();

      if ((0, _helpers.solveUpdate)(e.data.paths, watchedPaths)) return _this.emit('update');
    };

    this.tree.on('update', this.handler);
  }

  /**
   * Method used to get the current watched paths.
   *
   * @return {array} - The array of watched paths.
   */

  _createClass(Watcher, [{
    key: 'getWatchedPaths',
    value: function getWatchedPaths() {
      var _this2 = this;

      var rawPaths = Object.keys(this.mapping).map(function (k) {
        var v = _this2.mapping[k];

        // Watcher mappings can accept a cursor
        if (v instanceof _cursor2['default']) return v.solvedPath;

        return _this2.mapping[k];
      });

      return rawPaths.reduce(function (cp, p) {

        // Handling path polymorphisms
        p = [].concat(p);

        // Dynamic path?
        if (_type2['default'].dynamicPath(p)) p = (0, _helpers.getIn)(_this2.tree._data, p).solvedPath;

        if (!p) return cp;

        // Facet path?
        var monkeyPath = _type2['default'].monkeyPath(_this2.tree._monkeys, p);

        if (monkeyPath) return cp.concat((0, _helpers.getIn)(_this2.tree._monkeys, monkeyPath).data.relatedPaths());

        return cp.concat([p]);
      }, []);
    }

    /**
     * Method used to return a map of the watcher's cursors.
     *
     * @return {object} - TMap of relevant cursors.
     */
  }, {
    key: 'getCursors',
    value: function getCursors() {
      var _this3 = this;

      var cursors = {};

      Object.keys(this.mapping).forEach(function (k) {
        var path = _this3.mapping[k];

        if (path instanceof _cursor2['default']) cursors[k] = path;else cursors[k] = _this3.tree.select(path);
      });

      return cursors;
    }

    /**
     * Method used to refresh the watcher's mapping.
     *
     * @param  {object}  mapping  - The new mapping to apply.
     * @return {Watcher}          - Itself for chaining purposes.
     */
  }, {
    key: 'refresh',
    value: function refresh(mapping) {

      if (!_type2['default'].watcherMapping(mapping)) throw (0, _helpers.makeError)('Baobab.watch: invalid mapping.', { mapping: mapping });

      this.mapping = mapping;

      // Creating the get method
      var projection = {};

      for (var k in mapping) {
        projection[k] = mapping[k] instanceof _cursor2['default'] ? mapping[k].path : mapping[k];
      }this.get = this.tree.project.bind(this.tree, projection);
    }

    /**
     * Methods releasing the watcher from memory.
     */
  }, {
    key: 'release',
    value: function release() {

      this.tree.off('update', this.handler);
      this.state.killed = true;
      this.kill();
    }
  }]);

  return Watcher;
})(_emmett2['default']);

exports['default'] = Watcher;
module.exports = exports['default'];
},{"./cursor":2,"./helpers":3,"./type":5,"emmett":8}],8:[function(require,module,exports){
(function() {
  'use strict';

  /**
   * Here is the list of every allowed parameter when using Emitter#on:
   * @type {Object}
   */
  var __allowedOptions = {
    once: 'boolean',
    scope: 'object'
  };

  /**
   * Incremental id used to order event handlers.
   */
  var __order = 0;

  /**
   * A simple helper to shallowly merge two objects. The second one will "win"
   * over the first one.
   *
   * @param  {object}  o1 First target object.
   * @param  {object}  o2 Second target object.
   * @return {object}     Returns the merged object.
   */
  function shallowMerge(o1, o2) {
    var o = {},
        k;

    for (k in o1) o[k] = o1[k];
    for (k in o2) o[k] = o2[k];

    return o;
  }

  /**
   * Is the given variable a plain JavaScript object?
   *
   * @param  {mixed}  v   Target.
   * @return {boolean}    The boolean result.
   */
  function isPlainObject(v) {
    return v &&
           typeof v === 'object' &&
           !Array.isArray(v) &&
           !(v instanceof Function) &&
           !(v instanceof RegExp);
  }

  /**
   * Iterate over an object that may have ES6 Symbols.
   *
   * @param  {object}   object  Object on which to iterate.
   * @param  {function} fn      Iterator function.
   * @param  {object}   [scope] Optional scope.
   */
  function forIn(object, fn, scope) {
    var symbols,
        k,
        i,
        l;

    for (k in object)
      fn.call(scope || null, k, object[k]);

    if (Object.getOwnPropertySymbols) {
      symbols = Object.getOwnPropertySymbols(object);

      for (i = 0, l = symbols.length; i < l; i++)
        fn.call(scope || null, symbols[i], object[symbols[i]]);
    }
  }

  /**
   * The emitter's constructor. It initializes the handlers-per-events store and
   * the global handlers store.
   *
   * Emitters are useful for non-DOM events communication. Read its methods
   * documentation for more information about how it works.
   *
   * @return {Emitter}         The fresh new instance.
   */
  var Emitter = function() {
    this._enabled = true;

    // Dirty trick that will set the necessary properties to the emitter
    this.unbindAll();
  };

  /**
   * This method unbinds every handlers attached to every or any events. So,
   * these functions will no more be executed when the related events are
   * emitted. If the functions were not bound to the events, nothing will
   * happen, and no error will be thrown.
   *
   * Usage:
   * ******
   * > myEmitter.unbindAll();
   *
   * @return {Emitter}      Returns this.
   */
  Emitter.prototype.unbindAll = function() {

    this._handlers = {};
    this._handlersAll = [];
    this._handlersComplex = [];

    return this;
  };


  /**
   * This method binds one or more functions to the emitter, handled to one or a
   * suite of events. So, these functions will be executed anytime one related
   * event is emitted.
   *
   * It is also possible to bind a function to any emitted event by not
   * specifying any event to bind the function to.
   *
   * Recognized options:
   * *******************
   *  - {?boolean} once   If true, the handlers will be unbound after the first
   *                      execution. Default value: false.
   *  - {?object}  scope  If a scope is given, then the listeners will be called
   *                      with this scope as "this".
   *
   * Variant 1:
   * **********
   * > myEmitter.on('myEvent', function(e) { console.log(e); });
   * > // Or:
   * > myEmitter.on('myEvent', function(e) { console.log(e); }, { once: true });
   *
   * @param  {string}   event   The event to listen to.
   * @param  {function} handler The function to bind.
   * @param  {?object}  options Eventually some options.
   * @return {Emitter}          Returns this.
   *
   * Variant 2:
   * **********
   * > myEmitter.on(
   * >   ['myEvent1', 'myEvent2'],
   * >   function(e) { console.log(e); }
   * >);
   * > // Or:
   * > myEmitter.on(
   * >   ['myEvent1', 'myEvent2'],
   * >   function(e) { console.log(e); }
   * >   { once: true }}
   * >);
   *
   * @param  {array}    events  The events to listen to.
   * @param  {function} handler The function to bind.
   * @param  {?object}  options Eventually some options.
   * @return {Emitter}          Returns this.
   *
   * Variant 3:
   * **********
   * > myEmitter.on({
   * >   myEvent1: function(e) { console.log(e); },
   * >   myEvent2: function(e) { console.log(e); }
   * > });
   * > // Or:
   * > myEmitter.on({
   * >   myEvent1: function(e) { console.log(e); },
   * >   myEvent2: function(e) { console.log(e); }
   * > }, { once: true });
   *
   * @param  {object}  bindings An object containing pairs event / function.
   * @param  {?object}  options Eventually some options.
   * @return {Emitter}          Returns this.
   *
   * Variant 4:
   * **********
   * > myEmitter.on(function(e) { console.log(e); });
   * > // Or:
   * > myEmitter.on(function(e) { console.log(e); }, { once: true});
   *
   * @param  {function} handler The function to bind to every events.
   * @param  {?object}  options Eventually some options.
   * @return {Emitter}          Returns this.
   */
  Emitter.prototype.on = function(a, b, c) {
    var i,
        l,
        k,
        event,
        eArray,
        handlersList,
        bindingObject;

    // Variant 3
    if (isPlainObject(a)) {
      forIn(a, function(name, fn) {
        this.on(name, fn, b);
      }, this);

      return this;
    }

    // Variant 1, 2 and 4
    if (typeof a === 'function') {
      c = b;
      b = a;
      a = null;
    }

    eArray = [].concat(a);

    for (i = 0, l = eArray.length; i < l; i++) {
      event = eArray[i];

      bindingObject = {
        order: __order++,
        fn: b
      };

      // Defining the list in which the handler should be inserted
      if (typeof event === 'string' || typeof event === 'symbol') {
        if (!this._handlers[event])
          this._handlers[event] = [];
        handlersList = this._handlers[event];
        bindingObject.type = event;
      }
      else if (event instanceof RegExp) {
        handlersList = this._handlersComplex;
        bindingObject.pattern = event;
      }
      else if (event === null) {
        handlersList = this._handlersAll;
      }
      else {
        throw Error('Emitter.on: invalid event.');
      }

      // Appending needed properties
      for (k in c || {})
        if (__allowedOptions[k])
          bindingObject[k] = c[k];

      handlersList.push(bindingObject);
    }

    return this;
  };


  /**
   * This method works exactly as the previous #on, but will add an options
   * object if none is given, and set the option "once" to true.
   *
   * The polymorphism works exactly as with the #on method.
   */
  Emitter.prototype.once = function() {
    var args = Array.prototype.slice.call(arguments),
        li = args.length - 1;

    if (isPlainObject(args[li]) && args.length > 1)
      args[li] = shallowMerge(args[li], {once: true});
    else
      args.push({once: true});

    return this.on.apply(this, args);
  };


  /**
   * This method unbinds one or more functions from events of the emitter. So,
   * these functions will no more be executed when the related events are
   * emitted. If the functions were not bound to the events, nothing will
   * happen, and no error will be thrown.
   *
   * Variant 1:
   * **********
   * > myEmitter.off('myEvent', myHandler);
   *
   * @param  {string}   event   The event to unbind the handler from.
   * @param  {function} handler The function to unbind.
   * @return {Emitter}          Returns this.
   *
   * Variant 2:
   * **********
   * > myEmitter.off(['myEvent1', 'myEvent2'], myHandler);
   *
   * @param  {array}    events  The events to unbind the handler from.
   * @param  {function} handler The function to unbind.
   * @return {Emitter}          Returns this.
   *
   * Variant 3:
   * **********
   * > myEmitter.off({
   * >   myEvent1: myHandler1,
   * >   myEvent2: myHandler2
   * > });
   *
   * @param  {object} bindings An object containing pairs event / function.
   * @return {Emitter}         Returns this.
   *
   * Variant 4:
   * **********
   * > myEmitter.off(myHandler);
   *
   * @param  {function} handler The function to unbind from every events.
   * @return {Emitter}          Returns this.
   *
   * Variant 5:
   * **********
   * > myEmitter.off(event);
   *
   * @param  {string} event     The event we should unbind.
   * @return {Emitter}          Returns this.
   */
  function filter(target, fn) {
    target = target || [];

    var a = [],
        l,
        i;

    for (i = 0, l = target.length; i < l; i++)
      if (target[i].fn !== fn)
        a.push(target[i]);

    return a;
  }

  Emitter.prototype.off = function(events, fn) {
    var i,
        n,
        k,
        event;

    // Variant 4:
    if (arguments.length === 1 && typeof events === 'function') {
      fn = arguments[0];

      // Handlers bound to events:
      for (k in this._handlers) {
        this._handlers[k] = filter(this._handlers[k], fn);

        if (this._handlers[k].length === 0)
          delete this._handlers[k];
      }

      // Generic Handlers
      this._handlersAll = filter(this._handlersAll, fn);

      // Complex handlers
      this._handlersComplex = filter(this._handlersComplex, fn);
    }

    // Variant 5
    else if (arguments.length === 1 &&
             (typeof events === 'string' || typeof events === 'symbol')) {
      delete this._handlers[events];
    }

    // Variant 1 and 2:
    else if (arguments.length === 2) {
      var eArray = [].concat(events);

      for (i = 0, n = eArray.length; i < n; i++) {
        event = eArray[i];

        this._handlers[event] = filter(this._handlers[event], fn);

        if ((this._handlers[event] || []).length === 0)
          delete this._handlers[event];
      }
    }

    // Variant 3
    else if (isPlainObject(events)) {
      forIn(events, this.off, this);
    }

    return this;
  };

  /**
   * This method retrieve the listeners attached to a particular event.
   *
   * @param  {?string}    Name of the event.
   * @return {array}      Array of handler functions.
   */
  Emitter.prototype.listeners = function(event) {
    var handlers = this._handlersAll || [],
        complex = false,
        h,
        i,
        l;

    if (!event)
      throw Error('Emitter.listeners: no event provided.');

    handlers = handlers.concat(this._handlers[event] || []);

    for (i = 0, l = this._handlersComplex.length; i < l; i++) {
      h = this._handlersComplex[i];

      if (~event.search(h.pattern)) {
        complex = true;
        handlers.push(h);
      }
    }

    // If we have any complex handlers, we need to sort
    if (this._handlersAll.length || complex)
      return handlers.sort(function(a, b) {
        return a.order - b.order;
      });
    else
      return handlers.slice(0);
  };

  /**
   * This method emits the specified event(s), and executes every handlers bound
   * to the event(s).
   *
   * Use cases:
   * **********
   * > myEmitter.emit('myEvent');
   * > myEmitter.emit('myEvent', myData);
   * > myEmitter.emit(['myEvent1', 'myEvent2']);
   * > myEmitter.emit(['myEvent1', 'myEvent2'], myData);
   * > myEmitter.emit({myEvent1: myData1, myEvent2: myData2});
   *
   * @param  {string|array} events The event(s) to emit.
   * @param  {object?}      data   The data.
   * @return {Emitter}             Returns this.
   */
  Emitter.prototype.emit = function(events, data) {

    // Short exit if the emitter is disabled
    if (!this._enabled)
      return this;

    // Object variant
    if (isPlainObject(events)) {
      forIn(events, this.emit, this);
      return this;
    }

    var eArray = [].concat(events),
        onces = [],
        event,
        parent,
        handlers,
        handler,
        i,
        j,
        l,
        m;

    for (i = 0, l = eArray.length; i < l; i++) {
      handlers = this.listeners(eArray[i]);

      for (j = 0, m = handlers.length; j < m; j++) {
        handler = handlers[j];
        event = {
          type: eArray[i],
          target: this
        };

        if (arguments.length > 1)
          event.data = data;

        handler.fn.call('scope' in handler ? handler.scope : this, event);

        if (handler.once)
          onces.push(handler);
      }

      // Cleaning onces
      for (j = onces.length - 1; j >= 0; j--) {
        parent = onces[j].type ?
          this._handlers[onces[j].type] :
          onces[j].pattern ?
            this._handlersComplex :
            this._handlersAll;

        parent.splice(parent.indexOf(onces[j]), 1);
      }
    }

    return this;
  };


  /**
   * This method will unbind all listeners and make it impossible to ever
   * rebind any listener to any event.
   */
  Emitter.prototype.kill = function() {

    this.unbindAll();
    this._handlers = null;
    this._handlersAll = null;
    this._handlersComplex = null;
    this._enabled = false;

    // Nooping methods
    this.unbindAll =
    this.on =
    this.once =
    this.off =
    this.emit =
    this.listeners = Function.prototype;
  };


  /**
   * This method disabled the emitter, which means its emit method will do
   * nothing.
   *
   * @return {Emitter} Returns this.
   */
  Emitter.prototype.disable = function() {
    this._enabled = false;

    return this;
  };


  /**
   * This method enables the emitter.
   *
   * @return {Emitter} Returns this.
   */
  Emitter.prototype.enable = function() {
    this._enabled = true;

    return this;
  };


  /**
   * Version:
   */
  Emitter.version = '3.1.1';


  // Export:
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports)
      exports = module.exports = Emitter;
    exports.Emitter = Emitter;
  } else if (typeof define === 'function' && define.amd)
    define('emmett', [], function() {
      return Emitter;
    });
  else
    this.Emitter = Emitter;
}).call(this);

},{}],9:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],10:[function(require,module,exports){
/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
module.exports = require('./lib/Dispatcher');

},{"./lib/Dispatcher":12}],11:[function(require,module,exports){
/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';
var debug = require('debug')('Dispatchr:Action');

function Action(name, payload) {
    this.name = name;
    this.payload = payload;
    this._handlers = null;
    this._isExecuting = false;
    this._isCompleted = null;
}

/**
 * Gets a name from a store
 * @method getStoreName
 * @param {String|Object} store The store name or class from which to extract
 *      the name
 * @returns {String}
 */
Action.prototype.getStoreName = function getStoreName(store) {
    if ('string' === typeof store) {
        return store;
    }
    return store.storeName;
};

/**
 * Executes all handlers for the action
 * @method execute
 * @param {Function[]} handlers A mapping of store names to handler function
 * @throws {Error} if action has already been executed
 */
Action.prototype.execute = function execute(handlers) {
    if (this._isExecuting) {
        throw new Error('Action is already dispatched');
    }
    var self = this;
    this._handlers = handlers;
    this._isExecuting = true;
    this._isCompleted = {};
    Object.keys(handlers).forEach(function handlersEach(storeName) {
        self._callHandler(storeName);
    });
};

/**
 * Calls an individual store's handler function
 * @method _callHandler
 * @param {String} storeName
 * @private
 * @throws {Error} if handler does not exist for storeName
 */
Action.prototype._callHandler = function callHandler(storeName) {
    var self = this,
        handlerFn = self._handlers[storeName];
    if (!handlerFn) {
        throw new Error(storeName + ' does not have a handler for action ' + self.name);
    }
    if (self._isCompleted[storeName]) {
        return;
    }
    self._isCompleted[storeName] = false;
    debug('executing handler for ' + storeName);
    handlerFn(self.payload, self.name);
    self._isCompleted[storeName] = true;
};

/**
 * Waits until all stores have finished handling an action and then calls
 * the callback
 * @method waitFor
 * @param {String|String[]|Constructor|Constructor[]} stores An array of stores as strings or constructors to wait for
 * @param {Function} callback Called after all stores have completed handling their actions
 * @throws {Error} if the action is not being executed
 */
Action.prototype.waitFor = function waitFor(stores, callback) {
    var self = this;
    if (!self._isExecuting) {
        throw new Error('waitFor called even though there is no action being executed!');
    }
    if (!Array.isArray(stores)) {
        stores = [stores];
    }

    debug('waiting on ' + stores.join(', '));
    stores.forEach(function storesEach(storeName) {
        storeName = self.getStoreName(storeName);
        if (self._handlers[storeName]) {
            self._callHandler(storeName);
        }
    });

    callback();
};

module.exports = Action;

},{"debug":14}],12:[function(require,module,exports){
(function (process){
/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var Action = require('./Action');
var DEFAULT = 'default';
var DispatcherContext = require('./DispatcherContext');

/**
 * @class Dispatcher
 * @param {Object} options Dispatcher options
 * @param {Array} options.stores Array of stores to register
 * @constructor
 */
function Dispatcher (options) {
    options = options || {};
    options.stores = options.stores || [];
    this.stores = {};
    this.handlers = {};
    this.handlers[DEFAULT] = [];
    this.hasWarnedAboutNameProperty = false;
    options.stores.forEach(function (store) {
        this.registerStore(store);
    }, this);

}

Dispatcher.prototype.createContext = function createContext(context) {
    return new DispatcherContext(this, context);
};

/**
 * Registers a store so that it can handle actions.
 * @method registerStore
 * @static
 * @param {Object} store A store class to be registered. The store should have a static
 *      `name` property so that it can be loaded later.
 * @throws {Error} if store is invalid
 * @throws {Error} if store is already registered
 */
Dispatcher.prototype.registerStore = function registerStore(store) {
    if ('function' !== typeof store) {
        throw new Error('registerStore requires a constructor as first parameter');
    }
    var storeName = this.getStoreName(store);
    if (!storeName) {
        throw new Error('Store is required to have a `storeName` property.');
    }
    if (this.stores[storeName]) {
        if (this.stores[storeName] === store) {
            // Store is already registered, nothing to do
            return;
        }
        throw new Error('Store with name `' + storeName + '` has already been registered.');
    }
    this.stores[storeName] = store;
    if (store.handlers) {
        Object.keys(store.handlers).forEach(function storeHandlersEach(action) {
            var handler = store.handlers[action];
            this._registerHandler(action, storeName, handler);
        }, this);
    }
};

/**
 * Method to discover if a storeName has been registered
 * @method isRegistered
 * @static
 * @param {Object|String} store The store to check
 * @returns {boolean}
 */
Dispatcher.prototype.isRegistered = function isRegistered(store) {
    var storeName = this.getStoreName(store),
        storeInstance = this.stores[storeName];

    if (!storeInstance) {
        return false;
    }

    if ('function' === typeof store) {
        if (store !== storeInstance) {
            return false;
        }
    }
    return true;
};

/**
 * Gets a name from a store
 * @method getStoreName
 * @static
 * @param {String|Object} store The store name or class from which to extract
 *      the name
 * @returns {String}
 */
Dispatcher.prototype.getStoreName = function getStoreName(store) {
    if ('string' === typeof store) {
        return store;
    }
    if (store.storeName) {
        return store.storeName;
    }

    if (process.env.NODE_ENV !== 'production') {
        if (store.name && !this.hasWarnedAboutNameProperty) {
            console.warn('A store has been registered that relies on the ' +
                'constructor\'s name property. This name may change when you ' +
                'minify your stores during build time and could break string ' +
                'references to your store. It is advised that you add a ' +
                'static `storeName` property to your store to ensure the ' +
                'store name does not change during your build.');
            this.hasWarnedAboutNameProperty = true;
        }
    }
    return store.name;
};

/**
 * Adds a handler function to be called for the given action
 * @method registerHandler
 * @private
 * @static
 * @param {String} action Name of the action
 * @param {String} name Name of the store that handles the action
 * @param {String|Function} handler The function or name of the method that handles the action
 * @returns {number}
 */
Dispatcher.prototype._registerHandler = function registerHandler(action, name, handler) {
    this.handlers[action] = this.handlers[action] || [];
    this.handlers[action].push({
        name: this.getStoreName(name),
        handler: handler
    });
    return this.handlers.length - 1;
};

module.exports = {
    createDispatcher: function (options) {
        return new Dispatcher(options);
    }
};

}).call(this,require('_process'))
},{"./Action":11,"./DispatcherContext":13,"_process":9}],13:[function(require,module,exports){
/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var Action = require('./Action');
var DEFAULT = 'default';
var debug = require('debug')('Dispatchr:DispatcherContext');

/**
 * @class Dispatcher
 * @param {Object} context The context to be used for store instances
 * @constructor
 */
function DispatcherContext (dispatcher, context) {
    this.dispatcher = dispatcher;
    this.storeInstances = {};
    this.currentAction = null;
    this.dispatcherInterface = {
        getContext: function getContext() { return context; },
        getStore: this.getStore.bind(this),
        waitFor: this.waitFor.bind(this)
    };
}

/**
 * Returns a single store instance and creates one if it doesn't already exist
 * @method getStore
 * @param {String} name The name of the instance
 * @returns {Object} The store instance
 * @throws {Error} if store is not registered
 */
DispatcherContext.prototype.getStore = function getStore(name) {
    var storeName = this.dispatcher.getStoreName(name);
    if (!this.storeInstances[storeName]) {
        var Store = this.dispatcher.stores[storeName];
        if (!Store) {
            throw new Error('Store ' + storeName + ' was not registered.');
        }
        this.storeInstances[storeName] = new (this.dispatcher.stores[storeName])(this.dispatcherInterface);
    }
    return this.storeInstances[storeName];
};

/**
 * Dispatches a new action or queues it up if one is already in progress
 * @method dispatch
 * @param {String} actionName Name of the action to be dispatched
 * @param {Object} payload Parameters to describe the action
 * @throws {Error} if store has handler registered that does not exist
 */
DispatcherContext.prototype.dispatch = function dispatch(actionName, payload) {
    if (!actionName) {
        throw new Error('actionName parameter `' + actionName + '` is invalid.');
    }
    if (this.currentAction) {
        throw new Error('Cannot call dispatch while another dispatch is executing. Attempted to execute \'' + actionName + '\' but \'' + this.currentAction.name + '\' is already executing.');
    }
    var actionHandlers = this.dispatcher.handlers[actionName] || [],
        defaultHandlers = this.dispatcher.handlers[DEFAULT] || [];
    if (!actionHandlers.length && !defaultHandlers.length) {
        debug(actionName + ' does not have any registered handlers');
        return;
    }
    debug('dispatching ' + actionName, payload);
    this.currentAction = new Action(actionName, payload);
    var self = this,
        allHandlers = actionHandlers.concat(defaultHandlers),
        handlerFns = {};

    try {
        allHandlers.forEach(function actionHandlersEach(store) {
            if (handlerFns[store.name]) {
                // Don't call the default if the store has an explicit action handler
                return;
            }
            var storeInstance = self.getStore(store.name);
            if ('function' === typeof store.handler) {
                handlerFns[store.name] = store.handler.bind(storeInstance);
            } else {
                if (!storeInstance[store.handler]) {
                    throw new Error(store.name + ' does not have a method called ' + store.handler);
                }
                handlerFns[store.name] = storeInstance[store.handler].bind(storeInstance);
            }
        });
        this.currentAction.execute(handlerFns);
    } catch (e) {
        throw e;
    } finally {
        debug('finished ' + actionName);
        this.currentAction = null;
    }
};

/**
 * Returns a raw data object representation of the current state of the
 * dispatcher and all store instances. If the store implements a shouldDehdyrate
 * function, then it will be called and only dehydrate if the method returns `true`
 * @method dehydrate
 * @returns {Object} dehydrated dispatcher data
 */
DispatcherContext.prototype.dehydrate = function dehydrate() {
    var self = this,
        stores = {};
    Object.keys(self.storeInstances).forEach(function storeInstancesEach(storeName) {
        var store = self.storeInstances[storeName];
        if (!store.dehydrate || (store.shouldDehydrate && !store.shouldDehydrate())) {
            return;
        }
        stores[storeName] = store.dehydrate();
    });
    return {
        stores: stores
    };
};

/**
 * Takes a raw data object and rehydrates the dispatcher and store instances
 * @method rehydrate
 * @param {Object} dispatcherState raw state typically retrieved from `dehydrate`
 *      method
 */
DispatcherContext.prototype.rehydrate = function rehydrate(dispatcherState) {
    var self = this;
    if (dispatcherState.stores) {
        Object.keys(dispatcherState.stores).forEach(function storeStateEach(storeName) {
            var state = dispatcherState.stores[storeName],
                store = self.getStore(storeName);
            if (store.rehydrate) {
                store.rehydrate(state);
            }
        });
    }
};

/**
 * Waits until all stores have finished handling an action and then calls
 * the callback
 * @method waitFor
 * @param {String|String[]} stores An array of stores as strings to wait for
 * @param {Function} callback Called after all stores have completed handling their actions
 * @throws {Error} if there is no action dispatching
 */
DispatcherContext.prototype.waitFor = function waitFor(stores, callback) {
    if (!this.currentAction) {
        throw new Error('waitFor called even though there is no action dispatching');
    }
    this.currentAction.waitFor(stores, callback);
};

module.exports = DispatcherContext;

},{"./Action":11,"debug":14}],14:[function(require,module,exports){

/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = require('./debug');
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome
               && 'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : localstorage();

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // is webkit? http://stackoverflow.com/a/16459606/376773
  return ('WebkitAppearance' in document.documentElement.style) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (window.console && (console.firebug || (console.exception && console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31);
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  return JSON.stringify(v);
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs() {
  var args = arguments;
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return args;

  var c = 'color: ' + this.color;
  args = [args[0], c, 'color: inherit'].concat(Array.prototype.slice.call(args, 1));

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
  return args;
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = exports.storage.debug;
  } catch(e) {}
  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage(){
  try {
    return window.localStorage;
  } catch (e) {}
}

},{"./debug":15}],15:[function(require,module,exports){

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = debug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = require('ms');

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lowercased letter, i.e. "n".
 */

exports.formatters = {};

/**
 * Previously assigned color.
 */

var prevColor = 0;

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 *
 * @return {Number}
 * @api private
 */

function selectColor() {
  return exports.colors[prevColor++ % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function debug(namespace) {

  // define the `disabled` version
  function disabled() {
  }
  disabled.enabled = false;

  // define the `enabled` version
  function enabled() {

    var self = enabled;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // add the `color` if not set
    if (null == self.useColors) self.useColors = exports.useColors();
    if (null == self.color && self.useColors) self.color = selectColor();

    var args = Array.prototype.slice.call(arguments);

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %o
      args = ['%o'].concat(args);
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    if ('function' === typeof exports.formatArgs) {
      args = exports.formatArgs.apply(self, args);
    }
    var logFn = enabled.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }
  enabled.enabled = true;

  var fn = exports.enabled(namespace) ? enabled : disabled;

  fn.namespace = namespace;

  return fn;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  var split = (namespaces || '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

},{"ms":16}],16:[function(require,module,exports){
/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} options
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options){
  options = options || {};
  if ('string' == typeof val) return parse(val);
  return options.long
    ? long(val)
    : short(val);
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = '' + str;
  if (str.length > 10000) return;
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str);
  if (!match) return;
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function short(ms) {
  if (ms >= d) return Math.round(ms / d) + 'd';
  if (ms >= h) return Math.round(ms / h) + 'h';
  if (ms >= m) return Math.round(ms / m) + 'm';
  if (ms >= s) return Math.round(ms / s) + 's';
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function long(ms) {
  return plural(ms, d, 'day')
    || plural(ms, h, 'hour')
    || plural(ms, m, 'minute')
    || plural(ms, s, 'second')
    || ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) return;
  if (ms < n * 1.5) return Math.floor(ms / n) + ' ' + name;
  return Math.ceil(ms / n) + ' ' + name + 's';
}

},{}],17:[function(require,module,exports){
(function (global){
'use strict';

var _baobab = require('baobab');

var _baobab2 = _interopRequireDefault(_baobab);

var _dispatchr = require('dispatchr');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// When requiring Angular it is added to global for some reason
var angular = global.angular || require('angular') && global.angular;

// Dependencies

var angularModule = angular.module;
var registeredStores = [];
var autoInjectStores = false;

// A function that creates stores
function createStore(name) {
  var spec = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
  var immutableDefaults = arguments[2];
  var flux = arguments[3];

  // Constructor of a yahoo dispatchr store
  var Store = function Store(dispatcher) {
    this.dispatcher = dispatcher;

    // Check if store exists when waiting for it
    this.waitFor = function (stores, cb) {
      stores = Array.isArray(stores) ? stores : [stores];
      if (!flux.areStoresRegistered(stores)) {
        throw new Error('Waiting for stores that are not injected into Angular yet, ' + stores.join(', ') + '. Be sure to inject stores before waiting for them');
      }
      this.dispatcher.waitFor(stores, cb.bind(this));
    };

    if (!this.initialize) {
      throw new Error('Store ' + name + ' does not have an initialize method which is is necessary to set the initial state');
    }

    this.initialize();
  };

  // Add constructor properties, as required by Yahoo Dispatchr
  Store.handlers = spec.handlers;
  Store.storeName = name;

  // Instantiates immutable state and saves it to private variable that can be used for setting listeners
  Store.prototype.immutable = function (initialState) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    if (this.__tree) {
      this.__tree.set(initialState);
    } else {
      this.__tree = new _baobab2.default(initialState, angular.extend({}, immutableDefaults, options));
    }
    return this.__tree;
  };

  Store.prototype.monkey = _baobab2.default.monkey;

  // Attach store definition to the prototype
  Object.keys(spec).forEach(function (key) {
    Store.prototype[key] = spec[key];
  });

  return Store;
}

// Flux Service is a wrapper for the Yahoo Dispatchr
var FluxService = function FluxService(immutableDefaults) {
  this.stores = [];
  this.dispatcherInstance = (0, _dispatchr.createDispatcher)();
  this.dispatcher = this.dispatcherInstance.createContext();

  this.dispatch = function () {
    if (registeredStores.length) {
      console.warn('There are still stores not injected: ' + registeredStores.join(',') + '. Make sure to manually inject all stores before running any dispatches or set autoInjectStores to true.'); // eslint-disable-line no-console
    }
    this.dispatcher.dispatch.apply(this.dispatcher, arguments);
  };

  this.createStore = function (name, spec) {
    var store = createStore(name, spec, immutableDefaults, this);
    var storeInstance = undefined;

    // Create the exports object
    store.exports = {};

    this.dispatcherInstance.registerStore(store);
    this.stores.push(store);

    // Add cloning to exports

    if (!spec.exports) {
      throw new Error('You have to add an exports object to your store: ' + name);
    }

    storeInstance = this.dispatcher.getStore(store);
    Object.keys(spec.exports).forEach(function (key) {
      // Create a getter
      var descriptor = Object.getOwnPropertyDescriptor(spec.exports, key);
      if (descriptor.get) {
        Object.defineProperty(store.exports, key, {
          enumerable: descriptor.enumerable,
          configurable: descriptor.configurable,
          get: function get() {
            return descriptor.get.apply(storeInstance);
          }
        });
      } else {
        store.exports[key] = function () {
          return spec.exports[key].apply(storeInstance, arguments);
        };
        spec.exports[key] = spec.exports[key].bind(storeInstance);
      }
    });

    return store.exports;
  };

  this.getStore = function (storeExport) {
    var store = this.stores.filter(function (s) {
      return s.exports === storeExport;
    })[0];
    return this.dispatcher.getStore(store);
  };

  this.areStoresRegistered = function (stores) {
    var storeNames = this.stores.map(function (store) {
      return store.storeName;
    });
    return stores.every(function (storeName) {
      return storeNames.indexOf(storeName) > -1;
    });
  };

  this.reset = function () {
    this.dispatcherInstance.stores = {};
    this.dispatcherInstance.handlers = {};
    this.stores = [];
    registeredStores = [];
  };

  // Expose Baobab in case user wants access to it for use outside a store
  this.Baobab = _baobab2.default;
};

// Wrap "angular.module" to attach store method to module instance
angular.module = function () {
  // Call the module as normaly and grab the instance
  var moduleInstance = angularModule.apply(angular, arguments);

  // Attach store method to instance
  moduleInstance.store = function (storeName, storeDefinition) {

    // Add to stores array
    registeredStores.push(storeName);

    // Create a new store
    this.factory(storeName, ['$injector', 'flux', function ($injector, flux) {
      var storeConfig = $injector.invoke(storeDefinition);
      registeredStores.splice(registeredStores.indexOf(storeName), 1);
      return flux.createStore(storeName, storeConfig);
    }]);

    return this;
  };

  return moduleInstance;
};

angular.module('flux', []).provider('flux', function FluxProvider() {
  var immutableDefaults = {};

  // Defaults that are passed on to Baobab: https://github.com/Yomguithereal/baobab#options
  this.setImmutableDefaults = function (defaults) {
    immutableDefaults = defaults;
  };

  this.autoInjectStores = function (val) {
    autoInjectStores = val;
  };

  this.$get = [function fluxFactory() {
    return new FluxService(immutableDefaults);
  }];
}).run(['$rootScope', '$injector', 'flux', function ($rootScope, $injector, flux) {
  if (angular.mock) {
    flux.reset();
  }

  if (!angular.mock && autoInjectStores) {
    $injector.invoke(registeredStores.concat(angular.noop));
  }

  // Extend scopes with $listenTo
  $rootScope.constructor.prototype.$listenTo = function (storeExport, mapping, callback) {
    var cursor = undefined;
    var store = flux.getStore(storeExport);

    if (!store.__tree) {
      throw new Error('Store ' + storeExport.storeName + ' has not defined state with this.immutable() which is required in order to use $listenTo');
    }

    if (!callback) {
      callback = mapping;
      cursor = store.__tree;
    } else {
      cursor = store.__tree.select(mapping);
    }

    cursor.on('update', callback);

    // Call the callback so that state gets the initial sync with the view-model variables
    callback({});

    // Remove the listeners on the store when scope is destroyed (GC)
    this.$on('$destroy', function () {
      return cursor.off('update', callback);
    });
  };
}]);

module.exports = 'flux';

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"angular":"angular","baobab":1,"dispatchr":10}]},{},[17]);
