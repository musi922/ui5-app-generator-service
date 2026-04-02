const common = {
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
    - name: themelib_sap_horizon`,

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

  '.eslintignore': `node_modules/
dist/
resources/
test-resources/
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

  '.gitignore': `node_modules/
dist/
.DS_Store
*.local
*.log
.env
/resources
/test-resources
/report
npm-debug.log*
yarn-debug.log*
yarn-error.log*`,

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
};

const freestyle = {
  ...common,
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
        <f:title>
          <f:DynamicPageTitle>
            <f:heading>
              <Title text="{i18n>mainViewTitle}" level="H2" />
            </f:heading>
          </f:DynamicPageTitle>
        </f:title>

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
                <Button icon="sap-icon://add" text="Add Item" press=".onAddPress" />
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
          const aFilters = [];
          const sQuery = oEvent.getParameter("query");
          if (sQuery && sQuery.length > 0) {
            const filter = new Filter("Name", FilterOperator.Contains, sQuery);
            aFilters.push(filter);
          }

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

  'README.md': `# {{applicationTitle}}

An SAP UI5 application scaffolded by the SAP Scaffold Agent.

## Project Info

| Property | Value |
| ---| ---|
| Namespace | \`{{namespace}}.{{appId}}\` |
| Project Type | Freestyle (List Report Pattern) |
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
`,
};

const fioriElements = {
  ...common,
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
    },
    "dataSources": {
      "mainService": {
        "uri": "{{{odataServiceUrl}}}",
        "type": "OData",
        "settings": {
          "odataVersion": "4.0"
        }
      }
    }
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
        "sap.fe.templates": {}
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
      },
      "": {
        "dataSource": "mainService",
        "preload": true,
        "settings": {
          "synchronizationMode": "None",
          "operationMode": "Server",
          "autoExpandSelect": true,
          "earlyRequests": true
        }
      }
    },
    "routing": {
      "config": {
        "routerClass": "sap.fe.core.Router",
        "viewType": "XML",
        "controlId": "app",
        "controlAggregation": "pages",
        "async": true
      },
      "routes": [
        {
          "name": "DataList",
          "pattern": ":?query:",
          "target": "DataList"
        }
      ],
      "targets": {
        "DataList": {
          "type": "Component",
          "id": "DataList",
          "name": "sap.fe.templates.ListReport",
          "options": {
            "settings": {
              "entitySet": "Data",
              "navigation": {
                "Data": {
                  "detail": {
                    "route": "DataDetail"
                  }
                }
              }
            }
          }
        }
      }
    },
    "rootView": {
      "viewName": "sap.fe.core.rootView.RootView",
      "type": "XML",
      "async": true,
      "id": "app"
    }
  }
}`,

  'webapp/Component.js': `sap.ui.define(["sap/fe/core/AppComponent"], function (AppComponent) {
  "use strict";

  return AppComponent.extend("{{namespace}}.{{appId}}.Component", {
    metadata: {
      manifest: "json",
    },
  });
});`,

  'webapp/i18n/i18n.properties': `# App Descriptor
appTitle = {{ applicationTitle }}
appDescription = An SAP Fiori Elements Application`,

  'README.md': `# {{applicationTitle}} (Fiori Elements)

An SAP Fiori Elements List Report application scaffolded by the SAP Scaffold Agent.

## Project Info

| Property | Value |
| ---| ---|
| Namespace | \`{{namespace}}.{{appId}}\` |
| Project Type | Fiori Elements (List Report) |
| UI5 Version | {{minUI5Version}} |
| Theme | {{theme}} |
`,
};

const masterdetail = {
  ...common,
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
        "controlId": "flexibleColumnLayout",
        "controlAggregation": "pages",
        "async": true
      },
      "routes": [
        {
          "name": "master",
          "pattern": "",
          "target": ["master"]
        },
        {
          "name": "detail",
          "pattern": "detail/{id}",
          "target": ["master", "detail"]
        }
      ],
      "targets": {
        "master": {
          "viewName": "Master",
          "controlAggregation": "beginColumnPages"
        },
        "detail": {
          "viewName": "Detail",
          "controlAggregation": "midColumnPages"
        }
      }
    },
    "rootView": {
      "viewName": "{{namespace}}.{{appId}}.view.App",
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

  'webapp/view/App.view.xml': `<mvc:View
  controllerName="{{namespace}}.{{appId}}.controller.App"
  xmlns:mvc="sap.ui.core.mvc"
  displayBlock="true"
  xmlns="sap.m"
  xmlns:f="sap.f">
  <App id="app">
    <f:FlexibleColumnLayout
      id="flexibleColumnLayout"
      backgroundDesign="Translucent"
      layout="OneColumn" />
  </App>
</mvc:View>`,

  'webapp/view/Master.view.xml': `<mvc:View
  controllerName="{{namespace}}.{{appId}}.controller.Master"
  xmlns:mvc="sap.ui.core.mvc"
  xmlns="sap.m"
  xmlns:f="sap.f">
  <f:DynamicPage toggleHeaderOnTitleClick="false">
    <f:title>
      <f:DynamicPageTitle>
        <f:heading>
          <Title text="{{applicationTitle}}"/>
        </f:heading>
      </f:DynamicPageTitle>
    </f:title>
    <f:content>
      <List
        id="masterList"
        items="{/Data}"
        mode="SingleSelectMaster"
        selectionChange=".onSelectionChange">
        <items>
          <StandardListItem
            title="{Name}"
            description="{Description}"
            type="Navigation" />
        </items>
      </List>
    </f:content>
  </f:DynamicPage>
</mvc:View>`,

  'webapp/view/Detail.view.xml': `<mvc:View
  controllerName="{{namespace}}.{{appId}}.controller.Detail"
  xmlns:mvc="sap.ui.core.mvc"
  xmlns="sap.m"
  xmlns:f="sap.f"
  xmlns:layout="sap.ui.layout">
  <f:DynamicPage toggleHeaderOnTitleClick="false">
    <f:title>
      <f:DynamicPageTitle>
        <f:heading>
          <Title text="{Name}"/>
        </f:heading>
        <f:actions>
          <Button icon="sap-icon://decline" press=".onCloseDetail" />
        </f:actions>
      </f:DynamicPageTitle>
    </f:title>
    <f:content>
      <VBox class="sapUiSmallMargin">
        <Title text="Item Details" level="H3" class="sapUiSmallMarginBottom" />
        <Text text="ID: {ID}" />
        <Text text="Status: {Status}" />
        <Text text="Description: {Description}" />
      </VBox>
    </f:content>
  </f:DynamicPage>
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
);`,

  'webapp/controller/App.controller.js': `sap.ui.define(
  ["./BaseController"],
  function (BaseController) {
    "use strict";

    return BaseController.extend("{{namespace}}.{{appId}}.controller.App", {
      onInit: function () {
      }
    });
  }
);`,

  'webapp/controller/Master.controller.js': `sap.ui.define(
  ["./BaseController"],
  function (BaseController) {
    "use strict";

    return BaseController.extend("{{namespace}}.{{appId}}.controller.Master", {
      onSelectionChange: function (oEvent) {
        const oItem = oEvent.getParameter("listItem");
        const sPath = oItem.getBindingContext().getPath();
        const sId = sPath.substring(1);
        
        this.getRouter().navTo("detail", {
          id: sId
        });
        
        this.getOwnerComponent().byId("app").byId("flexibleColumnLayout").setLayout("TwoColumnsMidExpanded");
      }
    });
  }
);`,

  'webapp/controller/Detail.controller.js': `sap.ui.define(
  ["./BaseController"],
  function (BaseController) {
    "use strict";

    return BaseController.extend("{{namespace}}.{{appId}}.controller.Detail", {
      onInit: function () {
        this.getRouter().getRoute("detail").attachPatternMatched(this._onObjectMatched, this);
      },

      _onObjectMatched: function (oEvent) {
        const sId = oEvent.getParameter("arguments").id;
        this.getView().bindElement({
          path: "/" + sId
        });
      },

      onCloseDetail: function () {
        this.getOwnerComponent().byId("app").byId("flexibleColumnLayout").setLayout("OneColumn");
        this.getRouter().navTo("master");
      }
    });
  }
);`,

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
);`,

  'webapp/i18n/i18n.properties': `# App Descriptor
appTitle = {{ applicationTitle }}
appDescription = An SAP UI5 Master-Detail Application

# Master View
masterTitle = Items`,

  'README.md': `# {{applicationTitle}} (Master-Detail)

An SAP UI5 Master-Detail application scaffolded by the SAP Scaffold Agent.

## Project Info

| Property | Value |
| ---| ---|
| Namespace | \`{{namespace}}.{{appId}}\` |
| Project Type | Freestyle (Master-Detail) |
| UI5 Version | {{minUI5Version}} |
| Theme | {{theme}} |
`,
};

const templates = {
  freestyle,
  masterdetail,
};

export default templates;