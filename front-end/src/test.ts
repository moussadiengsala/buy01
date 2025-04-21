// This file is required by karma.conf.js and loads recursively all the .spec and framework files

// Zone.js and testing environment setup
import 'zone.js';
import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

// Add polyfill for process
(window as any).process = { env: {} };

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
);

// Note: require.context is a webpack-specific feature and may not be correctly 
// recognized in Angular v19. Test files will be loaded automatically by Angular CLI.
// For Angular v19, manual imports of test files are recommended if needed. 