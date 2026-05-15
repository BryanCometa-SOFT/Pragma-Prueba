import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  /**
   * AppComponent actúa únicamente como shell de la aplicación.
   * No contiene lógica de negocio: la inicialización de datos se realiza
   * vía APP_INITIALIZER en AppModule, y el contenido se delega al
   * ion-router-outlet mediante lazy loading de feature modules.
   */
  constructor() {}
}
