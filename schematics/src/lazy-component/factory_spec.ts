import { UnitTestTree } from '@angular-devkit/schematics/testing';
import { lastValueFrom } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { PWALazyComponentOptionsSchema as Options } from 'schemas/lazy-component/schema';

import {
  createAppLastRoutingModule,
  createApplication,
  createModule,
  createSchematicRunner,
} from '../utils/testHelper';

describe('Lazy Component Schematic', () => {
  const schematicRunner = createSchematicRunner();
  const defaultOptions: Options = {
    project: 'bar',
    prefix: 'foo',
  };

  let appTree: UnitTestTree;
  beforeEach(async () => {
    const appTree$ = createApplication(schematicRunner).pipe(
      createModule(schematicRunner, { name: 'shared', project: undefined }),
      createAppLastRoutingModule(schematicRunner),
      switchMap(tree =>
        schematicRunner.runSchematic('extension', { project: defaultOptions.project, name: 'ext' }, tree)
      ),
      switchMap(tree =>
        schematicRunner.runSchematic('component', { ...defaultOptions, name: 'extensions/ext/shared/dummy' }, tree)
      )
    );
    appTree = await lastValueFrom(appTree$);
  });

  it('should be created', () => {
    expect(appTree.files).toContain('/src/app/extensions/ext/shared/dummy/dummy.component.ts');
  });

  it.each([
    'extensions/ext/shared',
    'extensions/ext/shared/other/other.component.ts',
    'src/app/extensions/ext/shared/other/other.component.ts',
    'src/app/shared/other/other.component.ts',
  ])('should fail for path %s', async path => {
    const err = await schematicRunner
      .runSchematic('lazy-component', { ...defaultOptions, path }, appTree)

      .catch(error => error);

    expect(err.message).toMatch(/path does not point to an existing component/);
  });

  it.each(['extensions/ext/shared/dummy/dummy.component.ts', 'src/app/extensions/ext/shared/dummy/dummy.component.ts'])(
    'should generate a lazy component for %s',
    async path => {
      const tree = await schematicRunner.runSchematic('lazy-component', { ...defaultOptions, path }, appTree);
      expect(tree.files).toIncludeAllMembers([
        '/src/app/extensions/ext/exports/lazy-dummy/lazy-dummy.component.ts',
        '/src/app/extensions/ext/exports/lazy-dummy/lazy-dummy.component.html',
      ]);
    }
  );

  describe('empty component', () => {
    let tree: UnitTestTree;
    let htmlContent: string;
    let componentContent: string;
    let exportsModuleContent: string;

    beforeEach(async () => {
      tree = await schematicRunner.runSchematic(
        'lazy-component',
        { ...defaultOptions, path: 'extensions/ext/shared/dummy/dummy.component.ts' },
        appTree
      );

      htmlContent = tree.readContent('/src/app/extensions/ext/exports/lazy-dummy/lazy-dummy.component.html');
      componentContent = tree.readContent('/src/app/extensions/ext/exports/lazy-dummy/lazy-dummy.component.ts');
      exportsModuleContent = tree.readContent('/src/app/extensions/ext/exports/ext-exports.module.ts');
    });

    it('should generate a template with generating warning', async () => {
      expect(htmlContent).toContain('ng g lazy-component extensions/ext/shared/dummy/dummy.component.ts');
    });

    it('should generate a component with generating warning', async () => {
      expect(componentContent).toContain('ng g lazy-component extensions/ext/shared/dummy/dummy.component.ts');
    });

    it('should have anchor reference and use it in component', async () => {
      expect(htmlContent).toContain('#anchor');
      expect(componentContent).toContain("@ViewChild('anchor'");
    });

    it('should dynamically import component which is lazy loaded', async () => {
      expect(componentContent).toContain("await import('../../shared/dummy/dummy.component');");
    });

    it('should load component via module', async () => {
      expect(componentContent).toContain('import(`../../ext.module`)');
    });

    it('should check if extension is enabled', async () => {
      expect(componentContent).toContain(".enabled$('ext')");
    });

    it('should generate right component selector', async () => {
      expect(componentContent).toContain("selector: 'foo-lazy-dummy'");
    });

    it('should reference the right template', async () => {
      expect(componentContent).toContain("templateUrl: './lazy-dummy.component.html'");
    });

    it('should generate lazy component definition', async () => {
      expect(componentContent).toContain('export class LazyDummyComponent');
    });

    it('should import lazy component in exports module', async () => {
      expect(exportsModuleContent).toMatch("import { LazyDummyComponent } from './lazy-dummy/lazy-dummy.component';");
    });

    it('should declare lazy component in exports module', async () => {
      expect(exportsModuleContent).toMatch(/declarations:.*LazyDummyComponent/s);
    });

    it('should export lazy component in exports module', async () => {
      expect(exportsModuleContent).toMatch(/exports:.*LazyDummyComponent/s);
    });

    it('should add decorator to original component', () => {
      expect(tree.readContent('/src/app/extensions/ext/shared/dummy/dummy.component.ts')).toContain(
        '@GenerateLazyComponent()'
      );
    });

    it('should create a .gitignore file in the exports folder', () => {
      const gitignore = tree.readContent('/src/app/extensions/ext/exports/.gitignore');
      expect(gitignore.trim()).toMatchInlineSnapshot(`"**/lazy*"`);
    });
  });

  describe('ci', () => {
    let tree: UnitTestTree;
    let exportsModuleContent: string;
    let originalComponent: string;
    let storedCI: string;

    beforeAll(() => {
      storedCI = process.env.CI;
      process.env.CI = 'true';
    });

    afterAll(() => {
      process.env.CI = storedCI;
    });

    beforeEach(async () => {
      tree = await schematicRunner.runSchematic(
        'lazy-component',
        { ...defaultOptions, path: 'extensions/ext/shared/dummy/dummy.component.ts' },
        appTree
      );

      exportsModuleContent = tree.readContent('/src/app/extensions/ext/exports/ext-exports.module.ts');

      originalComponent = tree.readContent('/src/app/extensions/ext/shared/dummy/dummy.component.ts');
    });

    it('should generate the lazy component', async () => {
      expect(tree.files).toIncludeAllMembers([
        '/src/app/extensions/ext/exports/lazy-dummy/lazy-dummy.component.html',
        '/src/app/extensions/ext/exports/lazy-dummy/lazy-dummy.component.ts',
      ]);
    });

    it('should not touch exports module', () => {
      expect(exportsModuleContent).not.toContain('LazyDummyComponent');
    });

    it('should not touch original component', () => {
      expect(originalComponent).not.toContain('@GenerateLazyComponent()');
    });
  });

  describe('component with inputs', () => {
    let tree: UnitTestTree;
    let componentContent: string;

    beforeEach(async () => {
      appTree.overwrite(
        '/src/app/extensions/ext/shared/dummy/dummy.component.ts',
        `import { ChangeDetectionStrategy, Component, Input, Output } from '@angular/core';
import { Observable } from 'rxjs';

import { Product, ProductHelper } from 'ish-core/models/product/product.model';
import { User } from 'ish-core/models/user/user.model';
import { Customer } from 'ish-core/models/customer/customer.model';

@Component({
  selector: 'ish-dummy',
  templateUrl: './dummy.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DummyComponent {
  @Input() simpleTyped: boolean;
  @Input() simpleTypedInitialized = true;
  @Input() complexTyped: 'a' | 'b';
  @Input() complexTypedInitialized: 'a' | 'b' = 'a';
  @Input() importTyped: Product;
  @Input() importComplexTyped: User[];
  @Input() importGenericTyped: Observable<Customer[]>;
}
`
      );
      tree = await schematicRunner.runSchematic(
        'lazy-component',
        { ...defaultOptions, path: 'extensions/ext/shared/dummy/dummy.component.ts' },
        appTree
      );

      componentContent = tree.readContent('/src/app/extensions/ext/exports/lazy-dummy/lazy-dummy.component.ts');
    });

    it('should import type of component which is lazy loaded', async () => {
      expect(componentContent).toContain(
        "import type { DummyComponent as OriginalComponent } from '../../shared/dummy/dummy.component';"
      );
    });

    it('should delegate input types', () => {
      expect(componentContent).toContain("@Input() simpleTyped: OriginalComponent['simpleTyped'];");
      expect(componentContent).toContain(
        "@Input() simpleTypedInitialized: OriginalComponent['simpleTypedInitialized'];"
      );
      expect(componentContent).toContain("@Input() complexTyped: OriginalComponent['complexTyped'];");
      expect(componentContent).toContain(
        "@Input() complexTypedInitialized: OriginalComponent['complexTypedInitialized'];"
      );
      expect(componentContent).toContain("@Input() importTyped: OriginalComponent['importTyped'];");
      expect(componentContent).toContain("@Input() importComplexTyped: OriginalComponent['importComplexTyped'];");
      expect(componentContent).toContain("@Input() importGenericTyped: OriginalComponent['importGenericTyped'];");
    });

    it('should transfer inputs', () => {
      expect(componentContent).toContain('component.instance.simpleTyped = this.simpleTyped');
      expect(componentContent).toContain('component.instance.simpleTypedInitialized = this.simpleTypedInitialized');
      expect(componentContent).toContain('component.instance.complexTyped = this.complexTyped');
      expect(componentContent).toContain('component.instance.complexTypedInitialized = this.complexTypedInitialized');
      expect(componentContent).toContain('component.instance.importTyped = this.importTyped');
      expect(componentContent).toContain('component.instance.importComplexTyped = this.importComplexTyped');
      expect(componentContent).toContain('component.instance.importGenericTyped = this.importGenericTyped');
    });
  });

  describe('overwriting', () => {
    beforeEach(() => {
      appTree.create('/src/app/extensions/ext/exports/lazy-dummy/lazy-dummy.component.ts', 'ORIGINAL');
    });

    it('should overwrite existing lazy component', async () => {
      const tree = await schematicRunner.runSchematic(
        'lazy-component',
        { ...defaultOptions, path: 'extensions/ext/shared/dummy/dummy.component.ts' },
        appTree
      );
      expect(tree.files).toIncludeAllMembers([
        '/src/app/extensions/ext/exports/lazy-dummy/lazy-dummy.component.ts',
        '/src/app/extensions/ext/exports/lazy-dummy/lazy-dummy.component.html',
      ]);

      expect(tree.readContent('/src/app/extensions/ext/exports/lazy-dummy/lazy-dummy.component.ts')).toContain(
        'export class LazyDummyComponent'
      );
    });
  });

  describe('component with ngOnChanges without SimpleChanges', () => {
    let tree: UnitTestTree;
    let componentContent: string;

    beforeEach(async () => {
      appTree.overwrite(
        '/src/app/extensions/ext/shared/dummy/dummy.component.ts',
        `import { ChangeDetectionStrategy, Component, Input, OnChanges, Output } from '@angular/core';

import { Product, ProductHelper } from 'ish-core/models/product/product.model';

@Component({
  selector: 'ish-dummy',
  templateUrl: './dummy.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DummyComponent implements OnChanges {
  @Input() input: boolean;

  ngOnChanges() {
    // do something
  }
}
`
      );
      tree = await schematicRunner.runSchematic(
        'lazy-component',
        { ...defaultOptions, path: 'extensions/ext/shared/dummy/dummy.component.ts' },
        appTree
      );

      componentContent = tree.readContent('/src/app/extensions/ext/exports/lazy-dummy/lazy-dummy.component.ts');
    });

    it('should call ngOnChanges', () => {
      expect(componentContent).toContain('component.instance.ngOnChanges()');
    });

    it('should not import SimpleChanges', () => {
      expect(componentContent).not.toContain('SimpleChanges');
    });
  });

  describe('component with ngOnChanges with SimpleChanges', () => {
    let tree: UnitTestTree;
    let componentContent: string;

    beforeEach(async () => {
      appTree.overwrite(
        '/src/app/extensions/ext/shared/dummy/dummy.component.ts',
        `import { ChangeDetectionStrategy, Component, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

import { Product, ProductHelper } from 'ish-core/models/product/product.model';

@Component({
  selector: 'ish-dummy',
  templateUrl: './dummy.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DummyComponent implements OnChanges {
  @Input() input: boolean;

  ngOnChanges(changes: SimpleChanges) {
    // do something
  }
}
`
      );
      tree = await schematicRunner.runSchematic(
        'lazy-component',
        { ...defaultOptions, path: 'extensions/ext/shared/dummy/dummy.component.ts' },
        appTree
      );

      componentContent = tree.readContent('/src/app/extensions/ext/exports/lazy-dummy/lazy-dummy.component.ts');
    });

    it('should call ngOnChanges with parameter', () => {
      expect(componentContent).toMatch(/component\.instance\.ngOnChanges\(\w+\)/);
    });

    it('should import SimpleChanges', () => {
      expect(componentContent).toContain('SimpleChanges');
    });
  });
});
