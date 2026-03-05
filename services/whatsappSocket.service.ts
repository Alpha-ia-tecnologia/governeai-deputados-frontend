import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from './api';

/**
 * Serviço de WebSocket para comunicação em tempo real via Socket.IO.
 * Conecta ao namespace /whatsapp do backend.
 */

type EventHandler = (...args: any[]) => void;

class WhatsappSocketService {
    private socket: Socket | null = null;
    private eventHandlers: Map<string, Set<EventHandler>> = new Map();

    /**
     * Conectar ao WebSocket do backend.
     * Deve ser chamado após autenticação, quando o userId e vereadorId estão disponíveis.
     */
    async connect(userId: string, vereadorId: string): Promise<void> {
        if (this.socket?.connected) {
            console.log('[WS] Já conectado');
            return;
        }

        // Derivar URL do WebSocket a partir da URL da API
        const wsUrl = API_BASE_URL.replace('/api', '').replace(/\/$/, '');

        this.socket = io(`${wsUrl}/whatsapp`, {
            query: { userId, vereadorId },
            transports: ['websocket', 'polling'],
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
        });

        this.socket.on('connect', () => {
            console.log('🟢 [WS] Conectado ao WhatsApp Gateway');
        });

        this.socket.on('disconnect', (reason) => {
            console.log(`🔴 [WS] Desconectado: ${reason}`);
        });

        this.socket.on('connect_error', (error) => {
            console.error('❌ [WS] Erro de conexão:', error.message);
        });

        // Re-registrar handlers salvos após reconexão
        this.socket.on('connect', () => {
            this.eventHandlers.forEach((handlers, event) => {
                handlers.forEach(handler => {
                    this.socket?.on(event, handler);
                });
            });
        });
    }

    /**
     * Desconectar do WebSocket.
     */
    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.eventHandlers.clear();
            console.log('🔴 [WS] Desconectado manualmente');
        }
    }

    /**
     * Registrar handler para um evento.
     */
    on(event: string, handler: EventHandler): void {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, new Set());
        }
        this.eventHandlers.get(event)!.add(handler);

        if (this.socket) {
            this.socket.on(event, handler);
        }
    }

    /**
     * Remover handler de um evento.
     */
    off(event: string, handler: EventHandler): void {
        this.eventHandlers.get(event)?.delete(handler);
        if (this.socket) {
            this.socket.off(event, handler);
        }
    }

    /**
     * Emitir evento para o servidor.
     */
    emit(event: string, data?: any): void {
        if (this.socket?.connected) {
            this.socket.emit(event, data);
        } else {
            console.warn('[WS] Não conectado — evento não emitido:', event);
        }
    }

    /**
     * Verificar se está conectado.
     */
    get isConnected(): boolean {
        return this.socket?.connected || false;
    }
}

// Singleton
export const whatsappSocket = new WhatsappSocketService();
