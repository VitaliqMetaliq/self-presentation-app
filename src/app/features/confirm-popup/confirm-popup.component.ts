import { CommonModule } from "@angular/common";
import { Component, input, output } from "@angular/core";

@Component({
    selector: 'app-confirm-popup',
    templateUrl: './confirm-popup.component.html',
    styleUrls: [ './confirm-popup.component.scss' ],
    imports: [ CommonModule ],
    standalone: true,
})
export class ConfirmPopupComponent {
    public isOpen = input.required<boolean>();
    public title = input.required<string>();
    public message = input.required<string>();
    public confirmText = input.required<string>();
    public cancelText = input.required<string>();

    public confirm = output();
    public cancel = output();

    public onBackdropClick() {
        this.cancel.emit();
    }
}