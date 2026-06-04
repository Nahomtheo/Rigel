import {Resend} from "Resend";
export const resend= new Resend(
   process.env.RESEND_API_KEY
)