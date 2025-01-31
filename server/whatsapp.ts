import { type SelectReport } from "@db/schema";
import twilio from "twilio";

if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_WHATSAPP_NUMBER) {
  throw new Error(
    "Missing Twilio credentials. Make sure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_WHATSAPP_NUMBER are set.",
  );
}

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const WHATSAPP_REPORT_MESSAGE = (phoneNumber: string, description: string) => `
🚨 *Número Fraudulento Reportado*
📱 Número: ${phoneNumber}
📝 Descripción: ${description}

Este número ha sido reportado como fraudulento a través de nuestro sistema de reportes. Por favor, investigue y tome las medidas necesarias.

Mensaje automático - Sistema de Reportes de Fraude`;

export async function sendWhatsappReport(report: SelectReport): Promise<boolean> {
  try {
    const message = await client.messages.create({
      body: WHATSAPP_REPORT_MESSAGE(report.phoneNumber, report.description),
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      // El número de WhatsApp al que se enviará el reporte (el mismo número que el remitente en sandbox)
      to: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
    });

    console.log('Reporte enviado a WhatsApp:', {
      messageId: message.sid,
      status: message.status,
      phoneNumber: report.phoneNumber,
    });

    return true;
  } catch (error) {
    console.error('Error al enviar reporte a WhatsApp:', error);
    return false;
  }
}