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
          <ion-button (click)="close()">Cancelar</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium" style="color: var(--app-text)">Numero de TAG</label>
          <ion-input
            [(ngModel)]="numeroTag"
            placeholder="Ej: 1001"
            type="number"
            class="input-tablet"
          ></ion-input>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium" style="color: var(--app-text)">Tipo de ubicacion</label>
          <ion-select [(ngModel)]="tipo" placeholder="Seleccionar" class="input-tablet">
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
