export function notificationEmailTemplate(
  categoryName: string,
  articleTitle: string,
  articleUrl: string,
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f4f4f5; }
    .container { max-width: 560px; margin: 32px auto; background: #fff; border-radius: 8px; overflow: hidden; }
    .header { background: #18181b; padding: 24px; text-align: center; color: #fff; }
    .header h1 { margin: 0; font-size: 20px; }
    .body { padding: 24px; }
    .body p { color: #3f3f46; line-height: 1.6; margin: 0 0 16px; }
    .btn { display: inline-block; background: #18181b; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500; }
    .footer { padding: 16px 24px; text-align: center; font-size: 12px; color: #a1a1aa; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>FeedFlow</h1></div>
    <div class="body">
      <p>New article in <strong>${categoryName}</strong>:</p>
      <p><strong>${articleTitle}</strong></p>
      <p><a href="${articleUrl}" class="btn">Read article</a></p>
    </div>
    <div class="footer">You received this because you follow the ${categoryName} category.</div>
  </div>
</body>
</html>`.trim();
}

export function passwordRecoveryEmailTemplate(token: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f4f4f5; }
    .container { max-width: 560px; margin: 32px auto; background: #fff; border-radius: 8px; overflow: hidden; }
    .header { background: #18181b; padding: 24px; text-align: center; color: #fff; }
    .header h1 { margin: 0; font-size: 20px; }
    .body { padding: 24px; }
    .body p { color: #3f3f46; line-height: 1.6; margin: 0 0 16px; }
    .code { display: block; background: #f4f4f5; padding: 16px; border-radius: 6px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #18181b; margin: 16px 0; }
    .footer { padding: 16px 24px; text-align: center; font-size: 12px; color: #a1a1aa; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>FeedFlow</h1></div>
    <div class="body">
      <p>You requested a password reset. Use the following token:</p>
      <span class="code">${token}</span>
      <p>If you didn't request this, you can safely ignore this email.</p>
    </div>
    <div class="footer">This token expires in 1 hour.</div>
  </div>
</body>
</html>`.trim();
}
