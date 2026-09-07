import Mailgen from "mailgen";

const sendEmail = async (options) => {
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "Task Manager",
      link: "https://taskmanagelink.com"
    }
  })

  const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent)
  const emailHtml = mailGenerator.generate(options.mailgenContent)

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: "onboarding@resend.dev",
        to: options.email,
        subject: options.subject,
        text: emailTextual,
        html: emailHtml
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "Failed to send email")
    }

    console.log("Email sent successfully:", data)
  } catch (error) {
    console.error("Error sending email:", error)
    throw error
  }
}

const emailVerificationContent = (username, verificationUrl) => {
  return {
    body: {
      name: username,
      intro: "Welcome to our App! We'are excited to have you on board.",
      action: {
        instructions: "To verify your email please click on the following button",
        button: {
          color: "#27824e",
          text: "Verify your email",
          link: verificationUrl
        }
      },
      outro: "Need help, or have questions? Just reply to this email, we'd love to help."
    }
  }
}

const forgotPasswordContent = (username, passwordResetUrl) => {
  return {
    body: {
      name: username,
      intro: "We got a request to reset the password of your account",
      action: {
        instructions: "To reset your password please click on the following button or link",
        button: {
          color: "#27824e",
          text: "Reset password",
          link: passwordResetUrl
        }
      },
      outro: "Need help, or have questions? Just reply to this email, we'd love to help."
    }
  }
}

export { emailVerificationContent, forgotPasswordContent, sendEmail }