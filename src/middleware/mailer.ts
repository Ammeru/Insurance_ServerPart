import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.MAIL_PASSWORD,
    }
})

async function sendMail(to: string, subject: string, text: string) {
    const info = await transporter.sendMail({
        from: `"Insurance App" <${process.env.MAIL}>`,
        to,
        subject,
        text,
        html: `<b>${text}</b>`,
    });

    console.log("Message sent:", info.messageId);
}

export { sendMail };

//ПОЗЖЕ ПЕРЕНЕСТИ В utils