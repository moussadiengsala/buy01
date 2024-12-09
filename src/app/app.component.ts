import { Component, ViewEncapsulation } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './core/layout/navbar/navbar.component';
import { FooterComponent } from "./core/layout/footer/footer.component";
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, ],
  template: `
    <div class="w-full h-fit min-h-screen flex justify-center bg-black text-white">
      <div class="max-w-7xl w-full">
        <app-navbar />
        <div class="flex justify-center w-full my-5">
            <router-outlet />
        </div>
        <app-footer />
      </div>
    </div>
  `
})

export class AppComponent {
  title = 'startup-angular';
}
