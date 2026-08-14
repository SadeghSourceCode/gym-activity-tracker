import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppHeader } from './app-header';

describe('AppHeader', () => {
  let fixture: ComponentFixture<AppHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AppHeader] }).compileComponents();
    fixture = TestBed.createComponent(AppHeader);
    fixture.componentRef.setInput('config', {
      title: 'Statistics',
      leftButton: { ariaLabel: 'Go back', mode: 'iconOnly' },
      rightButton: { ariaLabel: 'Open settings', mode: 'iconOnly' },
    });
    fixture.detectChanges();
  });

  it('renders the configured title and two buttons', () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('h1')?.textContent?.trim()).toBe('Statistics');
    expect(element.querySelectorAll('button')).toHaveLength(2);
  });

  it('emits a unique output for each button', () => {
    const leftButtonClicked = vi.fn();
    const rightButtonClicked = vi.fn();
    const subscriptionA = fixture.componentInstance.leftButtonClicked.subscribe(leftButtonClicked);
    const subscriptionB =
      fixture.componentInstance.rightButtonClicked.subscribe(rightButtonClicked);
    const [leftButton, rightButton] = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('button'),
    );

    leftButton.click();
    rightButton.click();

    expect(leftButtonClicked).toHaveBeenCalledOnce();
    expect(rightButtonClicked).toHaveBeenCalledOnce();

    subscriptionA.unsubscribe();
    subscriptionB.unsubscribe();
  });
});
