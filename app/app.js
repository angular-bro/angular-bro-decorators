import angular from 'angular';
import routerModule from 'app/router';
import decoratorsModule from 'app/decorators';

const app = angular.module('app', [
    decoratorsModule.name,
    routerModule.name,
]);

angular.element(document).ready(() => {
    angular.bootstrap(document, [ app.name ], { strictDi: true });
});

export default app;
