import fs from "fs";
import csv from "csv-parser";

import prisma from "../config/prisma";

export async function ingestCsv(filePath: string) {
  return new Promise<void>((resolve, reject) => {
    const emails: any[] = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        emails.push(row);
      })
      .on("end", async () => {
        try {
          for (const email of emails) {
            await prisma.email.create({
              data: {
                from: email.from || "",
                to: email.to || "",
                cc: email.cc || null,
                subject: email.subject || "",
                body: email.body || "",
                date: email.date ? new Date(email.date) : new Date(),
              },
            });
          }

          resolve();
        } catch (error) {
          reject(error);
        }
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}
