const templates = {
  'db/schema.cds': `namespace {{namespace}}.{{appId}};

entity Data {
  key ID : String(3);
  Name : String;
  Description : String;
  Status : String;
}
`,

  'srv/service.cds': `using {{namespace}}.{{appId}} as my from '../db/schema';

service MainService {
  @readonly entity Data as projection on my.Data;
}
`,

  'srv/service.js': `import cds from '@sap/cds';

export default class MainService extends cds.ApplicationService {
  async init() {
    this.on('READ', 'Data', this.#onReadData);
    return super.init();
  }

  async #onReadData(req, next) {
    return next();
  }
}
`,

  'test/data/{{namespace}}.{{appId}}-Data.csv': `ID;Name;Description;Status
001;Project Alpha;Initial setup;Active
002;Project Beta;Component development;Inactive
003;Project Gamma;Testing phase;Active
`,

  'test/restclient/requests.http': `### Get all data
GET http://localhost:4004/odata/v4/main/Data

### Get single entity
GET http://localhost:4004/odata/v4/main/Data('001')
`,

  'srv/i18n/messages.properties': `# Service Messages
# Add translatable texts here
`,

  'package.json': `{
  "name": "{{projectNameBase}}",
  "version": "1.0.0",
  "description": "{{applicationTitle}}",
  "repository": "<Add your repository here>",
  "license": "UNLICENSED",
  "private": true,
  "type": "module",
  "dependencies": {
    "@sap/cds": "^8.0.0",
    "express": "^4"
  },
  "devDependencies": {
    "@cap-js/sqlite": "^1",
    "@ui5/cli": "^3.0.0",
    "eslint": "^8.57.0",
    "eslint-plugin-ui5": "^0.1.0"
  },
  "scripts": {
    "start": "cds watch",
    "build": "npm run build:ui5",
    "build:ui5": "cd app && npm install && npm run build"
  }
}`
};

export default templates;
