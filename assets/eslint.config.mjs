export default {
  "ignores": ["**/*.js"],
  "rules": {
    "no-var": 2,
    "keyword-spacing": [
      "error",
      {
        "before": true
      }
    ],
    "no-unreachable": "error",
    "object-curly-spacing": ["error", "always"],
    "template-curly-spacing": ["error", "never"],
    "curly": ["error"],
    "padding-line-between-statements": [
      "error",
      {
        "blankLine": "always",
        "prev": "*",
        "next": "return"
      }
    ],
    "lines-between-class-members": [
      "error",
      "always",
      {
        "exceptAfterSingleLine": true
      }
    ],
    "import/extensions": "off",
    "no-underscore-dangle": [
      "error",
      {
        "allowAfterThis": true,
        "allow": ["_id"]
      }
    ],
    "import/prefer-default-export": "off",
    "no-unused-vars": "off",
    "no-useless-constructor": "off",
    "arrow-parens": [
      "error",
      "as-needed",
      {
        "requireForBlockBody": true
      }
    ]
  }
};