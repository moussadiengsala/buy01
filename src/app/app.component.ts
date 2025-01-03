import { Component, ViewEncapsulation } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {FooterComponent} from "./components/layout/footer/footer.component";
import {NavbarComponent} from "./components/layout/navbar/navbar.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, ],
  template: `
    <div class="w-full h-fit min-h-screen flex justify-center bg-white">
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
