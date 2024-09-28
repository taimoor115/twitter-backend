import { sendMail, transporter } from "./index.js";
import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
} from "./emailTemplate.js";

export const sendPasswordResetEmail = async (email, resetURL) => {
  const subject = "Password reset email";
  try {
    await sendMail(
      transporter,
      email,
      subject,
      PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL)
    );
  } catch (error) {
    console.log("Error while send email", error);
  }
};

export const sendPasswordResetSuccessEmail = async (email) => {
  const subject = "Password reset success";
  try {
    await sendMail(
      transporter,
      email,
      subject,
      PASSWORD_RESET_SUCCESS_TEMPLATE
    );
  } catch (error) {
    console.log("Error while send email", error);
  }
};
