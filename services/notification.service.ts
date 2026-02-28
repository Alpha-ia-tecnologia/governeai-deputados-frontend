import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appointment } from '@/types';

const NOTIFICATION_PERMISSION_KEY = '@notification_permission';

// Configurar como as notificações são exibidas quando o app está em foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

class NotificationService {
    private isInitialized = false;

    /**
     * Inicializar o serviço de notificações
     */
    async initialize(): Promise<boolean> {
        if (Platform.OS === 'web') {
            console.log('Notificações push não são suportadas na web');
            return false;
        }

        if (this.isInitialized) {
            return true;
        }

        try {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                console.log('Permissão para notificações não concedida');
                await AsyncStorage.setItem(NOTIFICATION_PERMISSION_KEY, 'denied');
                return false;
            }

            await AsyncStorage.setItem(NOTIFICATION_PERMISSION_KEY, 'granted');
            this.isInitialized = true;

            // Configurar canal de notificação para Android
            if (Platform.OS === 'android') {
                await Notifications.setNotificationChannelAsync('appointments', {
                    name: 'Compromissos',
                    importance: Notifications.AndroidImportance.HIGH,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#3B82F6',
                    sound: 'default',
                });

                await Notifications.setNotificationChannelAsync('reminders', {
                    name: 'Lembretes',
                    importance: Notifications.AndroidImportance.HIGH,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#10B981',
                    sound: 'default',
                });
            }

            console.log('Serviço de notificações inicializado com sucesso');
            return true;
        } catch (error) {
            console.error('Erro ao inicializar notificações:', error);
            return false;
        }
    }

    /**
     * Verificar status da permissão
     */
    async checkPermission(): Promise<'granted' | 'denied' | 'undetermined'> {
        if (Platform.OS === 'web') {
            return 'denied';
        }

        const { status } = await Notifications.getPermissionsAsync();
        return status;
    }

    /**
     * Solicitar permissão de notificações
     */
    async requestPermission(): Promise<boolean> {
        if (Platform.OS === 'web') {
            return false;
        }

        try {
            const { status } = await Notifications.requestPermissionsAsync();
            return status === 'granted';
        } catch (error) {
            console.error('Erro ao solicitar permissão:', error);
            return false;
        }
    }

    /**
     * Agendar notificação para um compromisso
     */
    async scheduleAppointmentReminder(
        appointment: Appointment,
        minutesBefore: number
    ): Promise<string | null> {
        if (Platform.OS === 'web') {
            console.log(`[Web] Lembrete seria agendado para ${appointment.title} - ${minutesBefore} minutos antes`);
            return null;
        }

        try {
            // Calcular a data/hora do lembrete
            const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);
            const reminderTime = new Date(appointmentDateTime.getTime() - minutesBefore * 60 * 1000);

            // Verificar se o horário do lembrete já passou
            if (reminderTime <= new Date()) {
                console.log('Horário do lembrete já passou, ignorando...');
                return null;
            }

            // Gerar texto do tempo antes
            const timeText = minutesBefore >= 60
                ? `${minutesBefore / 60} hora(s)`
                : `${minutesBefore} minutos`;

            const identifier = await Notifications.scheduleNotificationAsync({
                content: {
                    title: `🗓️ Lembrete: ${appointment.title}`,
                    body: `Seu compromisso começa em ${timeText}${appointment.location ? ` - Local: ${appointment.location}` : ''}`,
                    data: {
                        appointmentId: appointment.id,
                        type: 'appointment_reminder',
                    },
                    sound: 'default',
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DATE,
                    date: reminderTime,
                },
            });

            console.log(`Notificação agendada: ${identifier} para ${reminderTime.toLocaleString()}`);
            return identifier;
        } catch (error) {
            console.error('Erro ao agendar notificação:', error);
            return null;
        }
    }

    /**
     * Agendar todos os lembretes de um compromisso
     */
    async scheduleAllReminders(appointment: Appointment): Promise<string[]> {
        const scheduledIds: string[] = [];

        for (const reminder of appointment.reminders) {
            const id = await this.scheduleAppointmentReminder(appointment, reminder.minutes);
            if (id) {
                scheduledIds.push(id);
            }
        }

        return scheduledIds;
    }

    /**
     * Cancelar todas as notificações de um compromisso
     */
    async cancelAppointmentNotifications(appointmentId: string): Promise<void> {
        if (Platform.OS === 'web') {
            return;
        }

        try {
            const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();

            for (const notification of scheduledNotifications) {
                if (notification.content.data?.appointmentId === appointmentId) {
                    await Notifications.cancelScheduledNotificationAsync(notification.identifier);
                    console.log(`Notificação cancelada: ${notification.identifier}`);
                }
            }
        } catch (error) {
            console.error('Erro ao cancelar notificações:', error);
        }
    }

    /**
     * Cancelar todas as notificações agendadas
     */
    async cancelAllNotifications(): Promise<void> {
        if (Platform.OS === 'web') {
            return;
        }

        try {
            await Notifications.cancelAllScheduledNotificationsAsync();
            console.log('Todas as notificações foram canceladas');
        } catch (error) {
            console.error('Erro ao cancelar todas as notificações:', error);
        }
    }

    /**
     * Obter notificações agendadas
     */
    async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
        if (Platform.OS === 'web') {
            return [];
        }

        try {
            return await Notifications.getAllScheduledNotificationsAsync();
        } catch (error) {
            console.error('Erro ao obter notificações agendadas:', error);
            return [];
        }
    }

    /**
     * Enviar notificação imediata
     */
    async sendImmediateNotification(
        title: string,
        body: string,
        data?: Record<string, any>
    ): Promise<string | null> {
        if (Platform.OS === 'web') {
            // Na web, usar window.Notification se disponível
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(title, { body });
            }
            return null;
        }

        try {
            const identifier = await Notifications.scheduleNotificationAsync({
                content: {
                    title,
                    body,
                    data,
                    sound: 'default',
                },
                trigger: null, // Enviar imediatamente
            });

            return identifier;
        } catch (error) {
            console.error('Erro ao enviar notificação:', error);
            return null;
        }
    }

    /**
     * Registrar listener para quando uma notificação é recebida
     */
    addNotificationReceivedListener(
        callback: (notification: Notifications.Notification) => void
    ): Notifications.Subscription {
        return Notifications.addNotificationReceivedListener(callback);
    }

    /**
     * Registrar listener para quando o usuário interage com uma notificação
     */
    addNotificationResponseListener(
        callback: (response: Notifications.NotificationResponse) => void
    ): Notifications.Subscription {
        return Notifications.addNotificationResponseReceivedListener(callback);
    }
}

export const notificationService = new NotificationService();
