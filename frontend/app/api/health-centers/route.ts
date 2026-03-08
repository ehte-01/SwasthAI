import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const type = searchParams.get('type') || 'all';
  if (!lat || !lng) {
    return NextResponse.json({ error: 'lat and lng required', results: [] }, { status: 400 });
  }
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured', results: [] }, { status: 500 });
  }
  const keyword = type === 'all' ? 'hospital clinic medical' : type;
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&keyword=${encodeURIComponent(keyword)}&key=${apiKey}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    const results = (data.results || []).map((p: any) => ({
      name: p.name,
      vicinity: p.vicinity,
      lat: p.geometry.location.lat,
      lng: p.geometry.location.lng,
      website: p.website || null,
    }));
    return NextResponse.json({ results });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch health centers', results: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { latitude, longitude } = await request.json();
    if (!latitude || !longitude) {
      return NextResponse.json({ error: 'Latitude and longitude are required' }, { status: 400 });
    }
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Google Maps API key not configured' }, { status: 500 });
    }
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=5000&type=hospital&key=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();
    const results = (data.results || []).slice(0, 5).map((p: any) => ({
      name: p.name,
      address: p.vicinity || 'No address available',
      latitude: p.geometry.location.lat,
      longitude: p.geometry.location.lng,
    }));
    return NextResponse.json({ nearest_health_centers: results });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
