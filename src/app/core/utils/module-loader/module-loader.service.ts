import { Injectable, InjectionToken, Injector, Type, createNgModule } from '@angular/core';
import { Store, select } from '@ngrx/store';

import { getFeatures, notifyLazyFeatureLoaded } from 'ish-core/store/core/configuration';
import { FeatureToggleService } from 'ish-core/utils/feature-toggle/feature-toggle.service';
import { whenTruthy } from 'ish-core/utils/operators';

declare interface LazyModuleType {
  feature: string;
  location(): Promise<Type<unknown>>;
}

export const LAZY_FEATURE_MODULE = new InjectionToken<LazyModuleType>('lazyModule');

@Injectable({ providedIn: 'root' })
export class ModuleLoaderService {
  private loadedModules: Type<unknown>[] = [];

  constructor(private featureToggleService: FeatureToggleService, private store: Store) {}

  init(injector: Injector) {
    this.store.pipe(select(getFeatures), whenTruthy()).subscribe(() => {
      const lazyModules = injector.get<LazyModuleType[]>(LAZY_FEATURE_MODULE, []);
      lazyModules
        .filter(mod => this.featureToggleService.enabled(mod.feature))
        .forEach(async mod => {
          const loaded = await mod.location();
          if (!this.loadedModules.includes(loaded)) {
            createNgModule(loaded, injector);
            this.loadedModules.push(loaded);
            this.store.dispatch(notifyLazyFeatureLoaded({ feature: mod.feature }));
          }
        });
    });
  }
}
