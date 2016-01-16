[![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/christianalfoni/flux-angular?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

# flux-angular
**flux-angular** makes it easy to implement a performant, scalable, and clean
[flux application architecture](https://facebook.github.io/flux/docs/overview.html) in an angular
application.  It does this by providing access to a new `angular.store` method
for holding immutable application state using [Baobab](https://github.com/Yomguithereal/baobab).
The `flux` service is exposed for dispatching actions using the [Yahoo Dispatchr](https://github.com/yahoo/dispatchr).
`$scope.$listenTo` is exposed as a way to respond to changes in a store and sync them with the view-model.

- [Releases](https://github.com/christianalfoni/flux-angular/releases)
- [Create a store](#create-a-store)
- [Dispatch actions](#dispatch-actions)
- [Wait for other stores to complete their handlers](#wait-for-other-stores-to-complete-their-handlers)
- [Testing stores](#testing-stores)
- [Performance](#performance)
- [FAQ](#faq)
- [Run project](#run-project)


## Create a store

By default the state in a store is immutable which means it cannot be changed
once created, except through a defined API. If you're unfamiliar with the
benefits of immutable data [this
article](http://jlongster.com/Using-Immutable-Data-Structures-in-JavaScript)
and [this video](https://www.youtube.com/watch?v=I7IdS-PbEgI) explain the theory and benefits.

Some of the pros:
* Faster reads because there is no deep cloning
* Less renders and `$scope.$watch` triggers because the reference to the object doesn't change unless the object changes
* Computed data (by using `this.monkey` in a store) can be observed in the same way
  as raw data.  This allows for more logic to live in the store (e.g. a
  sorted version of a list) and for angular to only re-render when the raw data
  underlying the computed data changes. See the [full
  docs](https://github.com/Yomguithereal/baobab#computed-data-or-monkey-business).
* Changes are batched together so that multiple dispatches only trigger one
  re-render is needed. This can be disabled by setting the `asynchronous`
  option to false.

Some of the cons:
* Need to use a slightly [more verbose API](https://github.com/Yomguithereal/baobab#updates) for changing state.
* Slightly slower writes
* `ng-repeat` with immutable objects need to use the `track by` option.
  Otherwise angular will fail, complaining it can't add the `$$hashKey`
  variable to the collection items.
* If your directive/controller does need to modify the immutable object (e.g.
  for use with `ng-model`) you must use something like the
  [angular.copy](https://docs.angularjs.org/api/ng/function/angular.copy)
  function when pulling it out of the store.  However, note that this has a
  performance impact. Also note that primitives are always copied so they don't
  need to be cloned.

Conclusion:
**It is faster, but a bit more verbose!**

### Configuration
Options that can be specified for the Baobab immutable store are [described
here](https://github.com/Yomguithereal/baobab#options).
For example, you may want to turn off immutability in production for a slight speed
increase, which you can do by setting the defaults:
```javascript
angular.module('app', ['flux'])
.config(function (fluxProvider) {
  fluxProvider.setImmutableDefaults({ immutable: false });
});
```

### Create a store
```javascript
angular.module('app', ['flux'])
.store('MyStore', function () {
  return {
    initialize: function () {
      this.state = this.immutable({
        comments: []
      });
    },
    handlers: {
      'addComment': 'addComment'
    },
    addComment: function (comment) {
      this.state.push('comments', comment);
    },
    exports: {
      getLatestComment: function () {
        var comments = this.state.get('comments');
        return comments[comments.length - 1];
      },
      get comments() {
        return this.state.get('comments');
      }
    }
  };
});
```

See the [Baobab docs](https://github.com/Yomguithereal/baobab#updates) for
documentation on how to retrieve and update the immutable state.

### Two way databinding
```javascript
angular.module('app', ['flux'])
.store('MyStore', function () {
  return {
    initialize: function () {
      this.state = this.immutable({
        person: {
          name: 'Jane',
          age: 30,
          likes: 'awesome stuff'
        }
      });
    },
    handlers: {
      'savePerson': 'savePerson'
    },
    savePerson: function (payload) {
      this.state.merge('person', payload.person);
    },
    saveName: function (payload) {
      this.state.set(['person', 'name'], payload.name);
    },
    exports: {
      get person() {
        return this.state.get('person');
      }
    }
  };
})
.directive ('myComponent', function () {
  return {
    controllerAs: 'myComponent',
    scope: {},
    templateUrl: 'myComponent.html',
    controller: function ($scope, MyStore, flux) {
      $scope.savePerson = function () {
        flux.dispatch('savePerson', { person: $scope.person });
      };
      $scope.$listenTo(MyStore, setStoreVars);
      $scope.$listenTo(MyStore, ['person', 'name'], setName);

      function setStoreVars() {
        $scope.person = MyStore.person;
      }

      function setName() {
        $scope.name = MyStore.person.name;
      }
    }
  };
});
```
By using the `.$listenTo()` method we set up a callback that will be fired
whenever any state in the store changes.
Also demonstrated via the `setName` example is that you can trigger an update
only when a specific node of the tree is changed.  This gives you more control
over how controllers and directives react to changes in the store.
Thus, when we dispatch the updated values and merge them into the immutable
object the callback is triggered and our scope properties can be synced with
the store.

## Dispatch actions
It can be helpful to create a service for dispatching actions related to a
store since different components may want to trigger the same action.
Additionally, the action methods are the place where the coordination of
multiple dispatch calls occur, as shown in the `addComment` method below.

```javascript
angular.module('app', ['flux'])
// When you develop a larger application, especially with lots of async
// operations it can be a good idea to define your actions as constants. That way
// it is less likely that a typo becomes confusing.
.constant('actions', {
  COMMENT_ADD: 'COMMENT_ADD',
  COMMENT_ADD_SUCCESS: 'COMMENT_ADD_SUCCESS',
  COMMENT_ADD_ERROR: 'COMMENT_ADD_ERROR'
})
.factory('commentActions', function ($http, flux, actions) {
  var service = {
    setTitle: setTitle,
    addComment: addComment
  };
  return service;

  // An exaple of a basic dispatch using a string as an action key and a payload.
  // One or more stores is expected to have a handler for COMMENT_SET_TITLE
  function setTitle(title) {
    flux.dispatch('COMMENT_SET_TITLE', { title: title });
  }

  // It is not recommended to run async operations in your store handlers. The
  // reason is that you would have a harder time testing and the **waitFor**
  // method also requires the handlers to be synchronous. You solve this by having
  // async services, also called **action creators** or **API adapters**.
  function addComment(comment) {
    flux.dispatch(actions.COMMENT_ADD, { comment: comment });
    $http.post('/comments', comment)
    .then(function () {
      flux.dispatch(actions.COMMENT_ADD_SUCCESS, { comment: comment });
    })
    .catch(function (error) {
      flux.dispatch(actions.COMMENT_ADD_ERROR, { comment: comment, error: error });
    });
  }
});
```

## Wait for other stores to complete their handlers
The **waitFor** method allows you to let other stores handle the action before
the current store acts upon it. You can also pass an array of stores. It was
decided to run this method straight off the store, as it gives more sense and
now the callback is bound to the store itself.

```javascript
angular.module('app', ['flux'])
.store('CommentsStore', function () {
  return {
    initialize: function() {
      this.state = this.immutable({ comments: [] });
    },
    handlers: {
      'addComment': 'addComment'
    },
    addComment: function (comment) {
      this.waitFor('NotificationStore', function () {
        this.state.push('comments', comment);
      });
    },
    getComments: function () {
      return this.state.get('comments');
    }
  };
})
.store('NotificationStore', function () {
  return {
    initialize: function() {
      this.state = this.immutable({ notifications: [] });
    },
    handlers: {
      'addComment': 'addNotification'
    },
    addNotification: function (comment) {
      this.state.push('notifications', 'Something happened');
    },
    exports: {
      getNotifications: function () {
        return this.state.get('notifications');
      }
    }
  };
});
```

### Testing stores
When Angular Mock is loaded flux-angular will reset stores automatically.

```javascript
describe('adding items', function () {
  beforeEach(module('app'));

  it('it should add strings dispatched to addItem', inject(function (MyStore, flux) {
    flux.dispatch('addItem', 'foo')
    expect(MyStore.getItems()).toEqual(['foo']);
  }));

  it('it should add number dispatched to addItem', inject(function (MyStore, flux) {
    flux.dispatch('addItem', 1)
    expect(MyStore.getItems()).toEqual([1]);
  }));
});
```

If you are doing integration tests using protractor you will want to disable
asynchronous event dispatching in Baobab since it relies on `setTimeout`, which
protractor can't detect:

```javascript
browser.addMockModule('protractorFixes', function() {
  angular.module('protractorFixes', [])
  .config(function (fluxProvider) {
    fluxProvider.setImmutableDefaults({ asynchronous: false });
  });
});
```

### Performance
Any $scopes listening to stores are removed when the $scope is destroyed.
Immutability (which uses `Object.freeze`) can be [disabled in production](#configuration).

## FAQ

#### PhantomJS gives me an error related to bind
PhantomJS does not support ES5 `Function.prototype.bind`, but will in next
version. Until then be sure to load the [ES5
shim](https://github.com/es-shims/es5-shim) with your tests.

#### Cannot call dispatch while another dispatch is executing
This is a problem/feature that is generic to the flux architecture. It can be
solved by having an action [dispatch multiple
events](https://github.com/christianalfoni/flux-angular/issues/48).

#### Did you really monkeypatch Angular?
Yes. Angular has a beautiful API (except directives ;-) ) and I did not want
flux-angular to feel like an alien syntax invasion, but rather it being a
natural part of the Angular habitat. Angular 1.x is a stable codebase and I
would be very surprised if this monkeypatch would be affected in later
versions.

### Run project
1. `npm install`
2. `bower install`
3. `npm test` and open browser at `http://localhost:9876/`

License
-------

flux-angular is licensed under the [MIT license](LICENSE).

> The MIT License (MIT)
>
> Copyright (c) 2014 Christian Alfoni
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
> THE SOFTWARE.
