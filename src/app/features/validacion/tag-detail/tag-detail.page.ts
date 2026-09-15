import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule, ModalController } from '@ionic/angular';
import { ValidacionState } from '../../../state/validacion/validacion.state';
import { GetTAGDetalleUseCase } from '../../../application/validacion/get-tag-detalle.usecase';
import { NotificationService } from '../../../shared/services/notification.service';
import { ConnectivityBannerComponent } from '../../../shared/components/connectivity-banner/connectivity-banner.component';
import { ValidacionCaptura } from '../../../domain/validacion/models/validacion.model';
import { IncorporarSkuModalComponent } from '../../../shared/components/incorporar-sku-modal/incorporar-sku-modal.component';

@Component({
  selector: 'app-tag-detail',
  standalone: true,
  imports: [IonicModule, ConnectivityBannerComponent],
  templateUrl: './tag-detail.page.html',
  styleUrls: ['./tag-detail.page.scss'],
})
export class TagDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private validacionState = inject(ValidacionState);
  private getTAGDetalle = inject(GetTAGDetalleUseCase);
  private notification = inject(NotificationService);
  private modalCtrl = inject(ModalController);

  validacionTAG = this.validacionState.validacionTAG;
  capturas = this.validacionState.capturas;
  loading = this.validacionState.loading;
  totalPendientes = this.validacionState.totalPendientes;
  totalConfirmadas = this.validacionState.totalConfirmadas;
  totalModificadas = this.validacionState.totalModificadas;
  puedeConfirmar = this.validacionState.puedeConfirmar;

  ngOnInit() {
    const tagId = Number(this.route.snapshot.paramMap.get('id'));
    if (!tagId) {
      this.router.navigate(['/home']);
      return;
    }

    this.getTAGDetalle.execute(tagId).subscribe({
      error: (err) => {
        this.notification.error(err.message);
        this.router.navigate(['/home']);
      },
    });
  }

  openCapture(captura: ValidacionCaptura) {
    this.router.navigate(['/tag', this.validacionTAG()?.tag?.id, 'capture', captura.captura_id]);
  }

  confirmarTAG() {
    // TODO: Implement confirmation
    this.notification.success('TAG confirmado correctamente');
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  async openIncorporar() {
    const tag = this.validacionTAG()?.tag;
    if (!tag) return;

    const modal = await this.modalCtrl.create({
      component: IncorporarSkuModalComponent,
      componentProps: { tagId: tag.id, tagTipo: tag.tipo },
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      this.validacionState.agregarCaptura(data);
      this.notification.success('SKU incorporado correctamente');
    }
  }
}
