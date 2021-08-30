import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const options = {
    from: process.env.EMAIL_USER,
    to: '',
    subject: "Recover your Xolombrisx password",
    text: '',
}

export default transporter;