import { GoogleGenAI } from '@google/genai';

export const calculateCompatibility = async (req, res) => {
  try {
    const { userProfile, targetProfile } = req.body;

    if (!userProfile || !targetProfile) {
      return res.status(400).json({ error: 'Both user profiles are required' });
    }

    // Initialize Gemini SDK with API key from .env
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = `
You are an expert roommate and flatmate compatibility matching AI.
Compare the following two flatmate profiles and evaluate their lifestyle compatibility.

Profile 1 (Current User):
- Name: ${userProfile.name}
- Target Area: ${userProfile.targetArea}
- Budget: ₹${userProfile.budgetMin} - ₹${userProfile.budgetMax}
- Sleep Schedule: ${userProfile.sleepSchedule}
- Food Preference: ${userProfile.foodPref}
- Smoking Habit: ${userProfile.smoking}
- Cleanliness (1-5): ${userProfile.cleanliness}
- Bio/Preferences: "${userProfile.bio || 'None'}"

Profile 2 (Potential Flatmate):
- Name: ${targetProfile.name}
- Target Area: ${targetProfile.targetArea}
- Budget: ₹${targetProfile.budgetMin} - ₹${targetProfile.budgetMax}
- Sleep Schedule: ${targetProfile.sleepSchedule}
- Food Preference: ${targetProfile.foodPref}
- Smoking Habit: ${targetProfile.smoking}
- Cleanliness (1-5): ${targetProfile.cleanliness}
- Bio/Preferences: "${targetProfile.bio || 'None'}"

Analyze their compatibility strictly and output ONLY a valid JSON object without markdown or code blocks.
Required JSON Structure:
{
  "matchScore": <integer percentage between 0 and 100>,
  "summary": "<2-sentence summary explaining why they are or aren't compatible>",
  "pros": ["<matching point 1>", "<matching point 2>"],
  "cons": ["<potential conflict point 1>", "<potential conflict point 2>"]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    // Clean response text in case markdown formatting is present
    let rawText = response.text.trim();
    if (rawText.startsWith('```json')) {
      rawText = rawText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (rawText.startsWith('```')) {
      rawText = rawText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const matchResult = JSON.parse(rawText);
    res.json({ success: true, matchData: matchResult });

  } catch (error) {
    console.error('Gemini AI Matching Error:', error);
    res.status(500).json({ 
      error: 'Failed to calculate compatibility', 
      details: error.message 
    });
  }
};