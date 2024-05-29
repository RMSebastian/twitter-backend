import swaggerUI from 'swagger-ui-express';
import swaggerDOC from 'swagger-jsdoc';

const definition = {
    openapi:'3.0.0',
    info:{
        title: 'Twitter Backend',
        version: '1.0.0'
    },
    server:{
        url: 'http://localhost:8080/api/swagger'
    }
}
const options = {
    definition,
    apis: ["./src/**/*.ts"],
}

const swaggerSpecs = swaggerDOC(options);

export function SetupSwagger(app: any): void{
    app.use('/', swaggerUI.serve, swaggerUI.setup(swaggerSpecs))
}