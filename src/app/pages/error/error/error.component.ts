import {Component, inject} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {switchMap} from "rxjs";

@Component({
    selector: 'app-error',
    imports: [
        RouterLink
    ],
    standalone: true,
    templateUrl: './error.component.html'
})
export class ErrorComponent {

    message: string = "Something went wrong!"
    status: number = 500

    private readonly route = inject(ActivatedRoute);

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
                let status: string | null = params.get('status')
                let message: string | null = params.get('message')

                if (status) this.status = Number(status)
                if (message) this.message = message;
                return;
            }
        )
    }
}
