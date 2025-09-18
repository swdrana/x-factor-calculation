import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Server from '@/models/Server';
import CurrencyRate from '@/models/CurrencyRate';
import { calculateServerWithXFactor } from '@/lib/calculations';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const server = await Server.findByIdAndDelete(params.id);
    
    if (!server) {
      return NextResponse.json(
        { success: false, error: 'Server not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Server deleted successfully' });
  } catch (error) {
    console.error('Error deleting server:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete server' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { name, originalPrice, originalCurrency, duration, bandwidth } = body;

    // Validate required fields
    if (!name || !originalPrice || !originalCurrency || !duration || !bandwidth) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Fetch current currency rates
    const currencyRates = await CurrencyRate.find({});
    const rates: { [key: string]: number } = { USD: 110, RMB: 15 }; // Default rates
    currencyRates.forEach(rate => {
      rates[rate.currency] = rate.rateToBDT;
    });

    // Get base server for calculations
    const baseServer = await Server.findOne({ isBaseServer: true });
    let baseServerData = undefined;
    if (baseServer) {
      baseServerData = {
        originalPrice: baseServer.originalPrice,
        originalCurrency: baseServer.originalCurrency,
        duration: baseServer.duration,
        bandwidth: baseServer.bandwidth,
      };
    }

    // Calculate server costs with current rates and base server
    const serverData = {
      originalPrice,
      originalCurrency,
      duration,
      bandwidth,
    };

    const calculations = calculateServerWithXFactor(serverData, baseServerData, rates);

    // Update server
    const server = await Server.findByIdAndUpdate(
      params.id,
      {
        name,
        originalPrice,
        originalCurrency,
        duration,
        bandwidth,
        ...calculations,
      },
      { new: true }
    );

    if (!server) {
      return NextResponse.json(
        { success: false, error: 'Server not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: server });
  } catch (error) {
    console.error('Error updating server:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update server' },
      { status: 500 }
    );
  }
}