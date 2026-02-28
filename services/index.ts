// Exportar todos os serviços de forma centralizada
export { authService } from './auth.service';
export { votersService } from './voters.service';
export { leadersService } from './leaders.service';
export { helpRecordsService } from './help-records.service';
export { visitsService } from './visits.service';
export { projectsService } from './projects.service';
export { amendmentsService } from './amendments.service';
export { appointmentsService } from './appointments.service';
export { usersService } from './users.service';
export { notificationService } from './notification.service';
export { citiesService } from './cities.service';
export { executiveRequestsService } from './executive-requests.service';

// SGP-DEP: Novos módulos
export { staffService } from './staff.service';
export { tasksService } from './tasks.service';
export { billsService } from './bills.service';
export { votingRecordsService } from './voting-records.service';
export { politicalContactsService } from './political-contacts.service';
export { ceapService } from './ceap.service';
export { auditLogService } from './audit-log.service';

export { default as api } from './api';
