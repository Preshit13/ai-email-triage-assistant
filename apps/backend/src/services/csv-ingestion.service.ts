import fs from "fs";
import csv from "csv-parser";

import prisma from "../config/prisma";

const REQUIRED_COLUMNS = ["from", "to", "subject", "body", "date"];

export async function ingestCsv(filePath: string) {
  return new Promise<{
    insertedCount: number;
  }>((resolve, reject) => {
    const emails: Record<string, string>[] = [];

    let validatedColumns = false;

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("headers", (headers: string[]) => {
        const missingColumns = REQUIRED_COLUMNS.filter(
          (column) => !headers.includes(column),
        );

        if (missingColumns.length > 0) {
          reject({
            message: "Invalid CSV format",
            missingColumns,
          });

          return;
        }

        validatedColumns = true;
      })
      .on("data", (row) => {
        if (validatedColumns) {
          emails.push(row);
        }
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

          resolve({
            insertedCount: emails.length,
          });
        } catch (error) {
          reject(error);
        }
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}
