import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

// In-memory storage (replace with database in production)
const invoices: any[] = []

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Filter invoices for this user
    const userInvoices = invoices.filter(inv => inv.userId === userId)
    
    return NextResponse.json({ invoices: userInvoices })
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Validate required fields
    if (!body.clientName || !body.clientEmail || !body.dueDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: 'Invoice must have at least one item' },
        { status: 400 }
      )
    }

    // Create invoice object
    const invoice = {
      id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      clientName: body.clientName,
      clientEmail: body.clientEmail,
      clientAddress: body.clientAddress || '',
      invoiceNumber: body.invoiceNumber,
      issueDate: body.issueDate,
      dueDate: body.dueDate,
      items: body.items,
      notes: body.notes || '',
      subtotal: body.subtotal,
      total: body.total,
      status: body.status || 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Store invoice
    invoices.push(invoice)
    
    console.log('Invoice created:', invoice.id)
    
    return NextResponse.json(
      { 
        success: true, 
        invoice,
        message: 'Invoice created successfully'
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create invoice',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}