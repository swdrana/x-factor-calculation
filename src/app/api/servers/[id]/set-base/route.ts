import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Server from '@/models/Server';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const { id } = params;

    // Find the server
    const server = await Server.findById(id);
    if (!server) {
      return NextResponse.json(
        { success: false, error: 'Server not found' },
        { status: 404 }
      );
    }

    // Set this server as base server (the pre-save hook will handle removing base flag from others)
    server.isBaseServer = true;
    await server.save();

    return NextResponse.json({
      success: true,
      data: server,
    });
  } catch (error) {
    console.error('Error setting base server:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to set base server' },
      { status: 500 }
    );
  }
}