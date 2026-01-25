import React, { useEffect, useState } from 'react';
import { getPatients } from '../services/patient.service';
import { Patient } from '../types/patient';

interface PatientTableProps {
    token: string;
    onLogout: () => void;
}

export const PatientTable: React.FC<PatientTableProps> = ({ token, onLogout }) => {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const response = await getPatients(token);
                // Support responses that are either an array of patients or an object { data, success, message }
                const anyRes: any = response;
                if (Array.isArray(anyRes)) {
                    setPatients(anyRes);
                } else if (anyRes && (anyRes.data || Array.isArray(anyRes))) {
                    // response.data if API returns { data: [...] }
                    setPatients(anyRes.data ?? anyRes);
                } else {
                    setError(anyRes?.message || 'Failed to load patients');
                }
            } catch (err: any) {
                setError(err.message || 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchPatients();
    }, [token]);

    if (loading) return <div>Loading patients...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Patient List</h2>
                <button onClick={onLogout} style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Logout
                </button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f8f9fa', textAlign: 'left' }}>
                        <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Name</th>
                        <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Email</th>
                        <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Phone</th>
                        <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>DOB</th>
                    </tr>
                </thead>
                <tbody>
                    {patients.map((patient) => (
                        <tr key={patient.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                            <td style={{ padding: '12px' }}>{patient.firstName} {patient.lastName}</td>
                            <td style={{ padding: '12px' }}>{patient.email || 'N/A'}</td>
                            <td style={{ padding: '12px' }}>{patient.phone || 'N/A'}</td>
                            <td style={{ padding: '12px' }}>{patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'N/A'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
