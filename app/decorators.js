import angular from 'angular';

let decoratorsModule = angular.module('angularBroDecorators', []);

export default decoratorsModule;

let $injector;

decoratorsModule.run(['$injector', (_$injector_) => {
    $injector = _$injector_;
}]);

/**
 * @example
 *  import {inject} from './decorators';
 *
 *  @inject('$scope', '$http')
 *  class MyController {
 *    constructor($scope, $http) {
 *      this.$scope = $scope;
 *      this.$http = $http;
 *    }
 *  }
 *
 *  class MyOtherController {
 *    @inject $http = null;
 *    @inject MyService = null;
 *    doSomething () {
 *      this.MyService.doServiceTask();
 *    }
 *  }
 */
export function inject (...components) {
    if (typeof components[0] === 'object') {
        let key = components[1];

        return {
            get: () => {
                try {
                    return $injector.get(key);
                } catch (err) {
                    throw new Error(`${key} cannot be injected as a property. Inject it in the controller.`);
                }
            }
        };
    } else {
        return function decorate (target/*, key, property*/) {
            target.$inject = components;
        };
    }
}

/**
 * @example
 *  import {injectAs} from './decorators';
 *
 *  class MyController {
 *    @injectAs('MyService') service = null;
 *    constructor() {
 *      this.service.doSomething();
 *    }
 *  }
 */
export function injectAs (dep) {
    return function decorate (/*target, key, descriptor*/) {
        return {
            get: () => {
                try {
                    return $injector.get(dep);
                } catch (err) {
                    throw new Error(`${name} cannot be injected as a property. Inject it in the controller.`);
                }
            }
        };
    };
}

/**
 * @example
 *  import {directive, inject} from './decorators';
 *  import {baseUrl} from './constants';
 *
 *  @directive({
 *    priority: 42,
 *    templateUrl: `${baseUrl}/components/myComponent/myView.html`,
 *    restrict: 'E',
 *    require: '^parentDirective',
 *    // etc
 *  })
 *  @inject('$scope', '$element', '$attrs')
 *  class MyView {
 *    constructor($scope, $element, '$attrs') {
 *      $element.on('click', e => console.log('click'));
 *    }
 *
 *    // If you want to use link function :
 *    static link (scope, element, attrs) {
 *      element.on('click', e => console.log('click'));
 *    }
 *  }
 */
export function directive (opts) {
    return function decorate (Target) {
        let name = opts.name || getTargetName(Target);

        name = name.substring(0,1).toLowerCase() + name.substring(1);

        function factory (/*...deps*/) {
            let inject = Target.$inject || [];
            let directiveDefinitionObject = {
                priority: opts.priority,
                template: opts.template,
                templateUrl: opts.templateUrl,
                transclude: opts.transclude,
                restrict: opts.restrict,
                templateNamespace: opts.templateNamespace,
                scope: opts.scope,
                controller: [...inject, function controller (...deps) {
                    return new Target(...deps);
                }],
                controllerAs: opts.controllerAs || 'controller',
                bindToController: opts.bindToController || true,
                require: opts.require
            };

            if (Target.compile) {
                directiveDefinitionObject.compile = function compile (...args) {
                    return Target.compile(...args);
                };
            }

            if (Target.link) {
                directiveDefinitionObject.link = function link (...args) {
                    return Target.link(...args);
                };
            }

            return directiveDefinitionObject;
        }

        decoratorsModule.directive(name, factory);
    };
}

/**
 * @example
 *  import {register} from './decorators';
 *
 *  @register({
 *    type: 'controller'
 *  })
 *  export default class MyController {}
 */
export function register (opts) {
    return function decorate (target) {
        if(opts.inject) {
            target.$inject = opts.inject;
        }

        let name = opts.name || getTargetName(target);

        decoratorsModule[opts.type](name, target);
    };
}

/**
 * @example
 *  import {controller} from './decorators';
 *
 *  @controller
 *  export default class MyController {}
 */
export function controller (target) {
    return register({ type: 'controller' })(target);
}

/**
 * @example
 *  import {filter, inject} from './decorators';
 *
 *  @filter
 *  @inject('$http')
 *  export default class MyFilter {
 *    constructor($http) {
 *      return this.
 *    }
 *    filter (input) {
 *      return input.toUpperCase();
 *    }
 *  }
 */
export function filter (Target) {
    let name = getTargetName(Target),
        deps = Target.$inject || [];

    name = name.substring(0,1).toLowerCase() + name.substring(1);

    decoratorsModule.filter(name, [...deps, function (/*...deps*/) {
        let instance = new Target();

        return function (...args) {
            return instance.filter(...args);
        };
    }]);
}

/**
 * @example
 *  import {constant} from './decorators';
 *
 *  @constant
 *  export default class MyConstant {
 *    constructor(...deps) {
 *      return () => {};
 *    }
 *  }
 */
export function constant (Target) {
    const type = 'constant';
    let name = getTargetName(Target);

    name = name.substring(0,1).toLowerCase() + name.substring(1);

    return register({ type, name })(new Target());
}

/**
 * @example
 *  import {value} from './decorators';
 *
 *  @value
 *  export default class MyValue {
 *    constructor(...deps) {
 *      return () => {};
 *    }
 *  }
 */
export function value (Target) {
    return register({ type: 'value' })(new Target());
}

/**
 * @example
 *  import {factory} from './decorators';
 *
 *  @factory
 *  export default class MyFactory {}
 */
export function factory (target) {
    return register({ type: 'factory' })(target);
}

/**
 * @example
 *  import {service} from './decorators';
 *
 *  @service
 *  export default class MyService {}
 */
export function service (target) {
    return register({ type: 'service' })(target);
}

/**
 * @example
 *  import {provider} from './decorators';
 *
 *  @provider
 *  export default class Myprovider {}
 */
export function provider (target) {
    return register({ type: 'provider' })(target);
}

/**
 * Angular UI Router State Factory Decorator
 *
 * Same import rules apply as the directives and such above.
 *
 * @example
 *  // All the examples below are equivalent.
 *  import {state} from './decorators';
 *
 *  @state('index', {
 *    // default options
 *    url: '/index',
 *    templateUrl: 'index/template.html',
 *    constrollerAs: 'controller',
 *    // additional options...
 *  })
 *  export default class IndexController {}
 *
 *
 *  @state('index')
 *  export default class IndexController {}
 *
 *
 *  @state('index')()
 */
export function state (name, opts) {
    return function decorate (Target) {
        function factory ($stateProvider) {
            let stateDefinitionObject = Object.assign({
                url: `/${name}`,
                templateUrl: `${name}/template.html`,
                controllerAs: 'controller',
            }, opts);

            if (typeof Target === 'function') {
                let inject = Target.$inject || [];

                stateDefinitionObject.controller = [...inject, function (...deps) {
                    return new Target(...deps);
                }];
            }

            $stateProvider.state(name, stateDefinitionObject);
        }

        decoratorsModule.config(['$stateProvider', factory]);
    };
}

/**
 * @example
 *  import {config} from './decorators'
 *
 *  @config
 *  export default class MyConfig {}
 */
export function config (Target) {
    let deps = Target.$inject || [];

    decoratorsModule.config([...deps, function (...deps) {
        new Target(...deps);
    }]);
}

/**
 * @example
 *  import {run} from './decorators'
 *
 *  @run
 *  export default class MyRun {}
 */
export function run (Target) {
    let deps = Target.$inject || [];

    decoratorsModule.run([...deps, function (...deps) {
        new Target(...deps);
    }]);
}

/**
 * Polyfill for IE to return Target.name
 */
function getTargetName (o) {
    if (o.name) {
        return o.name;
    }

    // if IE
    return o.toString().match(/function\s?(.*)\s?\(/)[1];
}
