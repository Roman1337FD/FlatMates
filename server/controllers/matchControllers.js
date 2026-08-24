import { GoogleGenAI } from '@google/genai';

export const calculateCompatibility = async (req, res) => {
  try {
    const { userProfile, targetProfile } = req.body;

    if (!userProfile || !targetProfile) {
      return res.status(400).json({
        success: false,
        error: 'Both user profiles are required'
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'Gemini API key is missing'
      });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });

    const prompt = `
You are an expert roommate and flatmate compatibility matching AI.

Compare these two flatmate profiles and calculate their lifestyle compatibility.

Profile 1:
- Name: ${userProfile.name || 'Unknown'}
- Target Area: ${userProfile.targetArea || 'Unknown'}
- Budget: ₹${userProfile.budgetMin || 0} - ₹${userProfile.budgetMax || 0}
- Sleep Schedule: ${userProfile.sleepSchedule || 'Unknown'}
- Food Preference: ${userProfile.foodPref || 'Unknown'}
- Smoking Habit: ${userProfile.smoking || 'Unknown'}
- Cleanliness: ${userProfile.cleanliness || 0}/5
- Bio: "${userProfile.bio || 'None'}"

Profile 2:
- Name: ${targetProfile.name || 'Unknown'}
- Target Area: ${targetProfile.targetArea || 'Unknown'}
- Budget: ₹${targetProfile.budgetMin || 0} - ₹${targetProfile.budgetMax || 0}
- Sleep Schedule: ${targetProfile.sleepSchedule || 'Unknown'}
- Food Preference: ${targetProfile.foodPref || 'Unknown'}
- Smoking Habit: ${targetProfile.smoking || 'Unknown'}
- Cleanliness: ${targetProfile.cleanliness || 0}/5
- Bio: "${targetProfile.bio || 'None'}"

Evaluate:
1. Area compatibility
2. Budget compatibility
3. Sleep schedule compatibility
4. Food preference compatibility
5. Smoking compatibility
6. Cleanliness compatibility
7. Lifestyle and bio compatibility

Return ONLY valid JSON.

Do not use markdown.
Do not use code fences.

Required format:

{
  "matchScore": 0,
  "summary": "Two sentence explanation.",
  "pros": [
    "Matching point 1",
    "Matching point 2"
  ],
  "cons": [
    "Potential conflict 1",
    "Potential conflict 2"
  ]
}

matchScore must be an integer between 0 and 100.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    if (!response || !response.text) {
      return res.status(502).json({
        success: false,
        error: 'Gemini returned an empty response'
      });
    }

    let rawText = response.text.trim();

    rawText = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    let matchResult;

    try {
      matchResult = JSON.parse(rawText);
    } catch (parseError) {
      console.error('Gemini JSON Parse Error:', parseError);
      console.error('Gemini Raw Response:', rawText);

      return res.status(502).json({
        success: false,
        error: 'Gemini returned an invalid response'
      });
    }

    if (
      typeof matchResult.matchScore !== 'number' ||
      typeof matchResult.summary !== 'string' ||
      !Array.isArray(matchResult.pros) ||
      !Array.isArray(matchResult.cons)
    ) {
      return res.status(502).json({
        success: false,
        error: 'Gemini returned an invalid compatibility format'
      });
    }

    matchResult.matchScore = Math.max(
      0,
      Math.min(100, Math.round(matchResult.matchScore))
    );

    res.json({
      success: true,
      matchData: matchResult
    });

  } catch (error) {
    console.error('Gemini AI Matching Error:', error);

    const errorMessage = error?.message || '';

    if (
      errorMessage.includes('429') ||
      errorMessage.toLowerCase().includes('quota')
    ) {
      return res.status(429).json({
        success: false,
        error: 'Gemini API quota exceeded. Please try again later.'
      });
    }

    if (
      errorMessage.includes('401') ||
      errorMessage.includes('403') ||
      errorMessage.toLowerCase().includes('api key')
    ) {
      return res.status(401).json({
        success: false,
        error: 'Gemini API key is invalid or unavailable.'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to calculate compatibility',
      details: errorMessage
    });
  }
};