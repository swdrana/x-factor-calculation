import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CurrencyRate from '@/models/CurrencyRate';

export async function GET() {
  try {
    await connectDB();
    
    let rates = await CurrencyRate.find({});
    
    // If no rates exist, create default ones
    if (rates.length === 0) {
      const defaultRates = [
        { currency: 'USD', rateToBDT: 124 },
        { currency: 'RMB', rateToBDT: 17.5 },
      ];
      
      rates = await CurrencyRate.insertMany(defaultRates);
    }
    
    return NextResponse.json({ success: true, data: rates });
  } catch (error) {
    console.error('Error fetching currency rates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch currency rates' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { rates } = body;

    if (!rates || !Array.isArray(rates)) {
      return NextResponse.json(
        { success: false, error: 'Invalid rates data' },
        { status: 400 }
      );
    }

    // Update each rate
    const updatedRates = [];
    for (const rate of rates) {
      const { currency, rateToBDT } = rate;
      
      if (!currency || !rateToBDT || rateToBDT <= 0) {
        return NextResponse.json(
          { success: false, error: 'Invalid rate data' },
          { status: 400 }
        );
      }

      const updatedRate = await CurrencyRate.findOneAndUpdate(
        { currency },
        { rateToBDT },
        { new: true, upsert: true }
      );
      
      updatedRates.push(updatedRate);
    }

    return NextResponse.json({ success: true, data: updatedRates });
  } catch (error) {
    console.error('Error updating currency rates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update currency rates' },
      { status: 500 }
    );
  }
}