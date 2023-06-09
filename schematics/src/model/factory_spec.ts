import { UnitTestTree } from '@angular-devkit/schematics/testing';
import { lastValueFrom } from 'rxjs';
import { PWAModelOptionsSchema as Options } from 'schemas/model/schema';

import { createApplication, createSchematicRunner } from '../utils/testHelper';

describe('Model Schematic', () => {
  const schematicRunner = createSchematicRunner();
  const defaultOptions: Options = {
    name: 'foo',
    project: 'bar',
  };

  let appTree: UnitTestTree;
  beforeEach(async () => {
    const appTree$ = createApplication(schematicRunner);
    appTree = await lastValueFrom(appTree$);
  });

  it('should create a model in core by default', async () => {
    const options = { ...defaultOptions };

    const tree = await schematicRunner.runSchematic('model', options, appTree);
    expect(tree.files.filter(x => x.search('foo') >= 0)).toMatchInlineSnapshot(`
      [
        "/src/app/core/models/foo/foo.helper.spec.ts",
        "/src/app/core/models/foo/foo.helper.ts",
        "/src/app/core/models/foo/foo.interface.ts",
        "/src/app/core/models/foo/foo.mapper.spec.ts",
        "/src/app/core/models/foo/foo.mapper.ts",
        "/src/app/core/models/foo/foo.model.ts",
      ]
    `);
  });

  it('should create a simple model in core if requested', async () => {
    const options = { ...defaultOptions, simple: true };

    const tree = await schematicRunner.runSchematic('model', options, appTree);
    expect(tree.files.filter(x => x.search('foo') >= 0)).toMatchInlineSnapshot(`
      [
        "/src/app/core/models/foo/foo.model.ts",
      ]
    `);
  });

  it('should create a model in extension if requested', async () => {
    const options = { ...defaultOptions, extension: 'feature' };

    const tree = await schematicRunner.runSchematic('model', options, appTree);
    expect(tree.files.filter(x => x.search('foo') >= 0)).toMatchInlineSnapshot(`
      [
        "/src/app/extensions/feature/models/foo/foo.helper.spec.ts",
        "/src/app/extensions/feature/models/foo/foo.helper.ts",
        "/src/app/extensions/feature/models/foo/foo.interface.ts",
        "/src/app/extensions/feature/models/foo/foo.mapper.spec.ts",
        "/src/app/extensions/feature/models/foo/foo.mapper.ts",
        "/src/app/extensions/feature/models/foo/foo.model.ts",
      ]
    `);
  });
});
