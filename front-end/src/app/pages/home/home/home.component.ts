import { Component } from '@angular/core';
import { Product } from '../../../types';
import { CommonModule } from '@angular/common';
import {RouterLink, RouterLinkActive} from "@angular/router";

@Component({
    selector: 'app-home',
    imports: [CommonModule, RouterLink, RouterLinkActive],
    standalone: true,
    templateUrl: './home.component.html',
    styleUrl: './home.component.css'
})
export class HomeComponent {}
