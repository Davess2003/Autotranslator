import { NextApiHandler } from "next";
import NextCors from "nextjs-cors";

type Data = {
    translation: string,
} | {
    error: string
};

const methods = ["GET"];
const handler: NextApiHandler<Data> = async (req, res) => {
    await NextCors(req, res, {
        methods,
        origin: "*",
        preflightContinue: true
    });

    const {
        query: { slug },
        method
    } = req;

    if (!slug || !Array.isArray(slug) || slug.length !== 3)
        return res.status(404).json({ error: "Not Found" });

    if (!method || !methods.includes(method)) {
        res.setHeader("Allow", methods);
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const [source, target, text] = slug;

    try {
        const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${source}|${target}`);

        if (!response.ok) {
            return res.status(500).json({ error: "Translation service error" });
        }

        const data = await response.json();
        if (data.responseStatus === 200) {
            return res.status(200).json({ translation: data.responseData.translatedText });
        } else {
            return res.status(500).json({ error: "Translation failed" });
        }
    } catch (error) {
        return res.status(500).json({ error: "An error occurred while retrieving the translation" });
    }
}

export default handler;
