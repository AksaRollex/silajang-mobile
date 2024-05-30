module.exports = {
  presets: ["module:metro-react-native-babel-preset"],
  plugins: [
    [
      "module:react-native-dotenv",
      {
        envName: "APP_ENV",
        moduleName: "@env",
        path: ".env",
      },
    ],
    "react-native-reanimated/plugin",
    [
      "module-resolver",
      {
        root: ["./src"],
        extensions: [
          ".ios.ts",
          ".android.ts",
          ".ts",
          ".ios.tsx",
          ".android.tsx",
          ".jsx",
          ".js",
          ".json",
        ],
        alias: {
          "@": "./",
        },
      },
    ],
  ],
  overrides: [
    {
      plugins: [
        [
          "@babel/plugin-transform-private-methods",
          {
            loose: true,
          },
        ],
      ],
    },
  ],
};
