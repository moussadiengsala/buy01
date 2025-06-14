// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { HomeComponent } from './home.component';
// import { HttpClientTestingModule } from '@angular/common/http/testing';
// import { RouterTestingModule } from '@angular/router/testing';
// import { ActivatedRoute, convertToParamMap } from '@angular/router';
// import { of } from 'rxjs';
// import { By } from '@angular/platform-browser';
//
// describe('HomeComponent', () => {
//   let component: HomeComponent;
//   let fixture: ComponentFixture<HomeComponent>;
//
//   beforeEach(async () => {
//     await TestBed.configureTestingModule({
//       imports: [
//         HomeComponent,
//         HttpClientTestingModule,
//         RouterTestingModule
//       ],
//       providers: [
//         {
//           provide: ActivatedRoute,
//           useValue: {
//             paramMap: of(convertToParamMap({})),
//             queryParamMap: of(convertToParamMap({}))
//           }
//         }
//       ]
//     })
//     .compileComponents();
//
//     fixture = TestBed.createComponent(HomeComponent);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   });
//
//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });
//
//   describe('Template', () => {
//     it('should render the main heading', () => {
//       const heading = fixture.debugElement.query(By.css('h1'));
//       expect(heading.nativeElement.textContent).toContain('Elevate Your Shopping Experience');
//     });
//
//     it('should render the subheading', () => {
//       const subheading = fixture.debugElement.query(By.css('h2'));
//       expect(subheading.nativeElement.textContent).toContain('Your One-Stop Shop for Premium Products');
//     });
//
//     it('should render the description paragraph', () => {
//       const description = fixture.debugElement.query(By.css('p'));
//       expect(description.nativeElement.textContent).toContain('Discover curated collections of premium products');
//     });
//
//     it('should have two main action buttons', () => {
//       const buttons = fixture.debugElement.queryAll(By.css('button'));
//       expect(buttons.length).toBe(2);
//     });
//
//     it('should have "Start Shopping" button with correct router link', () => {
//       const startShoppingButton = fixture.debugElement.query(By.css('button:first-child'));
//       const link = startShoppingButton.query(By.css('a'));
//       expect(link.attributes['routerLink']).toBe('/products');
//       expect(startShoppingButton.nativeElement.textContent).toContain('Start Shopping');
//     });
//
//     it('should have "Create Account" button with correct router link', () => {
//       const createAccountButton = fixture.debugElement.query(By.css('button:last-child'));
//       const link = createAccountButton.query(By.css('a'));
//       expect(link.attributes['routerLink']).toBe('/auth/sign-up');
//       expect(createAccountButton.nativeElement.textContent).toContain('Create Account');
//     });
//
//     it('should display all feature items', () => {
//       const features = fixture.debugElement.queryAll(By.css('.flex.items-center.gap-2'));
//       expect(features.length).toBe(4);
//
//       const featureTexts = features.map(feature => feature.nativeElement.textContent.trim());
//       expect(featureTexts).toContain('Free Shipping');
//       expect(featureTexts).toContain('Secure Payments');
//       expect(featureTexts).toContain('Easy Returns');
//       expect(featureTexts).toContain('24/7 Support');
//     });
//   });
// });
