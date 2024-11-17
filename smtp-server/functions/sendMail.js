const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: mailData.from, 
    pass: 'your-app-password'     
  }
});

const mailOptions = {
  from: mailData.from,     
  to: mailData.to.join(","),      
  subject: mailData.data,    
  text: 'This is a test email sent using Nodemailer with Gmail.' 
};
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    return console.log('Error:', error);
  }
  console.log('Message sent: %s', info.messageId);
});