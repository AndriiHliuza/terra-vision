// src/pages/SimpleChartPage.tsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Define the type of each data point
interface ChartData {
    month: string;
    sales: number;
}

const data: ChartData[] = [
    { month: 'Jan', sales: 400 },
    { month: 'Feb', sales: 300 },
    { month: 'Mar', sales: 500 },
    { month: 'Apr', sales: 700 },
    { month: 'May', sales: 600 },
    { month: 'A', sales: 100 },
];

export const SimpleChartPage: React.FC = () => {
    return (
        <div style={{ width: '100%', height: 400, padding: 20 }}>
            <h2>Monthly Sales Chart</h2>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="sales" stroke="#8884d8" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};
