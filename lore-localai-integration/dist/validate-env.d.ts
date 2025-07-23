declare function validateEnvironment(): Promise<boolean>;
declare function testDatabaseConnection(): Promise<boolean>;
declare function testRedisConnection(): Promise<boolean>;
declare function testLocalAIConnection(): Promise<boolean>;
declare function runEnvironmentValidation(): Promise<void>;
export { runEnvironmentValidation, validateEnvironment, testDatabaseConnection, testRedisConnection, testLocalAIConnection };
//# sourceMappingURL=validate-env.d.ts.map