// @ts-ignore
import {Category, CategoryConfiguration, CategoryServiceFactory, LogLevel} from "typescript-logging";

// Optionally change default settings, in this example set default logging to Info.
// Without changing configuration, categories will log to Error.
CategoryServiceFactory.setDefaultConfiguration(new CategoryConfiguration(process.env.DEBUG?LogLevel.Debug:LogLevel.Info));

// Create categories, they will autoregister themselves, one category without parent (root) and a child category.

export const loggerSystemLevel = new Category("system");
export const loggerMongoLevel = new Category("mongo", loggerSystemLevel);
export const catDebug = new Category("DEBUG", loggerSystemLevel);
export const loggerUserLevel = new Category("USER", loggerSystemLevel);

// Optionally get a logger for a category, since 0.5.0 this is not necessary anymore, you can use the category itself to log.
// export const log: CategoryLogger = CategoryServiceFactory.getLogger(cat);
