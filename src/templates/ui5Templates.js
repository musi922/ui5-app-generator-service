const templates = {
  'webapp/index.html': `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{applicationTitle}}</title>
    <script
      id="sap-ui-bootstrap"
      src="https://sapui5.hana.ondemand.com/resources/sap-ui-core.js"
      data-sap-ui-theme="{{theme}}"
      data-sap-ui-resourceroots='{ "{{namespace}}.{{appId}}": "./" }'
      data-sap-ui-oninit="module:sap/ui/core/ComponentSupport"
      data-sap-ui-compatVersion="edge"
      data-sap-ui-async="true"
      data-sap-ui-frameOptions="trusted"
    ></script>
  </head>
  <body class="sapUiBody">
    <div
      data-sap-ui-component
      data-name="{{namespace}}.{{appId}}"
      data-id="container"
      data-settings='{ "id": "{{appId}}" }'
    ></div>
  </body>
</html>`,

  'webapp/manifest.json': `{
  "_version": "1.65.0",
  "sap.app": {
    "id": "{{namespace}}.{{appId}}",
    "type": "application",
    "i18n": "i18n/i18n.properties",
    "title": "{{i18nTitle}}",
    "description": "{{i18nDescription}}",
    "applicationVersion": {
      "version": "1.0.0"
    }{{#enableOdata}},
    "dataSources": {
      "mainService": {
        "uri": "{{{odataServiceUrl}}}",
        "type": "OData",
        "settings": {
          "odataVersion": "4.0"
        }
      }
    }{{/enableOdata}}
  },
  "sap.ui": {
    "technology": "UI5",
    "icons": {
      "icon": "sap-icon://add"
    },
    "deviceTypes": {
      "desktop": true,
      "tablet": true,
      "phone": true
    }
  },
  "sap.ui5": {
    "flexEnabled": true,
    "dependencies": {
      "minUI5Version": "{{minUI5Version}}",
      "libs": {
        "sap.m": {},
        "sap.ui.core": {},
        "sap.f": {},
        "sap.ui.layout": {}
      }
    },
    "contentDensities": {
      "compact": true,
      "cozy": true
    },
    "models": {
      "i18n": {
        "type": "sap.ui.model.resource.ResourceModel",
        "settings": {
          "bundleName": "{{namespace}}.{{appId}}.i18n.i18n"
        }
      }{{#enableOdata}},
      "": {
        "dataSource": "mainService",
        "preload": true,
        "settings": {
          "synchronizationMode": "None",
          "operationMode": "Server",
          "autoExpandSelect": true,
          "earlyRequests": true
        }
      }{{/enableOdata}}
    },
    "routing": {
      "config": {
        "routerClass": "sap.m.routing.Router",
        "viewType": "XML",
        "viewPath": "{{namespace}}.{{appId}}.view",
        "controlId": "app",
        "controlAggregation": "pages",
        "async": true
      },
      "routes": [],
      "targets": {}
    },
    "rootView": {
      "viewName": "{{namespace}}.{{appId}}.view.Main",
      "type": "XML",
      "async": true,
      "id": "app"
    }
  }
}`,

  'webapp/Component.js': `sap.ui.define(
  ["sap/ui/core/UIComponent", "sap/ui/Device", "./model/models"],
  function (UIComponent, Device, models) {
    "use strict";

    return UIComponent.extend("{{namespace}}.{{appId}}.Component", {
      metadata: {
        manifest: "json",
      },

      init: function () {
        UIComponent.prototype.init.apply(this, arguments);

        this.setModel(models.createDeviceModel(), "device");

        this.getRouter().initialize();
      },

      getContentDensityClass: function () {
        if (!this._sContentDensityClass) {
          this._sContentDensityClass = Device.support.touch
            ? "sapUiSizeCozy"
            : "sapUiSizeCompact";
        }
        return this._sContentDensityClass;
      },
    });
  }
);`,

  'webapp/view/Main.view.xml': `<mvc:View
  controllerName="{{namespace}}.{{appId}}.controller.Main"
  xmlns:mvc="sap.ui.core.mvc"
  xmlns="sap.m"
  xmlns:f="sap.f"
  xmlns:layout="sap.ui.layout"
  displayBlock="true"
>
  <App id="app">
    <pages>
      <f:DynamicPage
        id="dynamicPageId"
        headerExpanded="true"
        toggleHeaderOnTitleClick="true"
      >
        <!-- DynamicPage Title -->
        <f:title>
          <f:DynamicPageTitle>
            <f:heading>
              <Title text="{i18n>mainViewTitle}" level="H2" />
            </f:heading>
          </f:DynamicPageTitle>
        </f:title>

        <!-- DynamicPage Header -->
        <f:header>
          <f:DynamicPageHeader pinnable="true">
            <layout:HorizontalLayout>
              <layout:VerticalLayout class="sapUiMediumMarginEnd">
                <Label text="Search" />
                <SearchField placeholder="Filter by Name..." search=".onSearch" width="250px" />
              </layout:VerticalLayout>
            </layout:HorizontalLayout>
          </f:DynamicPageHeader>
        </f:header>

        <!-- DynamicPage Content -->
        <f:content>
          <Table
            id="mainTable"
            inset="false"
            items="{/Data}"
            class="sapFDynamicPageAlignContent"
            width="auto"
          >
            <headerToolbar>
              <OverflowToolbar>
                <Title text="Items" level="H2" />
                <ToolbarSpacer />
                <Button icon="sap-icon://add" text="Add Output" press=".onAddPress" />
                <Button icon="sap-icon://sort" press=".onSortPress" />
              </OverflowToolbar>
            </headerToolbar>
            <columns>
              <Column>
                <Text text="ID" />
              </Column>
              <Column>
                <Text text="Name" />
              </Column>
              <Column>
                <Text text="Description" />
              </Column>
              <Column>
                <Text text="Status" />
              </Column>
            </columns>
            <items>
              <ColumnListItem>
                <cells>
                  <Text text="{ID}" />
                  <Text text="{Name}" />
                  <Text text="{Description}" />
                  <ObjectStatus text="{Status}" state="{= \${Status} === 'Active' ? 'Success' : 'Warning' }" />
                </cells>
              </ColumnListItem>
            </items>
          </Table>
        </f:content>
      </f:DynamicPage>
    </pages>
  </App>
</mvc:View>`,

  'webapp/controller/BaseController.js': `sap.ui.define(
    ["sap/ui/core/mvc/Controller", "sap/ui/core/routing/History"],
    function (Controller, History) {
      "use strict";

      return Controller.extend("{{namespace}}.{{appId}}.controller.BaseController", {
        getRouter: function () {
          return this.getOwnerComponent().getRouter();
        },

        getModel: function (sName) {
          return this.getView().getModel(sName) || this.getOwnerComponent().getModel(sName);
        },

        setModel: function (oModel, sName) {
          return this.getView().setModel(oModel, sName);
        },

        getResourceBundle: function () {
          return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        onNavBack: function () {
          const oHistory = History.getInstance();
          const sPreviousHash = oHistory.getPreviousHash();
          if (sPreviousHash !== undefined) {
            window.history.go(-1);
          }
        },
      });
    }
  ); `,

  'webapp/controller/Main.controller.js': `sap.ui.define(
    [
      "./BaseController",
      "sap/ui/model/json/JSONModel",
      "sap/ui/model/Filter",
      "sap/ui/model/FilterOperator",
      "sap/m/MessageToast"
    ],
    function (BaseController, JSONModel, Filter, FilterOperator, MessageToast) {
      "use strict";

      return BaseController.extend("{{namespace}}.{{appId}}.controller.Main", {
        onInit: function () {
        },

        onSearch: function (oEvent) {
          // Add search filter for table
          const aFilters = [];
          const sQuery = oEvent.getParameter("query");
          if (sQuery && sQuery.length > 0) {
            const filter = new Filter("Name", FilterOperator.Contains, sQuery);
            aFilters.push(filter);
          }

          // Update list binding
          const oTable = this.byId("mainTable");
          const oBinding = oTable.getBinding("items");
          oBinding.filter(aFilters, "Application");
        },

        onAddPress: function () {
          MessageToast.show("Add action triggered");
        },

        onSortPress: function () {
          MessageToast.show("Sort action triggered");
        }
      });
    }
  ); `,

  'webapp/model/models.js': `sap.ui.define(
    ["sap/ui/model/json/JSONModel", "sap/ui/Device"],
    function (JSONModel, Device) {
      "use strict";

      return {
        createDeviceModel: function () {
          const oModel = new JSONModel(Device);
          oModel.setDefaultBindingMode("OneWay");
          return oModel;
        },
      };
    }
  ); `,

  'webapp/i18n/i18n.properties': `# App Descriptor
appTitle = {{ applicationTitle }}
appDescription = An SAP UI5 Application

# Main View
mainViewTitle = {{ applicationTitle }}
welcomeTitle = Welcome
welcomeDescription = This is your SAP UI5 application.

# Common
okButtonText = OK
cancelButtonText = Cancel
saveButtonText = Save`,

  'ui5.yaml': `specVersion: "3.0"
metadata:
  name: {{ui5ProjectName}}
type: application
framework:
  name: OpenUI5
  version: "{{minUI5Version}}"
  libraries:
    - name: sap.m
    - name: sap.ui.core
    - name: sap.f
    - name: sap.ui.layout
    - name: themelib_sap_horizon
{{#enableOdata}}server:
  customMiddleware:
    - name: ui5-middleware-simpleproxy
      mountPath: /sap/opu/odata
      afterMiddleware: compression
      configuration:
        baseUri: "{{{odataServiceUrl}}}"
{{/enableOdata}}`,

  '.eslintrc.json': `{
  "env": {
    "browser": true,
      "es2020": true
  },
  "parserOptions": {
    "ecmaVersion": 2020,
      "sourceType": "module"
  },
  "plugins": ["ui5"],
    "extends": ["plugin:ui5/recommended"],
      "rules": {
    "no-console": "warn",
      "no-unused-vars": "error",
        "no-undef": "error",
          "eqeqeq": ["error", "always"],
            "curly": "error",
              "no-var": "error",
                "prefer-const": "error",
                  "semi": ["error", "always"],
                    "quotes": ["error", "double"],
                      "indent": ["error", 2],
                        "max-len": ["warn", { "code": 120 }],
                          "no-trailing-spaces": "error",
                            "comma-dangle": ["error", "always-multiline"],
                              "object-shorthand": ["error", "always"],
                                "arrow-body-style": ["error", "as-needed"],
                                  "prefer-template": "error"
  }
} `,

  '.eslintignore': `node_modules /
  dist /
  resources /
  test - resources /
*.min.js`,

  '.prettierrc': `{
  "printWidth": 120,
    "tabWidth": 2,
      "useTabs": false,
        "semi": true,
          "singleQuote": false,
            "trailingComma": "all",
              "bracketSpacing": true,
                "arrowParens": "always"
} `,

  '.gitignore': `node_modules /
  dist /
.DS_Store
  *.local
  *.log
    .env
  / resources
  / test - resources
  / report
npm - debug.log *
  yarn - debug.log *
  yarn - error.log * `,

  'package.json': `{
  "name": "{{projectNameBase}}",
    "version": "1.0.0",
      "description": "{{applicationTitle}}",
        "author": "{{authorName}} <{{authorEmail}}>",
          "license": "UNLICENSED",
            "private": true,
              "scripts": {
    "start": "ui5 serve",
      "build": "ui5 build --clean-dest",
        "lint": "eslint webapp/**/*.js",
          "lint:fix": "eslint webapp/**/*.js --fix",
            "test": "ui5 test"
  },
  "devDependencies": {
    "@ui5/cli": "^3.0.0",
    "eslint": "^8.57.0",
    "eslint-plugin-ui5": "^0.1.0"{{#enableOdata}},
    "ui5-middleware-simpleproxy": "^0.6.0"{{/enableOdata}}
  }
} `,

  'README.md': `# { { applicationTitle } }

An SAP UI5 application scaffolded by the SAP Scaffold Agent.

## Project Info

  | Property | Value |
| ---| ---|
| Namespace | \`{{namespace}}.{{appId}}\` |
| Project Type | {{projectType}} |
| UI5 Version | {{minUI5Version}} |
| Theme | {{theme}} |

## Development

\`\`\`bash
npm install
npm start         # Start development server (http://localhost:8080)
npm run lint      # Run ESLint
npm run lint:fix  # Auto-fix lint issues
npm run build     # Build for production
\`\`\`

## Project Structure

\`\`\`
webapp/
├── controller/
│   ├── BaseController.js       ← Shared helpers (router, model, nav back)
│   └── Main.controller.js      ← Main page controller
├── css/
│   └── style.css
├── i18n/
│   └── i18n.properties
├── model/
│   └── models.js               ← Device model factory
├── view/
│   └── Main.view.xml           ← Main page view
├── Component.js                ← UIComponent: sets device model, inits router
├── index.html                  ← Bootstrap entry point
└── manifest.json               ← App descriptor (routing, models, i18n)
\`\`\`

## Key Wiring

| File | Critical value | Why |
|---|---|---|
| \`manifest.json\` → \`rootView.id\` | \`"app"\` | Prefix for all control IDs in Main.view.xml |
| \`manifest.json\` → \`routing.config.controlId\` | \`"app"\` | Must match \`<App id="app">\` in Main.view.xml |
| \`manifest.json\` → \`routing.config.viewPath\` | \`"{{namespace}}.{{appId}}.view"\` | Key is \`viewPath\`, NOT \`path\` |
| \`index.html\` → \`data-settings\` | \`{"id": "{{appId}}"}\` | Component instance id, NOT the container div id |

## Conventions

- Controllers extend \`BaseController\`
- All text via \`i18n\` model — no hardcoded strings in views
- ESLint + Prettier enforced on every save
`,
};

export default templates;