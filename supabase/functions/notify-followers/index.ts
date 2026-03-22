// Supabase Edge Function — deploy with: supabase functions deploy notify-followers
// Set secrets: supabase secrets set RESEND_API_KEY=re_xxx FROM_EMAIL=notifications@yourdomain.com APP_URL=https://your-vercel-url.app

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const { sellerId, sellerName, title, price, location } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Get all followers of this seller
    const { data: follows } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('following_id', sellerId)

    if (!follows?.length) return new Response('no followers', { status: 200 })

    const followerIds = follows.map((f: any) => f.follower_id)

    // Get notification preferences
    const { data: prefs } = await supabase
      .from('profiles')
      .select('id, notify_email, notify_phone')
      .in('id', followerIds)

    const emailIds = (prefs || [])
      .filter((p: any) => p.notify_email !== false)
      .map((p: any) => p.id)

    if (!emailIds.length) return new Response('no email prefs', { status: 200 })

    const RESEND_KEY = Deno.env.get('RESEND_API_KEY')
    const FROM = Deno.env.get('FROM_EMAIL') || 'notifications@umarket.app'
    const APP_URL = Deno.env.get('APP_URL') || 'https://u-market-v2.vercel.app'

    if (!RESEND_KEY) return new Response('no resend key', { status: 200 })

    let sent = 0
    for (const userId of emailIds) {
      const { data: { user } } = await supabase.auth.admin.getUserById(userId)
      if (!user?.email) continue

      const priceText = price != null && price > 0 ? ` for $${price}` : price === 0 ? ' (Free)' : ''
      const locationText = location ? ` in ${location}` : ''

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: FROM,
          to: user.email,
          subject: `${sellerName} just listed something on UMarket`,
          html: `
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px">
                <div style="width:40px;height:40px;background:#CC0000;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:18px">${sellerName[0]?.toUpperCase()}</div>
                <span style="font-weight:700;font-size:16px;color:#111">UMarket</span>
              </div>
              <h2 style="margin:0 0 8px;color:#111;font-size:20px">${sellerName} just posted a new listing</h2>
              <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin:16px 0">
                <p style="margin:0 0 6px;font-size:18px;font-weight:800;color:#111">${title}</p>
                <p style="margin:0;color:#6b7280;font-size:14px">${priceText}${locationText}</p>
              </div>
              <a href="${APP_URL}" style="display:inline-block;background:#CC0000;color:#fff;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;margin-top:8px">View on UMarket →</a>
              <p style="color:#9ca3af;font-size:12px;margin-top:24px;line-height:1.6">
                You're receiving this because you follow ${sellerName} on UMarket.<br>
                <a href="${APP_URL}" style="color:#9ca3af">Manage notification settings in your profile.</a>
              </p>
            </div>
          `,
        }),
      })
      sent++
    }

    return new Response(JSON.stringify({ sent }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(String(err), { status: 500 })
  }
})
