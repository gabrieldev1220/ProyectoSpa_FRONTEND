import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ReservaService } from '@core/services/reserva.service';
import { EmpleadoService } from '@core/services/empleado.service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-reserva',
  standalone: false,
  templateUrl: './reserva.component.html',
  styleUrls: ['./reserva.component.scss']
})
export class ReservaComponent implements OnInit {
  servicio: string | null = null;
  fechaReserva: string = '';
  empleadoId: number | null = null;
  clienteId: number | null = null;
  empleadosDisponibles: any[] = [];

  // Lista de servicios (copiada de NavbarComponent)
  serviciosIndividuales = [
    {
      categoria: 'Masajes',
      items: [
        { nombre: 'Anti-stress', descripcion: 'Un masaje relajante para aliviar el estrés.', precio: 5000, imagen: 'assets/images/anti-stress.jpg', enum: 'ANTI_STRESS' },
        { nombre: 'Descontracturantes', descripcion: 'Ideal para aliviar tensiones musculares.', precio: 5500, imagen: 'assets/images/descontracturante.jpg', enum: 'DESCONTRACTURANTE' },
        { nombre: 'Masajes con piedras calientes', descripcion: 'Relajación profunda con piedras calientes.', precio: 6000, imagen: 'assets/images/piedras-calientes.jpg', enum: 'PIEDRAS_CALIENTES' },
        { nombre: 'Circulatorios', descripcion: 'Mejora la circulación y reduce la retención de líquidos.', precio: 5200, imagen: 'assets/images/circulatorio.jpg', enum: 'CIRCULATORIO' }
      ]
    },
    {
      categoria: 'Belleza',
      items: [
        { nombre: 'Lifting de pestañas', descripcion: 'Realza tus pestañas con un efecto natural.', precio: 3500, imagen: 'assets/images/lifting-pestanas.jpg', enum: 'LIFTING_PESTANAS' },
        { nombre: 'Depilación facial', descripcion: 'Elimina el vello facial con técnicas suaves.', precio: 2000, imagen: 'assets/images/depilacionfacial.jpg', enum: 'DEPILACION_FACIAL' },
        { nombre: 'Belleza de manos y pies', descripcion: 'Manicura y pedicura para un cuidado completo.', precio: 4000, imagen: 'assets/images/belleza-manos-pies.jpg', enum: 'BELLEZA_MANOS_PIES' }
      ]
    },
    {
      categoria: 'Tratamientos Faciales',
      items: [
        { nombre: 'Punta de Diamante', descripcion: 'Microexfoliación para una piel renovada.', precio: 4500, imagen: 'assets/images/punta-diamante.jpg', enum: 'PUNTA_DIAMANTE' },
        { nombre: 'Limpieza profunda + Hidratación', descripcion: 'Limpieza e hidratación para un rostro radiante.', precio: 4800, imagen: 'assets/images/limpieza-profunda.jpg', enum: 'LIMPIEZA_PROFUNDA' },
        { nombre: 'Crio frecuencia facial', descripcion: 'Efecto lifting instantáneo con shock térmico.', precio: 6000, imagen: 'assets/images/crio-frecuencia-facial.jpg', enum: 'CRIO_FRECUENCIA_FACIAL' }
      ]
    },
    {
      categoria: 'Tratamientos Corporales',
      items: [
        { nombre: 'VelaSlim', descripcion: 'Reducción de circunferencia corporal y celulitis.', precio: 7000, imagen: 'assets/images/velaslim.jpg', enum: 'VELASLIM' },
        { nombre: 'DermoHealth', descripcion: 'Drenaje linfático y estimulación de microcirculación.', precio: 6500, imagen: 'assets/images/dermohealth.jpg', enum: 'DERMOHEALTH' },
        { nombre: 'Criofrecuencia', descripcion: 'Efecto lifting instantáneo para el cuerpo.', precio: 7500, imagen: 'assets/images/criofrecuencia.jpg', enum: 'CRIOFRECUENCIA' },
        { nombre: 'Ultracavitación', descripcion: 'Técnica reductora para moldear el cuerpo.', precio: 6800, imagen: 'assets/images/ultracavitacion.jpg', enum: 'ULTRACAVITACION' }
      ]
    }
  ];

  serviciosGrupales = [
    {
      categoria: 'Servicios Grupales',
      items: [
        { nombre: 'Hidromasajes', descripcion: 'Sesiones relajantes en hidromasaje.', precio: 3000, imagen: 'assets/images/hidromasajes.jpg', enum: 'HIDROMASAJES' },
        { nombre: 'Yoga', descripcion: 'Clases de yoga para grupos.', precio: 2500, imagen: 'assets/images/yoga1.jpg', enum: 'YOGA' }
      ]
    }
  ];

  // Combinar todos los servicios en una lista plana para el <select>
  serviciosList: { nombre: string, enum: string }[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private reservaService: ReservaService,
    private empleadoService: EmpleadoService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    // Combinar servicios individuales y grupales en una lista plana
    this.serviciosList = [];
    this.serviciosIndividuales.forEach(categoria => {
      categoria.items.forEach(item => {
        this.serviciosList.push({ nombre: item.nombre, enum: item.enum });
      });
    });
    this.serviciosGrupales.forEach(categoria => {
      categoria.items.forEach(item => {
        this.serviciosList.push({ nombre: item.nombre, enum: item.enum });
      });
    });

    // Cargar el servicio desde los query params (si existe)
    this.route.queryParams.subscribe(params => {
      this.servicio = params['servicio'] || null;
    });

    // Verificar autenticación y obtener clienteId
    const clienteIdString = this.authService.getUserId();
    this.clienteId = clienteIdString ? parseInt(clienteIdString, 10) : null;
    if (!this.clienteId || !this.authService.isLoggedIn()) {
      this.toastr.warning('Debes iniciar sesión para hacer una reserva.', 'Advertencia');
      this.router.navigate(['/']);
      const modal = document.getElementById('loginModal') as HTMLElement;
      if (modal) {
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
      }
      return;
    }

    // Cargar la lista de empleados
    this.empleadoService.getAllEmpleados().subscribe({
      next: (empleados) => {
        this.empleadosDisponibles = empleados;
        if (empleados.length > 0) {
          this.toastr.success('Lista de empleados cargada correctamente.', 'Éxito');
        } else {
          this.toastr.info('No hay empleados disponibles en este momento.', 'Información');
        }
      },
      error: (error) => {
        console.error('Error al obtener empleados:', error);
        this.toastr.error(error.message || 'Error al cargar la lista de empleados. Por favor, intenta de nuevo.', 'Error');
      }
    });
  }

  hacerReserva() {
    if (!this.fechaReserva || !this.empleadoId || !this.clienteId || !this.servicio) {
      this.toastr.warning('Por favor, completa todos los campos requeridos.', 'Advertencia');
      return;
    }

    const reserva = {
      cliente: { id: this.clienteId },
      empleado: { id: this.empleadoId },
      fechaReserva: new Date(this.fechaReserva).toISOString(),
      servicio: this.servicio,
      status: 'PENDIENTE'
    };

    this.reservaService.createReserva(reserva).subscribe({
      next: (response) => {
        // Se tuiliza response.message si existe, o un mensaje por defecto
        this.toastr.success(response.message || 'Reserva creada exitosamente.', 'Éxito');
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Error al crear la reserva:', error);
        this.toastr.error(error.error?.message || 'Error al crear la reserva. Por favor, intenta de nuevo.', 'Error');
      }
    });
  }
}