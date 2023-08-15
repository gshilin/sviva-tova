require('dotenv').config();
const {mountRoutes} = require('remix-mount-routes');

const basePath = process.env.REMIX_BASEPATH ?? '';

/** @type {import("@remix-run/dev").AppConfig} */
module.exports = {
    ignoredRouteFiles: [ "**/.*" ],
    // appDirectory: "app",
    // assetsBuildDirectory: "public/build",
    // serverBuildPath: "build/index.js",
    // publicPath: "/build/",
    serverDependenciesToBundle: [ "axios" ],
    serverModuleFormat: "cjs",
    routes: defineRoutes => {
        const baseRoutes = mountRoutes(basePath, 'routes');
        return {
            ...baseRoutes,
        };
    },
    future: {
        v2_errorBoundary: true,
        v2_meta: true,
        v2_normalizeFormMethod: true,
        v2_routeConvention: true,
        unstable_dev: false
    },
    tailwind: true,
    postcss: true
};
