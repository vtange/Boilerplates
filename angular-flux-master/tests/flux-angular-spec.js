describe('FLUX-ANGULAR', function() {
  describe('.store', function() {
    let $scope, flux, cb, MyStore, MyStoreB;

    beforeEach(function() {
      angular.module('test', ['flux'])
        .config(function (fluxProvider) {
          fluxProvider.setImmutableDefaults({ asynchronous: false });
        })
        .store('MyStore', function() {
          return {
            initialize: function() {
              this.state = this.immutable({
                items: [],
                name: 'test'
              });
            },
            handlers: {
              addItem: 'addItem',
              setName: 'setName'
            },
            addItem: function(payload) {
              this.state.push('items', payload.item);
            },
            setName: function(payload) {
              this.state.set('name', payload.name);
            },
            exports: {
              getItems: function() {
                return this.state.get('items');
              },
              getFirstItem: function() {
                return this.exports.getItems()[0];
              },
              get items() {
                return this.state.get('items');
              },
              get name() {
                return this.state.get('name');
              }
            }
          };
        })
        .store('MyStoreB', function() {
          return {
            initialize: function() {
              this.state = this.immutable({ items: [] });
            },
            handlers: {
              addItem: 'addItem',
              addItemWithBadWaitFor: 'addItemWithBadWaitFor'
            },
            addItem: function(payload) {
              this.waitFor('MyStore', function() {
                this.state.push('items', payload.item);
              });
            },
            addItemWithBadWaitFor: function(payload) {
              this.waitFor('NotAStore', function() {
                this.state.push('items', payload.item);
              });
            },
            exports: {
              getItems: function() {
                return this.state.get('items');
              }
            }
          };
        })
        .store('MyStoreC', function() {
          return {
            initialize: function() {
              this.state = this.immutable({ items: [] }, { asynchronous: true });
            },
            exports: {}
          };
        });

      module('test');
    });

    beforeEach(inject(function($rootScope, _MyStore_, _MyStoreB_, _flux_) {
      MyStore = _MyStore_;
      MyStoreB = _MyStoreB_;
      flux = _flux_;
      $scope = $rootScope.$new();
      cb = jasmine.createSpy('callback');
    }));

    describe('initializing state', function() {
      it('should not expose the private tree property', function() {
        expect(MyStore.__tree).toBeUndefined();
      });

      it('should not error if initialize is called again to reset the state', function() {
        flux.dispatch('addItem', { item: 'foo' });
        expect(MyStore.items.length).toEqual(1);
        flux.dispatcher.storeInstances.MyStore.initialize();
        expect(MyStore.items.length).toEqual(0);
      });

      it('should not lose any event bindings if it is initialized again', function() {
        $scope.$listenTo(MyStore, cb);
        flux.dispatcher.storeInstances.MyStore.initialize();
        flux.dispatch('addItem', { item: 'foo' });
        expect(cb.calls.count()).toEqual(3); // once for initialization, once for state reset, and once for addItem
      });
    });

    describe('accessors', function() {
      it('should expose immutable data', function() {
        expect(Object.isFrozen(MyStore.items)).toBe(true);
      });

      it('should allow both getter and function accessors', function() {
        expect(MyStore.items.length).toEqual(0);
        expect(MyStore.getItems().length).toEqual(0);
      });

      it('should export identical object identities even when accessors are different', function() {
        expect(MyStore.getItems()).toBe(MyStore.items);
      });

      it('should bind export methods to the store instance', function() {
        flux.dispatch('addItem', { item: 'foo' });
        expect(MyStore.getFirstItem()).toEqual('foo');
      });
    });

    describe('handlers', function() {
      it('should call the correct handler with the payload', function() {
        flux.dispatch('addItem', { item: 'foo' });
        expect(MyStore.items.length).toEqual(1);
        expect(MyStore.items[0]).toEqual('foo');
      });
    });

    describe('event listeners', function() {
      it('should have a $listenTo method', function() {
        expect($scope.$listenTo).toBeDefined();
      });

      it('should call the callback when $listenTo is first attached so that the view-model is initialized', function() {
        $scope.$listenTo(MyStore, cb);
        expect(cb.calls.count()).toEqual(1);
        expect(cb.calls.argsFor(0)[0]).toEqual({});
      });

      it('should call the callback when state is changed on any part of the tree', function() {
        $scope.$listenTo(MyStore, cb);
        cb.calls.reset();
        flux.dispatch('addItem', { item: 'foo' });
        expect(cb.calls.count()).toEqual(1);
        flux.dispatch('setName', { name: 'bar' });
        expect(cb.calls.count()).toEqual(2);
      });

      it('should call the callback if a specific cursor is listened to and changed', function() {
        $scope.$listenTo(MyStore, ['items'], cb);
        cb.calls.reset();
        flux.dispatch('addItem', { item: 'foo' });
        expect(cb.calls.count()).toEqual(1);
        flux.dispatch('setName', { name: 'bar' });
        expect(cb.calls.count()).toEqual(1);
      });

      it('should remove the listener when the scope is destroyed', function() {
        $scope.$listenTo(MyStore, ['items'], cb);
        cb.calls.reset();
        $scope.$destroy();
        flux.dispatch('addItem', { item: 'foo' });
        expect(cb.calls.count()).toEqual(0);
      });
    });

    describe('waiting for other stores', function() {
      it('should wait for other store defined to finish first', function() {
        $scope.$listenTo(MyStoreB, function() {
          cb('MyStoreB');
        });
        $scope.$listenTo(MyStore, function() {
          cb('MyStore');
        });
        cb.calls.reset();
        flux.dispatch('addItem', { item: 'test' });
        expect(cb.calls.argsFor(0)[0]).toEqual('MyStore');
        expect(cb.calls.argsFor(1)[0]).toEqual('MyStoreB');
      });

      it('should throw an error when store waited for is not injected', function() {
        expect(flux.dispatch.bind(flux, 'addItemWithBadWaitFor', 'foo')).toThrow();
      });
    });

    describe('options', function() {
      it('should allow local options to override immutable defaults', inject(function(MyStoreC) { // eslint-disable-line no-unused-vars
        expect(flux.dispatcher.storeInstances.MyStore.state.options.asynchronous).toBe(false);
        expect(flux.dispatcher.storeInstances.MyStoreC.state.options.asynchronous).toBe(true);
      }));
    });
  });
});
