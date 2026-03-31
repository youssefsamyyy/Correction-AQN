/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Languages, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Copy, 
  Check,
  History,
  Info,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { correctArticle, CorrectionResult } from './services/geminiService';

const LOGO_URL = "https://alqaheranews.net/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.6a2665e0.png&w=3840&q=75";

export default function App() {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<CorrectionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isArabic, setIsArabic] = useState(true);

  const handleCorrect = async () => {
    if (!inputText.trim()) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const data = await correctArticle(inputText);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError('Failed to process the article. Please check your API key and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result?.correctedText) {
      navigator.clipboard.writeText(result.correctedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Detect language based on first characters
  useEffect(() => {
    const arabicPattern = /[\u0600-\u06FF]/;
    if (inputText.length > 0) {
      setIsArabic(arabicPattern.test(inputText.substring(0, 20)));
    }
  }, [inputText]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img 
              src={LOGO_URL} 
              alt="Al-Qahera News" 
              className="h-12 object-contain"
              referrerPolicy="no-referrer"
            />
            <div className="h-8 w-[1px] bg-gray-200 hidden sm:block"></div>
            <h1 className="text-xl font-bold tracking-tight text-qahera-dark hidden sm:block">
              Editor Pro
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button 
                onClick={() => setIsArabic(true)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${isArabic ? 'bg-white shadow-sm text-qahera-red' : 'text-gray-500 hover:text-gray-700'}`}
              >
                العربية
              </button>
              <button 
                onClick={() => setIsArabic(false)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${!isArabic ? 'bg-white shadow-sm text-qahera-red' : 'text-gray-500 hover:text-gray-700'}`}
              >
                English
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Languages className="w-5 h-5 text-qahera-red" />
              {isArabic ? 'نص المقال' : 'Article Text'}
            </h2>
            <span className="text-xs text-gray-400 font-mono">
              {inputText.length} {isArabic ? 'حرف' : 'chars'}
            </span>
          </div>
          
          <div className="relative flex-1 min-h-[400px]">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isArabic ? 'أدخل المقال هنا للتدقيق...' : 'Enter article text here for correction...'}
              className={`w-full h-full p-6 rounded-2xl border-2 border-transparent focus:border-qahera-red bg-white shadow-sm resize-none outline-none transition-all text-lg leading-relaxed ${isArabic ? 'arabic-text' : ''}`}
            />
            
            <div className="absolute bottom-6 right-6 flex gap-2">
              <button
                onClick={() => setInputText('')}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Clear"
              >
                <History className="w-5 h-5" />
              </button>
            </div>
          </div>

          <button
            onClick={handleCorrect}
            disabled={isLoading || !inputText.trim()}
            className="w-full py-4 bg-qahera-dark hover:bg-qahera-red text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-qahera-red/20"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                {isArabic ? 'جاري التدقيق...' : 'Correcting...'}
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                {isArabic ? 'ابدأ التدقيق' : 'Start Correction'}
              </>
            )}
          </button>
        </section>

        {/* Output Section */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              {isArabic ? 'النتيجة المدققة' : 'Corrected Result'}
            </h2>
            {result && (
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-qahera-red transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                {copied ? (isArabic ? 'تم النسخ' : 'Copied') : (isArabic ? 'نسخ النص' : 'Copy Text')}
              </button>
            )}
          </div>

          <div className="flex-1 min-h-[400px] flex flex-col gap-6">
            <AnimatePresence mode="wait">
              {error ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-100 p-6 rounded-2xl flex items-start gap-4"
                >
                  <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-red-800">{isArabic ? 'خطأ في المعالجة' : 'Processing Error'}</h3>
                    <p className="text-red-600 mt-1">{error}</p>
                  </div>
                </motion.div>
              ) : result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col gap-6"
                >
                  <div className={`p-6 rounded-2xl bg-white shadow-sm border border-green-100 text-lg leading-relaxed ${isArabic ? 'arabic-text' : ''}`}>
                    {result.correctedText}
                  </div>

                  <div className="flex flex-col gap-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                      <Info className="w-4 h-4" />
                      {isArabic ? 'التعديلات المنفذة' : 'Applied Changes'}
                    </h3>
                    <div className="space-y-3">
                      {result.explanations.map((exp, idx) => (
                        <motion.div
                          initial={{ opacity: 0, x: isArabic ? 20 : -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          key={idx}
                          className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-qahera-red/30 transition-colors group"
                        >
                          <div className={`flex items-center gap-3 mb-2 ${isArabic ? 'flex-row-reverse' : ''}`}>
                            <span className="line-through text-gray-400 text-sm">{exp.original}</span>
                            {isArabic ? <ChevronLeft className="w-4 h-4 text-qahera-red" /> : <ChevronRight className="w-4 h-4 text-qahera-red" />}
                            <span className="font-bold text-qahera-dark">{exp.corrected}</span>
                          </div>
                          <p className={`text-sm text-gray-600 ${isArabic ? 'text-right' : ''}`}>
                            {exp.reason}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50"
                >
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                    <Languages className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-gray-500 font-medium">
                    {isArabic ? 'بانتظار إدخال النص...' : 'Waiting for input...'}
                  </h3>
                  <p className="text-gray-400 text-sm mt-2 max-w-xs">
                    {isArabic 
                      ? 'سيتم تطبيق قواعد كتاب الأسلوب لصحيفة القاهرة الاخبارية تلقائياً' 
                      : 'AQN Style Book rules will be applied automatically'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">
            Powered by Gemini 3.1 Pro & Al-Qahera News AI Lab
          </p>
        </div>
      </footer>
    </div>
  );
}
