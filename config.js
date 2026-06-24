Protobject.setProduction(true);

Protobject.initialize([
  {
    name: "Pantalla",
    page: "fisicalizacion.html", // <-- Tiene que decir esto, NO index.html
    main: true,
    debug: "master",
  },
  {
    name: "Sensor",
    page: "sensor.html",
    debug: "local",
  }
]);