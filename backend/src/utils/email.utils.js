import nodemailer from 'nodemailer';

const transport = nodemailer.createTransport({
    host:process.env.EMAIL_HOST,
    port:process.env.EMAIL_PORT,
    secure:false,
    auth:{
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASSWORD
    }
});

transport.verify((error)=>{
    if(error){
        console.log('there is error on transportation',error.message)
    }
    else{
        console.log('Email transporter are ready')
    }
});

export const sendWelcomeEmail = async({to,name,resturant,subdomain})=>{
    const mailOptions ={
        from:`"DINE 24/7 -ERP" - <${process.env.EMAIL_USER}>`,
        to,
        subject:`Welcome to Dine 24/7 - ${resturant} register successfully`,
            html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px;">
        <h2 style="color: #2563eb;">Hello ${name}! 🎉</h2>
        <p>Your restaurant <strong>${resturant}</strong> successfully Register </p>

        <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #64748b;">Your dashboard:</p>
          <a href="https://${subdomain}" 
             style="color: #2563eb; font-size: 16px; font-weight: bold;">
            https://${subdomain}
          </a>
        </div>

        <p>do Login and setup your resturant:</p>
        <ul style="color: #374151; font-size: 14px;">
          <li>Add Menu </li>
          <li>Set Tables</li>
          <li>Add Staff</li>
        </ul>

        <p style="color: #6b7280; font-size: 13px; margin-top: 32px;">
         if you have any problem just contact to support@deboxtechnology.com
        </p>
      </div>
    `
    };

    await transport.sendMail(mailOptions);
};

export const sendOtpEmail = async({to,name,otp})=>{
    const mailOptions ={
        from :`"DINE 24/7 - ERP " <${process.env.EMAIL_USER}>`,
        to,
        subject:"Password Reset Otp - DINE 24/7 ERP",
            html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px;">
        <h2 style="color: #2563eb;">Password Reset</h2>
        <p>Namaste ${name},</p>
        <p>Aapka OTP code :</p>

        <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1e293b;">
            ${otp}
          </span>
        </div>

        <p style="color: #ef4444; font-size: 14px;">
          ⚠️ Otp is valid in 10 minutes only
        </p>
        <p style="color: #6b7280; font-size: 13px;">
     if you did'nt requested the reset email . kindly ignore it
        </p>
      </div>
    `
    };

  await transport.sendMail(mailOptions);

};