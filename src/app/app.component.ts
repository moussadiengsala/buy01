import { Component, ViewEncapsulation } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {FooterComponent} from "./components/layout/footer/footer.component";
import {NavbarComponent} from "./components/layout/navbar/navbar.component";
import {CdkPortalOutlet} from "@angular/cdk/portal";

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, NavbarComponent, FooterComponent, CdkPortalOutlet],
    standalone: true,
    template: `
    <div class="w-full h-fit min-h-screen flex justify-center bg-white">
      <div class="max-w-7xl w-full">
        <app-navbar />
        <div class="flex justify-center w-full mt-16">
            <router-outlet />
        </div>
        <div id="dialog-container">
          <ng-template cdkPortalOutlet></ng-template>
        </div>
        <app-footer />
      </div>
    </div>
  `
})

export class AppComponent {
  title = 'startup-angular';
}
