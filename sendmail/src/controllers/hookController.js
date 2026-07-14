const { verifySendEmailHook } = require('../middleware/hookAuth');
const { sendMail } = require('../config/email');
const { buildAuthEmail, buildEmailChangeMessages } = require('../lib/authEmails');

async function handleSendEmailHook(req, res) {
  try {
    const payload = verifySendEmailHook(req);
    const { user, email_data: emailData } = payload;
    const action = emailData.email_action_type;

    if (!user?.email) {
      return res.status(400).json({ error: { message: 'Missing user.email in hook payload' } });
    }

    let messages = [];

    if (action === 'email_change') {
      messages = buildEmailChangeMessages({ user, emailData });
    } else {
      messages = [
        {
          to: user.email,
          ...buildAuthEmail({
            user,
            emailData,
            token: emailData.token,
            tokenHash: emailData.token_hash,
            redirectTo: emailData.redirect_to,
            emailActionType: action,
          }),
        },
      ];
    }

    for (const msg of messages) {
      const info = await sendMail({
        to: msg.to,
        subject: msg.subject,
        html: msg.html,
        text: msg.text,
        brand: msg.brand,
      });
      console.log(
        `[sendmail] hook sent action=${action} site=${msg.brand?.id || 'voidborn'} to=${msg.to} messageId=${info.messageId}`,
      );
    }

    return res.status(200).json({});
  } catch (err) {
    const status = err.status || 401;
    console.error('[sendmail] hook failed:', err.message);
    return res.status(status).json({
      error: {
        message: err.message,
      },
    });
  }
}

module.exports = { handleSendEmailHook };
