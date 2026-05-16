import { Component, inject } from '@angular/core';
import { RemoteConfigService } from './core/services/remote-config.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  /** Servicio de feature flags inyectado para controlar visibilidad del menú */
  remoteConfig = inject(RemoteConfigService);
}
