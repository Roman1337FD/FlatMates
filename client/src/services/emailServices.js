import nodemailer from 'nodemailer';

const emailUser =
  process.env.EMAIL_USER;

const emailAppPassword =
  process.env.EMAIL_APP_PASSWORD;

if (!emailUser) {
  console.error(
    'EMAIL_USER is missing in .env'
  );
}

if (!emailAppPassword) {
  console.error(
    'EMAIL_APP_PASSWORD is missing in .env'
  );
}

const transporter =
  nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailAppPassword
    }
  });

const sendOtp = async (
  email,
  otp,
  purpose
) => {
  if (
    !email ||
    !otp
  ) {
    throw new Error(
      'Email and OTP are required'
    );
  }

  const isPasswordReset =
    purpose === 'password-reset';

  const subject =
    isPasswordReset
      ? 'FlatMate.GN - Password Reset OTP'
      : 'FlatMate.GN - Email Verification OTP';

  const heading =
    isPasswordReset
      ? 'Password Reset'
      : 'Verify Your Email';

  const description =
    isPasswordReset
      ? 'Use the OTP below to reset your FlatMate.GN password.'
      : 'Use the OTP below to verify your email and create your FlatMate.GN account.';

  await transporter.sendMail({
    from:
      `"FlatMate.GN" <${emailUser}>`,
    to: email,
    subject,
    text:
      `${heading}\n\n` +
      `${description}\n\n` +
      `Your OTP is: ${otp}\n\n` +
      `This OTP will expire in 10 minutes.\n` +
      `Do not share this OTP with anyone.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; color: #1e293b;">

        <h2 style="color: #4f46e5;">
          FlatMate.GN
        </h2>

        <h3>
          ${heading}
        </h3>

        <p>
          ${description}
        </p>

        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0; color: #4f46e5;">
          ${otp}
        </div>

        <p>
          This OTP will expire in
          <strong>10 minutes</strong>.
        </p>

        <p>
          Do not share this OTP with anyone.
        </p>

        <p style="color: #64748b; font-size: 13px; margin-top: 30px;">
          If you did not request this,
          you can safely ignore this email.
        </p>

      </div>
    `
  });
};

export const sendOtpEmail = async (
  email,
  otp
) => {
  await sendOtp(
    email,
    otp,
    'registration'
  );
};

export const sendPasswordResetOtpEmail =
  async (
    email,
    otp
  ) => {
    await sendOtp(
      email,
      otp,
      'password-reset'
    );
  };

export const verifyEmailConnection =
  async () => {
    await transporter.verify();

    console.log(
      'Email service connected successfully'
    );
  };