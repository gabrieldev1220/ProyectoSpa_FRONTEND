import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EmpleadoService } from '@core/services/empleado.service';
import { AuthService } from '@core/services/auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Empleado } from '@core/models/empleado';

@Component({
  selector: 'app-admin-empleados',
  standalone: false,
  templateUrl: './admin-empleados.component.html',
  styleUrls: ['./admin-empleados.component.scss']
})
export class AdminEmpleadosComponent implements OnInit {
  empleados: Empleado[] = [];
  newEmpleado: Empleado = { dni: '', nombre: '', apellido: '', email: '', password: '', telefono: '', rol: 'TERAPEUTA' };
  editingEmpleado: Empleado | null = null;
  roles: string[] = [];

  constructor(
    private empleadoService: EmpleadoService,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  formatRoleName(role: string): string {
    return role
      .replace(/_/g, ' ')
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  ngOnInit(): void {
    if (!this.authService.isGerenteGeneral()) {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.loadEmpleados();
    this.loadRoles();
  }

  loadRoles(): void {
    this.empleadoService.getAllRoles().subscribe({
      next: (roles) => {
        // Quitar el prefijo ROLE_ para mostrar en el formulario
        this.roles = roles.map(role => role.replace('ROLE_', ''));
        if (this.roles.length === 0) {
          this.toastr.warning('No se encontraron roles disponibles.', 'Advertencia');
        }
      },
      error: (error) => {
        this.toastr.error(error.message || 'Error al cargar los roles.', 'Error');
        console.error('Error al cargar roles:', error);
        if (error.message.includes('No estás autenticado')) {
          this.authService.logout();
        }
      }
    });
  }

  loadEmpleados(): void {
    this.empleadoService.getAllEmpleados().subscribe({
      next: (data) => {
        this.empleados = data;
        if (data.length === 0) {
          this.toastr.info('No hay empleados registrados.', 'Información');
        }
      },
      error: (error) => {
        this.toastr.error(error.message || 'Error al cargar los empleados.', 'Error');
        console.error('Error al cargar empleados:', error);
        if (error.message.includes('No estás autenticado')) {
          this.authService.logout();
        }
      }
    });
  }

  createEmpleado(): void {
    this.empleadoService.createEmpleado(this.newEmpleado).subscribe({
      next: () => {
        this.toastr.success('Empleado creado exitosamente.', 'Éxito');
        this.loadEmpleados();
        this.newEmpleado = { dni: '', nombre: '', apellido: '', email: '', password: '', telefono: '', rol: 'TERAPEUTA' };
      },
      error: (error) => {
        this.toastr.error(error.message || 'Error al crear el empleado.', 'Error');
        console.error('Error al crear empleado:', error);
        if (error.message.includes('No estás autenticado')) {
          this.authService.logout();
        }
      }
    });
  }

  editEmpleado(empleado: Empleado): void {
    this.editingEmpleado = { ...empleado };
    // Asegurarse de que el rol no tenga el prefijo ROLE_ al mostrarlo en el formulario
    if (this.editingEmpleado.rol.startsWith('ROLE_')) {
      this.editingEmpleado.rol = this.editingEmpleado.rol.replace('ROLE_', '');
    }
    // Abrir el modal usando Bootstrap
    const modalElement = document.getElementById('editEmpleadoModal') as HTMLElement;
    if (modalElement) {
      const modalInstance = new (window as any).bootstrap.Modal(modalElement);
      modalInstance.show();
    }
  }

  updateEmpleado(): void {
    if (this.editingEmpleado) {
      this.empleadoService.updateEmpleado(this.editingEmpleado.id!, this.editingEmpleado).subscribe({
        next: () => {
          this.toastr.success('Empleado actualizado exitosamente.', 'Éxito');
          this.loadEmpleados();
          this.editingEmpleado = null;
          // Cerrar el modal
          const modalElement = document.getElementById('editEmpleadoModal') as HTMLElement;
          if (modalElement) {
            const modalInstance = (window as any).bootstrap.Modal.getInstance(modalElement);
            modalInstance.hide();
          }
        },
        error: (error) => {
          this.toastr.error(error.message || 'Error al actualizar el empleado.', 'Error');
          console.error('Error al actualizar empleado:', error);
          if (error.message.includes('No estás autenticado')) {
            this.authService.logout();
          }
        }
      });
    }
  }

  deleteEmpleado(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este empleado?')) {
      this.empleadoService.deleteEmpleado(id).subscribe({
        next: () => {
          this.toastr.success('Empleado eliminado exitosamente.', 'Éxito');
          // Actualizar el arreglo localmente eliminando el empleado con el ID correspondiente
          this.empleados = this.empleados.filter(empleado => empleado.id !== id);          
        },
        error: (error) => {
          this.toastr.error(error.message || 'Error al eliminar el empleado.', 'Error');
          console.error('Error al eliminar empleado:', error);
          if (error.message.includes('No estás autenticado')) {
            this.authService.logout();
          }
        }
      });
    }
  }
}