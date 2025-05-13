import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Reserva } from '../models/reserva';
import { AuthService } from './auth.service';
import { environment } from '@environments/environment';

// Se define una interfaz para la respuesta del backend
interface ReservaResponse {
  message?: string;
  data?: Reserva;
}

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  private apiUrl = `${environment.apiUrl}/api/clientes/reservas`;
  private adminApiUrl = `${environment.apiUrl}/api/admin/reservas`;
  private serviciosUrl = `${environment.apiUrl}/api/servicios`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // Métodos para Clientes
  getReservas(): Observable<Reserva[]> {
    const clienteId = this.authService.getUserId();
    if (!clienteId) {
      console.error('No se encontró clienteId. Asegúrate de estar autenticado.');
      throw new Error('No se encontró clienteId. Por favor, inicia sesión nuevamente.');
    }
    const url = `${environment.apiUrl}/api/clientes/${clienteId}/reservas`;
    return this.http.get<Reserva[]>(url, { headers: this.getHeaders() }).pipe(
      tap(reservas => console.log('Reservas obtenidas:', reservas)),
      catchError(error => {
        console.error('Error al obtener reservas:', error);
        throw error;
      })
    );
  }

  createReserva(reserva: any): Observable<ReservaResponse> { // Cambiamos el tipo de retorno
    return this.http.post<ReservaResponse>(this.apiUrl, reserva, { headers: this.getHeaders() }).pipe(
      tap(response => console.log('Reserva creada:', response)),
      catchError(error => {
        console.error('Error al crear reserva:', error);
        throw error;
      })
    );
  }

  // Métodos para los Administradores o empleados que tengan el rol de GERENTE_GENERAL
  getAllReservas(): Observable<Reserva[]> {
    const headers = this.getHeaders();
    console.log('Token enviado:', headers.get('Authorization')); // Verifica el token
    return this.http.get<Reserva[]>(this.adminApiUrl, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('Error al obtener reservas:', error);
        throw error;
      })
    );
  }

  // Metodo para mostrar lista de reservas a RECEPCIONISTA.
  recepcionistaApiUrl = `${environment.apiUrl}/api/recepcionista/reservas`;

  getReservasForRecepcionista(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(this.recepcionistaApiUrl, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('Error al obtener reservas para recepcionista:', error);
        throw error;
      })
    );
  }

  updateReserva(id: number, reserva: any): Observable<Reserva> {
    return this.http.put<Reserva>(`${this.adminApiUrl}/${id}`, reserva, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('Error al actualizar reserva:', error);
        throw error;
      })
    );
  }

  deleteReserva(id: number): Observable<void> {
    return this.http.delete<void>(`${this.adminApiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('Error al eliminar reserva:', error);
        throw error;
      })
    );
  }

  getServicios(): Observable<string[]> {
    return this.http.get<string[]>(this.serviciosUrl, { headers: this.getHeaders() }).pipe(
      tap(servicios => console.log('Servicios obtenidos:', servicios)),
      catchError(error => {
        console.error('Error al obtener servicios:', error);
        throw error;
      })
    );
  }
}