const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const fs = require("fs");
const sendMail=async(email)=>{
  pathToAttachment = `${__dirname}/customerUtilization.xlsx`;
  attachment = fs.readFileSync(pathToAttachment).toString("base64");
    const mailOptions = {
        from: 'noreplay@numocity.com',
        subject: 'utilization Report',
        to: email,
        html:mailContent,
        attachments: [
            {
              filename: 'utilisationReport.xlsx',
              content: attachment,
              contentId: new Date(),
              disposition: "attachment"
            }
          ],
      };
      return await sendMailUsingSendgrid(mailOptions)

}
const sendMailUsingSendgrid = async (mailOptions)=>{
    try {
      verifyAndFormAttachments(mailOptions);
      const response = await sgMail.send(mailOptions);
      return response;
    } catch (ex) {
      throw ex;
    }
  };
  
  const verifyAndFormAttachments = (mailOptions)=>{
    if (mailOptions.attachments) {
      const attachments = mailOptions.attachments;
      const formedAttachments = attachments.map((attchmentObj)=>{
        return convertPathToBase64(attchmentObj);
      });
      mailOptions.attachments = formedAttachments;
      return mailOptions;
    }
    return mailOptions;
  };
  
  const convertPathToBase64 = (attchmentObj)=>{
    if (attchmentObj.path) {
      attchmentObj.content = fs.readFileSync(attchmentObj.path).toString('base64');
      return attchmentObj;
    }
    return attchmentObj;
  };

  const mailContent=`<p>Hi Team</p><p>please find the attachment</p>`

  module.exports={sendMail}
  