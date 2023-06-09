import { Inject, Injectable, InjectionToken } from '@angular/core';

import { InjectMultiple } from 'ish-core/utils/injection';

import { AddressFormConfiguration } from './address-form.configuration';

export const ADDRESS_FORM_CONFIGURATION = new InjectionToken<AddressFormConfiguration>('Address Form Factory');

/*
 * Service that collects address configurations from the module
 * and provides correctly configured `AddressFormConfiguration` objects
 */
@Injectable()
export class AddressFormConfigurationProvider {
  constructor(
    @Inject(ADDRESS_FORM_CONFIGURATION) private configurations: InjectMultiple<typeof ADDRESS_FORM_CONFIGURATION>
  ) {}

  /**
   * gets the appropriate address configuration for the given countryCode and configuration
   */
  getConfiguration(
    countryCode: string = '',
    businessCustomer: boolean = false,
    shortForm: boolean = false
  ): AddressFormConfiguration {
    let configuration = this.findConfiguration(countryCode);
    if (!configuration) {
      configuration = this.findConfiguration('');
    }
    configuration.businessCustomer = businessCustomer;
    configuration.shortForm = shortForm;
    return configuration;
  }

  private findConfiguration(countryCode: string): AddressFormConfiguration {
    return this.configurations.find(f => f.countryCode === countryCode);
  }
}
