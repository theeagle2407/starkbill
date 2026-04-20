'use client'

import { useEffect, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import Link from 'next/link'
import { Plus, FileText, DollarSign, Clock, CheckCircle, Loader2 } from 'lucide-react'

interface Invoice {
  id: string
  invoiceNumber: string
  clientName: string
  total: number
  status: string
  dueDate: string
  createdAt: string
}

export default function DashboardPage() {
  const { user, ready, authenticated, login, logout } = usePrivy()

  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (ready && authenticated) {
      fetchInvoices()
    } else if (ready && !authenticated) {
      login()
    }
  }, [ready, authenticated])

  const fetchInvoices = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/invoices')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch invoices')
      }

      setInvoices(data.invoices || [])
    } catch (err) {
      console.error('Error fetching invoices:', err)
      setError(err instanceof Error ? err.message : 'Failed to load invoices')
    } finally {
      setIsLoading(false)
    }
  }

  const stats = {
    total: invoices.length,
    paid: invoices.filter(inv => inv.status === 'paid').length,
    pending: invoices.filter(inv => inv.status === 'pending').length,
    draft: invoices.filter(inv => inv.status === 'draft').length,
    revenue: invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total, 0),
  }

  if (!ready || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">InvoiceFlow</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.email?.address || 'User'}
              </span>
              <button
                onClick={logout}
                className="text-sm text-red-600 hover:underline"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.email?.address?.split('@')[0] || 'there'}!
          </h2>
          <p className="text-gray-600">Here's an overview of your invoices</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard icon={<FileText className="h-6 w-6 text-blue-600" />} label="Total Invoices" value={stats.total} bgColor="bg-blue-50" />
          <StatCard icon={<DollarSign className="h-6 w-6 text-green-600" />} label="Total Revenue" value={`$${stats.revenue.toFixed(2)}`} bgColor="bg-green-50" />
          <StatCard icon={<Clock className="h-6 w-6 text-yellow-600" />} label="Pending" value={stats.pending} bgColor="bg-yellow-50" />
          <StatCard icon={<CheckCircle className="h-6 w-6 text-purple-600" />} label="Paid" value={stats.paid} bgColor="bg-purple-50" />
        </div>

        {/* Action */}
        <div className="mb-6">
          <Link href="/invoices/create" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
            <Plus className="h-5 w-5 mr-2" />
            Create New Invoice
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Invoices</h3>
          </div>

          {invoices.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p>No invoices yet</p>
            </div>
          ) : (
            <table className="w-full">
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td>{invoice.invoiceNumber}</td>
                    <td>{invoice.clientName}</td>
                    <td>${invoice.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}

function StatCard({ icon, label, value, bgColor }: any) {
  return (
    <div className="bg-white p-6">
      <div className={bgColor}>{icon}</div>
      <p>{label}</p>
      <p>{value}</p>
    </div>
  )
}