const templates = {
  'webapp/index.html': `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{{applicationTitle}}</title>
  <script
    id="sap-ui-bootstrap"
    src="https://ui5.sap.com/resources/sap-ui-core.js"
    data-sap-ui-theme="{{theme}}"
    data-sap-ui-resourceroots='{"{{namespace}}.{{appId}}": "./"}'
    data-sap-ui-compatVersion="edge"
    data-sap-ui-async="true"
    data-sap-ui-frameOptions="trusted"
    data-sap-ui-oninit="module:sap/ui/core/ComponentSupport"
  ></script>
</head>
<body class="sapUiBody" id="content">
  <div
    data-sap-ui-component
    data-name="{{namespace}}.{{appId}}"
    data-id="container"
    data-settings='{"id": "{{appId}}"}'
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
        "uri": "{{odataServiceUrl}}",
        "type": "OData",
        "settings": {
          "odataVersion": "2.0"
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
        "type": "JSON",
        "viewType": "XML",
        "path": "{{namespace}}.{{appId}}.view",
        "controlId": "app",
        "controlAggregation": "pages",
        "async": true
      },
      "routes": [
        {
          "name": "RouteMainView",
          "pattern": "",
          "target": "TargetMainView"
        }
      ],
      "targets": {
        "TargetMainView": {
          "id": "MainView",
          "name": "MainView"
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
  ["sap/ui/core/UIComponent", "sap/ui/Device"],
  function (UIComponent, Device) {
    "use strict";

    return UIComponent.extend("{{namespace}}.{{appId}}.Component", {
      metadata: {
        manifest: "json",
      },

      init: function () {
        UIComponent.prototype.init.apply(this, arguments);
        this.getRouter().initialize();
      },

      getContentDensityClass: function () {
        if (!this._sContentDensityClass) {
          this._sContentDensityClass = Device.support.touch ? "sapUiSizeCozy" : "sapUiSizeCompact";
        }
        return this._sContentDensityClass;
      },
    });
  }
);`,

  'webapp/view/App.view.xml': `<mvc:View
  controllerName="{{namespace}}.{{appId}}.controller.App"
  xmlns:mvc="sap.ui.core.mvc"
  xmlns="sap.m"
  displayBlock="true"
>
  <App id="app" />
</mvc:View>`,

  'webapp/view/MainView.view.xml': `<mvc:View
  controllerName="{{namespace}}.{{appId}}.controller.MainView"
  xmlns:mvc="sap.ui.core.mvc"
  xmlns="sap.m"
  xmlns:l="sap.ui.layout"
>
  <Page
    id="mainPage"
    title="{i18n>mainViewTitle}"
    showNavButton="false"
  >
    <content>
      <VBox class="sapUiMediumMargin">
        <Title
          text="{i18n>welcomeTitle}"
          level="H1"
        />
        <Text text="{i18n>welcomeDescription}" />
      </VBox>
    </content>
  </Page>
</mvc:View>`,

  'webapp/controller/App.controller.js': `sap.ui.define(
  ["./BaseController"],
  function (BaseController) {
    "use strict";

    return BaseController.extend("{{namespace}}.{{appId}}.controller.App", {
      onInit: function () {},
    });
  }
);`,

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
        } else {
          this.getRouter().navTo("RouteMainView", {}, true);
        }
      },
    });
  }
);`,

  'webapp/controller/MainView.controller.js': `sap.ui.define(
  ["./BaseController"],
  function (BaseController) {
    "use strict";

    return BaseController.extend("{{namespace}}.{{appId}}.controller.MainView", {
      onInit: function () {},
    });
  }
);`,

  'webapp/model/formatter.js': `sap.ui.define([], function () {
  "use strict";

  return {
    formatDate: function (sDate) {
      if (!sDate) return "";
      const oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
        pattern: "dd.MM.yyyy",
      });
      return oDateFormat.format(new Date(sDate));
    },

    formatCurrency: function (fValue, sCurrency) {
      if (!fValue) return "";
      const oCurrencyFormat = sap.ui.core.format.NumberFormat.getCurrencyInstance();
      return oCurrencyFormat.format(fValue, sCurrency);
    },

    statusState: function (sStatus) {
      const mStateMap = {
        Success: "Success",
        Error: "Error",
        Warning: "Warning",
      };
      return mStateMap[sStatus] || "None";
    },
  };
});`,

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
appTitle={{applicationTitle}}
appDescription=An SAP UI5 Application

# Main View
mainViewTitle={{applicationTitle}}
welcomeTitle=Welcome
welcomeDescription=This is your SAP UI5 application.

# Common
okButtonText=OK
cancelButtonText=Cancel
saveButtonText=Save`,

  'webapp/css/style.css': `.sapUiSizeCompact .customCompact {
  font-size: 0.75rem;
}

.customHighlightRow {
  background-color: var(--sapHighlightColor);
}`,

  'ui5.yaml': `specVersion: "3.0"
metadata:
  name: {{namespace}}.{{appId}}
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
server:
  customMiddleware:
    - name: ui5-middleware-simpleproxy
      mountPath: /sap/opu/odata
      afterMiddleware: compression
      configuration:
        baseUri: "{{odataServiceUrl}}"`,

  '.eslintrc.json': `{
  "env": {
    "browser": true,
    "es2020": true
  },
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module"
  },
  "plugins": ["ui5-jsdocs", "fiori-custom-controls"],
  "extends": ["plugin:@ui5/recommended"],
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
}`,

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
}`,

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
  "name": "{{projectName}}",
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
    "@ui5/eslint-plugin": "^0.6.0"
  }
}`,

  'README.md': `# {{applicationTitle}}

An SAP UI5 application scaffolded by the SAP Scaffold Agent.

## Project Info

| Property | Value |
|---|---|
| Namespace | \`{{namespace}}.{{appId}}\` |
| Project Type | {{projectType}} |
| UI5 Version | {{minUI5Version}} |
| Theme | {{theme}} |

## Development

\`\`\`bash
npm install
npm start         # Start development server
npm run lint      # Run ESLint
npm run lint:fix  # Auto-fix lint issues
npm run build     # Build for production
\`\`\`

## Project Structure

\`\`\`
webapp/
├── controller/
│   ├── App.controller.js
│   ├── BaseController.js
│   └── MainView.controller.js
├── css/
│   └── style.css
├── i18n/
│   └── i18n.properties
├── model/
│   ├── formatter.js
│   └── models.js
├── view/
│   ├── App.view.xml
│   └── MainView.view.xml
├── Component.js
├── index.html
└── manifest.json
\`\`\`

## Conventions

- Controllers extend \`BaseController\`
- All text via \`i18n\` model — no hardcoded strings in views
- Formatters in \`model/formatter.js\`
- ESLint rules enforced on every commit
`,
};

export default templates;
