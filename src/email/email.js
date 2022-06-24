const nodemailer = require("nodemailer");

var transport = nodemailer.createTransport({
	host: "smtp.mailtrap.io",
	port: 2525,
	auth: {
		user: process.env.MAILTRAP_USER,
		pass: process.env.MAILTRAP_PASS,
	},
});

var mailOptions = {
	from: "nightfury135269@gmail.com",
	to: "kayex57098@serosin.com",
	subject: "Nice Nodemailer test",
	text: "Hey there, it’s our first message sent with Nodemailer ;) ",
	html: "<b>Hey there! </b><br> This is our first message sent with Nodemailer",
};

const sendWelcomeEmail = (email, name) => {
	transport.sendMail(
		{
			from: "taskmanagerteam@mail.com",
			to: email,
			subject: "Welcome to Task Manager",
			text: `Hey ${name}, thanks for joining with us!`,
			html: `<b>Hey ${name}! </b><br> Thanks for joining with us!`,
		},
		(error, info) => {
			if (error) {
				console.log(error);
			} else {
				console.log(info);
			}
		}
	);
};

const sendCancelationEmail = (email, name) => {
	transport.sendMail(
		{
			from: "taskmanagerteam@mail.com",
			to: email,
			subject: "Service Closed",
			text: `Hey ${name}, we feel sorry that you are leaving. Hope we meet again.`,
			// html: `<b>Hey ${name}! </b><br> Thanks for joining with us!`,
		},
		(error, info) => {
			if (error) {
				console.log(error);
			} else {
				console.log(info);
			}
		}
	);
};

module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
}