import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppHeader } from './app-header';

describe('AppHeader', () => {
  let fixture: ComponentFixture<AppHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AppHeader] }).compileComponents();
    fixture = TestBed.createComponent(AppHeader);
    fixture.componentRef.setInput('config', {
      title: 'Statistics',
      leftButton: {
        buttonId: 'back-button',
        ariaLabel: 'Go back',
        mode: 'iconOnly',
        icon: 'fa-solid fa-arrow-left',
      },
      rightButton: { title: 'Save', mode: 'form' },
    });
    fixture.detectChanges();
  });

  it('renders the configured title and valid buttons', () => {
    const element = fixture.nativeElement as HTMLElement;
    const buttons = element.querySelectorAll('button');

    expect(element.querySelector('h1')?.textContent?.trim()).toBe('Statistics');
    expect(buttons).toHaveLength(2);
    expect(buttons[0].id).toBe('back-button');
    expect(buttons[0].querySelector('i')?.classList.contains('fa-arrow-left')).toBe(true);
    expect(buttons[1].textContent?.trim()).toBe('Save');
  });

  it('keeps the title in an independently centered layer when there are no buttons', () => {
    fixture.componentRef.setInput('config', { title: 'Workouts' });
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const title = element.querySelector('h1');

    expect(element.querySelectorAll('button')).toHaveLength(0);
    expect(title?.textContent?.trim()).toBe('Workouts');
    expect(title?.classList.contains('absolute')).toBe(true);
    expect(title?.classList.contains('text-center')).toBe(true);
  });

  it('does not render buttons whose required content is missing', () => {
    fixture.componentRef.setInput('config', {
      title: 'Workouts',
      leftButton: { mode: 'iconOnly', ariaLabel: 'Back' },
      rightButton: { mode: 'section', icon: 'fa-solid fa-check' },
    });
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).querySelectorAll('button')).toHaveLength(0);
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
