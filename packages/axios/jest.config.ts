import {InitialOptionsTsJest} from 'ts-jest/dist/types';

export default {
    preset: 'ts-jest',
    moduleNameMapper: {
        '@/(.*)$': '<rootDir>/src/$1',
    },
    setupFilesAfterEnv: ['<rootDir>/__tests__/setupTests.ts'],
    transform: {
        // 需要把js也配置上，因为jest不支持import。ts-jest 可以 ts -> es6 -> es5
        '^.+\\.[jt]sx?$': 'ts-jest',
    },
    testMatch: ['<rootDir>/__tests__/*.spec.[jt]s?(x)'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    collectCoverage: true,
    collectCoverageFrom: [
        // 'src/**/*.{ts,tsx,js,jsx}',
        // '!src/**/*.d.ts',
        // '!src/examples/*',
        'packages/axios/src/index.ts',
    ],
} as InitialOptionsTsJest;
