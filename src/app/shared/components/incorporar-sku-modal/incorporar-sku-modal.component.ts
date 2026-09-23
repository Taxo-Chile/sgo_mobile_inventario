import { Component, inject, signal } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ValidacionCaptura, IncorporarSKU } from '../../../domain/validacion/models/validacion.model';
import { VALIDACION_REPOSITORY } from '../../../core/tokens/repository.tokens';
import { ValidacionRepository } from '../../../domain/validacion/repositories/validacion.repository';
import { NotificationService } from '../../services/notification.service';

interface ProductoEncontrado {
  id_producto: number;
  sku: string;
  descripcion_producto: string;
  codigo_barras: string;
}

@Component({
  selector: 'app-incorporar-sku-modal',
  standalone: true,
  imports: [IonicModule, FormsModule],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Incorporar SKU</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="close()">Cancelar</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="flex flex-col gap-4">
        <!-- Buscar producto -->
        <div class="flex flex-col gap-2">
          <label style="font-size: 14px; font-weight: 500; color: #000;">Buscar SKU / Código de barras</label>
          <div class="flex gap-2">
            <ion-input
              [(ngModel)]="busqueda"
              placeholder="Ej: 9010696"
              type="text"
              class="input-tablet flex-1"
              (keyup.enter)="buscarProducto()"
            ></ion-input>
            <ion-button expand="block" fill="outline" color="medium" (click)="buscarProducto()" [disabled]="buscando()">
              Buscar
            </ion-button>
          </div>
        </div>

        <!-- Resultados de búsqueda -->
        @if (productosEncontrados().length > 0) {
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium">Seleccionar producto</label>
            <div class="flex flex-col gap-1" style="max-height: 200px; overflow-y: auto;">
              @for (prod of productosEncontrados(); track prod.id_producto) {
                <div 
                  style="padding: 10px; border: 1px solid #ddd; border-radius: 8px; cursor: pointer;"
                  [style.background]="productoSeleccionado()?.id_producto === prod.id_producto ? '#e8f5e9' : '#fff'"
                  (click)="seleccionarProducto(prod)"
                >
                  <div style="font-weight: bold; color: #000;">{{ prod.sku }}</div>
                  <div style="font-size: 12px; color: #666;">{{ prod.descripcion_producto }}</div>
                </div>
              }
            </div>
          </div>
        }

        @if (productoSeleccionado()) {
          <div style="background: #f5f5f5; padding: 12px; border-radius: 8px;">
            <div style="font-size: 11px; color: #666; margin-bottom: 4px;">Producto seleccionado:</div>
            <div style="font-weight: bold; color: #000;">{{ productoSeleccionado()?.sku }} - {{ productoSeleccionado()?.descripcion_producto }}</div>
          </div>
        }

        <!-- Cantidad -->
        <div class="flex flex-col gap-2">
          <label style="font-size: 14px; font-weight: 500; color: #000;">Cantidad</label>
          <ion-input
            [(ngModel)]="cantidad"
            placeholder="0"
            type="number"
            class="input-tablet"
          ></ion-input>
        </div>

        <!-- Unidad de medida -->
        <div class="flex flex-col gap-2">
          <label style="font-size: 14px; font-weight: 500; color: #000;">Unidad de medida</label>
          <ion-select [(ngModel)]="unidadMedida" placeholder="Seleccionar" class="input-tablet">
            <ion-select-option value="UN">UN</ion-select-option>
            <ion-select-option value="BLS">BLS</ion-select-option>
            <ion-select-option value="KG">KG</ion-select-option>
            <ion-select-option value="LT">LT</ion-select-option>
            <ion-select-option value="M2">M2</ion-select-option>
            <ion-select-option value="ML">ML</ion-select-option>
          </ion-select>
        </div>

        <!-- Motivo -->
        <div class="flex flex-col gap-2">
          <label style="font-size: 14px; font-weight: 500; color: #000;">Motivo de incorporación</label>
          <ion-textarea
            [(ngModel)]="motivo"
            placeholder="Ej: Producto no detectado en conteo PDA"
            rows="3"
            class="input-tablet"
          ></ion-textarea>
        </div>

        <ion-button
          class="btn-primary"
          expand="block"
          (click)="incorporar()"
          [disabled]="!productoSeleccionado() || !cantidad() || cantidad()! <= 0 || !motivo()?.trim() || guardando()"
        >
          @if (guardando()) {
            <ion-spinner name="crescent" slot="start"></ion-spinner>
            Guardando...
          } @else {
            <ion-icon name="add-circle-outline" slot="start"></ion-icon>
            Incorporar
          }
        </ion-button>
      </div>
    </ion-content>
  `,
})
export class IncorporarSkuModalComponent {
  private modalCtrl = inject(ModalController);
  private validacionRepo = inject<ValidacionRepository>(VALIDACION_REPOSITORY);
  private notification = inject(NotificationService);

  agendaId = 0;
  tagId = 0;
  tagTipo = '';

  busqueda = signal('');
  buscando = signal(false);
  guardando = signal(false);
  productosEncontrados = signal<ProductoEncontrado[]>([]);
  productoSeleccionado = signal<ProductoEncontrado | null>(null);
  cantidad = signal<number | null>(null);
  unidadMedida = signal('UN');
  motivo = signal('');

  buscarProducto() {
    const q = this.busqueda().trim();
    if (!q || !this.agendaId) return;

    this.buscando.set(true);
    this.productosEncontrados.set([]);
    this.productoSeleccionado.set(null);

    this.validacionRepo.buscarProductos(this.agendaId, q).subscribe({
      next: (productos) => {
        this.productosEncontrados.set(productos);
        this.buscando.set(false);
      },
      error: () => {
        this.buscando.set(false);
      },
    });
  }

  seleccionarProducto(prod: ProductoEncontrado) {
    this.productoSeleccionado.set(prod);
  }

  incorporar() {
    const prod = this.productoSeleccionado();
    if (!prod || !this.cantidad() || this.cantidad()! <= 0 || !this.motivo().trim()) return;

    this.guardando.set(true);

    const data: IncorporarSKU = {
      agenda_id: this.agendaId,
      tag_id: this.tagId,
      id_producto: prod.id_producto,
      cantidad: this.cantidad()!,
      motivo: this.motivo().trim(),
      login: 'APP_TABLET',
    };

    this.validacionRepo.incorporarSKU(data).subscribe({
      next: () => {
        const nuevaCaptura: ValidacionCaptura = {
          id_conteo_det_c1: Date.now(),
          id_producto: prod.id_producto,
          producto_nombre: prod.descripcion_producto,
          producto_sku: prod.sku,
          c1_cantidad: 0,
          c2_cantidad: this.cantidad(),
          unidad_medida: this.unidadMedida(),
          estado: 'MODIFICADA',
          motivo: `Incorporado: ${this.motivo()}`,
          login_operador: 'APP_TABLET',
          fecha_captura: new Date().toISOString(),
        };
        this.guardando.set(false);
        this.modalCtrl.dismiss(nuevaCaptura);
      },
      error: (err) => {
        this.guardando.set(false);
        this.notification.error(err?.message || 'Error al incorporar SKU. Intente nuevamente.');
      },
    });
  }

  close() {
    this.modalCtrl.dismiss(null);
  }
}
