// Sentiment Analysis Utility for Instagram Analytics Platform
import { EmotionScores } from '../types';

interface SentimentResult {
  score: number; // -1 to 1 (negative to positive)
  confidence: number; // 0 to 1
  emotions: EmotionScores;
  key_phrases: string[];
  language: string;
  sentiment_label: 'positive' | 'neutral' | 'negative';
}

class SentimentAnalyzer {
  private positiveWords: Set<string>;
  private negativeWords: Set<string>;
  private emotionKeywords: Record<string, string[]>;
  private intensifiers: Set<string>;
  private negators: Set<string>;

  constructor() {
    // Initialize sentiment word dictionaries
    this.positiveWords = new Set([
      'amazing', 'awesome', 'excellent', 'fantastic', 'great', 'good', 'love', 'like',
      'wonderful', 'brilliant', 'perfect', 'outstanding', 'superb', 'impressive',
      'helpful', 'useful', 'easy', 'simple', 'intuitive', 'fast', 'quick', 'efficient',
      'satisfied', 'happy', 'pleased', 'delighted', 'thrilled', 'excited', 'grateful',
      'recommend', 'best', 'better', 'improved', 'enhanced', 'optimized', 'smoother',
      'clear', 'helpful', 'responsive', 'professional', 'reliable', 'stable'
    ]);

    this.negativeWords = new Set([
      'bad', 'terrible', 'awful', 'horrible', 'disgusting', 'hate', 'dislike',
      'worst', 'useless', 'broken', 'slow', 'difficult', 'hard', 'confusing',
      'complicated', 'frustrating', 'annoying', 'irritating', 'disappointing',
      'unsatisfied', 'unhappy', 'angry', 'frustrated', 'confused', 'stuck',
      'problem', 'issue', 'bug', 'error', 'crash', 'fail', 'failed', 'failure',
      'missing', 'lost', 'wrong', 'inaccurate', 'unreliable', 'unstable', 'laggy',
      'freezing', 'not working', 'doesn\'t work', 'can\'t', 'unable', 'impossible'
    ]);

    // Emotion keywords mapping
    this.emotionKeywords = {
      joy: ['happy', 'joy', 'excited', 'delighted', 'thrilled', 'pleased', 'glad', 'cheerful'],
      anger: ['angry', 'mad', 'furious', 'irritated', 'annoyed', 'frustrated', 'rage'],
      sadness: ['sad', 'disappointed', 'unhappy', 'depressed', 'down', 'upset'],
      fear: ['scared', 'afraid', 'worried', 'anxious', 'concerned', 'nervous'],
      disgust: ['disgusted', 'revolted', 'sickened', 'gross', 'awful'],
      surprise: ['surprised', 'shocked', 'amazed', 'astonished', 'unexpected']
    };

    this.intensifiers = new Set([
      'very', 'extremely', 'really', 'quite', 'totally', 'completely', 'absolutely',
      'incredibly', 'remarkably', 'exceptionally', 'highly', 'deeply', 'truly'
    ]);

    this.negators = new Set([
      'not', 'no', 'never', 'nothing', 'nowhere', 'nobody', 'none', 'neither',
      'hardly', 'scarcely', 'barely', 'rarely', 'seldom', 'don\'t', 'doesn\'t',
      'didn\'t', 'won\'t', 'wouldn\'t', 'couldn\'t', 'shouldn\'t', 'cannot',
      'can\'t', 'won\'t', 'without'
    ]);
  }

  /**
   * Analyze sentiment of text
   */
  async analyze(text: string): Promise<SentimentResult> {
    if (!text || text.trim().length === 0) {
      return {
        score: 0,
        confidence: 0,
        emotions: {},
        key_phrases: [],
        language: 'en',
        sentiment_label: 'neutral'
      };
    }

    // Clean and normalize text
    const cleanText = this.cleanText(text.toLowerCase());
    
    // Calculate sentiment score
    const sentimentScore = this.calculateSentimentScore(cleanText);
    
    // Detect emotions
    const emotions = this.detectEmotions(cleanText);
    
    // Extract key phrases
    const keyPhrases = this.extractKeyPhrases(cleanText);
    
    // Determine confidence based on word matches and sentence structure
    const confidence = this.calculateConfidence(cleanText, sentimentScore);
    
    // Determine sentiment label
    const sentimentLabel = this.getSentimentLabel(sentimentScore);
    
    return {
      score: Math.max(-1, Math.min(1, sentimentScore)),
      confidence: Math.max(0, Math.min(1, confidence)),
      emotions,
      key_phrases: keyPhrases,
      language: 'en',
      sentiment_label: sentimentLabel
    };
  }

  /**
   * Clean and normalize text
   */
  private cleanText(text: string): string {
    // Remove punctuation and extra spaces, but keep some for context
    return text
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Calculate sentiment score based on word polarity
   */
  private calculateSentimentScore(text: string): number {
    const words = text.split(' ');
    let score = 0;
    let wordCount = 0;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const prevWord = words[i - 1];
      const nextWord = words[i + 1];
      
      let wordScore = 0;
      
      if (this.positiveWords.has(word)) {
        wordScore = 1;
      } else if (this.negativeWords.has(word)) {
        wordScore = -1;
      }

      // Apply modifiers
      if (wordScore !== 0) {
        // Check for intensifiers
        if (prevWord && this.intensifiers.has(prevWord)) {
          wordScore *= 1.5;
        }
        
        // Check for negators
        if (prevWord && this.negators.has(prevWord)) {
          wordScore *= -1;
        }
        
        // Check for double negatives (not bad = good)
        if (prevWord && this.negators.has(prevWord) && nextWord && this.negators.has(nextWord)) {
          wordScore *= -1;
        }
        
        score += wordScore;
        wordCount++;
      }
    }

    // Normalize score to -1 to 1 range
    if (wordCount === 0) return 0;
    return Math.max(-1, Math.min(1, score / wordCount));
  }

  /**
   * Detect emotions in text
   */
  private detectEmotions(text: string): EmotionScores {
    const emotions: EmotionScores = {};
    const words = text.split(' ');
    
    Object.entries(this.emotionKeywords).forEach(([emotion, keywords]) => {
      let emotionScore = 0;
      
      keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'g');
        const matches = text.match(regex);
        if (matches) {
          emotionScore += matches.length;
        }
      });
      
      if (emotionScore > 0) {
        // Normalize emotion score (assuming max possible score of 10)
        emotions[emotion] = Math.min(1, emotionScore / 10);
      }
    });
    
    return emotions;
  }

  /**
   * Extract key phrases from text
   */
  private extractKeyPhrases(text: string): string[] {
    const keyPhrases: string[] = [];
    const words = text.split(' ');
    
    // Look for 2-3 word phrases that contain sentiment words
    for (let i = 0; i < words.length - 1; i++) {
      const phrase = words.slice(i, i + 3).join(' ');
      
      // Check if phrase contains sentiment words
      if (this.containsSentimentWords(phrase)) {
        keyPhrases.push(phrase);
      }
    }
    
    // Remove duplicates and return top 5
    return [...new Set(keyPhrases)].slice(0, 5);
  }

  /**
   * Check if text contains sentiment words
   */
  private containsSentimentWords(text: string): boolean {
    const textWords = text.split(' ');
    return textWords.some(word => 
      this.positiveWords.has(word) || this.negativeWords.has(word)
    );
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(text: string, sentimentScore: number): number {
    let confidence = 0.5; // Base confidence
    
    // Increase confidence based on sentiment word density
    const words = text.split(' ');
    const sentimentWords = words.filter(word => 
      this.positiveWords.has(word) || this.negativeWords.has(word)
    );
    
    if (words.length > 0) {
      const density = sentimentWords.length / words.length;
      confidence += density * 0.3;
    }
    
    // Adjust based on sentiment strength
    const absScore = Math.abs(sentimentScore);
    confidence += absScore * 0.2;
    
    // Increase confidence for longer texts (more reliable)
    if (words.length > 10) {
      confidence += 0.1;
    }
    
    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Get sentiment label based on score
   */
  private getSentimentLabel(score: number): 'positive' | 'neutral' | 'negative' {
    if (score > 0.1) return 'positive';
    if (score < -0.1) return 'negative';
    return 'neutral';
  }

  /**
   * Batch analyze multiple texts
   */
  async batchAnalyze(texts: string[]): Promise<SentimentResult[]> {
    const results = await Promise.all(texts.map(text => this.analyze(text)));
    return results;
  }

  /**
   * Get sentiment trends over time
   */
  analyzeSentimentTrend(feedbackData: Array<{ text: string; timestamp: string }>): {
    trend: 'improving' | 'declining' | 'stable';
    change_percentage: number;
    current_sentiment: number;
    previous_sentiment: number;
  } {
    if (feedbackData.length < 2) {
      return {
        trend: 'stable',
        change_percentage: 0,
        current_sentiment: 0,
        previous_sentiment: 0
      };
    }

    // Sort by timestamp
    const sortedData = feedbackData.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const middleIndex = Math.floor(sortedData.length / 2);
    const firstHalf = sortedData.slice(0, middleIndex);
    const secondHalf = sortedData.slice(middleIndex);

    // Calculate average sentiment for each half
    const firstHalfSentiment = firstHalf.reduce((sum, item) => 
      sum + this.calculateSentimentScore(item.text.toLowerCase()), 0) / firstHalf.length;
    
    const secondHalfSentiment = secondHalf.reduce((sum, item) => 
      sum + this.calculateSentimentScore(item.text.toLowerCase()), 0) / secondHalf.length;

    const changePercentage = ((secondHalfSentiment - firstHalfSentiment) / 
      Math.abs(firstHalfSentiment || 1)) * 100;

    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (Math.abs(changePercentage) > 5) {
      trend = changePercentage > 0 ? 'improving' : 'declining';
    }

    return {
      trend,
      change_percentage: Math.abs(changePercentage),
      current_sentiment: secondHalfSentiment,
      previous_sentiment: firstHalfSentiment
    };
  }

  /**
   * Get top positive and negative phrases
   */
  getTopPhrases(feedbackData: Array<{ text: string; sentiment_score: number }>): {
    positive: Array<{ phrase: string; frequency: number; avg_sentiment: number }>;
    negative: Array<{ phrase: string; frequency: number; avg_sentiment: number }>;
  } {
    const positivePhrases: Record<string, { count: number; totalSentiment: number }> = {};
    const negativePhrases: Record<string, { count: number; totalSentiment: number }> = {};

    feedbackData.forEach(({ text, sentiment_score }) => {
      const phrases = this.extractKeyPhrases(text.toLowerCase());
      const phraseData = sentiment_score >= 0 ? positivePhrases : negativePhrases;
      
      phrases.forEach(phrase => {
        if (!phraseData[phrase]) {
          phraseData[phrase] = { count: 0, totalSentiment: 0 };
        }
        phraseData[phrase].count++;
        phraseData[phrase].totalSentiment += sentiment_score;
      });
    });

    const positive = Object.entries(positivePhrases)
      .map(([phrase, data]) => ({
        phrase,
        frequency: data.count,
        avg_sentiment: data.totalSentiment / data.count
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);

    const negative = Object.entries(negativePhrases)
      .map(([phrase, data]) => ({
        phrase,
        frequency: data.count,
        avg_sentiment: data.totalSentiment / data.count
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);

    return { positive, negative };
  }
}

export const sentimentAnalyzer = new SentimentAnalyzer();