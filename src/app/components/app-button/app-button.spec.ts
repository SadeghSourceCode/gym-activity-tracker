import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppButton } from './app-button';

describe('AppButton', () => {
  let component: AppButton;
  let fixture: ComponentFixture<AppButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppButton],
    }).compileComponents();

    fixture = TestBed.createComponent(AppButton);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply default button classes', () => {
    fixture.detectChanges();

    const button = getButton();

    expect(button.classList.contains('app-button--medium')).toBe(true);
    expect(button.classList.contains('app-button--fill')).toBe(true);
    expect(button.classList.contains('app-button--section')).toBe(true);
  });

  it('should apply configured size, variant, mode, and active state', () => {
    fixture.componentRef.setInput('size', 'large');
    fixture.componentRef.setInput('variant', 'outline');
    fixture.componentRef.setInput('mode', 'form');
    fixture.componentRef.setInput('active', true);
    fixture.detectChanges();

    const button = getButton();

    expect(button.classList.contains('app-button--large')).toBe(true);
    expect(button.classList.contains('app-button--outline')).toBe(true);
    expect(button.classList.contains('app-button--form')).toBe(true);
    expect(button.classList.contains('app-button--active')).toBe(true);
    expect(button.getAttribute('aria-pressed')).toBe('true');
  });

  it('should change font size from the size input', () => {
    fixture.componentRef.setInput('size', 'small');
    fixture.detectChanges();
    const smallFontSize = getComputedStyle(getButton()).fontSize;

    fixture.componentRef.setInput('size', 'large');
    fixture.detectChanges();
    const largeFontSize = getComputedStyle(getButton()).fontSize;

    expect(smallFontSize).toBe('0.75rem');
    expect(largeFontSize).toBe('1rem');
  });

  it('should render loading spinner instead of projected content', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    const button = getButton();

    expect(button.disabled).toBe(true);
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.querySelector('.app-button__spinner')).toBeTruthy();
  });

  it('should emit click when enabled', () => {
    const emittedEvents: MouseEvent[] = [];
    component.buttonClicked.subscribe((event) => emittedEvents.push(event));
    fixture.detectChanges();

    getButton().click();

    expect(emittedEvents.length).toBe(1);
  });

  it('should not emit click when disabled or loading', () => {
    const emittedEvents: MouseEvent[] = [];
    component.buttonClicked.subscribe((event) => emittedEvents.push(event));

    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    getButton().click();

    fixture.componentRef.setInput('disabled', false);
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    getButton().click();

    expect(emittedEvents.length).toBe(0);
  });

  function getButton(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('button') as HTMLButtonElement;
  }
});
