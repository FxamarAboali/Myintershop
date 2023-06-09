import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Store, select } from '@ngrx/store';

import { CoreStoreModule } from 'ish-core/store/core/core-store.module';
import { StoreWithSnapshots, provideStoreSnapshots } from 'ish-core/utils/dev/ngrx-testing';

import { ofUrl } from './router.operators';
import {
  selectPath,
  selectQueryParam,
  selectQueryParams,
  selectRouteData,
  selectRouteParam,
  selectRouter,
  selectUrl,
} from './router.selectors';

describe('Router Integration', () => {
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        CoreStoreModule.forTesting(['router'], true),
        RouterTestingModule.withRoutes([
          {
            path: 'test',
            data: { level: 1, root: true },
            children: [
              {
                path: ':foo',
                data: { foo: 'data' },
                children: [
                  {
                    path: 'deep',
                    data: { leaf: true },
                    children: [
                      {
                        path: 'routes',
                        children: [],
                        data: { level: 4 },
                      },
                    ],
                  },
                ],
              },
            ],
          },
          { path: '**', children: [] },
        ]),
      ],
      providers: [provideStoreSnapshots()],
    });

    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(router).toBeTruthy();
  });

  describe('selectors', () => {
    let store: StoreWithSnapshots;
    beforeEach(() => {
      store = TestBed.inject(StoreWithSnapshots);
    });

    it('should be undefined on start', () => {
      expect(selectRouter(store.state)).toBeUndefined();
      expect(selectQueryParams(store.state)).toBeEmpty();
      expect(selectQueryParam('foo')(store.state)).toBeUndefined();
      expect(selectRouteData('foo')(store.state)).toBeUndefined();
      expect(selectRouteParam('foo')(store.state)).toBeUndefined();
      expect(selectUrl(store.state)).toBeUndefined();
      expect(selectPath(store.state)).toBeUndefined();
      expect(store.actionsArray()).toMatchInlineSnapshot(`[]`);
    });

    it('should be empty on initial navigation', fakeAsync(() => {
      router.initialNavigation();
      tick(500);

      expect(selectRouter(store.state)).toMatchInlineSnapshot(`
        {
          "navigationId": 1,
          "state": {
            "data": {},
            "params": {},
            "path": "**",
            "queryParams": {},
            "url": "/",
          },
        }
      `);
      expect(selectQueryParams(store.state)).toBeEmpty();
      expect(selectQueryParam('foo')(store.state)).toBeUndefined();
      expect(selectRouteData('foo')(store.state)).toBeUndefined();
      expect(selectRouteParam('foo')(store.state)).toBeUndefined();
      expect(selectUrl(store.state)).toMatchInlineSnapshot(`"/"`);
      expect(selectPath(store.state)).toMatchInlineSnapshot(`"**"`);
      expect(store.actionsArray()).toMatchInlineSnapshot(`
        @ngrx/router-store/request: /
        @ngrx/router-store/navigation: /
        @ngrx/router-store/navigated: /
      `);
    }));

    it('should collect data when triggered with simple route', fakeAsync(() => {
      router.navigateByUrl('/any;foo=urlParam;bar=bar?bar=bar&foo=queryParam');
      tick(500);

      expect(selectRouter(store.state)).toMatchInlineSnapshot(`
        {
          "navigationId": 1,
          "state": {
            "data": {},
            "params": {
              "bar": "bar",
              "foo": "urlParam",
            },
            "path": "**",
            "queryParams": {
              "bar": "bar",
              "foo": "queryParam",
            },
            "url": "/any;foo=urlParam;bar=bar?bar=bar&foo=queryParam",
          },
        }
      `);
      expect(selectQueryParams(store.state)).toMatchInlineSnapshot(`
        {
          "bar": "bar",
          "foo": "queryParam",
        }
      `);
      expect(selectQueryParam('foo')(store.state)).toMatchInlineSnapshot(`"queryParam"`);
      expect(selectRouteData('foo')(store.state)).toBeUndefined();
      expect(selectRouteParam('foo')(store.state)).toMatchInlineSnapshot(`"urlParam"`);
      expect(selectUrl(store.state)).toMatchInlineSnapshot(`"/any;foo=urlParam;bar=bar?bar=bar&foo=queryParam"`);
      expect(selectPath(store.state)).toMatchInlineSnapshot(`"**"`);
      expect(store.actionsArray()).toMatchInlineSnapshot(`
        @ngrx/router-store/request: /any;foo=urlParam;bar=bar?bar=bar&foo=queryParam
        @ngrx/router-store/navigation: /any;foo=urlParam;bar=bar?bar=bar&foo=queryParam
        @ngrx/router-store/navigated: /any;foo=urlParam;bar=bar?bar=bar&foo=queryParam
      `);
    }));

    it('should collect data when triggered with deep route', fakeAsync(() => {
      router.navigateByUrl('/test/very/deep/routes;bar=bar?bar=bar&foo=queryParam');
      tick(500);

      expect(selectRouter(store.state)).toMatchInlineSnapshot(`
        {
          "navigationId": 1,
          "state": {
            "data": {
              "foo": "data",
              "leaf": true,
              "level": 4,
              "root": true,
            },
            "params": {
              "bar": "bar",
              "foo": "very",
            },
            "path": "test/:foo/deep/routes",
            "queryParams": {
              "bar": "bar",
              "foo": "queryParam",
            },
            "url": "/test/very/deep/routes;bar=bar?bar=bar&foo=queryParam",
          },
        }
      `);
      expect(selectQueryParams(store.state)).toMatchInlineSnapshot(`
        {
          "bar": "bar",
          "foo": "queryParam",
        }
      `);
      expect(selectQueryParam('foo')(store.state)).toMatchInlineSnapshot(`"queryParam"`);
      expect(selectRouteData('foo')(store.state)).toMatchInlineSnapshot(`"data"`);
      expect(selectRouteData('level')(store.state)).toMatchInlineSnapshot(`4`);
      expect(selectRouteData('leaf')(store.state)).toMatchInlineSnapshot(`true`);
      expect(selectRouteData('root')(store.state)).toMatchInlineSnapshot(`true`);
      expect(selectRouteParam('foo')(store.state)).toMatchInlineSnapshot(`"very"`);
      expect(selectUrl(store.state)).toMatchInlineSnapshot(`"/test/very/deep/routes;bar=bar?bar=bar&foo=queryParam"`);
      expect(selectPath(store.state)).toMatchInlineSnapshot(`"test/:foo/deep/routes"`);
      expect(store.actionsArray()).toMatchInlineSnapshot(`
        @ngrx/router-store/request: /test/very/deep/routes;bar=bar?bar=bar&foo=queryParam
        @ngrx/router-store/navigation: /test/very/deep/routes;bar=bar?bar=bar&foo=queryParam
        @ngrx/router-store/navigated: /test/very/deep/routes;bar=bar?bar=bar&foo=queryParam
      `);
    }));
  });

  describe('ofUrl operator', () => {
    let store: Store;

    beforeEach(() => {
      store = TestBed.inject(Store);
    });

    beforeEach(fakeAsync(() => {
      router.navigateByUrl('/any?view=list');
    }));

    it('should pass through any matcher when used', done => {
      store.pipe(ofUrl(/.*/), select(selectUrl)).subscribe(url => {
        expect(url).toMatchInlineSnapshot(`"/any?view=list"`);
        done();
      });
    });

    it('should pass through specific matcher when used', done => {
      store.pipe(ofUrl(/view/), select(selectUrl)).subscribe(url => {
        expect(url).toMatchInlineSnapshot(`"/any?view=list"`);
        done();
      });
    });

    it('should not pass through exact matcher when used', fakeAsync(() => {
      store.pipe(ofUrl(/^\/any$/), select(selectUrl)).subscribe({ next: fail, error: fail });

      tick(2000);
    }));
  });
});
