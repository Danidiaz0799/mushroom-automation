# MushroomAutomation

Este proyecto fue generado con Angular CLI versión 16.0.2.

## Arquitectura del Proyecto

El sistema sigue una arquitectura modular escalable en Angular, basada en la separación de responsabilidades:

- **Core**: Contiene configuraciones globales, rutas y el componente principal de la aplicación.
- **Config**: Maneja configuraciones e interceptores para peticiones HTTP.
- **Features**: Agrupa módulos funcionales específicos (administración, autenticación, dashboard, información).
- **Shared**: Componentes reutilizables como layout, barra de navegación, barra lateral y spinner.
- **Services**: Contiene la lógica de negocio e integración con APIs.
- **Assets**: Archivos estáticos como imágenes, íconos y estilos globales.
- **Environments**: Configuraciones diferenciadas para desarrollo y producción.
- **Dist**: Contiene los archivos compilados de la aplicación, que deben ser desplegados en la Raspberry Pi junto al servidor.

## Desarrollo del Proyecto

El sistema opera en una arquitectura distribuida basada en MQTT, con dos Raspberry Pi interconectadas:

- **Raspberry Pi Servidor**: Aloja la aplicación Angular y el broker MQTT, administra la comunicación con la base de datos y expone los endpoints REST.
- **Raspberry Pi Cliente**: Conectada a sensores y actuadores, transmite datos y recibe comandos desde el servidor vía MQTT.

El backend gestiona el procesamiento de datos en tiempo real y la automatización del control del entorno del cultivo.

## Servidor de Desarrollo

Ejecute `ng serve` para iniciar un servidor de desarrollo y acceda a `http://localhost:4200/`.

## Construcción

Ejecute `ng build` para compilar el proyecto en la carpeta `dist/`. Los archivos dentro de `dist/` deben ser transferidos a la Raspberry Pi Servidor junto con el servidor backend.

## Endpoints

### Sensores:

- **GET `/api/Sht3xSensor`**: Datos de temperatura y humedad.
- **GET `/api/Gy302Sensor`**: Datos del sensor de luz.
- **GET `/api/SensorData`**: Datos en un rango de fechas.

### Eventos:

- **GET `/api/Event`**: Eventos registrados.
- **GET `/api/Event/FilterByTopic`**: Filtra eventos por tema.

### Actuadores:

- **POST `/api/Actuator/toggle_light`**: Control de luz.
- **POST `/api/Actuator/toggle_fan`**: Control de ventilador.
- **POST `/api/Actuator/toggle_humidifier`**: Control de humidificador.
- **POST `/api/Actuator/toggle_motor`**: Control de motor.

### Parámetros Ideales:

- **GET `/api/IdealParams/{param}`**: Obtiene parámetros ideales.
- **PUT `/api/IdealParams/{param}`**: Actualiza parámetros ideales.
