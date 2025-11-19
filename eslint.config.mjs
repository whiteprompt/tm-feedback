import tailwind from "eslint-plugin-better-tailwindcss";
import tseslint from "typescript-eslint";

const eslintConfig = [
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/build/**",
    ],
  },
  ...tseslint.configs.recommended,
  {
    files: ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "better-tailwindcss": tailwind,
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      ...tailwind.configs.recommended.rules,
      "@typescript-eslint/no-explicit-any": "off",
      // Disable unregistered classes check since we use custom CSS classes
      "better-tailwindcss/no-unregistered-classes": "off",
    },
    settings: {
      tailwindcss: {
        // Entry point for Tailwind CSS (Tailwind v4)
        entryPoint: "./src/app/globals.css",
        // Specify the path to your Tailwind config if you have one
        // config: './tailwind.config.js',
        // For Tailwind v4, you might not need a config file
        callees: ["classnames", "clsx", "ctl", "cn", "twMerge"],
        cssFiles: [
          "**/*.css",
          "!**/node_modules",
          "!**/.*",
          "!**/dist",
          "!**/build",
        ],
      },
    },
  },
];

export default eslintConfig;


