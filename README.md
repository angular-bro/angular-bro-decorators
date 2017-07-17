# angular-bro-decoratore

This addon enables the use of angular with es7 decorators.
This will be made a standard inclusion in angular bro as soon as initial testing proves fruitful.
But, for now this can be added at your own risk with the instructions below.

## Adding this to other angular-bro projects

All you have to do is install this as a npm dependency.

```sh
npm install --save angular-bro-decorators
```

The angular-bro routine will automatically add and inject into your application.
To reference this in your application, just `import { decoratorType } from 'app/decorators';`


## Using decorators

There is a base decorator called `@register` which performs generic component registrations. In order to save work
you may use one of the following concrete implementations, which allow you to omit the type information

### Constants

```js
import { constant } from 'app/decorators';

@constant
export default class MyConstant {
  constructor () {
    return 'my-constant';
  }
}
```

### Values

```js
import { value } from 'app/decorators';

@value
export default class MyValue {
  constructor () {
    return 'my-value';
  }
}
```

### Factories

```js
import { factory } from 'app/decorators';

@factory
export default class MyFactory {
  constructor (/* dependancies */) { }
}
```

### Services

```js
import { service } from 'app/decorators';

@service
export default class MyService {
  constructor (/* dependancies */) { }
}
```

### Providers

```js
import { provider } from 'app/decorators';

@provider
export default class MyProvider {
  constructor (/* dependancies */) { }
}
```

### Controllers

```js
import { controller } from 'app/decorators';

@controller
export default class MyController {
  constructor (/* dependancies */) { }
}
```

### Directives

```js
import { directive } from 'app/decorators';

@directive({
  restrict: 'E',
  templateUrl: `${baseURL}/path/to/the/template.html`
})
export default class MyController {
  constructor (/* dependancies */) {
    this.foo = 'bar';
  }
}

// In template.html :
```

```html
<p>{{ ctrl.foo }} will display "bar"</p>
```

### Filters

```js
import { filter } from 'app/decorators';

@filter
export default class MyFilter {
  constructor (/* dependancies */) { }
  filter (input) {
    return input.toUpperCase();
  }
}
```

### Injections

In order to inject existing components/services into your new component you can leverage the following decorator as
depicted in the example below.

```js
import { inject } from 'app/decorators';

@controller
@inject('$http', 'MyService')
export default class MyController {
  constructor ($http, MyService) { }
}
```

### Injection as a property

Let's say you want to inject a component/service but use it with a different property name. In order to do so use the
`injectAs` decorator

```js
import { inject, injectAs } from 'app/decorators';

@controller
export default class MyController {
  @inject $http = null;
  @inject MyService = null;
  @injectAs('$q') Promise = null;

  doSomething () {
    return this.Promise((resolve, reject) {
      $http.get(this.MyService.path)
        .success(data => resolve(data))
        .error(err => reject(err));
    });
  }
}
```

## Credits

Special thanks goes to [Vildan Softic](https://github.com/zewa666) for the original project I forked this all from.
And a super special thanks goes to [Hadrien Lanneau](https://github.com/hadrienl) for his great contribution to the original project
