import { Component } from '@angular/core';
import { Product } from '../../../types';
import { CommonModule } from '@angular/common';
import {ProductComponent} from "../../../components/product/product.component";
import {RouterLink, RouterLinkActive} from "@angular/router";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ProductComponent, CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {}
