import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Server from '@/models/Server';
import CurrencyRate from '@/models/CurrencyRate';
import { calculateServerWithXFactor } from '@/lib/calculations';

export async function GET() {
  try {
    await connectDB();
    const servers = await Server.find({}).sort({ createdAt: -1 });
    
    // Fetch current currency rates
    const currencyRates = await CurrencyRate.find({});
    const rates: { [key: string]: number } = { USD: 110, RMB: 15 }; // Default rates
    currencyRates.forEach(rate => {
      rates[rate.currency] = rate.rateToBDT;
    });

    // Get base server for calculations
    const baseServer = servers.find(s => s.isBaseServer);
    let baseServerData = undefined;
    if (baseServer) {
      baseServerData = {
        originalPrice: baseServer.originalPrice,
        originalCurrency: baseServer.originalCurrency,
        duration: baseServer.duration,
        bandwidth: baseServer.bandwidth,
      };
    }

    // Recalculate X factors for all servers with current base server
    const updatedServers = servers.map(server => {
      const serverData = {
        originalPrice: server.originalPrice,
        originalCurrency: server.originalCurrency,
        duration: server.duration,
        bandwidth: server.bandwidth,
      };
      
      const calculations = calculateServerWithXFactor(serverData, baseServerData, rates);
      
      return {
        ...server.toObject(),
        ...calculations,
      };
    });
    
    return NextResponse.json({
      success: true,
      data: updatedServers,
    });
  } catch (error) {
    console.error('Error fetching servers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch servers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { name, websiteLink, originalPrice, originalCurrency, duration, bandwidth } = body;

    // Validate required fields (websiteLink is optional)
    if (!name || !originalPrice || !originalCurrency || !duration || !bandwidth) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate numeric values
    if (originalPrice <= 0 || duration <= 0 || bandwidth <= 0) {
      return NextResponse.json(
        { success: false, error: 'Price, duration, and bandwidth must be positive numbers' },
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

    // Create new server with calculations
    const server = new Server({
      name,
      websiteLink,
      originalPrice,
      originalCurrency,
      duration,
      bandwidth,
      ...calculations,
    });

    await server.save();

    return NextResponse.json({
      success: true,
      data: server,
    });
  } catch (error) {
    console.error('Error creating server:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create server' },
      { status: 500 }
    );
  }
}