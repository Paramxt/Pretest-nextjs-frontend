'use client';

import React, { useState, useEffect } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';

interface Quote {
    id: number;
    qoute: string;
    votesPoint?: number;
    userId: number;
    createdAt: string;
    updatedAt: string;
}

interface UserActivity {
    userId: number;
    quoteCount: number;
    totalVotes: number;
    averageVotes: number;
}

interface VoteDistribution {
    range: string;
    count: number;
    percentage: number;
}

interface VoteCategory {
    category: string;
    count: number;
    percentage: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const DashboardPage = () => { // Removed async keyword
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAndProcessQuotes = async () => {
        setError(null);
        setLoading(true);

        const access_token = localStorage.getItem('access_token');
        if (!access_token) {
            setError('ไม่พบ Access Token กรุณาเข้าสู่ระบบใหม่');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/qoute', { // Fixed typo: qoute -> quote
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${access_token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data: Quote[] = await response.json();
            setQuotes(data);

        } catch (err: any) {
            console.error('Error fetching quotes:', err);
            setError(`เกิดข้อผิดพลาดในการดึงข้อมูล Quote: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAndProcessQuotes();
    }, []);

    const processUserActivity = (): UserActivity[] => {
        const userStats = quotes.reduce((acc, quote) => {
            const userId = quote.userId;
            if (!acc[userId]) {
                acc[userId] = { quoteCount: 0, totalVotes: 0 };
            }
            acc[userId].quoteCount += 1;
            acc[userId].totalVotes += quote.votesPoint || 0;
            return acc;
        }, {} as Record<number, { quoteCount: number; totalVotes: number }>);

        return Object.entries(userStats).map(([userId, stats]) => ({
            userId: parseInt(userId),
            quoteCount: stats.quoteCount,
            totalVotes: stats.totalVotes,
            averageVotes: stats.quoteCount > 0 ? stats.totalVotes / stats.quoteCount : 0
        })).sort((a, b) => b.quoteCount - a.quoteCount);
    };

    // ประมวลผลข้อมูลสำหรับ Vote Distribution Chart
    const processVoteDistribution = (): VoteDistribution[] => {
        const voteCounts = quotes.reduce((acc, quote) => {
            const votes = quote.votesPoint || 0;
            let range: string;

            if (votes === 0) range = '0 คะแนน';
            else if (votes === 1) range = '1 คะแนน';
            else if (votes <= 5) range = '2-5 คะแนน';
            else if (votes <= 10) range = '6-10 คะแนน';
            else range = '10+ คะแนน';

            acc[range] = (acc[range] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const total = quotes.length;
        return Object.entries(voteCounts).map(([range, count]) => ({
            range,
            count,
            percentage: Math.round((count / total) * 100)
        })).sort((a, b) => b.count - a.count);
    };

    // ประมวลผลข้อมูลสำหรับ Vote Categories Pie Chart
    const processVoteCategories = (): VoteCategory[] => {
        const categories = quotes.reduce((acc, quote) => {
            const votes = quote.votesPoint || 0;
            let category: string;

            if (votes === 0) category = 'ไม่มีคะแนน';
            else if (votes <= 2) category = 'คะแนนต่ำ (1-2)';
            else if (votes <= 5) category = 'คะแนนปานกลาง (3-5)';
            else category = 'คะแนนสูง (6+)';

            acc[category] = (acc[category] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const total = quotes.length;
        return Object.entries(categories).map(([category, count]) => ({
            category,
            count,
            percentage: Math.round((count / total) * 100)
        }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    const userActivityData = processUserActivity();
    const voteDistributionData = processVoteDistribution();
    const voteCategoriesData = processVoteCategories();

    return (
        <div className="p-6 space-y-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                    <h3 className="text-sm font-medium text-gray-500">Total Quotes</h3>
                    <p className="text-2xl font-bold text-gray-900">{quotes.length}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
                    <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
                    <p className="text-2xl font-bold text-gray-900">
                        {new Set(quotes.map(q => q.userId)).size}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
                    <h3 className="text-sm font-medium text-gray-500">Total Votes</h3>
                    <p className="text-2xl font-bold text-gray-900">
                        {quotes.reduce((sum, q) => sum + (q.votesPoint || 0), 0)}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
                    <h3 className="text-sm font-medium text-gray-500">Average Votes</h3>
                    <p className="text-2xl font-bold text-gray-900">
                        {quotes.length > 0 ? (quotes.reduce((sum, q) => sum + (q.votesPoint || 0), 0) / quotes.length).toFixed(2) : '0.00'}
                    </p>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* User Activity Bar Chart */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        User Activity - จำนวน Quote ต่อผู้ใช้
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={userActivityData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="userId"
                                label={{ value: 'User ID', position: 'insideBottom', offset: -5 }}
                            />
                            <YAxis
                                label={{ value: 'จำนวน Quote', angle: -90, position: 'insideLeft' }}
                            />
                            <Tooltip
                                formatter={(value, name) => [
                                    value,
                                    name === 'quoteCount' ? 'จำนวน Quote' : 'คะแนนรวม'
                                ]}
                                labelFormatter={(label) => `User ID: ${label}`}
                            />
                            <Bar dataKey="quoteCount" fill="#3B82F6" name="quoteCount" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Vote Distribution Bar Chart */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        Vote Distribution - การกระจายของคะแนนโหวต
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={voteDistributionData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="range"
                                label={{ value: 'ช่วงคะแนน', position: 'insideBottom', offset: -5 }}
                            />
                            <YAxis
                                label={{ value: 'จำนวน Quote', angle: -90, position: 'insideLeft' }}
                            />
                            <Tooltip
                                formatter={(value, name) => [
                                    value,
                                    name === 'count' ? 'จำนวน Quote' : 'เปอร์เซ็นต์'
                                ]}
                            />
                            <Bar dataKey="count" fill="#10B981" name="count" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Vote Categories Pie Chart */}
                <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        Vote Categories - สัดส่วนหมวดหมู่คะแนนโหวต
                    </h2>
                    <div className="flex justify-center">
                        <ResponsiveContainer width="100%" height={400}>
                            <PieChart>
                                <Pie
                                    data={voteCategoriesData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ category, percentage }) => `${category}: ${percentage}%`}
                                    outerRadius={120}
                                    fill="#8884d8"
                                    dataKey="count"
                                >
                                    {voteCategoriesData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value, name) => [`${value} Quote`, 'จำนวน']}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    User Activity Summary
                </h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    User ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    จำนวน Quote
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    คะแนนรวม
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    คะแนนเฉลี่ย
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {userActivityData.map((user) => (
                                <tr key={user.userId} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {user.userId}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.quoteCount}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.totalVotes}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.averageVotes.toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;