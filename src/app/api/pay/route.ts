import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email, amount, courseId } = await req.json();

    if (!email || !amount || !courseId) {
      return NextResponse.json(
        { error: 'Missing required parameters: email, amount, courseId' },
        { status: 400 }
      );
    }

    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // If API Keys are not configured, simulate a successful transaction checkout page URL
    if (!paystackSecretKey || paystackSecretKey.startsWith('sk_test_...')) {
      console.log('Paystack Secret Key is missing or default. Mocking payment transaction...');
      
      const mockReference = `MOCK-REF-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      return NextResponse.json({
        success: true,
        message: 'Mock payment initiated',
        authorization_url: `${appUrl}/dashboard?pay_success=true&reference=${mockReference}&courseId=${courseId}`,
        reference: mockReference,
        mock: true
      });
    }

    // Initialize Paystack transaction
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        amount: Number(amount) * 100, // Paystack requires amount in kobo/cents
        callback_url: `${appUrl}/dashboard?pay_success=true`,
        metadata: {
          courseId,
          custom_fields: [
            {
              display_name: 'Course ID',
              variable_name: 'course_id',
              value: courseId
            }
          ]
        }
      })
    });

    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok || !paystackData.status) {
      throw new Error(paystackData.message || 'Failed to initialize Paystack transaction');
    }

    return NextResponse.json({
      success: true,
      authorization_url: paystackData.data.authorization_url,
      reference: paystackData.data.reference
    });
  } catch (err: any) {
    console.error('Checkout error:', err);
    return NextResponse.json(
      { error: err.message || 'Error occurred during checkout' },
      { status: 500 }
    );
  }
}
