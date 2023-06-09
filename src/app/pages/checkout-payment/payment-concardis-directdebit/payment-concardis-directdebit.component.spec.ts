import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormlyForm } from '@ngx-formly/core';
import { TranslateModule } from '@ngx-translate/core';
import { MockComponent } from 'ng-mocks';
import { anything, spy, verify } from 'ts-mockito';

import { PaymentMethod } from 'ish-core/models/payment-method/payment-method.model';

import { PaymentSaveCheckboxComponent } from '../formly/payment-save-checkbox/payment-save-checkbox.component';

import { PaymentConcardisDirectdebitComponent } from './payment-concardis-directdebit.component';

describe('Payment Concardis Directdebit Component', () => {
  let component: PaymentConcardisDirectdebitComponent;
  let fixture: ComponentFixture<PaymentConcardisDirectdebitComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        MockComponent(FormlyForm),
        MockComponent(PaymentSaveCheckboxComponent),
        PaymentConcardisDirectdebitComponent,
      ],
      imports: [TranslateModule.forRoot()],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentConcardisDirectdebitComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;

    component.paymentMethod = {
      id: 'Concardis_DirectDebit',
      saveAllowed: false,
      parameters: [
        {
          key: 'IBAN',
          name: 'IBAN',
          type: 'input',
          props: { label: 'input', type: 'text', disabled: false },
        },
      ],
    } as PaymentMethod;
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
    expect(element).toBeTruthy();
    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it('should emit submit event if submit call back returns with no error and parameter form is valid', () => {
    fixture.detectChanges();

    const emitter = spy(component.submitPayment);

    component.submitCallback(undefined, {
      paymentInstrumentId: '4711',
      attributes: {
        accountHolder: 'Klaus Klausen',
        iban: '123456789',
        bic: 'BYLADEM1SKB',
        mandateReference: 'ref',
        mandate: {
          mandateReference: 'ref',
          mandateText: 'mandate text',
          directDebitType: 'SINGLE',
          createdDateTime: undefined,
        },
        createdAt: undefined,
      },
    });

    verify(emitter.emit(anything())).once();
  });

  it('should show an error if submit call back returns with an error', () => {
    const errorMessage = 'field is required';

    fixture.detectChanges();
    component.submitCallback(
      { message: { properties: [{ key: 'iban', code: 123, message: errorMessage, messageKey: '' }] } },
      undefined
    );

    expect(component.errorMessage.iban.message).toEqual(errorMessage);
  });

  it('should emit cancel event when cancelNewPaymentInstrument is triggered', () => {
    fixture.detectChanges();

    const emitter = spy(component.cancelPayment);

    component.cancelNewPaymentInstrument();
    verify(emitter.emit()).once();
  });
});
