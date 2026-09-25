import { Component, inject, signal } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-crear-tag-modal',
  standalone: true,
  imports: [IonicModule, FormsModule],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Crear TAG nuevo</ion-title>
        <ion-buttons slot="end">
          <ion-button aria-label="Cancelar" (click)="close()">Cancelar</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <span class="field-label" id="crear-tag-numero-label">Numero de TAG</span>
          <ion-input
            id="crear-tag-numero"
            [(ngModel)]="numeroTag"
            (ionInput)="onNumeroInput($event)"
            aria-label="Numero de TAG"
            aria-labelledby="crear-tag-numero-label"
            placeholder="Ej: 1001"
            type="number"
            inputmode="numeric"
            enterkeyhint="next"
            min="1"
            class="input-base"
          ></ion-input>
        </div>

        <div class="flex flex-col gap-2">
          <span class="field-label" id="crear-tag-tipo-label">Tipo de ubicacion</span>
          <ion-select id="crear-tag-tipo" aria-label="Tipo de ubicacion" aria-labelledby="crear-tag-tipo-label" [(ngModel)]="tipo" placeholder="Seleccionar" class="input-base" interface="popover">
            <ion-select-option value="ALTILLO">ALTILLO</ion-select-option>
            <ion-select-option value="PDV">PDV</ion-select-option>
            <ion-select-option value="OTRO">OTRO</ion-select-option>
          </ion-select>
        </div>

        <ion-button
          class="btn-primary"
          expand="block"
          (click)="crear()"
          [disabled]="!numeroTag() || numeroTag()! <= 0 || !tipo()"
        >
          <ion-icon name="add-circle-outline" slot="start"></ion-icon>
          Crear TAG
        </ion-button>
      </div>
    </ion-content>
  `,
})
export class CrearTagModalComponent {
  private modalCtrl = inject(ModalController);

  numeroTag = signal<number | null>(null);
  tipo = signal('ALTILLO');

  onNumeroInput(event: CustomEvent<{ value?: string | number | null }>) {
    const raw = String(event.detail.value ?? '');
    if (raw.length > 15) {
      const limited = raw.slice(0, 15);
      this.numeroTag.set(Number(limited));
    }
  }

  crear() {
    const tipoMap: Record<string, number> = { ALTILLO: 1, PDV: 2, OTRO: 3 };
    this.modalCtrl.dismiss({
      numero_tag: this.numeroTag(),
      id_tipo_ubicacion: tipoMap[this.tipo()] || 1,
    });
  }

  close() {
    this.modalCtrl.dismiss(null);
  }
}
