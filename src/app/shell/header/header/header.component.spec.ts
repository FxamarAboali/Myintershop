import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockComponent } from 'ng-mocks';
import { of } from 'rxjs';
import { instance, mock, when } from 'ts-mockito';

import { AppFacade } from 'ish-core/facades/app.facade';
import { findAllCustomElements } from 'ish-core/utils/dev/html-query-utils';
import { BackToTopComponent } from 'ish-shell/header/back-to-top/back-to-top.component';
import { HeaderCheckoutComponent } from 'ish-shell/header/header-checkout/header-checkout.component';
import { HeaderDefaultComponent } from 'ish-shell/header/header-default/header-default.component';
import { HeaderErrorComponent } from 'ish-shell/header/header-error/header-error.component';
import { HeaderSimpleComponent } from 'ish-shell/header/header-simple/header-simple.component';

import { HeaderComponent } from './header.component';

describe('Header Component', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let element: HTMLElement;
  let appFacade: AppFacade;

  beforeEach(async () => {
    appFacade = mock(AppFacade);
    when(appFacade.headerType$).thenReturn(of(undefined));

    await TestBed.configureTestingModule({
      declarations: [
        HeaderComponent,
        MockComponent(BackToTopComponent),
        MockComponent(HeaderCheckoutComponent),
        MockComponent(HeaderDefaultComponent),
        MockComponent(HeaderErrorComponent),
        MockComponent(HeaderSimpleComponent),
      ],
      providers: [{ provide: AppFacade, useFactory: () => instance(appFacade) }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
    expect(element).toBeTruthy();
    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it('should render default header component if no headerType is set', () => {
    fixture.detectChanges();
    expect(findAllCustomElements(element)).toMatchInlineSnapshot(`
      [
        "ish-header-default",
        "ish-back-to-top",
      ]
    `);
  });

  it('should render simple header component if set', () => {
    when(appFacade.headerType$).thenReturn(of('simple'));
    fixture.detectChanges();
    expect(findAllCustomElements(element)).toMatchInlineSnapshot(`
      [
        "ish-header-simple",
        "ish-back-to-top",
      ]
    `);
  });

  it('should render error header component if set', () => {
    when(appFacade.headerType$).thenReturn(of('error'));
    fixture.detectChanges();
    expect(findAllCustomElements(element)).toMatchInlineSnapshot(`
      [
        "ish-header-error",
        "ish-back-to-top",
      ]
    `);
  });

  it('should render checkout header component if set', () => {
    when(appFacade.headerType$).thenReturn(of('checkout'));
    fixture.detectChanges();
    expect(findAllCustomElements(element)).toMatchInlineSnapshot(`
      [
        "ish-header-checkout",
        "ish-back-to-top",
      ]
    `);
  });
});
