import React from 'react';
import { Clock } from 'lucide-react';
import { Appointment } from '../../types/appointment';
import { Table, TableBody, TableCell, TableHeadCell, TableHeader, TableRow } from '../ui/Table';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';

interface AppointmentTableProps {
  appointments: Appointment[];
}

const STATUS_VARIANT: Record<string, 'warning' | 'success' | 'danger' | 'neutral'> = {
  SCHEDULED: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'danger',
  NO_SHOW: 'neutral',
};

export const AppointmentTable: React.FC<AppointmentTableProps> = ({ appointments }) => {
  const formatTime = (dateString: string) =>
    new Date(dateString).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (appointments.length === 0) {
    return (
      <div className="rounded-lg border border-surface-200 bg-white">
        <EmptyState icon={Clock} title="No appointments scheduled for today" />
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <tr>
          <TableHeadCell>Date</TableHeadCell>
          <TableHeadCell>Time</TableHeadCell>
          <TableHeadCell>Patient</TableHeadCell>
          <TableHeadCell>Treatment</TableHeadCell>
          <TableHeadCell>Status</TableHeadCell>
        </tr>
      </TableHeader>
      <TableBody>
        {appointments.map((a) => (
          <TableRow key={a.id}>
            <TableCell>{formatDate(a.dateOfTreatment)}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2 text-surface-500">
                <Clock size={15} />
                {formatTime(a.dateOfTreatment)}
              </div>
            </TableCell>
            <TableCell className="font-medium">
              {a.patient ? `${a.patient.firstName} ${a.patient.lastName}` : 'N/A'}
            </TableCell>
            <TableCell>
              <Badge variant="info">{a.typeOfTreatment || 'Not specified'}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant={STATUS_VARIANT[a.status] ?? 'neutral'}>{a.status}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default AppointmentTable;
