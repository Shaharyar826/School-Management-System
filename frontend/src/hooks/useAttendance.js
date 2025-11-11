import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// Get student attendance for absence fine calculation
export const useStudentAttendance = (studentId, month, year) => {
  return useQuery({
    queryKey: ['attendance', 'student', studentId, month, year],
    queryFn: async () => {
      if (!studentId || !month || !year) {
        console.log('Missing parameters:', { studentId, month, year });
        return { absences: 0, fine: 0, excessAbsences: 0, allowedAbsences: 3 };
      }
      
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      
      console.log('Fetching attendance for:', {
        studentId,
        month,
        year,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      });
      
      const response = await axios.get('/api/attendance', {
        params: {
          userType: 'student',
          userId: studentId
        }
      });
      
      console.log('Attendance API response:', response.data);
      
      if (response.data.success) {
        const attendanceRecords = response.data.data || [];
        // Filter records by date range
        const filteredRecords = attendanceRecords.filter(record => {
          const recordDate = new Date(record.date);
          return recordDate >= startDate && recordDate <= endDate;
        });
        const absences = filteredRecords.filter(record => record.status === 'absent').length;
        const fine = absences > 3 ? 500 : 0;
        
        console.log('Attendance calculation:', {
          totalRecords: attendanceRecords.length,
          filteredRecords: filteredRecords.length,
          absences,
          fine,
          records: filteredRecords.map(r => ({ date: r.date, status: r.status }))
        });
        
        return { 
          absences, 
          fine,
          excessAbsences: Math.max(0, absences - 3),
          allowedAbsences: 3
        };
      }
      
      console.log('No attendance data found');
      return { absences: 0, fine: 0, excessAbsences: 0, allowedAbsences: 3 };
    },
    enabled: !!studentId && !!month && !!year,
    staleTime: 2 * 60 * 1000,
  });
};

// Get all attendance records with filters
export const useAttendance = (filters = {}) => {
  return useQuery({
    queryKey: ['attendance', 'list', filters],
    queryFn: () => axios.get('/api/attendance', { params: filters }).then(res => res.data),
    staleTime: 3 * 60 * 1000, // 3 minutes
    select: (data) => data?.data || [],
  });
};