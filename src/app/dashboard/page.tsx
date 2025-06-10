"use client"

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Chart } from 'chart.js/auto';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCcw, BarChart2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VoteOption {
  label: string;
  votes: number;
}

interface BallotResult {
  id: string;
  title: string;
  options: VoteOption[];
}

const Dashboard = () => {
  const router = useRouter();
  const [results, setResults] = useState<BallotResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch('/api/results');
        if (!response.ok) {
          throw new Error('Failed to fetch results');
        }
        const data = await response.json();
        setResults(data);
        if (data && data.length > 0 && data[0].options) {
          renderChart(data[0]);
        }
      } catch (error) {
        console.error('Error:', error);
        setError('Failed to load voting results');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  const renderChart = (ballot: BallotResult) => {
    const ctx = document.getElementById('resultsChart') as HTMLCanvasElement;
    if (!ctx || !ballot?.options?.length) return;

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ballot.options.map(option => option.label),
        datasets: [{
          label: ballot.title,
          data: ballot.options.map(option => option.votes),
          backgroundColor: ['rgba(59, 130, 246, 0.5)', 'rgba(16, 185, 129, 0.5)', 'rgba(249, 115, 22, 0.5)', 'rgba(139, 92, 246, 0.5)'],
          borderColor: ['rgba(59, 130, 246, 1)', 'rgba(16, 185, 129, 1)', 'rgba(249, 115, 22, 1)', 'rgba(139, 92, 246, 1)'],
          borderWidth: 2,
          borderRadius: 6,
        }],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Voting Results'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        },
      },
    });
  };

  const handleSignOut = async () => {
    try {
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
      });

      if (response.ok) {
        router.push('/login');
      } else {
        throw new Error('Failed to sign out');
      }
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-xl font-semibold mb-4">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="inline-flex items-center"
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // if (!results || results.length === 0) {
  //   return (
  //     <div className="container mx-auto p-6">
  //       <Card>
  //         <CardContent className="pt-6 text-center">
  //           <BarChart2 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
  //           <h2 className="text-2xl font-semibold mb-2">No Results Yet</h2>
  //           <p className="text-gray-500">Check back later for voting results</p>
  //         </CardContent>
  //       </Card>
  //     </div>
  //   );
  // }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button
          onClick={handleSignOut}
          variant="outline"
          className="inline-flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Voting Results Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          {results[0]?.options?.length > 0 && (
            <div className="aspect-[2/1] mb-6">
              <canvas id="resultsChart"></canvas>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {results.map(ballot => (
          <Card key={ballot.id}>
            <CardHeader>
              <CardTitle>{ballot.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {ballot.options && ballot.options.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Option</TableHead>
                      <TableHead className="text-right">Votes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ballot.options.map(option => (
                      <TableRow key={option.label}>
                        <TableCell>{option.label}</TableCell>
                        <TableCell className="text-right font-medium">
                          {option.votes}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No options available for this ballot.
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;