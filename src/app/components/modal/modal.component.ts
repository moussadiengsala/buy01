import {Component, EventEmitter, inject, OnInit, Output, ViewChild} from "@angular/core";
import {CdkPortal, PortalModule} from "@angular/cdk/portal";
import {Overlay, OverlayConfig} from "@angular/cdk/overlay";
import {DialogModule} from "primeng/dialog";


@Component({
    selector: 'app-modal',
    imports: [PortalModule, DialogModule],
    standalone: true,
    template: `
        <ng-template cdkPortal class="">
            <div class="modal">
                <ng-content select="[modal-body]"></ng-content>
            </div>
        </ng-template>
    `,
    styles: [`
        /*:host {*/
        /*    display: block;*/
        /*}*/
        
        /*.modal {*/
        /*    background: white;*/
        /*    padding: 20px;*/
        /*    border-radius: 8px;*/
        /*    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);*/
        /*    min-width: 300px;*/
        /*    max-width: 90vw;*/
        /*    max-height: 90vh;*/
        /*    overflow: auto;*/
        /*}*/
    `]
})
export class ModalComponent implements OnInit {
    @ViewChild(CdkPortal) portal: CdkPortal | undefined;
    @Output() close = new EventEmitter();

    overlay = inject(Overlay)
    overlayConfig = new OverlayConfig({
        // hasBackdrop: true,
        positionStrategy: this.overlay
            .position()
            .global()
            .centerVertically()
            .centerVertically(),
        scrollStrategy: this.overlay.scrollStrategies.block(),
        minWidth: 500
    })
    overlayRef = this.overlay.create(this.overlayConfig)

    ngOnInit(): void {
        this.overlayRef.backdropClick().subscribe(() => {
            this.close.emit()
        })
    }

    ngAfterViewInit(): void {
        this.overlayRef?.attach(this.portal)
    }

    ngOnDestroy(): void {
        this.overlayRef?.detach()
        this.overlayRef?.dispose()
    }
}