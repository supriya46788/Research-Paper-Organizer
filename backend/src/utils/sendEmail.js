import { Resend } from "resend";

const sendEmail = async (to, subject, html) => {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  try {
    const resend = new Resend(RESEND_API_KEY);
    const data = await resend.emails.send({
      from: "ResearchPaperOrganizerEmailservice@resend.dev",
      to,
      subject,
      html,
    });
    return data;
  } catch (error) {
    console.error("Email sending failed:", error);
    throw new Error("Email could not be sent");
  }
};
