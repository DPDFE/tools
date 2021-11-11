module.exports = {
    env: {
        browser: true,
        es2021: true,
    },
    extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:jsdoc/recommended',

        // 请确保格式化代码插件放在最后
        'plugin:prettier/recommended',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: 2021,
        sourceType: 'module',
    },
    settings: {
        jsdoc: {
            mode: 'typescript',
        },
    },
    rules: {
        // 请不要随意添加、修改、删除规则
        radix: 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-var-requires': 'off',

        '@typescript-eslint/no-explicit-any': 'error',

        // jsdoc rules
        'jsdoc/check-access': 2,
        'jsdoc/check-alignment': 2,
        'jsdoc/check-examples': 0,
        'jsdoc/check-indentation': 2,
        'jsdoc/check-line-alignment': 0,
        'jsdoc/check-param-names': 2,
        'jsdoc/check-property-names': 2,
        'jsdoc/check-syntax': 2,
        'jsdoc/check-tag-names': 2,
        'jsdoc/check-types': 2,
        'jsdoc/check-values': 2,
        'jsdoc/empty-tags': 2,
        'jsdoc/implements-on-classes': 2,
        'jsdoc/match-description': 0,
        'jsdoc/newline-after-description': 2,
        'jsdoc/no-bad-blocks': 2,
        'jsdoc/no-defaults': 2,
        'jsdoc/no-types': 2,
        'jsdoc/no-undefined-types': 2,
        'jsdoc/require-description': 2,
        'jsdoc/require-description-complete-sentence': 0,
        'jsdoc/require-example': 0,
        'jsdoc/require-file-overview': 0,
        'jsdoc/require-hyphen-before-param-description': 2,
        'jsdoc/require-jsdoc': [
            'error',
            {
                contexts: [
                    'TSInterfaceDeclaration',
                    'TSMethodSignature',
                    'TSPropertySignature',
                ],
                require: {
                    ClassDeclaration: true,
                    ClassExpression: true,
                    MethodDefinition: true,
                    ArrowFunctionExpression: true,
                    FunctionDeclaration: true,
                    FunctionExpression: true,
                },
            },
        ],
        'jsdoc/require-param': 2,
        'jsdoc/require-param-description': 2,
        'jsdoc/require-param-name': 2,
        'jsdoc/require-param-type': 0,
        'jsdoc/require-property': 2,
        'jsdoc/require-property-description': 2,
        'jsdoc/require-property-name': 2,
        'jsdoc/require-property-type': 2,
        'jsdoc/require-returns': 0,
        'jsdoc/require-returns-check': 0,
        'jsdoc/require-returns-description': 0,
        'jsdoc/require-returns-type': 0,
        'jsdoc/require-throws': 2,
        'jsdoc/require-yields': 2,
        'jsdoc/require-yields-check': 2,
        'jsdoc/valid-types': 2,
    },
};
