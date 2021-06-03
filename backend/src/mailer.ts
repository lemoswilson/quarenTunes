import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    // service: 'Yahoo',
    service: 'Hotmail',
    auth: {
        // user: "lemoswilson@yahoo.com",
        user: "xolombrisx@outlook.com",
        pass: '$ine$QUARE420'
    }
});

export const options = {
    from: "xolombrisx@outlook.com",
    // from: "uiubeats@gmail.com",
    to: '',
    subject: "Recover your Xolombrisx password",
    text: '',
}

export default transporter;