import { defineConfig } from "eslint/config";
import js from "@eslint/js";

export default defineConfig([
    {
        files: ["**/*.js"],
        plugins: {
            js,
        },
        extends: ["js/recommended"],
        rules: {
            "no-undef": "warn",
            "no-unused-vars": [
                "warn",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                    caughtErrorsIgnorePattern: "^_",
                    destructuredArrayIgnorePattern: "^_"
                }
            ]
        },
    },
]);
