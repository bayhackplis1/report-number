import type { Express } from "express";
import { createServer, type Server } from "http";
import { eq } from "drizzle-orm";
import { db } from "@db";
import { reports, insertReportSchema } from "@db/schema";
import { ZodError } from "zod";
import { sendWhatsappReport } from "./whatsapp";

export function registerRoutes(app: Express): Server {
  // Get all reports
  app.get("/api/reports", async (_req, res) => {
    const allReports = await db.query.reports.findMany({
      orderBy: (reports, { desc }) => [desc(reports.createdAt)],
      limit: 50,
    });
    res.json(allReports);
  });

  // Create a new report
  app.post("/api/reports", async (req, res) => {
    try {
      const report = insertReportSchema.parse(req.body);
      const [inserted] = await db.insert(reports).values(report).returning();

      // Enviar el reporte a WhatsApp
      const whatsappSent = await sendWhatsappReport(inserted);

      if (whatsappSent) {
        console.log(`Reporte enviado exitosamente a WhatsApp para el número ${inserted.phoneNumber}`);
      } else {
        console.warn(`No se pudo enviar el reporte a WhatsApp para el número ${inserted.phoneNumber}`);
      }

      res.json(inserted);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: error.errors[0].message });
      } else {
        console.error('Error al procesar el reporte:', error);
        res.status(500).json({ message: "Error interno del servidor" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}