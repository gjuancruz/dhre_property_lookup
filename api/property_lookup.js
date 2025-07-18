import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const { reference_code } = req.body || {};

    if (!reference_code) {
      return res
        .status(400)
        .json({ error: "Falta el parámetro reference_code" });
    }

    const csvUrl =
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vQvmef7v68toFfSZj_1Q160E-4myzs-_mKhHB1aoTpIIH0c1WBmPYEiYEOzGDlgBHlm5jviilnvSyGG/pub?gid=2008777298&single=true&output=csv";
    const response = await fetch(csvUrl);
    const csv = await response.text();

    const rows = csv.split("\n").map((r) => r.split(","));
    const headers = rows[0];
    const data = rows
      .slice(1)
      .filter(
        (r) => r.length === headers.length && r.some((c) => c.trim() !== "")
      )
      .map((r) =>
        Object.fromEntries(
          r.map((val, i) => [
            headers[i]?.trim() ?? `col_${i}`,
            val?.trim() ?? "",
          ])
        )
      );

    const property = data.find((p) => p.reference_code === reference_code);

    if (!property) {
      return res.json({
        result: `No se encontró ninguna propiedad con código ${reference_code}.`,
      });
    }

    return res.json({
      result: `La propiedad es un ${property.título}, ubicada en ${property.ubicación}, con ${property.superficie} y un precio de ${property.precio}.`,
    });
  } catch (err) {
    console.error("Error interno:", err);
    return res.status(500).json({ error: "Error interno del servidor." });
  }
}
