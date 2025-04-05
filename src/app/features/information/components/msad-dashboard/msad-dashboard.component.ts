import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MsadService } from '../../services/msad.service';
import { ClientService } from 'src/app/shared/services/client.service';

@Component({
  selector: 'app-msad-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="p-6 bg-gray-50 min-h-screen">
      <h1 class="text-3xl font-bold mb-8 text-gray-800 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Sistema de Respaldos (MSAD)</h1>
      
      <!-- Spinner de carga -->
      <div *ngIf="loading" class="flex justify-center my-10">
        <svg class="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
      
      <!-- Mensaje de error -->
      <div *ngIf="error" class="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <svg class="h-6 w-6 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-red-800">{{ errorMessage }}</p>
          </div>
        </div>
      </div>
      
      <!-- Contenido principal -->
      <div *ngIf="!loading && !error" class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- Estado del servidor -->
        <div class="lg:col-span-5">
          <div class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden h-full">
            <div class="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-6 flex justify-between items-center">
              <h2 class="text-xl font-semibold flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
                Estado del Servidor
              </h2>
              <span 
                [ngClass]="serverStatus?.active ? 'bg-green-500' : 'bg-red-500'" 
                class="px-3 py-1 rounded-full text-sm font-semibold">
                {{ serverStatus?.active ? 'Activo' : 'Inactivo' }}
              </span>
            </div>
            <div class="p-6 space-y-6">
              <div class="space-y-4">
                <div class="flex items-center border-b border-gray-100 pb-4">
                  <div class="w-1/3 text-gray-600 font-medium">URL</div>
                  <div class="w-2/3">
                    <a *ngIf="serverStatus?.url" [href]="serverStatus.url" target="_blank" 
                      class="text-indigo-600 hover:text-indigo-800 flex items-center">
                      {{ serverStatus.url }}
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                    <span *ngIf="!serverStatus?.url">N/A</span>
                  </div>
                </div>
                <div class="flex items-center">
                  <div class="w-1/3 text-gray-600 font-medium">Puerto</div>
                  <div class="w-2/3">{{ serverStatus?.port || 'N/A' }}</div>
                </div>
              </div>
              
              <div class="pt-4 flex space-x-3">
                <button 
                  (click)="createBackup()" 
                  [disabled]="backupLoading"
                  class="flex items-center justify-center px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-md hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                  <span *ngIf="backupLoading" class="mr-2">
                    <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                  <svg *ngIf="!backupLoading" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Crear Respaldo
                </button>
                <button 
                  (click)="restartMsad()" 
                  [disabled]="restartLoading"
                  class="flex items-center justify-center px-5 py-3 border border-gray-300 bg-white text-gray-700 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                  <span *ngIf="restartLoading" class="mr-2">
                    <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                  <svg *ngIf="!restartLoading" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reiniciar Servicio
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Respaldos disponibles -->
        <div class="lg:col-span-7">
          <div class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div class="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-6">
              <h2 class="text-xl font-semibold flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                Respaldos Disponibles
              </h2>
            </div>
            <div class="p-6">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <!-- Respaldos diarios -->
                <div class="bg-blue-50 rounded-xl p-6 transition-all duration-200 hover:shadow-md">
                  <div class="flex items-center mb-4">
                    <div class="flex-shrink-0 bg-blue-500 rounded-full p-2">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 class="ml-3 text-lg font-medium text-blue-900">Diarios</h3>
                  </div>
                  <div class="flex justify-between items-center border-b border-blue-100 pb-2 mb-2">
                    <span class="text-blue-700">Cantidad:</span>
                    <span class="text-2xl font-bold text-blue-900">{{ backupStats?.daily?.count || 0 }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-blue-700">Tamaño:</span>
                    <span class="text-2xl font-bold text-blue-900">{{ formatSize(backupStats?.daily?.size) }}</span>
                  </div>
                </div>
                
                <!-- Respaldos semanales -->
                <div class="bg-green-50 rounded-xl p-6 transition-all duration-200 hover:shadow-md">
                  <div class="flex items-center mb-4">
                    <div class="flex-shrink-0 bg-green-500 rounded-full p-2">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h3 class="ml-3 text-lg font-medium text-green-900">Semanales</h3>
                  </div>
                  <div class="flex justify-between items-center border-b border-green-100 pb-2 mb-2">
                    <span class="text-green-700">Cantidad:</span>
                    <span class="text-2xl font-bold text-green-900">{{ backupStats?.weekly?.count || 0 }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-green-700">Tamaño:</span>
                    <span class="text-2xl font-bold text-green-900">{{ formatSize(backupStats?.weekly?.size) }}</span>
                  </div>
                </div>
                
                <!-- Respaldos mensuales -->
                <div class="bg-purple-50 rounded-xl p-6 transition-all duration-200 hover:shadow-md">
                  <div class="flex items-center mb-4">
                    <div class="flex-shrink-0 bg-purple-500 rounded-full p-2">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                      </svg>
                    </div>
                    <h3 class="ml-3 text-lg font-medium text-purple-900">Mensuales</h3>
                  </div>
                  <div class="flex justify-between items-center border-b border-purple-100 pb-2 mb-2">
                    <span class="text-purple-700">Cantidad:</span>
                    <span class="text-2xl font-bold text-purple-900">{{ backupStats?.monthly?.count || 0 }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-purple-700">Tamaño:</span>
                    <span class="text-2xl font-bold text-purple-900">{{ formatSize(backupStats?.monthly?.size) }}</span>
                  </div>
                </div>
              </div>
              
              <!-- Información de política de respaldos -->
              <div class="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
                <div class="flex items-start">
                  <div class="flex-shrink-0">
                    <svg class="h-6 w-6 text-indigo-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div class="ml-4">
                    <p class="text-sm font-medium text-indigo-800 mb-2">Los respaldos se crean automáticamente y se conservan según la política del sistema:</p>
                    <ul class="list-disc text-xs text-indigo-700 ml-4 space-y-1">
                      <li>7 respaldos diarios</li>
                      <li>4 respaldos semanales</li>
                      <li>6 respaldos mensuales</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MsadDashboardComponent implements OnInit {
  // Servicios
  private msadService = inject(MsadService);
  private clientService = inject(ClientService);
  
  // Estados
  loading = true;
  error = false;
  errorMessage = '';
  backupLoading = false;
  restartLoading = false;
  
  // Datos
  serverStatus: any = null;
  backupStats: any = null;
  storageInfo: any = null;
  
  ngOnInit(): void {
    this.loadMsadStatus();
  }
  
  loadMsadStatus(): void {
    this.loading = true;
    this.error = false;
    
    const clientId = this.clientService.getCurrentClientId();
    
    this.msadService.getMsadClientStats(clientId).subscribe({
      next: (data) => {
        if (data.success) {
          this.serverStatus = data.server;
          this.backupStats = data.backups;
          this.loading = false;
        } else {
          this.error = true;
          this.errorMessage = data.error || 'Error al cargar los datos de MSAD';
          this.loading = false;
        }
      },
      error: (error) => {
        this.error = true;
        this.errorMessage = 'Error al comunicarse con el servidor: ' + (error.message || error);
        this.loading = false;
      }
    });
  }
  
  createBackup(): void {
    this.backupLoading = true;
    
    this.msadService.createBackup().subscribe({
      next: (data) => {
        this.backupLoading = false;
        if (data.success) {
          // Recargar la información después de crear el respaldo
          this.loadMsadStatus();
        } else {
          this.error = true;
          this.errorMessage = data.error || 'Error al crear respaldo';
        }
      },
      error: (error) => {
        this.backupLoading = false;
        this.error = true;
        this.errorMessage = 'Error al crear respaldo: ' + (error.message || error);
      }
    });
  }
  
  restartMsad(): void {
    this.restartLoading = true;
    
    this.msadService.restartMsad().subscribe({
      next: (data) => {
        this.restartLoading = false;
        if (data.success) {
          // Recargar la información después de reiniciar
          setTimeout(() => this.loadMsadStatus(), 1000);
        } else {
          this.error = true;
          this.errorMessage = data.error || 'Error al reiniciar MSAD';
        }
      },
      error: (error) => {
        this.restartLoading = false;
        this.error = true;
        this.errorMessage = 'Error al reiniciar MSAD: ' + (error.message || error);
      }
    });
  }
  
  formatSize(size: number): string {
    if (size === undefined || size === null) return 'N/A';
    
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }
} 