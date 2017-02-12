var kimeAdmin = angular.module('kimeAdmin', ['ng-admin']);
/* quick fix ng-adming
replace http://[baseApiUrl]/cars?_filters={"ownerId":123}
by http://[baseApiUrl]/users/123/cars
loopback apis does not filter correctly
*/
kimeAdmin.config(['$httpProvider', function($httpProvider) {
  $httpProvider.interceptors.push(function() {
      return {
          request: function(config) {
              // test for /cars?_filters={ownerId:XXX}
              if (/\/cars$/.test(config.url) && config.params._filters && config.params._filters.ownerId) {
                  config.url = config.url.replace('cars', 'owners/' + config.params._filters.ownerId + '/cars');
                  delete config.params._filters.ownerId;
              }
              return config;
          },
      };
  });
}]);

kimeAdmin.config(['NgAdminConfigurationProvider', function (nga) {
    var admin = nga.application('Kime Admin')
    .baseApiUrl('http://localhost:3005/api/');
    /* Users management */
    var owners = nga.entity('owners');
    owners.listView().fields([
        nga.field('id'),
        nga.field('username'),
        nga.field('createdAt', 'date').format('dd/MM/yyyy HH:mm')
    ]);
  /* Show view of all user's cars */
    owners.showView().fields([
        nga.field('username'),
        nga.field('cars', 'referenced_list')
            .targetEntity(nga.entity('cars'))
            .targetReferenceField('ownerId')
            .targetFields([
                nga.field('id'),
                nga.field('name'),
                nga.field('motor_type')
            ])
            .sortField('name')
            .sortDir('DESC'),
    ]);

    admin.addEntity(owners);


    /* Cars management */
    var cars = nga.entity('cars');
    cars.listView().fields([
      nga.field('name'),
      nga.field('motor_type'),
      nga.field('start_mileage'),
      nga.field('ownerId', 'reference')
        .targetEntity(owners)
        .targetField(nga.field('username'))
        .label('Owner')
    ]);
    admin.addEntity(cars);

    /* Oil actions management */
    var oil_actions = nga.entity('oil_actions');
    oil_actions.listView().fields([
      nga.field('date', 'date').format('dd/MM/yyyy HH:mm'),
      nga.field('total'),
      nga.field('old_mileage'),
      nga.field('new_mileage'),
      nga.field('volume'),
      nga.field('price_litre'),
      nga.field('consumption'),
      nga.field('partial'),
      nga.field('car_oilId', 'reference')
        .targetEntity(cars)
        .targetField(nga.field('name'))
        .label('Car')
    ]);
    admin.addEntity(oil_actions);

    admin.menu(nga.menu()
      .addChild(nga.menu(owners).icon('<i class="fa fa-users"></i>'))
      .addChild(nga.menu(cars).icon('<i class="fa fa-car"></i>'))
      .addChild(nga.menu(oil_actions).icon('<i class="fa fa-tachometer"></i>'))
    );

    /* Dashboard */
    /*admin.dashboard(nga.dashboard()
      .addCollection(nga.collection(admin.getEntity(owners))
        .name('recent_users')
        .title('Recent users')
        .perPage(5) // limit the panel to the 5 latest posts
        .fields([
            nga.field('createdAt', 'date').label('Subscription').format('dd/MM/yyyy HH:mm'),
            nga.field('username').isDetailLink(true).map(truncate)
        ])
        .sortField('createdAt')
        .sortDir('DESC')
        .order(1)
      )
    );*/
    nga.configure(admin);
}]);
